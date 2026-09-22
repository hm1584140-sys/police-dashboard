import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getServerSupabase } from '@/lib/supabase-server'
import { writeAuditLog } from '@/lib/audit'

async function requireOwner(token: string | null) {
  const session = await getSession(token)
  return session?.role === 'owner' ? session : null
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const owner = await requireOwner(searchParams.get('token'))
  if (!owner) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

  const limit = Math.min(Math.max(Number(searchParams.get('limit') ?? 200), 1), 500)
  const { data, error } = await getServerSupabase()
    .from('pd_audit_logs')
    .select('id,actor_username,actor_discord,actor_role,action,target_type,target_id,details,created_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: Request) {
  try {
    const { token, action, targetType, targetId, details } = await req.json()
    const session = await getSession(token)
    if (!session || session.role === 'visitor') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    await writeAuditLog(
      session,
      String(action ?? 'unknown'),
      String(targetType ?? ''),
      String(targetId ?? ''),
      details && typeof details === 'object' ? details : {},
    )
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'تعذر تسجيل النشاط' }, { status: 400 })
  }
}
