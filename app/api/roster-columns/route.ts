import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getServerSupabase } from '@/lib/supabase-server'

async function requireOwner(token: string | null) {
  const session = await getSession(token)
  return session?.role === 'owner' ? session : null
}

export async function GET(req: Request) {
  const sector = new URL(req.url).searchParams.get('sector')
  if (!sector) return NextResponse.json({ error: 'sector مطلوب' }, { status: 400 })
  const { data, error } = await getServerSupabase().from('pd_roster_columns').select('*').eq('sector_id', sector).order('position', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (!(await requireOwner(body.token))) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    const label = String(body.label ?? '').trim()
    const sectorId = String(body.sectorId ?? '').trim()
    const key = label.toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]+/gi, '_').replace(/^_+|_+$/g, '').slice(0, 50)
    if (!sectorId || !label || !key) return NextResponse.json({ error: 'بيانات العمود ناقصة' }, { status: 400 })

    const db = getServerSupabase()
    const { count } = await db.from('pd_roster_columns').select('id', { count: 'exact', head: true }).eq('sector_id', sectorId)
    const { data, error } = await db.from('pd_roster_columns').insert({
      sector_id: sectorId,
      column_key: key,
      label,
      kind: ['text', 'number', 'select'].includes(body.kind) ? body.kind : 'text',
      options: Array.isArray(body.options) ? body.options : [],
      position: count ?? 0,
    }).select('*').single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'تعذر إضافة العمود' }, { status: 400 })
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    if (!(await requireOwner(body.token))) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    const { data, error } = await getServerSupabase().from('pd_roster_columns').update({
      label: String(body.label ?? '').trim(),
      kind: ['text', 'number', 'select'].includes(body.kind) ? body.kind : 'text',
      options: Array.isArray(body.options) ? body.options : [],
    }).eq('id', body.id).select('*').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'تعذر تعديل العمود' }, { status: 400 })
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    if (!(await requireOwner(body.token))) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    const { error } = await getServerSupabase().from('pd_roster_columns').delete().eq('id', body.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'تعذر حذف العمود' }, { status: 400 })
  }
}
