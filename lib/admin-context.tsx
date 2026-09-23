'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Permission } from '@/lib/permissions'

export type Section = 'sops' | 'radio' | 'roster' | 'outfits' | 'strikes' | 'violations'
export type Role = 'visitor' | 'commander' | 'admin' | 'owner'

const COMMANDER_SECTIONS: Section[] = ['roster', 'outfits']
const TOKEN_KEY = 'pd_session_token'

type AdminContextValue = {
  role: Role
  username: string | null
  discordName: string | null
  token: string | null
  permissions: Permission[]
  isOwner: boolean
  isAdmin: boolean
  isCommander: boolean
  isVisitor: boolean
  loading: boolean
  login: (username: string, password: string, discordName: string) => Promise<{ ok: boolean; banned?: boolean; reason?: string; discordName?: string; error?: string }>
  logout: () => void
  canEdit: (section: Section) => boolean
  can: (permission: Permission) => boolean
}

const AdminContext = createContext<AdminContextValue | null>(null)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('visitor')
  const [username, setUsername] = useState<string | null>(null)
  const [discordName, setDiscordName] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)

  async function checkSession(savedToken: string) {
    try {
      const res = await fetch(`/api/auth/me?token=${encodeURIComponent(savedToken)}`)
      const data = await res.json()
      if (data.role && data.role !== 'visitor') {
        setRole(data.role)
        setUsername(data.username)
        setDiscordName(data.discordName ?? '')
        setToken(savedToken)
        setPermissions(Array.isArray(data.permissions) ? data.permissions : [])
      } else {
        // الجلسة انتهت أو انطرد — نسجل خروج تلقائي
        localStorage.removeItem(TOKEN_KEY)
        setRole('visitor')
        setUsername(null)
        setDiscordName(null)
        setToken(null)
        setPermissions([])
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null
    if (!saved) { setLoading(false); return }
    checkSession(saved)

    // فحص خفيف للجلسة بدون ضغط زائد على الموقع.
    const interval = setInterval(() => {
      if (document.visibilityState !== 'visible') return
      const currentToken = localStorage.getItem(TOKEN_KEY)
      if (currentToken) checkSession(currentToken)
    }, 20000)

    return () => clearInterval(interval)
  }, [])

  async function login(user: string, pass: string, discord: string) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass, discordName: discord }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        return { ok: false, banned: Boolean(data.banned), reason: data.reason, discordName: data.discordName, error: data.error }
      }
      setRole(data.role)
      setUsername(data.username)
      setDiscordName(data.discordName ?? discord)
      setToken(data.token)
      setPermissions(Array.isArray(data.permissions) ? data.permissions : [])
      localStorage.setItem(TOKEN_KEY, data.token)
      return { ok: true, discordName: data.discordName }
    } catch {
      return { ok: false }
    }
  }

  function logout() {
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      }).catch(() => {})
    }
    localStorage.removeItem(TOKEN_KEY)
    setRole('visitor')
    setUsername(null)
    setDiscordName(null)
    setToken(null)
    setPermissions([])
  }

  function can(permission: Permission) {
    if (role === 'owner') return true
    return permissions.includes(permission)
  }

  function canEdit(section: Section) {
    if (role === 'owner' || role === 'admin') return true
    if (role === 'commander') return COMMANDER_SECTIONS.includes(section)
    return false
  }

  return (
    <AdminContext.Provider value={{
      role, username, discordName, token, permissions,
      isOwner: role === 'owner',
      isAdmin: role === 'admin' || role === 'owner',
      isCommander: role === 'commander',
      isVisitor: role === 'visitor',
      loading,
      login, logout, canEdit, can,
    }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider')
  return ctx
}
