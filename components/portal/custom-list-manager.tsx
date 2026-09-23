'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, X, ListPlus } from 'lucide-react'
import { NeonCard, Pill } from './primitives'
import { useSector } from '@/lib/sector-context'

type Col = { key: string; label: string; kind: 'text' | 'number' | 'select'; options: string[] }
type Item = { id: string; title: string; description: string; sector_id: string | null; columns: Col[]; is_visible: boolean }

export function CustomListManager({ token, onClose }: { token:string; onClose:()=>void }) {
  const { sectors } = useSector()
  const [items,setItems]=useState<Item[]>([])
  const [title,setTitle]=useState('')
  const [description,setDescription]=useState('')
  const [sector,setSector]=useState('')
  const [columns,setColumns]=useState<Col[]>([
    { key:'name', label:'الاسم', kind:'text', options:[] },
    { key:'notes', label:'ملاحظات', kind:'text', options:[] },
  ])
  const [message,setMessage]=useState('')
  const [saving,setSaving]=useState(false)

  async function load(){
    const res=await fetch('/api/custom-lists',{cache:'no-store'})
    if(res.ok)setItems(await res.json())
  }
  useEffect(()=>{void load()},[])

  function patchColumn(index:number, patch:Partial<Col>){
    setColumns((prev)=>prev.map((col,i)=>i===index?{...col,...patch}:col))
  }

  async function create(){
    if(!title.trim() || !columns.some((c)=>c.label.trim())) return setMessage('اكتب اسم القائمة وأضف عموداً واحداً على الأقل')
    setSaving(true);setMessage('')
    const cleaned=columns.filter((c)=>c.label.trim()).map((c,i)=>({
      ...c,
      key:(c.key||c.label||('field'+i)).trim().toLowerCase().replace(/[^a-z0-9؀-ۿ]+/gi,'_'),
    }))
    const res=await fetch('/api/custom-lists',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
      token,title,description,sectorId:sector||null,columns:cleaned,
    })})
    const data=await res.json().catch(()=>({}))
    setSaving(false)
    if(!res.ok)return setMessage(data.error??'تعذر إنشاء القائمة')
    setTitle('');setDescription('');setSector('');setColumns([{key:'name',label:'الاسم',kind:'text',options:[]},{key:'notes',label:'ملاحظات',kind:'text',options:[]}])
    setMessage('تم إنشاء القائمة وستظهر تلقائياً في الموقع ✓')
    window.dispatchEvent(new CustomEvent('pd:pages-changed'))
    await load()
  }

  async function remove(item:Item){
    setItems((prev)=>prev.filter((x)=>x.id!==item.id))
    const res=await fetch('/api/custom-lists',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,id:item.id})})
    if(!res.ok){setMessage('تعذر حذف القائمة');await load();return}
    window.dispatchEvent(new CustomEvent('pd:pages-changed'))
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/75 p-3" onClick={onClose}>
      <div className="w-full max-w-5xl" onClick={(e)=>e.stopPropagation()}>
        <NeonCard glow className="max-h-[92vh] overflow-y-auto p-5">
          <div className="mb-5 flex items-center justify-between">
            <div><h3 className="font-heading text-xl font-extrabold">إنشاء قائمة تشغيلية مخصصة</h3><p className="mt-1 text-xs text-muted-foreground">مثل كشف القوات الرقمي، لكن باسمك وأعمدتك والقطاع الذي تختاره.</p></div>
            <button type="button" onClick={onClose} className="rounded-md border border-border p-2"><X className="size-4"/></button>
          </div>

          {message?<div className="mb-4 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">{message}</div>:null}

          <div className="grid gap-3 sm:grid-cols-2">
            <label><span className="mb-1 block text-xs font-bold text-muted-foreground">اسم القائمة</span><input value={title} onChange={(e)=>setTitle(e.target.value)} className="input-base" placeholder="مثال: مكتب التحقيقات LSPD"/></label>
            <label><span className="mb-1 block text-xs font-bold text-muted-foreground">القطاع</span><select value={sector} onChange={(e)=>setSector(e.target.value)} className="input-base"><option value="">كل القطاعات / بدون ربط</option>{sectors.map((s)=><option key={s.id} value={s.id}>{s.code??s.id} — {s.arabic}</option>)}</select></label>
            <label className="sm:col-span-2"><span className="mb-1 block text-xs font-bold text-muted-foreground">الوصف</span><input value={description} onChange={(e)=>setDescription(e.target.value)} className="input-base" placeholder="وصف مختصر للقائمة"/></label>
          </div>

          <div className="mt-5 rounded-xl border border-border bg-background/30 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div><h4 className="font-heading text-sm font-extrabold">الأعمدة</h4><p className="mt-1 text-[11px] text-muted-foreground">كل سطر هنا هو عمود فعلي سيظهر في القائمة.</p></div>
              <button type="button" onClick={()=>setColumns((prev)=>[...prev,{key:'',label:'',kind:'text',options:[]}])} className="inline-flex items-center gap-1 rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-bold text-primary"><Plus className="size-3.5"/> عمود جديد</button>
            </div>
            <div className="space-y-2">
              {columns.map((col,index)=>(
                <div key={index} className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-[1.2fr_.8fr_1.4fr_auto]">
                  <input value={col.label} onChange={(e)=>patchColumn(index,{label:e.target.value})} className="input-base" placeholder="اسم العمود"/>
                  <select value={col.kind} onChange={(e)=>patchColumn(index,{kind:e.target.value as Col['kind']})} className="input-base"><option value="text">نص</option><option value="number">رقم</option><option value="select">اختيارات</option></select>
                  {col.kind==='select'?<input value={col.options.join(', ')} onChange={(e)=>patchColumn(index,{options:e.target.value.split(',').map((v)=>v.trim()).filter(Boolean)})} className="input-base" placeholder="مثال: فعال, موقوف, تدريب"/>:<div className="hidden sm:block"/>}
                  <button type="button" onClick={()=>setColumns((prev)=>prev.filter((_,i)=>i!==index))} className="rounded-md border border-destructive/40 p-2 text-destructive"><Trash2 className="size-4"/></button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button type="button" disabled={saving} onClick={()=>void create()} className="inline-flex items-center gap-2 rounded-lg border border-primary/50 bg-primary/15 px-4 py-2 text-sm font-bold text-primary disabled:opacity-50"><ListPlus className="size-4"/>{saving?'جاري الإنشاء...':'إنشاء القائمة'}</button>
          </div>

          <div className="mt-6 border-t border-border pt-5">
            <h4 className="mb-3 font-heading text-sm font-extrabold">القوائم المخصصة الحالية</h4>
            <div className="grid gap-2">
              {items.map((item)=>(
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/30 p-3">
                  <div><div className="flex items-center gap-2"><span className="font-heading text-sm font-bold">{item.title}</span>{item.sector_id?<Pill tone="muted">{item.sector_id}</Pill>:null}</div><p className="mt-1 text-xs text-muted-foreground">{item.columns.length} أعمدة • {item.description||'بدون وصف'}</p></div>
                  <button type="button" onClick={()=>void remove(item)} className="rounded-md border border-destructive/40 p-2 text-destructive"><Trash2 className="size-4"/></button>
                </div>
              ))}
              {!items.length?<p className="py-8 text-center text-xs text-muted-foreground">لا توجد قوائم مخصصة بعد.</p>:null}
            </div>
          </div>
        </NeonCard>
      </div>
    </div>
  )
}
