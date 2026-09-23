import { NextResponse } from 'next/server'
import { createAccount, deleteAccount, getAllAccounts, getSession, updateAccount, setAccountBan } from '@/lib/auth'
import type { Role } from '@/lib/auth'
import { writeAuditLog } from '@/lib/audit'
import { hasPermission, normalizePermissions } from '@/lib/permissions'

async function requireAccess(token: string | null) {
  return getSession(token)
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const requester = await requireAccess(searchParams.get('token'))
  if (!hasPermission(requester, 'accounts.view')) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  return NextResponse.json(await getAllAccounts())
}

export async function POST(req: Request) {
  try {
    const { token, username, password, role, discordName, permissions } = await req.json()
    const requester = await requireAccess(token)
    if (!hasPermission(requester, 'accounts.create')) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    const allowed: Role[] = ['commander', 'admin', 'owner']
    if (!allowed.includes(role)) return NextResponse.json({ error: 'صلاحية غير صحيحة' }, { status: 400 })
    const safeRole: Role = requester.role === 'owner' ? role : 'commander'
    const created = await createAccount({ username, password, role: safeRole, discordName, permissions: requester.role === 'owner' ? normalizePermissions(permissions) : [] })
    await writeAuditLog(requester, 'account_create', 'account', created.username, { role: created.role })
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    return NextResponse.json({ error: message === 'username_exists' ? 'اسم المستخدم موجود مسبقاً' : 'تعذر إنشاء الحساب' }, { status: 400 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { token, username, action, newUsername, newPassword, role, discordName, reason, permissions } = await req.json()
    const requester = await requireAccess(token)
    if (!requester) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    const target = String(username ?? '').trim().toLowerCase()
    if (action === 'ban' || action === 'unban') {
      if (!hasPermission(requester, 'accounts.ban')) return NextResponse.json({ error: 'ليس لديك صلاحية الباند' }, { status: 403 })
      if (target === requester.username) return NextResponse.json({ error: 'لا يمكنك تبنيد حسابك' }, { status: 400 })
      if (target === 'owner') return NextResponse.json({ error: 'حساب المالك محمي من الباند' }, { status: 400 })
      await setAccountBan(target, action === 'ban', String(reason ?? ''), requester.username)
      await writeAuditLog(requester, action === 'ban' ? 'account_ban' : 'account_unban', 'account', target, { reason: String(reason ?? '') })
      return NextResponse.json({ ok: true })
    }

    if (!hasPermission(requester, 'accounts.edit')) return NextResponse.json({ error: 'ليس لديك صلاحية تعديل الحسابات' }, { status: 403 })
    if (newPassword && !hasPermission(requester, 'accounts.password')) return NextResponse.json({ error: 'ليس لديك صلاحية تغيير كلمات السر' }, { status: 403 })
    if (target === 'owner' && requester.role !== 'owner') return NextResponse.json({ error: 'حساب المالك محمي' }, { status: 403 })
    if (target === requester.username && role && role !== 'owner') {
      return NextResponse.json({ error: 'لا يمكن خفض صلاحية حساب المالك الحالي' }, { status: 400 })
    }

    await updateAccount(username, {
      newUsername,
      newPassword,
      role: requester.role === 'owner' ? role : undefined,
      discordName,
      permissions: requester.role === 'owner' ? normalizePermissions(permissions) : undefined,
    })
    await writeAuditLog(requester, 'account_update', 'account', target, { newUsername: newUsername || null, passwordChanged: Boolean(newPassword), role: role || null, discordName: discordName ?? null })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'حدث خطأ' }, { status: 400 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { token, username } = await req.json()
    const requester = await requireAccess(token)
    if (!hasPermission(requester, 'accounts.delete')) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    const target = String(username ?? '').trim().toLowerCase()
    if (target === requester.username) return NextResponse.json({ error: 'لا يمكنك حذف حسابك من هنا' }, { status: 400 })
    if (target === 'owner') return NextResponse.json({ error: 'حساب المالك محمي من الحذف' }, { status: 400 })
    await deleteAccount(target)
    await writeAuditLog(requester, 'account_delete', 'account', target)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'تعذر حذف الحساب' }, { status: 400 })
  }
}
