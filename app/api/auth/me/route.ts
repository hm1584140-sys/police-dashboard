import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')
    const session = await getSession(token)
    if (!session) return NextResponse.json({ role: 'visitor', username: null })
    return NextResponse.json({ role: session.role, username: session.username })
  } catch {
    return NextResponse.json({ role: 'visitor', username: null })
  }
}
