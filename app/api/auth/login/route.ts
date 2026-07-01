import { NextResponse } from 'next/server'
import { findAccount, createSession } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()
    const account = await findAccount(username, password)
    if (!account) {
      return NextResponse.json({ error: 'بيانات الدخول غير صحيحة' }, { status: 401 })
    }
    const token = await createSession(account.username, account.role)
    return NextResponse.json({ token, username: account.username, role: account.role })
  } catch {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
