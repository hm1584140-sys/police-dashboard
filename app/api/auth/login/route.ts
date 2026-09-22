import { NextResponse } from 'next/server'
import { createSession, findAccount } from '@/lib/auth'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()
    const account = await findAccount(username, password)

    if (!account) return NextResponse.json({ error: 'بيانات الدخول غير صحيحة' }, { status: 401 })

    if (account.is_banned) {
      return NextResponse.json({
        error: 'هذا الحساب مبنّد',
        banned: true,
        username: account.username,
        discordName: account.discord_name,
        reason: account.ban_reason || 'لم يتم ذكر سبب.',
      }, { status: 403 })
    }

    const token = await createSession(account)
    return NextResponse.json({ token, username: account.username, role: account.role, discordName: account.discord_name })
  } catch {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
