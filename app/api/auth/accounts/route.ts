import { NextResponse } from 'next/server'
import { getSession, getAllAccounts, updateAccount } from '@/lib/auth'

async function requireOwner(token: string | null) {
  const session = await getSession(token)
  return session?.role === 'owner' ? session : null
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')
  const requester = await requireOwner(token)
  if (!requester) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  const accounts = await getAllAccounts()
  return NextResponse.json(accounts)
}

export async function PATCH(req: Request) {
  try {
    const { token, username, newUsername, newPassword } = await req.json()
    const requester = await requireOwner(token)
    if (!requester) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    await updateAccount(username, { newUsername, newPassword })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
