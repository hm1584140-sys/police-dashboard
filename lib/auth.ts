import { getServerSupabase } from '@/lib/supabase-server'

export type Role = 'visitor' | 'commander' | 'admin' | 'owner'

export type Account = {
  username: string
  password: string
  role: Role
  discord_name: string
  is_banned: boolean
  ban_reason: string
  banned_at?: string | null
  banned_by?: string | null
  created_at?: string
  updated_at?: string
  last_login_at?: string | null
}

export type PublicAccount = Omit<Account, 'password'>

export type SessionInfo = {
  token: string
  username: string
  role: Role
  discord_name: string
  login_at: number
  is_banned?: boolean
  ban_reason?: string
}

function db() {
  return getServerSupabase()
}

export async function findAccount(username: string, password: string): Promise<Account | null> {
  const clean = username.trim().toLowerCase()
  if (!clean || !password) return null

  const { data, error } = await db()
    .from('pd_accounts')
    .select('username,password,role,discord_name,is_banned,ban_reason,banned_at,banned_by,created_at,updated_at,last_login_at')
    .eq('username', clean)
    .maybeSingle()

  if (error || !data) return null

  return {
    ...data,
    role: data.role as Role,
    discord_name: data.discord_name ?? '',
    ban_reason: data.ban_reason ?? '',
  } as Account
}

export async function createSession(account: Pick<Account, 'username' | 'role' | 'discord_name'>): Promise<string> {
  const token = crypto.randomUUID()
  const now = Date.now()

  await db().from('pd_sessions').insert({
    token,
    username: account.username,
    role: account.role,
    discord_name: account.discord_name ?? '',
    login_at: now,
  })

  await db()
    .from('pd_accounts')
    .update({ last_login_at: new Date(now).toISOString(), updated_at: new Date().toISOString() })
    .eq('username', account.username)

  return token
}

export async function getSession(token: string | null): Promise<SessionInfo | null> {
  if (!token) return null

  const { data: session, error: sessionError } = await db()
    .from('pd_sessions')
    .select('token,username,role,discord_name,login_at')
    .eq('token', token)
    .maybeSingle()

  if (sessionError || !session) return null

  const { data: account } = await db()
    .from('pd_accounts')
    .select('is_banned,ban_reason')
    .eq('username', session.username)
    .maybeSingle()

  if (account?.is_banned) {
    return {
      ...session,
      role: session.role as Role,
      discord_name: session.discord_name ?? '',
      is_banned: true,
      ban_reason: account.ban_reason ?? '',
    }
  }

  return {
    ...session,
    role: session.role as Role,
    discord_name: session.discord_name ?? '',
    is_banned: false,
    ban_reason: '',
  }
}

export async function deleteSession(token: string) {
  if (!token) return
  await db().from('pd_sessions').delete().eq('token', token)
}

export async function deleteSessionsForUser(username: string) {
  await db().from('pd_sessions').delete().eq('username', username)
}

export async function getAllSessions(): Promise<SessionInfo[]> {
  const { data } = await db()
    .from('pd_sessions')
    .select('token,username,role,discord_name,login_at')
    .order('login_at', { ascending: false })

  const sessions = (data ?? []) as Array<Record<string, unknown>>
  if (!sessions.length) return []

  const usernames = [...new Set(sessions.map((row) => String(row.username ?? '')).filter(Boolean))]
  const { data: accounts } = await db()
    .from('pd_accounts')
    .select('username,is_banned,ban_reason')
    .in('username', usernames)

  const accountMap = new Map(
    (accounts ?? []).map((row) => [String(row.username), row]),
  )

  return sessions.map((row) => {
    const account = accountMap.get(String(row.username))
    return {
      token: String(row.token),
      username: String(row.username),
      role: row.role as Role,
      discord_name: String(row.discord_name ?? ''),
      login_at: Number(row.login_at ?? 0),
      is_banned: Boolean(account?.is_banned),
      ban_reason: String(account?.ban_reason ?? ''),
    }
  })
}

export async function getAllAccounts(): Promise<PublicAccount[]> {
  const { data } = await db()
    .from('pd_accounts')
    .select('username,role,discord_name,is_banned,ban_reason,banned_at,banned_by,created_at,updated_at,last_login_at')
    .order('created_at', { ascending: true })

  return (data ?? []).map((row) => ({
    ...row,
    role: row.role as Role,
    discord_name: row.discord_name ?? '',
    ban_reason: row.ban_reason ?? '',
  })) as PublicAccount[]
}

export async function createAccount(input: {
  username: string
  password: string
  role: Role
  discordName?: string
}) {
  const username = input.username.trim().toLowerCase()
  const password = input.password.trim()
  if (!username || !password) throw new Error('missing_credentials')

  const { data, error } = await db()
    .from('pd_accounts')
    .insert({
      username,
      password,
      role: input.role,
      discord_name: input.discordName?.trim() ?? '',
      is_banned: false,
      ban_reason: '',
    })
    .select('username,role,discord_name,is_banned,ban_reason,banned_at,banned_by,created_at,updated_at,last_login_at')
    .single()

  if (error) throw new Error(error.code === '23505' ? 'username_exists' : error.message)

  return {
    ...data,
    role: data.role as Role,
    discord_name: data.discord_name ?? '',
    ban_reason: data.ban_reason ?? '',
  } as PublicAccount
}

export async function updateAccount(
  username: string,
  updates: {
    newUsername?: string
    newPassword?: string
    role?: Role
    discordName?: string
  },
) {
  const current = username.trim().toLowerCase()
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }

  const nextUsername = updates.newUsername?.trim().toLowerCase()
  if (nextUsername) patch.username = nextUsername
  if (updates.newPassword?.trim()) patch.password = updates.newPassword.trim()
  if (updates.role) patch.role = updates.role
  if (updates.discordName !== undefined) patch.discord_name = updates.discordName.trim()

  if (Object.keys(patch).length === 1) return
  const { error } = await db().from('pd_accounts').update(patch).eq('username', current)
  if (error) throw new Error(error.message)

  if (nextUsername && nextUsername !== current) {
    await db().from('pd_sessions').update({
      username: nextUsername,
    }).eq('username', current)
  }
}

export async function deleteAccount(username: string) {
  const clean = username.trim().toLowerCase()
  await deleteSessionsForUser(clean)
  const { error } = await db().from('pd_accounts').delete().eq('username', clean)
  if (error) throw new Error(error.message)
}

export async function setAccountBan(
  username: string,
  banned: boolean,
  reason: string,
  bannedBy: string,
) {
  const clean = username.trim().toLowerCase()
  const { error } = await db().from('pd_accounts').update({
    is_banned: banned,
    ban_reason: banned ? reason.trim() : '',
    banned_at: banned ? new Date().toISOString() : null,
    banned_by: banned ? bannedBy : null,
    updated_at: new Date().toISOString(),
  }).eq('username', clean)

  if (error) throw new Error(error.message)
  if (banned) await deleteSessionsForUser(clean)
}

export async function getBanAppeals() {
  const { data } = await db()
    .from('pd_ban_appeals')
    .select('*')
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function createBanAppeal(username: string, discordName: string, message: string) {
  const clean = username.trim().toLowerCase()
  const text = message.trim()
  if (!clean || !text) throw new Error('missing_message')

  const { data: account } = await db()
    .from('pd_accounts')
    .select('username,is_banned,discord_name')
    .eq('username', clean)
    .maybeSingle()

  if (!account?.is_banned) throw new Error('not_banned')

  const { data, error } = await db()
    .from('pd_ban_appeals')
    .insert({
      username: clean,
      discord_name: discordName.trim() || account.discord_name || '',
      message: text,
    })
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return data
}
