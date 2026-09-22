import { NextResponse } from 'next/server'
import { deleteSession, deleteSessionsForUser, getAllSessions, getSession } from '@/lib/auth'

async function requireOwner(token: string | null) {
  const session = await getSession(token)
  return session?.role === 'owner' ? session : null
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  if (!(await requireOwner(searchParams.get('token')))) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  return NextResponse.json(await getAllSessions())
}

export async function DELETE(req: Request) {
  try {
    const { token, targetToken, username } = await req.json()
    if (!(await requireOwner(token))) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    if (targetToken) await deleteSession(String(targetToken))
    if (username) await deleteSessionsForUser(String(username).trim().toLowerCase())
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
