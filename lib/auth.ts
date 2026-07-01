import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// نستخدم نفس credentials الموجودة بالمشروع
function getSupabase() {
  return createClient(supabaseUrl, supabaseKey)
}

export type Role = 'visitor' | 'commander' | 'admin' | 'owner'

export type Account = {
  username: string
  password: string
  role: Role
}

export type SessionInfo = {
  token: string
  username: string
  role: Role
  login_at: number
}

export async function findAccount(username: string, password: string): Promise<Account | null> {
  const db = getSupabase()
  const { data } = await db
    .from('pd_accounts')
    .select('*')
    .eq('username', username.trim().toLowerCase())
    .eq('password', password)
    .single()
  return data ?? null
}

export async function createSession(username: string, role: Role): Promise<string> {
  const db = getSupabase()
  const token = crypto.randomUUID()
  await db.from('pd_sessions').insert({
    token,
    username,
    role,
    login_at: Date.now(),
  })
  return token
}

export async function getSession(token: string | null): Promise<SessionInfo | null> {
  if (!token) return null
  const db = getSupabase()
  const { data } = await db
    .from('pd_sessions')
    .select('*')
    .eq('token', token)
    .single()
  return data ?? null
}

export async function deleteSession(token: string) {
  const db = getSupabase()
  await db.from('pd_sessions').delete().eq('token', token)
}

export async function getAllSessions(): Promise<SessionInfo[]> {
  const db = getSupabase()
  const { data } = await db
    .from('pd_sessions')
    .select('*')
    .order('login_at', { ascending: false })
  return data ?? []
}

export async function getAllAccounts(): Promise<Omit<Account, 'password'>[]> {
  const db = getSupabase()
  const { data } = await db
    .from('pd_accounts')
    .select('username, role')
  return data ?? []
}

export async function updateAccount(
  username: string,
  updates: { newUsername?: string; newPassword?: string },
) {
  const db = getSupabase()
  const patch: Record<string, string> = {}
  if (updates.newUsername?.trim()) patch.username = updates.newUsername.trim().toLowerCase()
  if (updates.newPassword?.trim()) patch.password = updates.newPassword.trim()
  if (Object.keys(patch).length === 0) return
  await db.from('pd_accounts').update(patch).eq('username', username)
}
