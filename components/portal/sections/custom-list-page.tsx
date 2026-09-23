'use client'

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Columns3, FolderPlus, GripVertical, List, Minus, Plus, Rows3, Trash2 } from 'lucide-react'
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
}

const MIN_W=90
const DEFAULT_W=170

export function CustomListPage({ page }: { page: PageDefinition }) {
  const { token, can } = useAdmin()
  const listId = useMemo(() => {
    const block = page.blocks.find((item) => item.type === 'custom-list-config') as Extract<typeof page.blocks[number], { type: 'custom-list-config' }> | undefined
    return block?.listId ?? ''
  }, [page.blocks])

  const [list, setList] = useState<ListDef | null>(null)
  const [rows, setRows] = useState<Row[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const [newColumnOpen, setNewColumnOpen] = useState(false)
  const [newColumnLabel, setNewColumnLabel] = useState('')
  const [newColumnKind, setNewColumnKind] = useState<Column['kind']>('text')
  const [newColumnOptions, setNewColumnOptions] = useState('')
  const [groupOpen, setGroupOpen] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [editingHeader, setEditingHeader] = useState<string | null>(null)
  const [headerDraft, setHeaderDraft] = useState('')
  const editable = Boolean(token && can('roster.manage'))
  const saveTimer = useRef<Record<string, number>>({})

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
      if (document.visibilityState === 'visible') void load()
    }, 1300)
    return () => window.clearInterval(interval)
  }, [listId])

  async function persistList(next: ListDef) {
    if (!token) return
    setList(next)
    await fetch('/api/custom-lists', {
      method:'PATCH',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        token,
        id:next.id,
        title:next.title,
        description:next.description,
        sectorId:next.sector_id,
        columns:next.columns,
      }),
    })
  }

  async function addRow() {
    if (!token || !list) return
    const temp='temp-'+crypto.randomUUID()
    const data=Object.fromEntries(list.columns.map((c)=>[c.key,'']))
    data._height='44'
    setRows((prev)=>[...prev,{id:temp,data}])
    const res=await fetch('/api/custom-lists/rows',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,listId:list.id,data})})
    if(res.ok){const created=await res.json();setRows((prev)=>prev.map((r)=>r.id===temp?created:r))}
    else setRows((prev)=>prev.filter((r)=>r.id!==temp))
  }

  async function persistRow(row: Row, data: Record<string,string>) {
    if (!token || row.id.startsWith('temp-')) return
    await fetch('/api/custom-lists/rows',{
      method:'PATCH',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({token,id:row.id,data}),
    })
  }

  function updateRow(row: Row, key: string, value: string) {
    const data={...row.data,[key]:value}
    setRows((prev)=>prev.map((r)=>r.id===row.id?{...r,data}:r))
    if (saveTimer.current[row.id]) window.clearTimeout(saveTimer.current[row.id])
    saveTimer.current[row.id]=window.setTimeout(()=>void persistRow(row,data),250)
  }

  async function removeRow(row: Row) {
    if (!token) return
    setRows((prev)=>prev.filter((r)=>r.id!==row.id))
    setSelected((prev)=>{const next=new Set(prev);next.delete(row.id);return next})
    if(!row.id.startsWith('temp-')) await fetch('/api/custom-lists/rows',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,id:row.id})})
  }

  async function removeSelected() {
    const targets=rows.filter((row)=>selected.has(row.id))
    setRows((prev)=>prev.filter((row)=>!selected.has(row.id)))
    setSelected(new Set())
    await Promise.all(targets.filter((row)=>!row.id.startsWith('temp-')).map((row)=>fetch('/api/custom-lists/rows',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,id:row.id})})))
  }

  function toggleSelected(id:string){
    setSelected((prev)=>{const next=new Set(prev);next.has(id)?next.delete(id):next.add(id);return next})
  }

  async function groupSelected() {
    if (!groupName.trim()) return
    const name=groupName.trim()
    const targets=rows.filter((row)=>selected.has(row.id))
    const nextRows=rows.map((row)=>selected.has(row.id)?{...row,data:{...row.data,_group:name}}:row)
    setRows(nextRows)
    setSelected(new Set())
    setGroupOpen(false)
    setGroupName('')
    await Promise.all(targets.map((row)=>persistRow(row,{...row.data,_group:name})))
  }

  async function ungroupSelected(){
    const targets=rows.filter((row)=>selected.has(row.id))
    const nextRows=rows.map((row)=>{
      if(!selected.has(row.id)) return row
      const data={...row.data};delete data._group;return {...row,data}
    })
    setRows(nextRows);setSelected(new Set())
    await Promise.all(targets.map((row)=>{const data={...row.data};delete data._group;return persistRow(row,data)}))
  }

  async function addColumn(){
    if(!list || !newColumnLabel.trim()) return
    const base=newColumnLabel.trim().toLowerCase().replace(/[^a-z0-9؀-ۿ]+/gi,'_').replace(/^_+|_+$/g,'') || 'column'
    let key=base
    let n=2
    while(list.columns.some((col)=>col.key===key)){key=base+'_'+n++}
    const next:ListDef={...list,columns:[...list.columns,{key,label:newColumnLabel.trim(),kind:newColumnKind,options:newColumnKind==='select'?newColumnOptions.split(',').map((v)=>v.trim()).filter(Boolean):[],width:DEFAULT_W}]}
    setNewColumnOpen(false);setNewColumnLabel('');setNewColumnKind('text');setNewColumnOptions('')
    await persistList(next)
  }

  async function deleteColumn(key:string){
    if(!list || list.columns.length<=1) return
    const next:ListDef={...list,columns:list.columns.filter((col)=>col.key!==key)}
    setRows((prev)=>prev.map((row)=>{const data={...row.data};delete data[key];return {...row,data}}))
    await persistList(next)
  }

  async function renameColumn(key:string,label:string){
    if(!list || !label.trim()) return
    const next={...list,columns:list.columns.map((col)=>col.key===key?{...col,label:label.trim()}:col)}
    setEditingHeader(null)
    await persistList(next)
  }

  function startResizeColumn(key:string,event:ReactPointerEvent<HTMLDivElement>){
    if(!list) return
    event.preventDefault()
    const start=event.clientX
    const col=list.columns.find((item)=>item.key===key)
    const startW=col?.width??DEFAULT_W
    const onMove=(ev:PointerEvent)=>{
      const delta=start-ev.clientX
      const width=Math.max(MIN_W,startW+delta)
      setList((prev)=>prev?{...prev,columns:prev.columns.map((item)=>item.key===key?{...item,width}:item)}:prev)
    }
    const onUp=async()=>{
      window.removeEventListener('pointermove',onMove)
      window.removeEventListener('pointerup',onUp)
      setList((current)=>{if(current) void persistList(current);return current})
    }
    window.addEventListener('pointermove',onMove)
    window.addEventListener('pointerup',onUp)
  }

  function changeRowHeight(row:Row,delta:number){
    const current=Math.max(34,Number(row.data._height)||44)
    updateRow(row,'_height',String(Math.max(34,Math.min(180,current+delta))))
  }

  const grouped=useMemo(()=>{
    const out:Array<{kind:'group';name:string;count:number}|{kind:'row';row:Row}>=[]
    const seen=new Set<string>()
    for(const row of rows){
      const group=row.data._group?.trim()
      if(group){
        if(!seen.has(group)){
          seen.add(group)
          out.push({kind:'group',name:group,count:rows.filter((r)=>r.data._group===group).length})
        }
        if(!collapsedGroups.has(group)) out.push({kind:'row',row})
      }else out.push({kind:'row',row})
    }
    return out
  },[rows,collapsedGroups])

  return (
    <div className="flex flex-col gap-6">
      <SectionTitle eyebrow="CUSTOM OPERATIONS SHEET" title={list?.title ?? page.title} desc={list?.description ?? page.description} icon={<List className="size-6" />} />

      <NeonCard glow className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/30 px-3 py-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-border bg-background/40 px-2 py-1 font-mono text-[10px] text-muted-foreground">{rows.length} صف • {list?.columns.length??0} عمود</span>
            {selected.size?<span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">{selected.size} محدد</span>:null}
          </div>
          {editable ? <div className="flex flex-wrap items-center gap-1.5">
            <button type="button" onClick={()=>void addRow()} className="inline-flex items-center gap-1 rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1.5 text-xs font-bold text-primary"><Rows3 className="size-3.5"/> صف</button>
            <button type="button" onClick={()=>setNewColumnOpen(true)} className="inline-flex items-center gap-1 rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1.5 text-xs font-bold text-primary"><Columns3 className="size-3.5"/> عمود</button>
            <button type="button" disabled={!selected.size} onClick={()=>setGroupOpen(true)} className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-bold text-muted-foreground disabled:opacity-35"><FolderPlus className="size-3.5"/> تجميع</button>
            <button type="button" disabled={!selected.size} onClick={()=>void ungroupSelected()} className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-bold text-muted-foreground disabled:opacity-35"><Minus className="size-3.5"/> فك التجميع</button>
            <button type="button" disabled={!selected.size} onClick={()=>void removeSelected()} className="inline-flex items-center gap-1 rounded-md border border-destructive/40 bg-destructive/10 px-2.5 py-1.5 text-xs font-bold text-destructive disabled:opacity-35"><Trash2 className="size-3.5"/> حذف</button>
          </div>:null}
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="border-collapse text-right" style={{minWidth:(list?.columns??[]).reduce((sum,col)=>sum+(col.width??DEFAULT_W),0)+(editable?110:42)}}>
            <colgroup>
              <col style={{width:42}}/>
              {(list?.columns??[]).map((col)=><col key={col.key} style={{width:col.width??DEFAULT_W}}/> )}
              {editable?<col style={{width:68}}/>:null}
            </colgroup>
            <thead>
              <tr className="border-b border-border bg-background/55">
                <th className="w-10 border-l border-border/60 px-2 py-2 text-center text-[10px] text-muted-foreground">#</th>
                {(list?.columns??[]).map((col)=>(
                  <th key={col.key} className="group relative border-l border-border/60 px-2 py-2 text-xs font-bold text-primary">
                    {editingHeader===col.key?(
                      <input autoFocus value={headerDraft} onChange={(e)=>setHeaderDraft(e.target.value)} onBlur={()=>void renameColumn(col.key,headerDraft)} onKeyDown={(e)=>{if(e.key==='Enter')void renameColumn(col.key,headerDraft);if(e.key==='Escape')setEditingHeader(null)}} className="w-full rounded border border-primary/40 bg-background px-2 py-1 text-xs text-foreground outline-none"/>
                    ):(
                      <button type="button" disabled={!editable} onDoubleClick={()=>{setEditingHeader(col.key);setHeaderDraft(col.label)}} className="w-full truncate text-right disabled:cursor-default" title={editable?'اضغط مرتين لتغيير اسم العمود':undefined}>{col.label}</button>
                    )}
                    {editable?<button type="button" onClick={()=>void deleteColumn(col.key)} title="حذف العمود" className="absolute left-2 top-1/2 -translate-y-1/2 rounded p-1 text-destructive opacity-0 transition-opacity group-hover:opacity-100"><Trash2 className="size-3"/></button>:null}
                    {editable?<div role="separator" onPointerDown={(e)=>startResizeColumn(col.key,e)} className="absolute inset-y-0 right-0 z-10 w-2 cursor-col-resize touch-none"><span className="absolute right-0 top-1/4 h-1/2 w-px bg-border"/></div>:null}
                  </th>
                ))}
                {editable?<th className="px-2 py-2"/>:null}
              </tr>
            </thead>
            <tbody>
              {grouped.map((item,index)=>{
                if(item.kind==='group'){
                  const collapsed=collapsedGroups.has(item.name)
                  return <tr key={'g-'+item.name} className="border-y border-primary/25 bg-primary/8"><td colSpan={(list?.columns.length??0)+(editable?2:1)} className="px-3 py-2">
                    <button type="button" onClick={()=>setCollapsedGroups((prev)=>{const next=new Set(prev);next.has(item.name)?next.delete(item.name):next.add(item.name);return next})} className="inline-flex items-center gap-2 text-xs font-extrabold text-primary">
                      {collapsed?<ChevronLeft className="size-3.5"/>:<ChevronDown className="size-3.5"/>}{item.name}<span className="font-mono text-[10px] text-muted-foreground">({item.count})</span>
                    </button>
                  </td></tr>
                }
                const row=item.row
                const visualIndex=rows.findIndex((r)=>r.id===row.id)+1
                return (
                  <tr key={row.id} className={cn('border-b border-border/60 hover:bg-muted/10',selected.has(row.id)&&'bg-primary/8')} style={{height:Number(row.data._height)||44}}>
                    <td className="border-l border-border/50 px-1 text-center">
                      {editable?<label className="flex h-full cursor-pointer items-center justify-center gap-1"><input type="checkbox" checked={selected.has(row.id)} onChange={()=>toggleSelected(row.id)} className="size-3.5 accent-cyan-400"/><span className="font-mono text-[10px] text-muted-foreground">{visualIndex}</span></label>:<span className="font-mono text-[10px] text-muted-foreground">{visualIndex}</span>}
                    </td>
                    {(list?.columns??[]).map((col)=>(
                      <td key={col.key} className="border-l border-border/50 p-0">
                        {col.kind==='select' ? (
                          <select value={row.data[col.key]??''} onChange={(e)=>updateRow(row,col.key,e.target.value)} disabled={!editable} className="h-full w-full min-w-0 border-0 bg-transparent px-2 py-2 text-xs text-foreground outline-none focus:bg-primary/5 disabled:opacity-80">
                            <option value="">—</option>{(col.options??[]).map((o)=><option key={o} value={o}>{o}</option>)}
                          </select>
                        ) : (
                          <input type={col.kind==='number'?'number':'text'} value={row.data[col.key]??''} onChange={(e)=>updateRow(row,col.key,e.target.value)} disabled={!editable} className="h-full w-full min-w-0 border-0 bg-transparent px-2 py-2 text-xs text-foreground outline-none focus:bg-primary/5 disabled:opacity-80" />
                        )}
                      </td>
                    ))}
                    {editable?<td className="px-1">
                      <div className="flex items-center justify-center gap-0.5">
                        <button type="button" onClick={()=>changeRowHeight(row,8)} title="تكبير الصف" className="rounded p-1 text-muted-foreground hover:text-primary"><ChevronUp className="size-3"/></button>
                        <button type="button" onClick={()=>changeRowHeight(row,-8)} title="تصغير الصف" className="rounded p-1 text-muted-foreground hover:text-primary"><ChevronDown className="size-3"/></button>
                        <button type="button" onClick={()=>void removeRow(row)} title="حذف الصف" className="rounded p-1 text-destructive"><Trash2 className="size-3.5"/></button>
                      </div>
                    </td>:null}
                  </tr>
                )
              })}
              {!rows.length?<tr><td colSpan={(list?.columns.length??0)+(editable?2:1)} className="px-4 py-12 text-center text-sm text-muted-foreground">لا توجد بيانات بعد — اضغط «صف» للبدء.</td></tr>:null}
            </tbody>
          </table>
        </div>
      </NeonCard>

      {newColumnOpen?(
        <div className="fixed inset-0 z-[170] flex items-center justify-center bg-black/75 p-3" onClick={()=>setNewColumnOpen(false)}>
          <div className="w-full max-w-md" onClick={(e)=>e.stopPropagation()}>
            <NeonCard glow className="p-5">
              <h4 className="font-heading text-lg font-extrabold">إضافة عمود</h4>
              <div className="mt-4 grid gap-3">
                <label><span className="mb-1 block text-xs font-bold text-muted-foreground">اسم العمود</span><input value={newColumnLabel} onChange={(e)=>setNewColumnLabel(e.target.value)} className="input-base" placeholder="مثال: الحالة"/></label>
                <label><span className="mb-1 block text-xs font-bold text-muted-foreground">نوع الخلية</span><select value={newColumnKind} onChange={(e)=>setNewColumnKind(e.target.value as Column['kind'])} className="input-base"><option value="text">نص</option><option value="number">رقم</option><option value="select">قائمة اختيارات</option></select></label>
                {newColumnKind==='select'?<label><span className="mb-1 block text-xs font-bold text-muted-foreground">الاختيارات — افصل بفاصلة</span><input value={newColumnOptions} onChange={(e)=>setNewColumnOptions(e.target.value)} className="input-base" placeholder="فعال, تدريب, موقوف"/></label>:null}
              </div>
              <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={()=>setNewColumnOpen(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-bold text-muted-foreground">إلغاء</button><button type="button" onClick={()=>void addColumn()} className="rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">إضافة</button></div>
            </NeonCard>
          </div>
        </div>
      ):null}

      {groupOpen?(
        <div className="fixed inset-0 z-[170] flex items-center justify-center bg-black/75 p-3" onClick={()=>setGroupOpen(false)}>
          <div className="w-full max-w-md" onClick={(e)=>e.stopPropagation()}>
            <NeonCard glow className="p-5">
              <h4 className="font-heading text-lg font-extrabold">تجميع الصفوف المحددة</h4>
              <p className="mt-1 text-xs text-muted-foreground">سيظهر عنوان مجموعة يمكن فتحه وإغلاقه مثل مجموعات Sheets.</p>
              <input value={groupName} onChange={(e)=>setGroupName(e.target.value)} className="input-base mt-4" placeholder="مثال: وحدة التحقيقات"/>
              <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={()=>setGroupOpen(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-bold text-muted-foreground">إلغاء</button><button type="button" onClick={()=>void groupSelected()} className="rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">تجميع</button></div>
            </NeonCard>
          </div>
        </div>
      ):null}
    </div>
  )
}
