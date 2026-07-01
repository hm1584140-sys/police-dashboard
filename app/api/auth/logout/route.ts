import { NextResponse } from 'next/server'
import { deleteSession } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { token } = await req.json()
    if (token) await deleteSession(token)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
