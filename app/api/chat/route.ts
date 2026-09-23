import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getServerSupabase } from '@/lib/supabase-server'
import { hasPermission } from '@/lib/permissions'
import { writeAuditLog } from '@/lib/audit'

export const runtime = 'nodejs'

async function sessionFrom(token: unknown) {
  return getSession(typeof token === 'string' ? token : null)
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const session = await sessionFrom(searchParams.get('token'))
  if (!session || session.is_banned) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

  const db = getServerSupabase()
  const [{ data: settings }, { data: restriction }, { data: messages, error }] = await Promise.all([
    db.from('pd_chat_settings').select('is_open,updated_at,updated_by').eq('id', 'global').maybeSingle(),
    db.from('pd_chat_restrictions').select('muted,timeout_until,reason').eq('username', session.username).maybeSingle(),
    db.from('pd_chat_messages').select('id,username,discord_name,body,created_at').order('created_at', { ascending: false }).limit(80),
  ])

  if (error) return NextResponse.json({ error: 'تعذر تحميل الشات' }, { status: 500 })

  return NextResponse.json({
    open: settings?.is_open !== false,
    messages: (messages ?? []).reverse(),
    restriction: restriction ?? { muted: false, timeout_until: null, reason: '' },
    canManage: hasPermission(session, 'chat.manage'),
    canModerate: hasPermission(session, 'chat.moderate'),
  })
}

export async function POST(req: Request) {
  try {
    const { token, body } = await req.json()
    const session = await sessionFrom(token)
    if (!session || session.is_banned) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    const text = String(body ?? '').trim().slice(0, 800)
    if (!text) return NextResponse.json({ error: 'اكتب رسالة أولاً' }, { status: 400 })

    const db = getServerSupabase()
    const [{ data: settings }, { data: restriction }] = await Promise.all([
      db.from('pd_chat_settings').select('is_open').eq('id', 'global').maybeSingle(),
      db.from('pd_chat_restrictions').select('muted,timeout_until,reason').eq('username', session.username).maybeSingle(),
    ])

    if (settings?.is_open === false && !hasPermission(session, 'chat.manage')) {
      return NextResponse.json({ error: 'الشات مغلق حالياً' }, { status: 403 })
    }
    if (restriction?.muted) return NextResponse.json({ error: restriction.reason || 'تم منعك من الكتابة في الشات' }, { status: 403 })
    if (restriction?.timeout_until && new Date(restriction.timeout_until).getTime() > Date.now()) {
      return NextResponse.json({ error: 'عندك تايم أوت من الشات حتى ' + new Date(restriction.timeout_until).toLocaleString('ar') }, { status: 403 })
    }

    const { data, error } = await db.from('pd_chat_messages').insert({
      username: session.username,
      discord_name: session.discord_name ?? '',
      body: text,
    }).select('id,username,discord_name,body,created_at').single()

    if (error) return NextResponse.json({ error: 'تعذر إرسال الرسالة' }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { token, action, username, minutes, reason, open } = await req.json()
    const session = await sessionFrom(token)
    if (!session || session.is_banned) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    const db = getServerSupabase()

    if (action === 'set_open') {
      if (!hasPermission(session, 'chat.manage')) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
      const { error } = await db.from('pd_chat_settings').upsert({
        id: 'global',
        is_open: Boolean(open),
        updated_at: new Date().toISOString(),
        updated_by: session.username,
      })
      if (error) return NextResponse.json({ error: 'تعذر تغيير حالة الشات' }, { status: 500 })
      await writeAuditLog(session, open ? 'chat_open' : 'chat_close', 'chat', 'global')
      return NextResponse.json({ ok: true })
    }

    if (!hasPermission(session, 'chat.moderate')) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    const target = String(username ?? '').trim().toLowerCase()
    if (!target) return NextResponse.json({ error: 'الحساب مطلوب' }, { status: 400 })
    if (target === session.username) return NextResponse.json({ error: 'لا يمكنك معاقبة نفسك في الشات' }, { status: 400 })
    if (target === 'owner' && session.role !== 'owner') return NextResponse.json({ error: 'حساب المالك محمي' }, { status: 403 })

    if (action === 'mute' || action === 'unmute') {
      await db.from('pd_chat_restrictions').upsert({
        username: target,
        muted: action === 'mute',
        reason: action === 'mute' ? String(reason ?? '').trim() : '',
        updated_at: new Date().toISOString(),
        updated_by: session.username,
      })
      await writeAuditLog(session, action === 'mute' ? 'chat_mute' : 'chat_unmute', 'account', target, { reason: String(reason ?? '') })
      return NextResponse.json({ ok: true })
    }

    if (action === 'timeout' || action === 'clear_timeout') {
      const duration = Math.max(1, Math.min(Number(minutes) || 10, 10080))
      const timeoutUntil = action === 'timeout' ? new Date(Date.now() + duration * 60_000).toISOString() : null
      await db.from('pd_chat_restrictions').upsert({
        username: target,
        timeout_until: timeoutUntil,
        reason: action === 'timeout' ? String(reason ?? '').trim() : '',
        updated_at: new Date().toISOString(),
        updated_by: session.username,
      })
      await writeAuditLog(session, action === 'timeout' ? 'chat_timeout' : 'chat_timeout_clear', 'account', target, { minutes: duration, reason: String(reason ?? '') })
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'عملية غير معروفة' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { token, id } = await req.json()
    const session = await sessionFrom(token)
    if (!hasPermission(session, 'chat.moderate')) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    const { error } = await getServerSupabase().from('pd_chat_messages').delete().eq('id', String(id))
    if (error) return NextResponse.json({ error: 'تعذر حذف الرسالة' }, { status: 500 })
    await writeAuditLog(session!, 'chat_message_delete', 'chat_message', String(id))
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
