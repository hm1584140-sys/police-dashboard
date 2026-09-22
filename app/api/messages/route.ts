import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getServerSupabase } from '@/lib/supabase-server'
import { writeAuditLog } from '@/lib/audit'

async function getOwner(token: string | null) {
  const session = await getSession(token)
  return session?.role === 'owner' ? session : null
}

function matches(
  row: { audience: string; recipient_username?: string | null },
  session: { username: string; is_banned?: boolean },
) {
  if (row.audience === 'all') return true
  if (row.audience === 'user') return row.recipient_username === session.username
  if (row.audience === 'banned') return Boolean(session.is_banned)
  if (row.audience === 'online') return true
  return false
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')
  const owner = await getOwner(token)
  const db = getServerSupabase()

  const { data, error } = await db.from('pd_messages').select('id,audience,recipient_username,title,body,created_by,created_at').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (owner) return NextResponse.json(data ?? [])

  const session = await getSession(token)
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

  return NextResponse.json((data ?? []).filter((row) => matches(row, session)))
}

export async function POST(req: Request) {
  try {
    const { token, audience, recipientUsername, title, body } = await req.json()
    const owner = await getOwner(token)
    if (!owner) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    if (!['all', 'online', 'banned', 'user'].includes(audience)) return NextResponse.json({ error: 'نوع الجمهور غير صحيح' }, { status: 400 })

    const { data, error } = await getServerSupabase().from('pd_messages').insert({
      audience,
      recipient_username: audience === 'user' ? String(recipientUsername ?? '').trim().toLowerCase() : null,
      title: String(title ?? '').trim(),
      body: String(body ?? '').trim(),
      created_by: owner.username,
    }).select('id,audience,recipient_username,title,body,created_by,created_at').single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    await writeAuditLog(owner, 'message_send', 'message', data.id, { audience, recipientUsername: data.recipient_username, title: data.title })
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'تعذر إرسال الرسالة' }, { status: 400 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { token, id } = await req.json()
    const owner = await getOwner(token)
    if (!owner) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    const { error } = await getServerSupabase().from('pd_messages').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    await writeAuditLog(owner, 'message_delete', 'message', String(id))
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'تعذر حذف الرسالة' }, { status: 400 })
  }
}
