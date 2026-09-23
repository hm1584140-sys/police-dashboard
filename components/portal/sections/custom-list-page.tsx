'use client'

import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { ChevronDown, ChevronLeft, Columns3, Copy, EyeOff, FolderPlus, List, Minus, Plus, Rows3, Scissors, Trash2 } from 'lucide-react'
import type { PageDefinition } from '@/lib/page-types'
import { useAdmin } from '@/lib/admin-context'
import { NeonCard, SectionTitle } from '../primitives'
import { cn } from '@/lib/utils'

type Column = {
  key: string
  label: string
  kind: 'text' | 'number' | 'select'
  options?: string[]
  width?: number
  hidden?: boolean
}

type ListDef = {
  id: string
  title: string
  description: string
  sector_id: string | null
  columns: Column[]
}

type Row = {
  id: string
  data: Record<string,string>
  sort_order?: number
}

type MenuState =
  | { x:number; y:number; kind:'cell'; row:Row; col:Column }
  | { x:number; y:number; kind:'row'; row:Row }
  | { x:number; y:number; kind:'col'; col:Column }
  | null

const MIN_W=72
const DEFAULT_W=128

function letter(index:number){
  let n=index+1
  let out=''
  while(n>0){const r=(n-1)%26;out=String.fromCharCode(65+r)+out;n=Math.floor((n-1)/26)}
  return out
}

export function CustomListPage({ page }: { page: PageDefinition }) {
  const { token, can } = useAdmin()
  const listId = useMemo(() => {
    const block = page.blocks.find((item) => item.type === 'custom-list-config') as Extract<typeof page.blocks[number], { type: 'custom-list-config' }> | undefined
    return block?.listId ?? ''
  }, [page.blocks])

  const [list, setList] = useState<ListDef | null>(null)
  const [rows, setRows] = useState<Row[]>([])
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [selectedCols, setSelectedCols] = useState<Set<string>>(new Set())
  const [selectedCell,setSelectedCell]=useState<{rowId:string;colKey:string}|null>(null)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const [groupOpen, setGroupOpen] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [editingHeader, setEditingHeader] = useState<string | null>(null)
  const [headerDraft, setHeaderDraft] = useState('')
  const [editingTitle,setEditingTitle]=useState(false)
  const [titleDraft,setTitleDraft]=useState('')
  const [menu,setMenu]=useState<MenuState>(null)
  const clipboard=useRef<string>('')
  const saveTimer = useRef<Record<string, number>>({})
  const editable = Boolean(token && can('roster.manage'))

  async function load() {
    if (!listId) return
    const [a,b] = await Promise.all([
      fetch('/api/custom-lists?id=' + encodeURIComponent(listId), { cache: 'no-store' }),
      fetch('/api/custom-lists/rows?listId=' + encodeURIComponent(listId), { cache: 'no-store' }),
    ])
    if (a.ok) setList(await a.json())
    if (b.ok) setRows(await b.json())
  }

  useEffect(() => {
    void load()
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible' && !document.activeElement?.matches('input,textarea,select,[contenteditable="true"]')) void load()
    }, 1600)
    const close=()=>setMenu(null)
    window.addEventListener('click',close)
    return () => { window.clearInterval(interval); window.removeEventListener('click',close) }
  }, [listId])

  const visibleColumns=useMemo(()=>list?.columns.filter((col)=>!col.hidden)??[],[list?.columns])

  async function persistList(next: ListDef) {
    if (!token) return
    setList(next)
    await fetch('/api/custom-lists', {
      method:'PATCH',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ token,id:next.id,title:next.title,description:next.description,sectorId:next.sector_id,columns:next.columns }),
    })
    window.dispatchEvent(new CustomEvent('pd:pages-changed'))
  }

  async function persistRow(row: Row, data: Record<string,string>, sortOrder?:number) {
    if (!token || row.id.startsWith('temp-')) return
    await fetch('/api/custom-lists/rows',{
      method:'PATCH',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({token,id:row.id,data,sortOrder}),
    })
  }

  function updateRow(row: Row, key: string, value: string) {
    const data={...row.data,[key]:value}
    setRows((prev)=>prev.map((r)=>r.id===row.id?{...r,data}:r))
    if (saveTimer.current[row.id]) window.clearTimeout(saveTimer.current[row.id])
    saveTimer.current[row.id]=window.setTimeout(()=>void persistRow(row,data),180)
  }

  async function createRowAt(index:number){
    if(!token||!list)return
    const before=rows[index-1]?.sort_order
    const after=rows[index]?.sort_order
    let order:number
    if(Number.isFinite(before)&&Number.isFinite(after)) order=((before as number)+(after as number))/2
    else if(Number.isFinite(after)) order=(after as number)-1
    else if(Number.isFinite(before)) order=(before as number)+1
    else order=index+1

    const temp='temp-'+crypto.randomUUID()
    const data=Object.fromEntries(list.columns.map((c)=>[c.key,'']))
    data._height='34'
    const tempRow:Row={id:temp,data,sort_order:order}
    setRows((prev)=>[...prev.slice(0,index),tempRow,...prev.slice(index)])
    const res=await fetch('/api/custom-lists/rows',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,listId:list.id,data,sortOrder:order})})
    if(res.ok){const created=await res.json();setRows((prev)=>prev.map((r)=>r.id===temp?created:r).sort((a,b)=>(a.sort_order??0)-(b.sort_order??0)))}
    else setRows((prev)=>prev.filter((r)=>r.id!==temp))
  }

  async function addRow(){ await createRowAt(rows.length) }

  async function removeRow(row: Row) {
    if (!token) return
    setRows((prev)=>prev.filter((r)=>r.id!==row.id))
    setSelectedRows((prev)=>{const next=new Set(prev);next.delete(row.id);return next})
    if(!row.id.startsWith('temp-')) await fetch('/api/custom-lists/rows',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,id:row.id})})
  }

  async function removeSelectedRows() {
    const targets=rows.filter((row)=>selectedRows.has(row.id))
    setRows((prev)=>prev.filter((row)=>!selectedRows.has(row.id)))
    setSelectedRows(new Set())
    await Promise.all(targets.filter((row)=>!row.id.startsWith('temp-')).map((row)=>fetch('/api/custom-lists/rows',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,id:row.id})})))
  }

  async function groupSelected() {
    if (!groupName.trim()) return
    const name=groupName.trim()
    const targets=rows.filter((row)=>selectedRows.has(row.id))
    setRows((prev)=>prev.map((row)=>selectedRows.has(row.id)?{...row,data:{...row.data,_group:name}}:row))
    setSelectedRows(new Set());setGroupOpen(false);setGroupName('')
    await Promise.all(targets.map((row)=>persistRow(row,{...row.data,_group:name})))
  }

  async function ungroupSelected(){
    const targets=rows.filter((row)=>selectedRows.has(row.id))
    setRows((prev)=>prev.map((row)=>{if(!selectedRows.has(row.id))return row;const data={...row.data};delete data._group;return {...row,data}}))
    setSelectedRows(new Set())
    await Promise.all(targets.map((row)=>{const data={...row.data};delete data._group;return persistRow(row,data)}))
  }

  function uniqueColumnKey(){
    const used=new Set(list?.columns.map((c)=>c.key)??[])
    let i=1
    while(used.has('column_'+i))i++
    return 'column_'+i
  }

  async function insertColumn(index:number){
    if(!list)return
    const key=uniqueColumnKey()
    const col:Column={key,label:letter(index),kind:'text',width:DEFAULT_W,options:[]}
    const next={...list,columns:[...list.columns.slice(0,index),col,...list.columns.slice(index)]}
    await persistList(next)
  }

  async function deleteColumn(key:string){
    if(!list||list.columns.length<=1)return
    const next={...list,columns:list.columns.filter((col)=>col.key!==key)}
    setRows((prev)=>prev.map((row)=>{const data={...row.data};delete data[key];void persistRow(row,data);return {...row,data}}))
    setSelectedCols((prev)=>{const n=new Set(prev);n.delete(key);return n})
    await persistList(next)
  }

  async function renameColumn(key:string,label:string){
    if(!list||!label.trim())return
    setEditingHeader(null)
    await persistList({...list,columns:list.columns.map((col)=>col.key===key?{...col,label:label.trim()}:col)})
  }

  async function hideColumn(key:string){
    if(!list)return
    await persistList({...list,columns:list.columns.map((col)=>col.key===key?{...col,hidden:true}:col)})
  }

  async function showAllColumns(){
    if(!list)return
    await persistList({...list,columns:list.columns.map((col)=>({...col,hidden:false}))})
  }

  function startResizeColumn(key:string,event:ReactPointerEvent<HTMLDivElement>){
    if(!list)return
    event.preventDefault();event.stopPropagation()
    const start=event.clientX
    const col=list.columns.find((item)=>item.key===key)
    const startW=col?.width??DEFAULT_W
    const onMove=(ev:PointerEvent)=>{
      const width=Math.max(MIN_W,startW+(start-ev.clientX))
      setList((prev)=>prev?{...prev,columns:prev.columns.map((item)=>item.key===key?{...item,width}:item)}:prev)
    }
    const onUp=()=>{
      window.removeEventListener('pointermove',onMove);window.removeEventListener('pointerup',onUp)
      setList((current)=>{if(current)void persistList(current);return current})
    }
    window.addEventListener('pointermove',onMove);window.addEventListener('pointerup',onUp)
  }

  function startResizeRow(row:Row,event:ReactPointerEvent<HTMLDivElement>){
    event.preventDefault();event.stopPropagation()
    const start=event.clientY
    const startH=Math.max(28,Number(row.data._height)||34)
    const onMove=(ev:PointerEvent)=>{
      const height=Math.max(28,Math.min(180,startH+ev.clientY-start))
      setRows((prev)=>prev.map((item)=>item.id===row.id?{...item,data:{...item.data,_height:String(height)}}:item))
    }
    const onUp=()=>{
      window.removeEventListener('pointermove',onMove);window.removeEventListener('pointerup',onUp)
      const current=rows.find((item)=>item.id===row.id)
      if(current)void persistRow(current,current.data)
    }
    window.addEventListener('pointermove',onMove);window.addEventListener('pointerup',onUp)
  }

  async function copyCell(row:Row,col:Column,cut=false){
    const value=row.data[col.key]??''
    clipboard.current=value
    try{await navigator.clipboard.writeText(value)}catch{}
    if(cut)updateRow(row,col.key,'')
  }

  async function pasteCell(row:Row,col:Column){
    let value=clipboard.current
    try{value=await navigator.clipboard.readText()||value}catch{}
    updateRow(row,col.key,value)
  }

  function openMenu(event:ReactMouseEvent, next:MenuState){
    if(!editable)return
    event.preventDefault();event.stopPropagation()
    setMenu(next?{...next,x:event.clientX,y:event.clientY} as MenuState:null)
  }

  const grouped=useMemo(()=>{
    const out:Array<{kind:'group';name:string;count:number}|{kind:'row';row:Row}>=[]
    const seen=new Set<string>()
    for(const row of rows){
      const group=row.data._group?.trim()
      if(group){
        if(!seen.has(group)){seen.add(group);out.push({kind:'group',name:group,count:rows.filter((r)=>r.data._group===group).length})}
        if(!collapsedGroups.has(group))out.push({kind:'row',row})
      }else out.push({kind:'row',row})
    }
    return out
  },[rows,collapsedGroups])

  const tableWidth=Math.max(920,visibleColumns.reduce((sum,col)=>sum+(col.width??DEFAULT_W),0)+48)

  return (
    <div className="flex flex-col gap-4">
      <div onDoubleClick={()=>{if(editable&&list){setTitleDraft(list.title);setEditingTitle(true)}}}>
        {editingTitle&&list?(
          <input autoFocus value={titleDraft} onChange={(e)=>setTitleDraft(e.target.value)} onBlur={()=>{setEditingTitle(false);if(titleDraft.trim())void persistList({...list,title:titleDraft.trim()})}} onKeyDown={(e)=>{if(e.key==='Enter')e.currentTarget.blur()}} className="input-base mb-2 max-w-xl text-xl font-black"/>
        ):<SectionTitle eyebrow="GOOGLE SHEETS MODE" title={list?.title ?? page.title} desc={list?.description ?? page.description} icon={<List className="size-6" />} />}
      </div>

      <NeonCard glow className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/30 px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="rounded border border-border bg-background/50 px-2 py-1 font-mono text-[10px] text-muted-foreground">{rows.length} صف • {visibleColumns.length} عمود</span>
            {list?.columns.some((c)=>c.hidden)?<button type="button" onClick={()=>void showAllColumns()} className="text-[10px] font-bold text-primary">إظهار الأعمدة المخفية</button>:null}
          </div>
          {editable?<div className="flex flex-wrap items-center gap-1">
            <button type="button" onClick={()=>void addRow()} className="inline-flex items-center gap-1 rounded-md border border-border bg-background/50 px-2.5 py-1.5 text-[11px] font-bold text-muted-foreground hover:border-primary/40 hover:text-primary"><Rows3 className="size-3.5"/> صف</button>
            <button type="button" onClick={()=>void insertColumn(list?.columns.length??0)} className="inline-flex items-center gap-1 rounded-md border border-border bg-background/50 px-2.5 py-1.5 text-[11px] font-bold text-muted-foreground hover:border-primary/40 hover:text-primary"><Columns3 className="size-3.5"/> عمود</button>
            <button type="button" disabled={!selectedRows.size} onClick={()=>setGroupOpen(true)} className="inline-flex items-center gap-1 rounded-md border border-border bg-background/50 px-2.5 py-1.5 text-[11px] font-bold text-muted-foreground hover:border-primary/40 hover:text-primary disabled:opacity-30"><FolderPlus className="size-3.5"/> تجميع</button>
            <button type="button" disabled={!selectedRows.size} onClick={()=>void ungroupSelected()} className="inline-flex items-center gap-1 rounded-md border border-border bg-background/50 px-2.5 py-1.5 text-[11px] font-bold text-muted-foreground hover:border-primary/40 hover:text-primary disabled:opacity-30"><Minus className="size-3.5"/> فك</button>
            <button type="button" disabled={!selectedRows.size} onClick={()=>void removeSelectedRows()} className="inline-flex items-center gap-1 rounded-md border border-destructive/30 bg-destructive/5 px-2.5 py-1.5 text-[11px] font-bold text-destructive hover:bg-destructive/10 disabled:opacity-30"><Trash2 className="size-3.5"/> حذف</button>
          </div>:null}
        </div>

        <div className="max-h-[70vh] overflow-auto bg-background scrollbar-thin">
          <table className="border-collapse text-right text-xs" style={{width:tableWidth,minWidth:'100%'}}>
            <colgroup><col style={{width:48}}/>{visibleColumns.map((col)=><col key={col.key} style={{width:col.width??DEFAULT_W}}/>)}</colgroup>
            <thead className="sticky top-0 z-20">
              <tr className="h-7 border-b border-border bg-muted/70">
                <th className="sticky right-0 z-30 border-l border-border bg-muted/90"/>
                {visibleColumns.map((col,index)=>(
                  <th key={'letter-'+col.key} onClick={()=>setSelectedCols(new Set([col.key]))} onContextMenu={(e)=>openMenu(e,{x:0,y:0,kind:'col',col})} className={cn('border-l border-border px-2 text-center font-mono text-[10px] text-muted-foreground',selectedCols.has(col.key)&&'bg-primary/20 text-primary')}>{letter(index)}</th>
                ))}
              </tr>
              <tr className="h-8 border-b border-border bg-background/95">
                <th className="sticky right-0 z-30 border-l border-border bg-background/95 text-center font-mono text-[10px] text-muted-foreground">#</th>
                {visibleColumns.map((col,index)=>(
                  <th key={col.key} onContextMenu={(e)=>openMenu(e,{x:0,y:0,kind:'col',col})} className={cn('group relative border-l border-border px-1 font-bold text-primary',selectedCols.has(col.key)&&'bg-primary/10')}>
                    {editingHeader===col.key?(
                      <input autoFocus value={headerDraft} onChange={(e)=>setHeaderDraft(e.target.value)} onBlur={()=>void renameColumn(col.key,headerDraft)} onKeyDown={(e)=>{if(e.key==='Enter')e.currentTarget.blur();if(e.key==='Escape')setEditingHeader(null)}} className="h-7 w-full border-0 bg-transparent px-1 text-center outline-none"/>
                    ):(
                      <button type="button" onDoubleClick={()=>{if(editable){setEditingHeader(col.key);setHeaderDraft(col.label)}}} onClick={()=>setSelectedCols(new Set([col.key]))} className="h-7 w-full truncate text-center">{col.label||letter(index)}</button>
                    )}
                    {editable?<div role="separator" onPointerDown={(e)=>startResizeColumn(col.key,e)} className="absolute inset-y-0 right-0 w-2 cursor-col-resize touch-none"><span className="absolute right-0 top-1/4 h-1/2 w-px bg-border"/></div>:null}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grouped.map((item)=>{
                if(item.kind==='group'){
                  const collapsed=collapsedGroups.has(item.name)
                  return <tr key={'g-'+item.name} className="border-b border-primary/25 bg-primary/10"><td colSpan={visibleColumns.length+1} className="px-2 py-1.5"><button type="button" onClick={()=>setCollapsedGroups((prev)=>{const n=new Set(prev);n.has(item.name)?n.delete(item.name):n.add(item.name);return n})} className="inline-flex items-center gap-1.5 font-bold text-primary">{collapsed?<ChevronLeft className="size-3"/>:<ChevronDown className="size-3"/>}{item.name}<span className="font-mono text-[9px] text-muted-foreground">({item.count})</span></button></td></tr>
                }
                const row=item.row
                const rowIndex=rows.findIndex((r)=>r.id===row.id)
                return <tr key={row.id} style={{height:Number(row.data._height)||34}} className={cn('border-b border-border/70',selectedRows.has(row.id)&&'bg-primary/8')}>
                  <th onClick={()=>setSelectedRows(new Set([row.id]))} onContextMenu={(e)=>openMenu(e,{x:0,y:0,kind:'row',row})} className={cn('sticky right-0 z-10 relative border-l border-border bg-muted/55 text-center font-mono text-[10px] text-muted-foreground',selectedRows.has(row.id)&&'bg-primary/20 text-primary')}>
                    {rowIndex+1}
                    {editable?<div onPointerDown={(e)=>startResizeRow(row,e)} className="absolute inset-x-0 bottom-0 h-1.5 cursor-row-resize touch-none"/>:null}
                  </th>
                  {visibleColumns.map((col)=>(
                    <td key={col.key} onClick={()=>setSelectedCell({rowId:row.id,colKey:col.key})} onContextMenu={(e)=>openMenu(e,{x:0,y:0,kind:'cell',row,col})} className={cn('border-l border-border/70 p-0',selectedCell?.rowId===row.id&&selectedCell.colKey===col.key&&'outline outline-2 -outline-offset-2 outline-primary')}>
                      {col.kind==='select'?(
                        <select value={row.data[col.key]??''} onChange={(e)=>updateRow(row,col.key,e.target.value)} disabled={!editable} className="h-full min-h-8 w-full border-0 bg-transparent px-1.5 outline-none focus:bg-primary/5"><option value=""></option>{(col.options??[]).map((o)=><option key={o} value={o}>{o}</option>)}</select>
                      ):(
                        <input type={col.kind==='number'?'number':'text'} value={row.data[col.key]??''} onChange={(e)=>updateRow(row,col.key,e.target.value)} disabled={!editable} className="h-full min-h-8 w-full border-0 bg-transparent px-1.5 outline-none focus:bg-primary/5 disabled:cursor-default" />
                      )}
                    </td>
                  ))}
                </tr>
              })}
            </tbody>
          </table>
        </div>
      </NeonCard>

      {menu?<SheetMenu menu={menu} list={list} rows={rows} onClose={()=>setMenu(null)}
        onCopy={(row,col,cut)=>void copyCell(row,col,cut)}
        onPaste={(row,col)=>void pasteCell(row,col)}
        onClear={(row,col)=>updateRow(row,col.key,'')}
        onInsertRow={(row,after)=>{const i=rows.findIndex((r)=>r.id===row.id);void createRowAt(i+(after?1:0))}}
        onDeleteRow={(row)=>void removeRow(row)}
        onInsertCol={(col,after)=>{const i=list?.columns.findIndex((c)=>c.key===col.key)??0;void insertColumn(i+(after?1:0))}}
        onDeleteCol={(col)=>void deleteColumn(col.key)}
        onRenameCol={(col)=>{setEditingHeader(col.key);setHeaderDraft(col.label)}}
        onHideCol={(col)=>void hideColumn(col.key)}
      />:null}

      {groupOpen?(
        <div className="fixed inset-0 z-[170] flex items-center justify-center bg-black/75 p-3" onClick={()=>setGroupOpen(false)}>
          <div className="w-full max-w-md" onClick={(e)=>e.stopPropagation()}>
            <NeonCard glow className="p-5"><h4 className="font-heading text-lg font-extrabold">تجميع الصفوف المحددة</h4><input value={groupName} onChange={(e)=>setGroupName(e.target.value)} className="input-base mt-4" placeholder="اسم المجموعة"/><div className="mt-4 flex justify-end gap-2"><button type="button" onClick={()=>setGroupOpen(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-bold text-muted-foreground">إلغاء</button><button type="button" onClick={()=>void groupSelected()} className="rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">تجميع</button></div></NeonCard>
          </div>
        </div>
      ):null}
    </div>
  )
}

function SheetMenu({
  menu,onClose,onCopy,onPaste,onClear,onInsertRow,onDeleteRow,onInsertCol,onDeleteCol,onRenameCol,onHideCol,
}:{
  menu:Exclude<MenuState,null>;list:ListDef|null;rows:Row[];onClose:()=>void
  onCopy:(row:Row,col:Column,cut:boolean)=>void;onPaste:(row:Row,col:Column)=>void;onClear:(row:Row,col:Column)=>void
  onInsertRow:(row:Row,after:boolean)=>void;onDeleteRow:(row:Row)=>void
  onInsertCol:(col:Column,after:boolean)=>void;onDeleteCol:(col:Column)=>void;onRenameCol:(col:Column)=>void;onHideCol:(col:Column)=>void
}){
  const action=(fn:()=>void)=>()=>{fn();onClose()}
  return <div data-live-editor-ui="true" onClick={(e)=>e.stopPropagation()} className="fixed z-[260] min-w-56 overflow-hidden rounded-lg border border-border bg-card py-1 shadow-2xl" style={{left:Math.min(menu.x,window.innerWidth-250),top:Math.min(menu.y,window.innerHeight-420)}}>
    {menu.kind==='cell'?<>
      <MenuItem icon={<Scissors className="size-3.5"/>} label="قص" onClick={action(()=>onCopy(menu.row,menu.col,true))}/>
      <MenuItem icon={<Copy className="size-3.5"/>} label="نسخ" onClick={action(()=>onCopy(menu.row,menu.col,false))}/>
      <MenuItem label="لصق" onClick={action(()=>onPaste(menu.row,menu.col))}/>
      <Divider/><MenuItem label="مسح محتوى الخلية" onClick={action(()=>onClear(menu.row,menu.col))}/>
      <Divider/><MenuItem label="إدراج صف للأعلى" onClick={action(()=>onInsertRow(menu.row,false))}/><MenuItem label="إدراج صف للأسفل" onClick={action(()=>onInsertRow(menu.row,true))}/>
      <MenuItem label="إدراج عمود لليمين" onClick={action(()=>onInsertCol(menu.col,false))}/><MenuItem label="إدراج عمود لليسار" onClick={action(()=>onInsertCol(menu.col,true))}/>
    </>:null}
    {menu.kind==='row'?<>
      <MenuItem label="إدراج صف للأعلى" onClick={action(()=>onInsertRow(menu.row,false))}/><MenuItem label="إدراج صف للأسفل" onClick={action(()=>onInsertRow(menu.row,true))}/>
      <Divider/><MenuItem danger label="حذف الصف" onClick={action(()=>onDeleteRow(menu.row))}/>
    </>:null}
    {menu.kind==='col'?<>
      <MenuItem label="إدراج عمود لليمين" onClick={action(()=>onInsertCol(menu.col,false))}/><MenuItem label="إدراج عمود لليسار" onClick={action(()=>onInsertCol(menu.col,true))}/>
      <MenuItem label="إعادة تسمية العمود" onClick={action(()=>onRenameCol(menu.col))}/>
      <MenuItem icon={<EyeOff className="size-3.5"/>} label="إخفاء العمود" onClick={action(()=>onHideCol(menu.col))}/>
      <Divider/><MenuItem danger label="حذف العمود" onClick={action(()=>onDeleteCol(menu.col))}/>
    </>:null}
  </div>
}

function MenuItem({label,onClick,icon,danger=false}:{label:string;onClick:()=>void;icon?:React.ReactNode;danger?:boolean}){
  return <button type="button" onClick={onClick} className={cn('flex w-full items-center gap-2 px-3 py-2 text-right text-xs hover:bg-muted/60',danger?'text-destructive':'text-foreground')}>{icon}{label}</button>
}
function Divider(){return <div className="my-1 h-px bg-border"/>}
