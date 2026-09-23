import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const session = await getSession(searchParams.get('token'))
    if (!session) return NextResponse.json({ role: 'visitor', username: null })
    if (session.is_banned) return NextResponse.json({ role: 'visitor', username: null, banned: true, reason: session.ban_reason ?? '' })
    return NextResponse.json({ role: session.role, username: session.username, discordName: session.discord_name, permissions: session.permissions })
  } catch {
    return NextResponse.json({ role: 'visitor', username: null })
  }
}
