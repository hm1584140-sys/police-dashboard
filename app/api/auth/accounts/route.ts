import { NextResponse } from 'next/server'
import { createAccount, deleteAccount, getAllAccounts, getSession, updateAccount, setAccountBan } from '@/lib/auth'
import type { Role } from '@/lib/auth'

async function requireOwner(token: string | null) {
  const session = await getSession(token)
  return session?.role === 'owner' ? session : null
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const requester = await requireOwner(searchParams.get('token'))
  if (!requester) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  return NextResponse.json(await getAllAccounts())
}

export async function POST(req: Request) {
  try {
    const { token, username, password, role, discordName } = await req.json()
    if (!(await requireOwner(token))) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    const allowed: Role[] = ['commander', 'admin', 'owner']
    if (!allowed.includes(role)) return NextResponse.json({ error: 'صلاحية غير صحيحة' }, { status: 400 })
    return NextResponse.json(await createAccount({ username, password, role, discordName }), { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    return NextResponse.json({ error: message === 'username_exists' ? 'اسم المستخدم موجود مسبقاً' : 'تعذر إنشاء الحساب' }, { status: 400 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { token, username, action, newUsername, newPassword, role, discordName, reason } = await req.json()
    const requester = await requireOwner(token)
    if (!requester) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    const target = String(username ?? '').trim().toLowerCase()
    if (action === 'ban' || action === 'unban') {
      if (target === requester.username) return NextResponse.json({ error: 'لا يمكنك تبنيد حسابك' }, { status: 400 })
      await setAccountBan(target, action === 'ban', String(reason ?? ''), requester.username)
      return NextResponse.json({ ok: true })
    }

    if (target === requester.username && role && role !== 'owner') {
      return NextResponse.json({ error: 'لا يمكن خفض صلاحية حساب المالك الحالي' }, { status: 400 })
    }

    await updateAccount(username, { newUsername, newPassword, role, discordName })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'حدث خطأ' }, { status: 400 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { token, username } = await req.json()
    const requester = await requireOwner(token)
    if (!requester) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    const target = String(username ?? '').trim().toLowerCase()
    if (target === requester.username) return NextResponse.json({ error: 'لا يمكنك حذف حسابك من هنا' }, { status: 400 })
    await deleteAccount(target)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'تعذر حذف الحساب' }, { status: 400 })
  }
}
