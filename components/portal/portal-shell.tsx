'use client'

import { useState, useEffect, type CSSProperties, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import {
  BookMarked, Radio, Users, Shirt, Gavel, TrafficCone,
  Shield, Lock, LogIn, LogOut, Settings, UserX,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSector, sectorThemes, type SectorId } from '@/lib/sector-context'
import { useAdmin, type Role } from '@/lib/admin-context'
import { NeonCard, Pill } from './primitives'
import { SopsPortal } from './sections/sops-portal'
import { RadioProtocols } from './sections/radio-protocols'
import { RosterHub } from './sections/roster-hub'
import { OutfitsBuilder } from './sections/outfits-builder'
import { StrikeBook } from './sections/strike-book'
import { Violations } from './sections/violations'

const TABS = [
  { id: 'sops', label: 'كتيب البروتوكولات', icon: BookMarked },
  { id: 'radio', label: 'بروتوكولات اللاسلكي', icon: Radio },
  { id: 'roster', label: 'كشف القوات الرقمي', icon: Users },
  { id: 'outfits', label: 'دليل ملابس الرتب', icon: Shirt },
  { id: 'strikes', label: 'كتيب الجزاءات', icon: Gavel },
  { id: 'violations', label: 'المخالفات المرورية', icon: TrafficCone },
] as const

type TabId = (typeof TABS)[number]['id']
const SECTORS: SectorId[] = ['LSPD', 'BCSO', 'SASP']

const ROLE_LABEL: Record<Role, string> = { visitor: 'زائر', commander: 'قائد', admin: 'أدمن', owner: 'المالك' }
const ROLE_TONE: Record<Role, 'muted' | 'gold' | 'danger' | 'neon'> = {
  visitor: 'muted', commander: 'gold', admin: 'danger', owner: 'neon',
}

type SessionItem = { token: string; username: string; role: Role; login_at: number }
type AccountItem = { username: string; role: Role }

function OwnerPanel({ token, onClose }: { token: string; onClose: () => void }) {
  const [sessions, setSessions] = useState<SessionItem[]>([])
  const [accounts, setAccounts] = useState<AccountItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editUser, setEditUser] = useState<string | null>(null)
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  async function loadData() {
    setLoading(true); setError('')
    try {
      const [sRes, aRes] = await Promise.all([
        fetch(`/api/auth/sessions?token=${encodeURIComponent(token)}`),
        fetch(`/api/auth/accounts?token=${encodeURIComponent(token)}`),
      ])
      if (!sRes.ok || !aRes.ok) throw new Error('failed')
      setSessions(await sRes.json())
      setAccounts(await aRes.json())
    } catch { setError('تعذر تحميل البيانات') }
    finally { setLoading(false) }
  }

  useEffect(() => { loadData() }, [])

  async function kick(targetToken: string) {
    await fetch('/api/auth/sessions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, targetToken }),
    })
    setSessions((prev) => prev.filter((s) => s.token !== targetToken))
  }

  async function saveAccount(e: FormEvent) {
    e.preventDefault()
    if (!editUser) return
    setSaving(true); setSaveMsg('')
    try {
      const res = await fetch('/api/auth/accounts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, username: editUser, newUsername: newUsername || undefined, newPassword: newPassword || undefined }),
      })
      if (!res.ok) throw new Error()
      setSaveMsg('تم الحفظ ✓')
      setNewUsername(''); setNewPassword(''); setEditUser(null)
      loadData()
    } catch { setSaveMsg('تعذر الحفظ') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl">
        <NeonCard glow className="max-h-[85vh] overflow-y-auto p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-heading text-lg font-extrabold text-foreground">لوحة تحكم المالك</h3>
            <button type="button" onClick={onClose} className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted/40">إغلاق</button>
          </div>

          {loading ? <p className="text-sm text-muted-foreground">جارِ التحميل…</p>
          : error ? <p className="text-sm text-destructive">{error}</p>
          : (
            <div className="flex flex-col gap-6">
              {/* الجلسات النشطة */}
              <div>
                <h4 className="mb-2 font-heading text-sm font-bold text-primary">المسجّلون دخول الآن ({sessions.length})</h4>
                {sessions.length === 0
                  ? <p className="text-xs text-muted-foreground">لا يوجد أحد مسجل دخول حالياً.</p>
                  : <div className="flex flex-col gap-2">
                    {sessions.map((s) => (
                      <div key={s.token} className="flex items-center justify-between rounded-md border border-border bg-background/40 px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Pill tone={ROLE_TONE[s.role]}>{ROLE_LABEL[s.role]}</Pill>
                          <span className="text-sm font-bold text-foreground">{s.username}</span>
                          <span className="text-[11px] text-muted-foreground">{new Date(s.login_at).toLocaleString('ar')}</span>
                        </div>
                        <button type="button" onClick={() => kick(s.token)}
                          className="inline-flex items-center gap-1 rounded-md border border-destructive/50 bg-destructive/10 px-2.5 py-1 text-xs font-bold text-destructive hover:bg-destructive/20">
                          <UserX className="size-3.5" /> طرد
                        </button>
                      </div>
                    ))}
                  </div>
                }
              </div>

              {/* إدارة الحسابات */}
              <div>
                <h4 className="mb-2 font-heading text-sm font-bold text-primary">إدارة الحسابات</h4>
                <div className="flex flex-col gap-2">
                  {accounts.map((a) => (
                    <div key={a.username} className="rounded-md border border-border bg-background/40 px-3 py-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Pill tone={ROLE_TONE[a.role]}>{ROLE_LABEL[a.role]}</Pill>
                          <span className="text-sm font-bold text-foreground">{a.username}</span>
                        </div>
                        <button type="button" onClick={() => { setEditUser(editUser === a.username ? null : a.username); setNewUsername(''); setNewPassword(''); setSaveMsg('') }}
                          className="rounded-md border border-border px-2.5 py-1 text-xs font-bold text-muted-foreground hover:bg-muted/40">
                          {editUser === a.username ? 'إلغاء' : 'تعديل'}
                        </button>
                      </div>
                      {editUser === a.username && (
                        <form onSubmit={saveAccount} className="mt-3 flex flex-col gap-2">
                          <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="اسم مستخدم جديد (اختياري)"
                            className="w-full rounded-md border border-border bg-background/60 px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary" />
                          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="كلمة مرور جديدة (اختياري)"
                            className="w-full rounded-md border border-border bg-background/60 px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary" />
                          {saveMsg && <p className={cn('text-xs', saveMsg.includes('✓') ? 'text-primary' : 'text-destructive')}>{saveMsg}</p>}
                          <button type="submit" disabled={saving}
                            className="self-start rounded-md border border-primary/50 bg-primary/15 px-4 py-1.5 text-xs font-bold text-primary hover:bg-primary/25 disabled:opacity-60">
                            {saving ? 'جارِ الحفظ…' : 'حفظ التغييرات'}
                          </button>
                        </form>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </NeonCard>
      </div>
    </div>
  )
}

function AuthControl() {
  const { role, username, token, isOwner, login, logout } = useAdmin()
  const [open, setOpen] = useState(false)
  const [ownerOpen, setOwnerOpen] = useState(false)
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const ok = await login(user, pass)
    setSubmitting(false)
    if (ok) { setOpen(false); setUser(''); setPass(''); setError('') }
    else setError('اسم المستخدم أو كلمة المرور غير صحيحة')
  }

  function closeModal() { setOpen(false); setUser(''); setPass(''); setError('') }

  return (
    <div className="flex items-center gap-2">
      <Pill tone={ROLE_TONE[role]}>{ROLE_LABEL[role]}{username ? ` — ${username}` : ''}</Pill>

      {isOwner && (
        <button type="button" onClick={() => setOwnerOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-primary/50 bg-primary/15 px-3 py-1.5 font-heading text-xs font-bold text-primary hover:bg-primary/25">
          <Settings className="size-3.5" /> إدارة
        </button>
      )}

      {role === 'visitor'
        ? <button type="button" onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-1.5 font-heading text-xs font-bold text-foreground hover:bg-muted/70">
            <LogIn className="size-3.5" /> تسجيل دخول
          </button>
        : <button type="button" onClick={logout}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-1.5 font-heading text-xs font-bold text-foreground hover:bg-destructive/15 hover:border-destructive/50 hover:text-destructive">
            <LogOut className="size-3.5" /> خروج
          </button>
      }

      {open && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" onClick={closeModal}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm">
            <NeonCard glow className="p-6">
              <h3 className="mb-1 font-heading text-lg font-extrabold text-foreground">تسجيل الدخول</h3>
              <p className="mb-4 text-xs text-muted-foreground">للقادة والأدمن والمالك فقط.</p>
              <form onSubmit={handleLogin} className="flex flex-col gap-3">
                <input type="text" value={user} onChange={(e) => setUser(e.target.value)} placeholder="اسم المستخدم" autoFocus
                  className="w-full rounded-md border border-border bg-background/60 px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-ring" />
                <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="كلمة المرور"
                  className="w-full rounded-md border border-border bg-background/60 px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-ring" />
                {error && <p className="text-xs text-destructive">{error}</p>}
                <div className="mt-1 flex gap-2">
                  <button type="submit" disabled={submitting}
                    className="flex-1 rounded-md border border-primary/50 bg-primary/15 py-2 font-heading text-sm font-bold text-primary hover:bg-primary/25 disabled:opacity-60">
                    {submitting ? 'جارِ الدخول…' : 'دخول'}
                  </button>
                  <button type="button" onClick={closeModal}
                    className="flex-1 rounded-md border border-border py-2 font-heading text-sm font-bold text-muted-foreground hover:bg-muted/40">
                    إلغاء
                  </button>
                </div>
              </form>
            </NeonCard>
          </div>
        </div>,
        document.body,
      )}

      {ownerOpen && token && typeof document !== 'undefined' && createPortal(
        <OwnerPanel token={token} onClose={() => setOwnerOpen(false)} />,
        document.body,
      )}
    </div>
  )
}

function SectorSwitch() {
  const { sector, setSector } = useSector()
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-background/50 p-1">
      {SECTORS.map((id) => (
        <button key={id} type="button" onClick={() => setSector(id)}
          className={cn('rounded-md px-3 py-1.5 font-heading text-xs font-bold transition-colors',
            sector === id ? 'bg-primary/20 text-primary glow-neon' : 'text-muted-foreground hover:text-foreground')}>
          {id}
        </button>
      ))}
    </div>
  )
}

export function PortalShell() {
  const [active, setActive] = useState<TabId>('sops')
  const { sector } = useSector()
  const theme = sectorThemes[sector]

  return (
    <div style={theme.vars as CSSProperties} className="min-h-screen cyber-grid">
      <div className="min-h-screen bg-gradient-to-b from-background/40 via-background/80 to-background">
        <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 text-primary glow-neon">
                <Shield className="size-6" />
              </div>
              <div className="leading-tight">
                <p className="font-heading text-sm font-extrabold text-foreground md:text-base">بوابة عمليات جهاز الشرطة</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{sectorThemes[sector].name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SectorSwitch />
              <AuthControl />
              <span className="hidden items-center gap-1.5 rounded-full border border-destructive/50 bg-destructive/15 px-3 py-1 font-mono text-xs text-destructive lg:inline-flex">
                <Lock className="size-3" /> CLASSIFIED
              </span>
            </div>
          </div>
          <nav className="border-t border-border/60">
            <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-2 py-2 scrollbar-thin md:px-4">
              {TABS.map((tab) => {
                const Icon = tab.icon
                return (
                  <button key={tab.id} type="button" onClick={() => setActive(tab.id)}
                    className={cn('group flex shrink-0 items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-bold transition-colors',
                      active === tab.id ? 'border-primary/50 bg-primary/15 text-primary glow-neon' : 'border-transparent text-muted-foreground hover:border-border hover:bg-muted/40 hover:text-foreground')}>
                    <Icon className="size-4" />
                    <span className="font-heading">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </nav>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
          {active === 'sops' && <SopsPortal />}
          {active === 'radio' && <RadioProtocols />}
          {active === 'roster' && <RosterHub />}
          {active === 'outfits' && <OutfitsBuilder />}
          {active === 'strikes' && <StrikeBook />}
          {active === 'violations' && <Violations />}
        </main>

        <footer className="border-t border-border py-6 text-center">
          <p className="font-mono text-xs text-muted-foreground">CLASSIFIED • INTERNAL USE ONLY • جهاز الشرطة — جميع الحقوق محفوظة</p>
        </footer>
      </div>
    </div>
  )
}
