import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getServerSupabase } from '@/lib/supabase-server'
import { hasPermission } from '@/lib/permissions'
import { writeAuditLog } from '@/lib/audit'

async function requireEditor(token: string | null) {
  const session = await getSession(token)
  return hasPermission(session, 'roster.manage') ? session : null
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const listId = searchParams.get('listId')
  if (!listId) return NextResponse.json({ error: 'listId مطلوب' }, { status: 400 })
  const { data, error } = await getServerSupabase()
    .from('pd_custom_list_rows')
    .select('id,list_id,data,created_at,updated_at')
    .eq('list_id', listId)
    .order('created_at', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: Request) {
  try {
    const { token, listId, data } = await req.json()
    const session = await requireEditor(token)
    if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    const { data: row, error } = await getServerSupabase()
      .from('pd_custom_list_rows')
      .insert({ list_id: String(listId), data: data && typeof data === 'object' ? data : {} })
      .select('id,list_id,data,created_at,updated_at')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    await writeAuditLog(session, 'custom_list_row_create', 'custom_list_row', String(row.id), { listId })
    return NextResponse.json(row, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'تعذر إضافة الصف' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { token, id, data } = await req.json()
    const session = await requireEditor(token)
    if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    const { data: row, error } = await getServerSupabase()
      .from('pd_custom_list_rows')
      .update({ data: data && typeof data === 'object' ? data : {}, updated_at: new Date().toISOString() })
      .eq('id', String(id))
      .select('id,list_id,data,created_at,updated_at')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    await writeAuditLog(session, 'custom_list_row_update', 'custom_list_row', String(id))
    return NextResponse.json(row)
  } catch {
    return NextResponse.json({ error: 'تعذر تعديل الصف' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { token, id } = await req.json()
    const session = await requireEditor(token)
    if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    const { error } = await getServerSupabase().from('pd_custom_list_rows').delete().eq('id', String(id))
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    await writeAuditLog(session, 'custom_list_row_delete', 'custom_list_row', String(id))
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'تعذر حذف الصف' }, { status: 500 })
  }
}
