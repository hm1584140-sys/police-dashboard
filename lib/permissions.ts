import type { SessionInfo } from '@/lib/auth'

export const PERMISSIONS = [
  'admin.view',
  'accounts.view',
  'accounts.create',
  'accounts.edit',
  'accounts.password',
  'accounts.ban',
  'accounts.delete',
  'messages.manage',
  'appeals.manage',
  'pages.manage',
  'sectors.manage',
  'roster.manage',
  'logs.view',
  'chat.manage',
  'chat.moderate',
] as const

export type Permission = (typeof PERMISSIONS)[number]

export const PERMISSION_LABELS: Record<Permission, string> = {
  'admin.view': 'فتح قائمة الإدارة',
  'accounts.view': 'عرض الحسابات',
  'accounts.create': 'إنشاء حسابات',
  'accounts.edit': 'تعديل الحسابات',
  'accounts.password': 'تغيير كلمات السر',
  'accounts.ban': 'تبنيد وفك الباند',
  'accounts.delete': 'حذف الحسابات',
  'messages.manage': 'إدارة الرسائل',
  'appeals.manage': 'طلبات فك الباند',
  'pages.manage': 'إدارة القوائم والمحتوى',
  'sectors.manage': 'إدارة القطاعات',
  'roster.manage': 'إدارة أعمدة كشف القوات',
  'logs.view': 'عرض السجلات',
  'chat.manage': 'فتح وإغلاق الشات',
  'chat.moderate': 'تايم أوت ومنع الكتابة',
}

export function normalizePermissions(value: unknown): Permission[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is Permission =>
    typeof item === 'string' && (PERMISSIONS as readonly string[]).includes(item),
  )
}

export function hasPermission(session: Pick<SessionInfo, 'role' | 'permissions'> | null, permission: Permission) {
  if (!session) return false
  if (session.role === 'owner') return true
  return session.permissions.includes(permission)
}

export function canOpenAdmin(session: Pick<SessionInfo, 'role' | 'permissions'> | null) {
  return Boolean(session && (session.role === 'owner' || session.permissions.includes('admin.view')))
}
