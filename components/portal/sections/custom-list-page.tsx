'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, List } from 'lucide-react'
import type { PageDefinition } from '@/lib/page-types'
import { useAdmin } from '@/lib/admin-context'
import { NeonCard, SectionTitle } from '../primitives'

type Column = { key: string; label: string; kind: 'text' | 'number' | 'select'; options?: string[] }
type ListDef = { id: string; title: string; description: string; sector_id: string | null; columns: Column[] }
type Row = { id: string; data: Record<string,string> }

export function CustomListPage({ page }: { page: PageDefinition }) {
  const { token, can } = useAdmin()
  const listId = useMemo(() => {
    const block = page.blocks.find((item) => item.type === 'custom-list-config') as Extract<typeof page.blocks[number], { type: 'custom-list-config' }> | undefined
    return block?.listId ?? ''
  }, [page.blocks])
  const [list, setList] = useState<ListDef | null>(null)
  const [rows, setRows] = useState<Row[]>([])
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
      if (document.visibilityState === 'visible') void load()
    }, 1200)
    return () => window.clearInterval(interval)
  }, [listId])

  async function addRow() {
    if (!token || !list) return
    const temp='temp-'+crypto.randomUUID()
    const data=Object.fromEntries(list.columns.map((c)=>[c.key,'']))
    setRows((prev)=>[...prev,{id:temp,data}])
    const res=await fetch('/api/custom-lists/rows',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,listId:list.id,data})})
    if(res.ok){const created=await res.json();setRows((prev)=>prev.map((r)=>r.id===temp?created:r))}
    else setRows((prev)=>prev.filter((r)=>r.id!==temp))
  }

  async function updateRow(row: Row, key: string, value: string) {
    if (!token || row.id.startsWith('temp-')) return
    const data={...row.data,[key]:value}
    setRows((prev)=>prev.map((r)=>r.id===row.id?{...r,data}:r))
    await fetch('/api/custom-lists/rows',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,id:row.id,data})})
  }

  async function removeRow(row: Row) {
    if (!token) return
    setRows((prev)=>prev.filter((r)=>r.id!==row.id))
    if(!row.id.startsWith('temp-')) await fetch('/api/custom-lists/rows',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,id:row.id})})
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionTitle eyebrow="CUSTOM OPERATIONS LIST" title={list?.title ?? page.title} desc={list?.description ?? page.description} icon={<List className="size-6" />} />
      <NeonCard glow className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
          <span className="text-xs text-muted-foreground">{rows.length} صف</span>
          {editable ? <button type="button" onClick={()=>void addRow()} className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-bold text-primary"><Plus className="size-4"/> إضافة صف</button> : null}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-right">
            <thead><tr className="border-b border-border bg-background/40">{(list?.columns??[]).map((col)=><th key={col.key} className="whitespace-nowrap px-3 py-3 text-xs font-bold text-primary">{col.label}</th>)}{editable?<th/>:null}</tr></thead>
            <tbody>
              {rows.map((row)=>(
                <tr key={row.id} className="border-b border-border/60">
                  {(list?.columns??[]).map((col)=>(
                    <td key={col.key} className="px-2 py-2">
                      {col.kind==='select' ? (
                        <select value={row.data[col.key]??''} onChange={(e)=>void updateRow(row,col.key,e.target.value)} disabled={!editable} className="input-base min-w-32">
                          <option value="">—</option>{(col.options??[]).map((o)=><option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input type={col.kind==='number'?'number':'text'} value={row.data[col.key]??''} onChange={(e)=>void updateRow(row,col.key,e.target.value)} disabled={!editable} className="input-base min-w-32" />
                      )}
                    </td>
                  ))}
                  {editable?<td className="px-2 py-2"><button type="button" onClick={()=>void removeRow(row)} className="rounded-md border border-destructive/40 p-2 text-destructive"><Trash2 className="size-4"/></button></td>:null}
                </tr>
              ))}
              {!rows.length?<tr><td colSpan={(list?.columns.length??0)+1} className="px-4 py-12 text-center text-sm text-muted-foreground">لا توجد بيانات بعد.</td></tr>:null}
            </tbody>
          </table>
        </div>
      </NeonCard>
    </div>
  )
}
