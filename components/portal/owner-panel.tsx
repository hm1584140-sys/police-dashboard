'use client'

import { useEffect, useState } from 'react'
import {
  Ban,
  CheckCircle2,
  FileCog,
  Mail,
  MessageSquare,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserPlus,
  UserX,
  Users,
  X,
} from 'lucide-react'
import { NeonCard, Pill } from './primitives'
import { cn } from '@/lib/utils'
import { PageManager } from './page-manager'
import { SectorManager } from './sector-manager'
import type { Role } from '@/lib/auth'
import { PERMISSIONS, PERMISSION_LABELS, type Permission } from '@/lib/permissions'
import { useAdmin } from '@/lib/admin-context'

type Tab = 'overview' | 'accounts' | 'messages' | 'appeals' | 'pages' | 'sectors' | 'roster' | 'logs'

type Account = {
  username: string
  role: Role
  discord_name: string
  is_banned: boolean
  ban_reason: string
  last_login_at?: string | null
  created_at?: string
  permissions: Permission[]
}

type Session = {
  token: string
  username: string
  role: Role
  discord_name: string
  login_at: number
}

type Appeal = {
  id: string
  username: string
  discord_name: string
  message: string
  status: 'pending' | 'approved' | 'rejected'
  owner_response: string
  created_at: string
}

type OwnerMessage = {
  id: string
  audience: 'user' | 'online' | 'banned' | 'all'
  recipient_username?: string | null
  title: string
  body: string
  created_by: string
  created_at: string
}

type AuditLog = {
  id: string
  actor_username: string
  actor_discord: string
  actor_role: string
  action: string
  target_type: string
  target_id: string
  details: Record<string, unknown>
  created_at: string
}

type RosterColumn = {
  id: string
  sector_id: string
  column_key: string
  label: string
  kind: 'text' | 'number' | 'select'
  options: string[]
}

let ownerPanelCache: {
  accounts: Account[]
  sessions: Session[]
  appeals: Appeal[]
  messages: OwnerMessage[]
  logs: AuditLog[]
  at: number
} | null = null

const ROLE_LABEL: Record<Role, string> = { visitor: 'زائر', commander: 'قائد', admin: 'أدمن', owner: 'مالك' }
const ROLE_TONE: Record<Role, 'muted' | 'gold' | 'danger' | 'neon'> = {
  visitor: 'muted', commander: 'gold', admin: 'danger', owner: 'neon',
}

export function OwnerPanel({ token, onClose }: { token: string; onClose: () => void }) {
  const { role: currentRole, username: currentUsername, can } = useAdmin()
  const isOwner = currentRole === 'owner'
  const [tab, setTab] = useState<Tab>('overview')
  const [accounts, setAccounts] = useState<Account[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [appeals, setAppeals] = useState<Appeal[]>([])
  const [messages, setMessages] = useState<OwnerMessage[]>([])
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [pageManagerOpen, setPageManagerOpen] = useState(false)
  const [sectorManagerOpen, setSectorManagerOpen] = useState(false)
  const [rosterManagerOpen, setRosterManagerOpen] = useState(false)
  const [accountForm, setAccountForm] = useState<{ username: string; password: string; discordName: string; role: Role; permissions: Permission[] } | null>(null)
  const [editing, setEditing] = useState<EditableAccount | null>(null)
  const [banTarget, setBanTarget] = useState<Account | null>(null)
  const [banReason, setBanReason] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null)
  const [appealReview, setAppealReview] = useState<{ appeal: Appeal; status: Appeal['status']; response: string } | null>(null)
  const [composerOpen, setComposerOpen] = useState(false)
  const [messageForm, setMessageForm] = useState({ audience: 'all' as OwnerMessage['audience'], recipient: '', title: '', body: '' })

  async function loadCore(force = false) {
    const freshCache = ownerPanelCache && Date.now() - ownerPanelCache.at < 30_000
    if (!force && freshCache && ownerPanelCache) {
      setAccounts(ownerPanelCache.accounts)
      setSessions(ownerPanelCache.sessions)
      setAppeals(ownerPanelCache.appeals)
      setMessages(ownerPanelCache.messages)
      setLogs(ownerPanelCache.logs)
      setLoading(false)
      return
    }

    setLoading(true)
    if (force) setMessage('')
    try {
      const [aRes, sRes, pRes, mRes, lRes] = await Promise.all([
        fetch('/api/auth/accounts?token=' + encodeURIComponent(token)),
        fetch('/api/auth/sessions?token=' + encodeURIComponent(token)),
        fetch('/api/auth/appeals?token=' + encodeURIComponent(token)),
        fetch('/api/messages?token=' + encodeURIComponent(token)),
        fetch('/api/audit?token=' + encodeURIComponent(token) + '&limit=250'),
      ])
      if (!aRes.ok || !sRes.ok || !pRes.ok || !mRes.ok || !lRes.ok) throw new Error()
      const [nextAccounts, nextSessions, nextAppeals, nextMessages, nextLogs] = await Promise.all([
        aRes.json(), sRes.json(), pRes.json(), mRes.json(), lRes.json(),
      ])
      setAccounts(nextAccounts)
      setSessions(nextSessions)
      setAppeals(nextAppeals)
      setMessages(nextMessages)
      setLogs(nextLogs)
      ownerPanelCache = {
        accounts: nextAccounts,
        sessions: nextSessions,
        appeals: nextAppeals,
        messages: nextMessages,
        logs: nextLogs,
        at: Date.now(),
      }
    } catch {
      setMessage('تعذر تحميل بعض بيانات الإدارة')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void loadCore() }, [])

  async function createAccount() {
    if (!accountForm) return
    const res = await fetch('/api/auth/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, username: accountForm.username, password: accountForm.password, role: accountForm.role, discordName: accountForm.discordName, permissions: accountForm.permissions }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return setMessage(data.error ?? 'تعذر إنشاء الحساب')
    setAccountForm(null); setMessage('تم إنشاء الحساب ✓'); await loadCore(true)
  }

  async function updateAccount(account: EditableAccount) {
    const res = await fetch('/api/auth/accounts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        username: account.username,
        newUsername: account.__newUsername,
        newPassword: account.__newPassword,
        role: account.role,
        discordName: account.discord_name,
        permissions: account.permissions,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return setMessage(data.error ?? 'تعذر تعديل الحساب')
    setEditing(null); setMessage('تم تعديل الحساب ✓'); await loadCore(true)
  }

  async function ban(username: string, banned: boolean, reason = '') {
    const res = await fetch('/api/auth/accounts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, username, action: banned ? 'ban' : 'unban', reason }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return setMessage(data.error ?? 'تعذر تنفيذ العملية')
    setBanTarget(null); setBanReason(''); setMessage(banned ? 'تم التبنيد وطرد الجلسات ✓' : 'تم فك الباند ✓'); await loadCore(true)
  }

  async function removeAccount(username: string) {
    const res = await fetch('/api/auth/accounts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, username }),
    })
    if (!res.ok) return setMessage('تعذر حذف الحساب')
    setDeleteTarget(null); setMessage('تم حذف الحساب ✓'); await loadCore(true)
  }

  async function sendMessage() {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        audience: messageForm.audience,
        recipientUsername: messageForm.recipient,
        title: messageForm.title,
        body: messageForm.body,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return setMessage(data.error ?? 'تعذر إرسال الرسالة')
    setComposerOpen(false)
    setMessageForm({ audience: 'all', recipient: '', title: '', body: '' })
    setMessage('تم إرسال الرسالة ✓')
    await loadCore(true)
  }

  async function reviewAppeal(appeal: Appeal, status: Appeal['status'], response: string) {
    const res = await fetch('/api/auth/appeals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, id: appeal.id, status, ownerResponse: response }),
    })
    if (!res.ok) return setMessage('تعذر تحديث الطلب')
    setAppealReview(null)
    setMessage(status === 'approved' ? 'تم فك الباند ومراجعة الطلب ✓' : 'تم رفض الطلب ✓')
    await loadCore(true)
  }

  const onlineCount = sessions.length
  const bannedCount = accounts.filter((item) => item.is_banned).length
  const pendingAppeals = appeals.filter((item) => item.status === 'pending').length

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-3 md:p-6" onClick={onClose}>
      <div className="w-full max-w-7xl" onClick={(e) => e.stopPropagation()}>
        <NeonCard glow className="max-h-[92vh] overflow-y-auto p-4 md:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-primary" />
                <h3 className="font-heading text-xl font-extrabold text-foreground">مركز تحكم المالك</h3>
                <Pill tone="neon">OWNER</Pill>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">إدارة الحسابات، الجلسات، الباندات، الطلبات، الرسائل، القطاعات والمحتوى.</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => void loadCore(true)} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-bold text-muted-foreground hover:bg-muted/40">
                <RefreshCw className="size-3.5" /> تحديث
              </button>
              <button type="button" onClick={onClose} className="rounded-md border border-border p-2 text-muted-foreground hover:bg-muted/40"><X className="size-4" /></button>
            </div>
          </div>

          <div className="mb-5 flex flex-wrap gap-1 overflow-x-auto rounded-lg border border-border bg-background/40 p-1">
            {([
              ['overview','الرئيسية', ShieldCheck],
              ['accounts','الحسابات', Users],
              ['messages','الرسائل', MessageSquare],
              ['appeals','طلبات فك الباند', Mail],
              ['pages','القوائم والمحتوى', FileCog],
              ['sectors','القطاعات', ShieldCheck],
              ['roster','أعمدة كشف القوات', FileCog],
              ['logs','السجلات', RefreshCw],
            ] as const).map(([id,label,Icon]) => (
              <button key={id} type="button" onClick={() => setTab(id)} className={cn('flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-bold', tab === id ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-muted/30')}>
                <Icon className="size-3.5" /> {label}
              </button>
            ))}
          </div>

          {message ? <div className="mb-4 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">{message}</div> : null}

          {loading && tab === 'overview' ? <p className="py-12 text-center text-sm text-muted-foreground">جاري التحميل...</p> : null}

          {tab === 'overview' ? (
            <div className="grid gap-4 md:grid-cols-3">
              <Stat label="الحسابات" value={accounts.length} />
              <Stat label="المسجلون الآن" value={onlineCount} />
              <Stat label="المبندون" value={bannedCount} tone="danger" />
              <Stat label="طلبات فك الباند" value={pendingAppeals} tone="gold" />
              <button type="button" onClick={() => setTab('accounts')} className="rounded-xl border border-border bg-background/40 p-5 text-right hover:bg-muted/20">
                <UserPlus className="mb-3 size-5 text-primary" /><p className="font-heading font-bold">إنشاء حساب جديد</p><p className="mt-1 text-xs text-muted-foreground">اسم مستخدم + كلمة مرور + Discord + الصلاحية</p>
              </button>
              <button type="button" onClick={() => { setTab('messages'); setComposerOpen(true) }} className="rounded-xl border border-border bg-background/40 p-5 text-right hover:bg-muted/20">
                <MessageSquare className="mb-3 size-5 text-primary" /><p className="font-heading font-bold">إرسال إعلان</p><p className="mt-1 text-xs text-muted-foreground">للموجودين أو المبندين أو شخص محدد أو الجميع</p>
              </button>
              <div className="md:col-span-3 rounded-xl border border-border bg-background/40 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="font-heading font-bold text-foreground">المسجلون دخول الآن</h4>
                  <Pill tone="neon">{onlineCount}</Pill>
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  {sessions.map((session) => (
                    <div key={session.token} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                      <div><p className="text-sm font-bold text-foreground">{session.username}</p><p className="text-[11px] text-muted-foreground">{session.discord_name || 'بدون Discord'} • {ROLE_LABEL[session.role]}</p></div>
                      <button type="button" onClick={() => void ban(session.username, true, 'تم طرد الحساب بواسطة المالك')} className="rounded-md border border-destructive/40 bg-destructive/10 p-1.5 text-destructive"><UserX className="size-3.5" /></button>
                    </div>
                  ))}
                  {!sessions.length ? <p className="text-xs text-muted-foreground">لا يوجد أحد مسجل حالياً.</p> : null}
                </div>
              </div>
            </div>
          ) : null}

          {tab === 'accounts' ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-heading text-base font-bold text-foreground">إدارة الحسابات</h4>
                <button type="button" onClick={() => setAccountForm({ username: '', password: '', discordName: '', role: 'commander', permissions: [] })} className="inline-flex items-center gap-1.5 rounded-lg border border-primary/50 bg-primary/15 px-3.5 py-2 text-sm font-bold text-primary"><Plus className="size-4" /> إنشاء حساب</button>
              </div>
              <div className="grid gap-2">
                {accounts.map((account) => (
                  <div key={account.username} className="rounded-xl border border-border bg-background/30 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Pill tone={account.is_banned ? 'danger' : ROLE_TONE[account.role]}>{account.is_banned ? 'مبند' : ROLE_LABEL[account.role]}</Pill>
                        <span className="font-heading text-sm font-bold text-foreground">{account.username}</span>
                        <span className="text-xs text-muted-foreground">{account.discord_name || 'بدون Discord'}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <button type="button" onClick={() => setEditing(account)} className="rounded-md border border-border px-2.5 py-1.5 text-xs font-bold text-muted-foreground hover:bg-muted/30">تعديل</button>
                        {account.is_banned
                          ? <button type="button" onClick={() => void ban(account.username, false)} className="rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1.5 text-xs font-bold text-primary">فك الباند</button>
                          : <button type="button" onClick={() => { setBanTarget(account); setBanReason('') }} className="rounded-md border border-destructive/40 bg-destructive/10 px-2.5 py-1.5 text-xs font-bold text-destructive"><Ban className="mr-1 inline size-3.5" />تبنيد</button>}
                        <button type="button" onClick={() => setDeleteTarget(account)} className="rounded-md border border-border p-1.5 text-muted-foreground hover:border-destructive/50 hover:text-destructive"><Trash2 className="size-3.5" /></button>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">آخر دخول: {account.last_login_at ? new Date(account.last_login_at).toLocaleString('ar') : 'لم يدخل بعد'}{account.is_banned && account.ban_reason ? ` • سبب الباند: ${account.ban_reason}` : ''}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {tab === 'messages' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-heading font-bold">صندوق الرسائل الإدارية</h4>
                <button type="button" onClick={() => setComposerOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-primary/50 bg-primary/15 px-3 py-2 text-xs font-bold text-primary"><MessageSquare className="size-4" /> رسالة جديدة</button>
              </div>
              <div className="grid gap-2">
                {messages.map((item) => (
                  <div key={item.id} className="rounded-xl border border-border bg-background/30 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div><div className="flex flex-wrap gap-2"><Pill tone="muted">{item.audience}</Pill>{item.recipient_username ? <Pill tone="neon">{item.recipient_username}</Pill> : null}</div><h5 className="mt-2 font-heading font-bold text-foreground">{item.title || 'رسالة إدارية'}</h5><p className="mt-1 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{item.body}</p></div>
                      <button type="button" onClick={async()=>{await fetch('/api/messages',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,id:item.id})});void loadCore(true)}} className="rounded-md border border-border p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="size-3.5" /></button>
                    </div>
                  </div>
                ))}
                {!messages.length ? <p className="py-10 text-center text-sm text-muted-foreground">لا توجد رسائل.</p> : null}
              </div>
            </div>
          ) : null}

          {tab === 'appeals' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between"><h4 className="font-heading font-bold">طلبات فك الباند</h4><Pill tone="gold">{pendingAppeals} معلّق</Pill></div>
              {appeals.map((appeal) => (
                <div key={appeal.id} className="rounded-xl border border-border bg-background/30 p-4">
                  <div className="flex flex-wrap items-center gap-2"><Pill tone={appeal.status === 'pending' ? 'gold' : appeal.status === 'approved' ? 'neon' : 'danger'}>{appeal.status}</Pill><span className="font-bold">{appeal.username}</span><span className="text-xs text-muted-foreground">{appeal.discord_name || 'بدون Discord'}</span></div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-foreground">{appeal.message}</p>
                  {appeal.owner_response ? <p className="mt-2 rounded-lg bg-muted/20 p-3 text-xs text-muted-foreground">رد المالك: {appeal.owner_response}</p> : null}
                  {appeal.status === 'pending' ? (
                    <div className="mt-3 flex gap-2">
                      <button type="button" onClick={() => setAppealReview({ appeal, status: 'approved', response: appeal.owner_response ?? '' })} className="inline-flex items-center gap-1 rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary"><CheckCircle2 className="size-3.5" /> قبول وفك الباند</button>
                      <button type="button" onClick={() => setAppealReview({ appeal, status: 'rejected', response: appeal.owner_response ?? '' })} className="inline-flex items-center gap-1 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive">رفض</button>
                    </div>
                  ) : null}
                </div>
              ))}
              {!appeals.length ? <p className="py-10 text-center text-sm text-muted-foreground">لا توجد طلبات.</p> : null}
            </div>
          ) : null}

          {tab === 'pages' ? (
            <div className="rounded-xl border border-border bg-background/30 p-5">
              <p className="mb-4 text-sm text-muted-foreground">استخدم مدير القوائم لإنشاء قائمة جديدة من الصفر، اختيار وظيفتها، تغيير الأيقونة، تعديل النصوص والبلوكات، وترتيب القوائم.</p>
              <button type="button" onClick={() => setPageManagerOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-primary/50 bg-primary/15 px-4 py-2 text-sm font-bold text-primary"><FileCog className="size-4" /> فتح مدير القوائم</button>
            </div>
          ) : null}

          {tab === 'sectors' ? (
            <div className="rounded-xl border border-border bg-background/30 p-5">
              <p className="mb-4 text-sm text-muted-foreground">إنشاء قطاع، فتح القطاعات الجاهزة، تعديل الرتب والثيم، وإظهار أو إخفاء أي قطاع.</p>
              <button type="button" onClick={() => setSectorManagerOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-primary/50 bg-primary/15 px-4 py-2 text-sm font-bold text-primary"><ShieldCheck className="size-4" /> فتح إدارة القطاعات</button>
            </div>
          ) : null}

          {tab === 'roster' ? (
            <div className="rounded-xl border border-border bg-background/30 p-5">
              <p className="mb-4 text-sm text-muted-foreground">أضف أعمدة جديدة لكل قطاع. العمود يظهر فوراً على جميع الأفراد الحاليين والجدد داخل نفس القطاع.</p>
              <button type="button" onClick={() => setRosterManagerOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-primary/50 bg-primary/15 px-4 py-2 text-sm font-bold text-primary"><FileCog className="size-4" /> إدارة أعمدة كشف القوات</button>
            </div>
          ) : null}

          {tab === 'logs' ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="font-heading font-bold text-foreground">سجل النشاط</h4>
                  <p className="mt-1 text-xs text-muted-foreground">يعرض من نفذ العملية واسم Discord ونوع التعديل والوقت.</p>
                </div>
                <Pill tone="muted">{logs.length} سجل</Pill>
              </div>
              <div className="grid gap-2">
                {logs.map((item) => (
                  <div key={item.id} className="rounded-xl border border-border bg-background/30 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill tone="neon">{item.actor_discord || item.actor_username || 'غير معروف'}</Pill>
                      <Pill tone="muted">{item.actor_role || '—'}</Pill>
                      <span className="text-xs font-bold text-foreground">{auditActionLabel(item.action)}</span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      الحساب: {item.actor_username || '—'}
                      {item.target_type ? ` • الهدف: ${item.target_type}` : ''}
                      {item.target_id ? ` • ${item.target_id}` : ''}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{new Date(item.created_at).toLocaleString('ar')}</p>
                  </div>
                ))}
                {!logs.length ? <p className="py-10 text-center text-sm text-muted-foreground">لا توجد سجلات حتى الآن.</p> : null}
              </div>
            </div>
          ) : null}
        </NeonCard>
      </div>

      {pageManagerOpen ? <PageManager token={token} onClose={() => setPageManagerOpen(false)} /> : null}
      {sectorManagerOpen ? <SectorManager token={token} onClose={() => setSectorManagerOpen(false)} /> : null}
      {rosterManagerOpen ? <RosterColumnsManager token={token} onClose={() => setRosterManagerOpen(false)} /> : null}

      {accountForm ? (
        <Modal title="إنشاء حساب جديد" onClose={() => setAccountForm(null)}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="اسم المستخدم"><input value={accountForm.username} onChange={e=>setAccountForm({...accountForm,username:e.target.value})} className="input-base" /></Field>
            <Field label="كلمة المرور"><input type="password" value={accountForm.password} onChange={e=>setAccountForm({...accountForm,password:e.target.value})} className="input-base" /></Field>
            <Field label="اسم الشخص في Discord (اختياري)"><input value={accountForm.discordName} onChange={e=>setAccountForm({...accountForm,discordName:e.target.value})} className="input-base" placeholder="مثال: أحمد | Ahmd" /></Field>
            <Field label="الصلاحية"><select value={accountForm.role} onChange={e=>setAccountForm({...accountForm,role:e.target.value as Role})} className="input-base"><option value="commander">قائد</option><option value="admin">أدمن</option>{isOwner ? <option value="owner">مالك</option> : null}</select></Field>
          </div>
          {isOwner && accountForm.role !== 'owner' ? <PermissionPicker value={accountForm.permissions} onChange={(permissions)=>setAccountForm({...accountForm,permissions})} /> : null}
          <Actions onCancel={() => setAccountForm(null)} onSave={() => void createAccount()} saveLabel="إنشاء الحساب" />
        </Modal>
      ) : null}

      {editing ? (
        <EditAccountModal account={editing} onClose={()=>setEditing(null)} onSave={(next)=>{setEditing(next);void updateAccount(next)}} canChangePassword={can('accounts.password')} canAssignPermissions={isOwner} />
      ) : null}

      {banTarget ? (
        <Modal title={`تبنيد ${banTarget.username}`} onClose={() => setBanTarget(null)}>
          <Field label="سبب الباند"><textarea value={banReason} onChange={e=>setBanReason(e.target.value)} className="input-base min-h-28 resize-y" placeholder="اكتب السبب الذي سيظهر للمبند..." /></Field>
          <Actions onCancel={()=>setBanTarget(null)} onSave={()=>void ban(banTarget.username,true,banReason)} saveLabel="تأكيد الباند" />
        </Modal>
      ) : null}

      {deleteTarget ? (
        <Modal title="تأكيد حذف الحساب" onClose={() => setDeleteTarget(null)}>
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
            <p className="font-heading text-sm font-extrabold text-foreground">هل تريد حذف حساب {deleteTarget.username} نهائياً؟</p>
            <p className="mt-2 text-xs text-muted-foreground">هذا الإجراء يحذف الجلسات المرتبطة بالحساب أيضاً.</p>
          </div>
          <Actions onCancel={() => setDeleteTarget(null)} onSave={() => void removeAccount(deleteTarget.username)} saveLabel="حذف الحساب" />
        </Modal>
      ) : null}

      {appealReview ? (
        <Modal title={appealReview.status === 'approved' ? 'قبول طلب فك الباند' : 'رفض طلب فك الباند'} onClose={() => setAppealReview(null)}>
          <Field label="الرد على صاحب الطلب (اختياري)">
            <textarea value={appealReview.response} onChange={(e)=>setAppealReview({...appealReview,response:e.target.value})} className="input-base min-h-28 resize-y" />
          </Field>
          <Actions onCancel={() => setAppealReview(null)} onSave={() => void reviewAppeal(appealReview.appeal, appealReview.status, appealReview.response)} saveLabel={appealReview.status === 'approved' ? 'قبول الطلب' : 'رفض الطلب'} />
        </Modal>
      ) : null}

      {composerOpen ? (
        <Modal title="إرسال رسالة إدارية" onClose={()=>setComposerOpen(false)}>
          <div className="grid gap-3">
            <Field label="إرسال إلى">
              <select value={messageForm.audience} onChange={e=>setMessageForm({...messageForm,audience:e.target.value as OwnerMessage['audience']})} className="input-base">
                <option value="all">الجميع</option>
                <option value="online">المسجلون دخول الآن</option>
                <option value="banned">المبندون</option>
                <option value="user">شخص محدد</option>
              </select>
            </Field>
            {messageForm.audience === 'user' ? <Field label="اسم المستخدم"><input value={messageForm.recipient} onChange={e=>setMessageForm({...messageForm,recipient:e.target.value})} className="input-base" /></Field> : null}
            <Field label="العنوان"><input value={messageForm.title} onChange={e=>setMessageForm({...messageForm,title:e.target.value})} className="input-base" /></Field>
            <Field label="الرسالة"><textarea value={messageForm.body} onChange={e=>setMessageForm({...messageForm,body:e.target.value})} className="input-base min-h-32 resize-y" /></Field>
          </div>
          <Actions onCancel={()=>setComposerOpen(false)} onSave={()=>void sendMessage()} saveLabel="إرسال" />
        </Modal>
      ) : null}
    </div>
  )
}

type EditableAccount = Account & { __newUsername?: string; __newPassword?: string }

function EditAccountModal({ account, onClose, onSave, canChangePassword, canAssignPermissions }: { account: Account; onClose:()=>void; onSave:(next: EditableAccount)=>void; canChangePassword:boolean; canAssignPermissions:boolean }) {
  const [form, setForm] = useState<EditableAccount>({ ...account, __newUsername: account.username, __newPassword: '' })
  return (
    <Modal title={`تعديل حساب ${account.username}`} onClose={onClose}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="اسم المستخدم الجديد"><input value={form.__newUsername ?? ''} onChange={e=>setForm({...form,__newUsername:e.target.value})} className="input-base" /></Field>
        {canChangePassword ? <Field label="كلمة المرور الجديدة (اتركها فارغة إذا لا تريد التغيير)"><input type="password" value={form.__newPassword ?? ''} onChange={e=>setForm({...form,__newPassword:e.target.value})} className="input-base" /></Field> : null}
        <Field label="Discord"><input value={form.discord_name} onChange={e=>setForm({...form,discord_name:e.target.value})} className="input-base" /></Field>
        <Field label="الصلاحية"><select value={form.role} onChange={e=>setForm({...form,role:e.target.value as Role})} className="input-base"><option value="commander">قائد</option><option value="admin">أدمن</option><option value="owner">مالك</option></select></Field>
      </div>
      {canAssignPermissions && form.role !== 'owner' ? <PermissionPicker value={form.permissions} onChange={(permissions)=>setForm({...form,permissions})} /> : null}
      <Actions onCancel={onClose} onSave={()=>onSave(form)} saveLabel="حفظ التغييرات" />
    </Modal>
  )
}

function PermissionPicker({ value, onChange }: { value: Permission[]; onChange: (permissions: Permission[]) => void }) {
  return (
    <div className="mt-4 rounded-xl border border-border bg-background/40 p-4">
      <div className="mb-3">
        <h5 className="font-heading text-sm font-extrabold text-foreground">الصلاحيات الخاصة</h5>
        <p className="mt-1 text-[11px] text-muted-foreground">حدد بالضبط ما يظهر لهذا الحساب وما يستطيع تنفيذه داخل الإدارة.</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {PERMISSIONS.map((permission) => {
          const checked = value.includes(permission)
          return (
            <label key={permission} className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 hover:bg-muted/20">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onChange(checked ? value.filter((item) => item !== permission) : [...value, permission])}
                className="size-4 accent-cyan-400"
              />
              <span className="text-xs font-bold text-foreground">{PERMISSION_LABELS[permission]}</span>
            </label>
          )
        })}
      </div>
    </div>
  )
}

function RosterColumnsManager({ token, onClose }: { token:string; onClose:()=>void }) {
  const [sectors,setSectors]=useState<Array<{id:string;name:string;arabic:string}>>([])
  const [sector,setSector]=useState('')
  const [columns,setColumns]=useState<RosterColumn[]>([])
  const [label,setLabel]=useState('')
  const [kind,setKind]=useState<RosterColumn['kind']>('text')
  const [options,setOptions]=useState('')
  const [loading,setLoading]=useState(false)
  const [adding,setAdding]=useState(false)

  async function loadSectors(){
    const res=await fetch('/api/sectors?mode=admin&token='+encodeURIComponent(token))
    if(!res.ok)return
    const payload=await res.json()
    const data = Array.isArray(payload.sectors) ? payload.sectors as Array<{id:string;name:string;arabic:string}> : []
    setSectors(data)
    if(!sector) setSector(data[0]?.id ?? '')
  }
  async function loadColumns(id=sector){
    if(!id)return
    const res=await fetch('/api/roster-columns?sector='+encodeURIComponent(id))
    if(res.ok)setColumns(await res.json())
  }
  useEffect(()=>{void loadSectors()},[])
  useEffect(()=>{void loadColumns()},[sector])

  async function add(){
    if(!label.trim() || adding)return
    setAdding(true)
    const tempId=`temp-${crypto.randomUUID()}`
    const temp: RosterColumn={
      id:tempId,
      sector_id:sector,
      column_key:`temp_${Date.now()}`,
      label:label.trim(),
      kind,
      options:options.split('\n').map(v=>v.trim()).filter(Boolean),
    }
    setColumns(prev=>[...prev,temp])
    const res=await fetch('/api/roster-columns',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,sectorId:sector,label,kind,options:temp.options})})
    if(res.ok){
      const created=await res.json()
      setColumns(prev=>prev.map(item=>item.id===tempId?created:item))
      setLabel('')
      setOptions('')
      window.dispatchEvent(new CustomEvent('pd:roster-columns-changed',{detail:{sector}}))
    }else{
      setColumns(prev=>prev.filter(item=>item.id!==tempId))
    }
    setAdding(false)
  }
  async function remove(id:string){
    await fetch('/api/roster-columns',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,id})});await loadColumns()
  }

  return <Modal title="أعمدة كشف القوات" onClose={onClose}>
    <div className="grid gap-3">
      <Field label="القطاع"><select value={sector} onChange={e=>setSector(e.target.value)} className="input-base">{sectors.map((s)=><option key={s.id} value={s.id}>{s.id} — {s.arabic || s.name}</option>)}</select></Field>
      <div className="grid gap-2 sm:grid-cols-[1fr_160px]">
        <Field label="اسم العمود الجديد"><input value={label} onChange={e=>setLabel(e.target.value)} className="input-base" placeholder="مثال: الإدارة المناوبة" /></Field>
        <Field label="نوع الخانة"><select value={kind} onChange={e=>setKind(e.target.value as RosterColumn['kind'])} className="input-base"><option value="text">نص</option><option value="number">رقم</option><option value="select">قائمة اختيار</option></select></Field>
      </div>
      {kind==='select'?<Field label="خيارات القائمة — كل خيار في سطر"><textarea value={options} onChange={e=>setOptions(e.target.value)} className="input-base min-h-20" /></Field>:null}
      <button type="button" onClick={()=>void add()} disabled={adding} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-primary/50 bg-primary/15 px-4 py-2 text-sm font-bold text-primary disabled:opacity-50"><Plus className="size-4" /> {adding?'جاري الإضافة...':'إضافة العمود'}</button>
      <div className="mt-2 grid gap-2">{columns.map(c=><div key={c.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2"><div><p className="font-bold">{c.label}</p><p className="text-[10px] text-muted-foreground">{c.kind}</p></div><button type="button" onClick={()=>void remove(c.id)} className="rounded border border-border p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="size-3.5" /></button></div>)}{!columns.length?<p className="text-xs text-muted-foreground">لا توجد أعمدة مخصصة لهذا القطاع.</p>:null}</div>
    </div>
  </Modal>
}

function auditActionLabel(action: string) {
  const labels: Record<string, string> = {
    login: 'تسجيل دخول',
    logout: 'تسجيل خروج',
    account_create: 'إنشاء حساب',
    account_update: 'تعديل حساب',
    account_delete: 'حذف حساب',
    account_ban: 'تبنيد حساب',
    account_unban: 'فك باند',
    session_kick: 'طرد جلسة',
    message_send: 'إرسال رسالة',
    message_delete: 'حذف رسالة',
    page_create: 'إنشاء قائمة',
    page_update: 'تعديل قائمة',
    page_delete: 'حذف قائمة',
    sector_create: 'إنشاء قطاع',
    sector_update: 'تعديل قطاع',
    sector_delete: 'حذف قطاع',
    strike_create: 'إضافة جزاء',
    strike_update: 'تعديل جزاء',
    strike_delete: 'حذف جزاء',
    roster_create: 'إضافة فرد',
    roster_update: 'تعديل فرد',
    roster_delete: 'حذف فرد',
    radio_create: 'إضافة سطر لاسلكي',
    radio_update: 'تعديل سطر لاسلكي',
    radio_delete: 'حذف سطر لاسلكي',
    violation_create: 'إضافة مخالفة',
    violation_update: 'تعديل مخالفة',
    violation_delete: 'حذف مخالفة',
    outfit_update: 'تعديل ملابس',
    roster_column_create: 'إضافة عمود كشف',
    roster_column_update: 'تعديل عمود كشف',
    roster_column_delete: 'حذف عمود كشف',
    appeal_review: 'مراجعة طلب فك باند',
  }
  return labels[action] ?? action
}

function Stat({ label, value, tone='neon' }: { label:string; value:number; tone?:'neon'|'gold'|'danger' }) {
  return <div className="rounded-xl border border-border bg-background/40 p-5"><p className="text-xs text-muted-foreground">{label}</p><p className={cn('mt-1 font-mono text-3xl font-black',tone==='danger'?'text-destructive':tone==='gold'?'text-[oklch(0.88_0.16_90)]':'text-primary')}>{value}</p></div>
}
function Field({ label, children }: { label:string; children:React.ReactNode }) { return <label className="block"><span className="mb-1.5 block text-xs font-bold text-muted-foreground">{label}</span>{children}</label> }
function Actions({ onCancel,onSave,saveLabel }: {onCancel:()=>void;onSave:()=>void;saveLabel:string}) { return <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onCancel} className="rounded-lg border border-border px-4 py-2 text-sm font-bold text-muted-foreground">إلغاء</button><button type="button" onClick={onSave} className="rounded-lg border border-primary/50 bg-primary/15 px-4 py-2 text-sm font-bold text-primary"><SaveIcon /> {saveLabel}</button></div> }
function SaveIcon(){return <span className="mr-1 inline-block">✓</span>}
function Modal({ title, children, onClose }: {title:string;children:React.ReactNode;onClose:()=>void}) { return <div className="fixed inset-0 z-[170] flex items-center justify-center bg-black/70 p-3" onClick={onClose}><div className="w-full max-w-2xl" onClick={e=>e.stopPropagation()}><NeonCard glow className="max-h-[90vh] overflow-y-auto p-5"><div className="mb-4 flex items-center justify-between"><h4 className="font-heading text-lg font-extrabold">{title}</h4><button type="button" onClick={onClose} className="rounded border border-border p-2"><X className="size-4" /></button></div>{children}</NeonCard></div></div> }
