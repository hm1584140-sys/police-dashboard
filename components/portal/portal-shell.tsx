'use client'

import { memo, useCallback, useEffect, useMemo, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react'
import { BookOpen, Lock, LogIn, LogOut, MessageSquare, Pencil, Settings, Shield, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSector } from '@/lib/sector-context'
import { useAdmin, type Role } from '@/lib/admin-context'
import { NeonCard, Pill } from './primitives'
import { SopsPortal } from './sections/sops-portal'
import { RadioProtocols } from './sections/radio-protocols'
import { RosterHub } from './sections/roster-hub'
import { OutfitsBuilder } from './sections/outfits-builder'
import { StrikeBook } from './sections/strike-book'
import { Violations } from './sections/violations'
import { OwnerPanel } from './owner-panel'
import { PageManager } from './page-manager'
import { CmsBlocks, CmsPage } from './cms-page'
import { BUILTIN_PAGES, PAGE_ICON_MAP, type PageDefinition } from '@/lib/page-types'

let pageCache: PageDefinition[] | null = null

const ROLE_LABEL: Record<Role, string> = { visitor: 'زائر', commander: 'قائد', admin: 'أدمن', owner: 'المالك' }
const ROLE_TONE: Record<Role, 'muted' | 'gold' | 'danger' | 'neon'> = {
  visitor: 'muted', commander: 'gold', admin: 'danger', owner: 'neon',
}

export const SectorSwitch = memo(function SectorSwitch() {
  const { sector, setSector, sectors } = useSector()
  return (
    <div className="flex max-w-[42vw] items-center gap-1 overflow-x-auto rounded-lg border border-border bg-background/50 p-1 scrollbar-thin">
      {sectors.map((item) => (
        <button key={item.id} type="button" onClick={() => setSector(item.id)} title={item.description}
          className={cn('shrink-0 rounded-md px-3 py-1.5 font-heading text-xs font-bold transition-colors',
            sector === item.id ? 'bg-primary/20 text-primary glow-neon' : 'text-muted-foreground hover:text-foreground')}>
          {item.id}
        </button>
      ))}
    </div>
  )
})

type InboxItem = {
  id: string
  audience: string
  title: string
  body: string
  created_at: string
  recipient_username?: string | null
}

function Inbox({ token, onClose }: { token: string; onClose: () => void }) {
  const [items, setItems] = useState<InboxItem[]>([])
  useEffect(() => {
    fetch('/api/messages?token=' + encodeURIComponent(token))
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setItems(data))
      .catch(() => {})
  }, [token])

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-3" onClick={onClose}>
      <div className="w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
        <NeonCard glow className="max-h-[80vh] overflow-y-auto p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2"><MessageSquare className="size-5 text-primary" /><h3 className="font-heading text-lg font-extrabold">الرسائل الإدارية</h3></div>
            <button type="button" onClick={onClose} className="rounded border border-border p-2"><X className="size-4" /></button>
          </div>
          <div className="grid gap-3">
            {items.map((item) => (
              <div key={item.id} className="rounded-lg border border-border bg-background/40 p-4">
                <div className="flex items-center gap-2"><Pill tone="muted">{item.title || 'رسالة'}</Pill><span className="text-[10px] text-muted-foreground">{new Date(item.created_at).toLocaleString('ar')}</span></div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-foreground">{item.body}</p>
              </div>
            ))}
            {!items.length ? <p className="py-8 text-center text-sm text-muted-foreground">لا توجد رسائل جديدة.</p> : null}
          </div>
        </NeonCard>
      </div>
    </div>
  )
}

function AuthControl() {
  const { role, username, discordName, token, isOwner, login, logout } = useAdmin()
  const [open, setOpen] = useState(false)
  const [ownerOpen, setOwnerOpen] = useState(false)
  const [inboxOpen, setInboxOpen] = useState(false)
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [discord, setDiscord] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [bannedInfo, setBannedInfo] = useState<{ username: string; reason: string; discordName?: string } | null>(null)
  const [appealMessage, setAppealMessage] = useState('')
  const [appealDiscord, setAppealDiscord] = useState('')
  const [appealSent, setAppealSent] = useState(false)

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    if (!discord.trim()) {
      setError('اسم Discord مطلوب')
      return
    }
    setSubmitting(true)
    const result = await login(user, pass, discord)
    setSubmitting(false)
    if (result.ok) {
      setOpen(false)
      setUser('')
      setPass('')
      setDiscord('')
      setError('')
      setBannedInfo(null)
      return
    }
    if (result.banned) {
      setBannedInfo({ username: user.trim().toLowerCase(), reason: result.reason || 'لم يتم ذكر سبب.', discordName: result.discordName })
      setAppealDiscord(result.discordName || '')
      setError('')
    } else {
      setError(result.error || 'اسم المستخدم أو كلمة المرور غير صحيحة')
    }
  }

  async function sendAppeal() {
    if (!bannedInfo || !appealMessage.trim()) return
    const res = await fetch('/api/auth/appeals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: bannedInfo.username, discordName: appealDiscord, message: appealMessage }),
    })
    if (res.ok) {
      setAppealSent(true)
      setAppealMessage('')
    } else {
      setError('تعذر إرسال الطلب')
    }
  }

  function closeLogin() {
    setOpen(false)
    setUser(''); setPass(''); setDiscord(''); setError(''); setBannedInfo(null); setAppealSent(false)
  }

  return (
    <div className="flex items-center gap-2">
      <Pill tone={ROLE_TONE[role]}>
        {ROLE_LABEL[role]}
        {discordName ? ` — ${discordName}` : username ? ` — ${username}` : ''}
      </Pill>

      {username && token ? (
        <button type="button" onClick={() => setInboxOpen(true)} title="الرسائل" className="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground hover:text-primary">
          <MessageSquare className="size-3.5" />
        </button>
      ) : null}

      {isOwner ? (
        <button type="button" onClick={() => setOwnerOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-primary/50 bg-primary/15 px-3 py-1.5 font-heading text-xs font-bold text-primary hover:bg-primary/25">
          <Settings className="size-3.5" /> إدارة
        </button>
      ) : null}

      {role === 'visitor' ? (
        <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-1.5 font-heading text-xs font-bold text-foreground hover:bg-muted/70">
          <LogIn className="size-3.5" /> تسجيل دخول
        </button>
      ) : (
        <button type="button" onClick={logout} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-1.5 font-heading text-xs font-bold text-foreground hover:border-destructive/50 hover:text-destructive">
          <LogOut className="size-3.5" /> خروج
        </button>
      )}

      {open ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-3" onClick={closeLogin}>
          <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <NeonCard glow className="p-6">
              <div className="mb-4 flex items-center justify-between"><h3 className="font-heading text-lg font-extrabold">تسجيل الدخول</h3><button type="button" onClick={closeLogin} className="rounded border border-border p-2"><X className="size-4" /></button></div>

              {!bannedInfo ? (
                <form onSubmit={handleLogin} className="grid gap-3">
                  <input autoFocus value={discord} onChange={(e) => setDiscord(e.target.value)} placeholder="اسمك في Discord — مطلوب" className="input-base" required />
                  <input value={user} onChange={(e) => setUser(e.target.value)} placeholder="اسم المستخدم" className="input-base" />
                  <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="كلمة المرور" className="input-base" />
                  {error ? <p className="text-xs text-destructive">{error}</p> : null}
                  <button type="submit" disabled={submitting} className="rounded-lg border border-primary/50 bg-primary/15 px-4 py-2 font-bold text-primary disabled:opacity-50">{submitting ? 'جارِ التحقق...' : 'دخول'}</button>
                </form>
              ) : (
                <div className="grid gap-3">
                  <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4">
                    <p className="font-heading font-bold text-destructive">هذا الحساب مبنّد</p>
                    <p className="mt-2 text-sm leading-7 text-foreground">السبب: {bannedInfo.reason}</p>
                  </div>
                  {appealSent ? (
                    <div className="rounded-lg border border-primary/40 bg-primary/10 p-4 text-sm text-primary">تم إرسال طلب فك الباند للمالك ✓</div>
                  ) : (
                    <>
                      <input value={appealDiscord} onChange={(e) => setAppealDiscord(e.target.value)} placeholder="اسمك في Discord (اختياري)" className="input-base" />
                      <textarea value={appealMessage} onChange={(e) => setAppealMessage(e.target.value)} placeholder="اكتب طلب فك الباند..." className="input-base min-h-32 resize-y" />
                      {error ? <p className="text-xs text-destructive">{error}</p> : null}
                      <button type="button" onClick={() => void sendAppeal()} disabled={!appealMessage.trim()} className="rounded-lg border border-primary/50 bg-primary/15 px-4 py-2 font-bold text-primary disabled:opacity-50">إرسال طلب فك الباند</button>
                    </>
                  )}
                </div>
              )}
            </NeonCard>
          </div>
        </div>
      ) : null}

      {ownerOpen && token ? <OwnerPanel token={token} onClose={() => setOwnerOpen(false)} /> : null}
      {inboxOpen && token ? <Inbox token={token} onClose={() => setInboxOpen(false)} /> : null}
    </div>
  )
}

export function PortalShell() {
  const [pages, setPages] = useState<PageDefinition[]>(() => pageCache ?? BUILTIN_PAGES)
  const [active, setActive] = useState('sops')
  const [quickEditorOpen, setQuickEditorOpen] = useState(false)
  const { currentSector } = useSector()
  const { isOwner, token } = useAdmin()

  const loadPages = useCallback(async () => {
    try {
      const res = await fetch('/api/pages', { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      if (!Array.isArray(data) || !data.length) return
      const next = data
        .filter((page: PageDefinition) => page.is_visible)
        .map((page: PageDefinition) => page.slug === 'sops' ? { ...page, renderer: 'sops' as const } : page)
      if (!next.length) return
      pageCache = next
      setPages(next)
      setActive((current) => next.some((page: PageDefinition) => page.slug === current) ? current : (next[0]?.slug ?? 'sops'))
    } catch {
      // Keep the last known page list on transient network errors.
    }
  }, [])

  useEffect(() => {
    void loadPages()
    const handlePagesChanged = () => void loadPages()
    window.addEventListener('pd:pages-changed', handlePagesChanged)
    return () => window.removeEventListener('pd:pages-changed', handlePagesChanged)
  }, [loadPages])

  const theme = useMemo(() => ({ vars: currentSector.vars }), [currentSector.vars])
  const activePage = useMemo(() => pages.find((page) => page.slug === active) ?? pages[0] ?? BUILTIN_PAGES[0], [pages, active])

  function withExtraContent(page: PageDefinition, content: ReactNode) {
    const extra = (page.blocks ?? []).filter((block) => block.type !== 'sops-copy')
    return (
      <div className="flex flex-col gap-6">
        {content}
        {extra.length ? <CmsBlocks blocks={extra} /> : null}
      </div>
    )
  }

  function renderActivePage(page: PageDefinition) {
    if (page.slug === 'sops' || page.renderer === 'sops') return <SopsPortal page={page} />
    if (page.renderer === 'radio') return withExtraContent(page, <RadioProtocols page={page} />)
    if (page.renderer === 'roster') return withExtraContent(page, <RosterHub page={page} />)
    if (page.renderer === 'outfits') return withExtraContent(page, <OutfitsBuilder page={page} />)
    if (page.renderer === 'strikes') return withExtraContent(page, <StrikeBook page={page} />)
    if (page.renderer === 'violations') return withExtraContent(page, <Violations page={page} />)
    return <CmsPage page={page} />
  }

  return (
    <div style={theme.vars as CSSProperties} className="min-h-screen cyber-grid">
      <div className="min-h-screen bg-gradient-to-b from-background/40 via-background/80 to-background">
        <header className="sticky top-0 z-30 border-b border-border bg-background/95">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 text-primary glow-neon"><Shield className="size-6" /></div>
              <div className="leading-tight">
                <p className="font-heading text-sm font-extrabold text-foreground md:text-base">بوابة عمليات جهاز الشرطة</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{currentSector.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2"><SectorSwitch /><AuthControl /><span className="hidden items-center gap-1.5 rounded-full border border-destructive/50 bg-destructive/15 px-3 py-1 font-mono text-xs text-destructive lg:inline-flex"><Lock className="size-3" /> CLASSIFIED</span></div>
          </div>

          <nav className="border-t border-border/60">
            <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-2 py-2 scrollbar-thin md:px-4">
              {pages.map((page) => {
                const Icon = PAGE_ICON_MAP[page.icon] ?? BookOpen
                return (
                  <button key={page.slug} type="button" onClick={() => setActive(page.slug)} title={page.description}
                    className={cn('group flex shrink-0 items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-bold transition-colors',
                      active === page.slug ? 'border-primary/50 bg-primary/15 text-primary glow-neon' : 'border-transparent text-muted-foreground hover:border-border hover:bg-muted/40 hover:text-foreground')}>
                    <Icon className="size-4" /><span className="font-heading">{page.title}</span>
                  </button>
                )
              })}
            </div>
          </nav>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
          {isOwner && token && activePage ? (
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={() => setQuickEditorOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-primary/50 bg-primary/10 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/20"
              >
                <Pencil className="size-3.5" />
                تعديل هذه الصفحة
              </button>
            </div>
          ) : null}
          {activePage ? renderActivePage(activePage) : null}
        </main>

        {quickEditorOpen && token && activePage ? (
          <PageManager
            token={token}
            initialPage={activePage}
            onSaved={() => { void loadPages(); setQuickEditorOpen(false) }}
            onClose={() => setQuickEditorOpen(false)}
          />
        ) : null}

        <footer className="border-t border-border py-6 text-center">
          <p className="font-mono text-xs text-muted-foreground">CLASSIFIED • INTERNAL USE ONLY • جهاز الشرطة — جميع الحقوق محفوظة</p>
        </footer>
      </div>
    </div>
  )
}
