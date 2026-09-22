import { NextResponse } from 'next/server'
import { createBanAppeal, getBanAppeals, getSession } from '@/lib/auth'
import { getServerSupabase } from '@/lib/supabase-server'

async function requireOwner(token: string | null) {
  const session = await getSession(token)
  return session?.role === 'owner' ? session : null
}

export async function POST(req: Request) {
  try {
    const { username, discordName, message } = await req.json()
    return NextResponse.json(await createBanAppeal(username, discordName ?? '', message), { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    return NextResponse.json({ error: message === 'not_banned' ? 'هذا الحساب غير مبنّد' : 'تعذر إرسال الطلب' }, { status: 400 })
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  if (!(await requireOwner(searchParams.get('token')))) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  return NextResponse.json(await getBanAppeals())
}

export async function PATCH(req: Request) {
  try {
    const { token, id, status, ownerResponse } = await req.json()
    if (!(await requireOwner(token))) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    if (!['pending', 'approved', 'rejected'].includes(status)) return NextResponse.json({ error: 'حالة غير صحيحة' }, { status: 400 })

    const db = getServerSupabase()
    const { data: appeal } = await db.from('pd_ban_appeals').select('username').eq('id', id).maybeSingle()
    if (!appeal) return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })

    const { error } = await db.from('pd_ban_appeals').update({
      status,
      owner_response: String(ownerResponse ?? ''),
      updated_at: new Date().toISOString(),
    }).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    if (status === 'approved') {
      await db.from('pd_accounts').update({
        is_banned: false,
        ban_reason: '',
        banned_at: null,
        banned_by: null,
        updated_at: new Date().toISOString(),
      }).eq('username', appeal.username)
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'تعذر تحديث الطلب' }, { status: 400 })
  }
}
