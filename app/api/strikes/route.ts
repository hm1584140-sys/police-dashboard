import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getServerSupabase } from '@/lib/supabase-server'
import { strikes as defaultStrikes } from '@/lib/police-data'

async function staff(token: string | null) {
  const session = await getSession(token)
  return session && ['admin', 'owner'].includes(session.role) ? session : null
}

async function ensureSeeded() {
  const db = getServerSupabase()
  const { count } = await db.from('strikes').select('id', { count: 'exact', head: true })
  if ((count ?? 0) > 0) return
  await db.from('strikes').insert(defaultStrikes.map((row, index) => ({
    code: row.code,
    description: row.desc,
    points: row.points,
    is_critical: Boolean(row.critical),
    position: index,
  })))
}

export async function GET(req: Request) {
  await ensureSeeded()
  const { data, error } = await getServerSupabase().from('strikes').select('id,code,description,points,is_critical,position').order('position', { ascending: true })
  if (error) return NextResponse.json({ error: 'تعذر تحميل الجزاءات' }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (!(await staff(body.token))) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    const db = getServerSupabase()
    const { count } = await db.from('strikes').select('id', { count: 'exact', head: true })
    const { data, error } = await db.from('strikes').insert({
      code: String(body.code ?? ''),
      description: String(body.description ?? ''),
      points: Number(body.points ?? 0),
      is_critical: Boolean(body.isCritical),
      position: count ?? 0,
    }).select('id,code,description,points,is_critical,position').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'تعذر إضافة البند' }, { status: 400 })
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    if (!(await staff(body.token))) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    const dbPatch: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (body.code !== undefined) dbPatch.code = String(body.code)
    if (body.description !== undefined) dbPatch.description = String(body.description)
    if (body.points !== undefined) dbPatch.points = Number(body.points)
    if (body.isCritical !== undefined) dbPatch.is_critical = Boolean(body.isCritical)
    const { data, error } = await getServerSupabase().from('strikes').update(dbPatch).eq('id', body.id).select('id,code,description,points,is_critical,position').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'تعذر تعديل البند' }, { status: 400 })
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    if (!(await staff(body.token))) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    const { error } = await getServerSupabase().from('strikes').delete().eq('id', body.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'تعذر حذف البند' }, { status: 400 })
  }
}
