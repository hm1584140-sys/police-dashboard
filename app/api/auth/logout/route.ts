import { NextResponse } from 'next/server'
import { deleteSession, getSession } from '@/lib/auth'
import { writeAuditLog } from '@/lib/audit'

export async function POST(req: Request) {
  try {
    const { token } = await req.json()
    if (token) {
      const session = await getSession(String(token))
      if (session) await writeAuditLog(session, 'logout', 'session', String(token))
      await deleteSession(String(token))
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
