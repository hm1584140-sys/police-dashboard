import { getServerSupabase } from '@/lib/supabase-server'
import type { SessionInfo } from '@/lib/auth'

export type AuditAction =
  | 'login'
  | 'logout'
  | 'account_create'
  | 'account_update'
  | 'account_delete'
  | 'account_ban'
  | 'account_unban'
  | 'session_kick'
  | 'message_send'
  | 'message_delete'
  | 'page_create'
  | 'page_update'
  | 'page_delete'
  | 'sector_create'
  | 'sector_update'
  | 'sector_delete'
  | 'strike_create'
  | 'strike_update'
  | 'strike_delete'
  | 'roster_create'
  | 'roster_update'
  | 'roster_delete'
  | 'radio_create'
  | 'radio_update'
  | 'radio_delete'
  | 'violation_create'
  | 'violation_update'
  | 'violation_delete'
  | 'outfit_update'
  | 'roster_column_create'
  | 'roster_column_update'
  | 'roster_column_delete'
  | 'appeal_review'

export async function writeAuditLog(
  actor: Pick<SessionInfo, 'username' | 'discord_name' | 'role'>,
  action: AuditAction | string,
  targetType = '',
  targetId = '',
  details: Record<string, unknown> = {},
) {
  const { error } = await getServerSupabase().from('pd_audit_logs').insert({
    actor_username: actor.username,
    actor_discord: actor.discord_name ?? '',
    actor_role: actor.role,
    action,
    target_type: targetType,
    target_id: targetId,
    details,
  })

  if (error) console.error('audit log failed', error.message)
}
