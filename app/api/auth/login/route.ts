import { NextResponse } from 'next/server'
import { createSession, findAccount } from '@/lib/auth'
import { writeAuditLog } from '@/lib/audit'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { username, password, discordName } = await req.json()
    const cleanDiscord = String(discordName ?? '').trim()
    if (!cleanDiscord) return NextResponse.json({ error: 'اسم Discord مطلوب' }, { status: 400 })
    const account = await findAccount(username, password)

    if (!account) return NextResponse.json({ error: 'بيانات الدخول غير صحيحة' }, { status: 401 })

    if (account.is_banned && account.banned_until && new Date(account.banned_until).getTime() <= Date.now()) {
      const { getServerSupabase } = await import('@/lib/supabase-server')
      await getServerSupabase().from('pd_accounts').update({ is_banned: false, ban_reason: '', banned_at: null, banned_by: null, banned_until: null, updated_at: new Date().toISOString() }).eq('username', account.username)
      account.is_banned = false
      account.ban_reason = ''
      account.banned_until = null
    }

    if (account.is_banned) {
      return NextResponse.json({
        error: 'هذا الحساب مبنّد',
        banned: true,
        username: account.username,
        discordName: cleanDiscord,
        reason: account.ban_reason || 'لم يتم ذكر سبب.',
        bannedUntil: account.banned_until ?? null,
      }, { status: 403 })
    }

    const token = await createSession(account, cleanDiscord)
    await writeAuditLog({ username: account.username, role: account.role, discord_name: cleanDiscord }, 'login', 'session', token, { source: 'website' })
    return NextResponse.json({ token, username: account.username, role: account.role, discordName: cleanDiscord, permissions: account.permissions })
  } catch {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
