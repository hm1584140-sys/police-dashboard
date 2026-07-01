'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export type Section = 'sops' | 'radio' | 'roster' | 'outfits' | 'strikes' | 'violations'
export type Role = 'visitor' | 'commander' | 'admin' | 'owner'

const COMMANDER_SECTIONS: Section[] = ['roster', 'outfits']
const TOKEN_KEY = 'pd_session_token'

type AdminContextValue = {
  role: Role
  username: string | null
  token: string | null
  isOwner: boolean
  isAdmin: boolean
  isCommander: boolean
  isVisitor: boolean
  loading: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  canEdit: (section: Section) => boolean
}

const AdminContext = createContext<AdminContextValue | null>(null)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('visitor')
  const [username, setUsername] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null
    if (!saved) { setLoading(false); return }
    fetch(`/api/auth/me?token=${encodeURIComponent(saved)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.role && data.role !== 'visitor') {
          setRole(data.role)
          setUsername(data.username)
          setToken(saved)
        } else {
          localStorage.removeItem(TOKEN_KEY)
        }
      })
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false))
  }, [])

  async function login(user: string, pass: string) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass }),
      })
      if (!res.ok) return false
      const data = await res.json()
      setRole(data.role)
      setUsername(data.username)
      setToken(data.token)
      localStorage.setItem(TOKEN_KEY, data.token)
      return true
    } catch {
      return false
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
    setToken(null)
  }

  function canEdit(section: Section) {
    if (role === 'owner' || role === 'admin') return true
    if (role === 'commander') return COMMANDER_SECTIONS.includes(section)
    return false
  }

  return (
    <AdminContext.Provider value={{
      role, username, token,
      isOwner: role === 'owner',
      isAdmin: role === 'admin' || role === 'owner',
      isCommander: role === 'commander',
      isVisitor: role === 'visitor',
      loading,
      login, logout, canEdit,
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
