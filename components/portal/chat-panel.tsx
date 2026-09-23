'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Ban, Clock3, Lock, MessageCircle, Send, Trash2, Unlock, Volume2, VolumeX, X } from 'lucide-react'
import { NeonCard, Pill } from './primitives'

type ChatMessage = {
  id: string
  username: string
  discord_name: string
  body: string
  created_at: string
}

type ChatPayload = {
  open: boolean
  messages: ChatMessage[]
  restriction: { muted: boolean; timeout_until: string | null; reason: string }
  canManage: boolean
  canModerate: boolean
}

export function ChatPanel({ token, currentUsername, onClose }: { token: string; currentUsername: string; onClose: () => void }) {
  const [payload, setPayload] = useState<ChatPayload>({ open: true, messages: [], restriction: { muted: false, timeout_until: null, reason: '' }, canManage: false, canModerate: false })
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [moderate, setModerate] = useState<ChatMessage | null>(null)
  const [timeoutMinutes, setTimeoutMinutes] = useState(10)
  const [reason, setReason] = useState('')
  const endRef = useRef<HTMLDivElement | null>(null)

  async function load(quiet = false) {
    try {
      const res = await fetch('/api/chat?token=' + encodeURIComponent(token), { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) {
        if (!quiet) setError(data.error ?? 'تعذر تحميل الشات')
        return
      }
      setPayload(data)
      if (!quiet) setError('')
    } catch {
      if (!quiet) setError('تعذر تحميل الشات')
    }
  }

  useEffect(() => {
    void load()
    const interval = window.setInterval(() => void load(true), 3500)
    return () => window.clearInterval(interval)
  }, [token])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [payload.messages.length])

  const timedOut = useMemo(() => {
    if (!payload.restriction.timeout_until) return false
    return new Date(payload.restriction.timeout_until).getTime() > Date.now()
  }, [payload.restriction.timeout_until])

  async function send() {
    const body = text.trim()
    if (!body || sending) return
    setSending(true)
    setError('')
    const optimistic: ChatMessage = {
      id: 'temp-' + crypto.randomUUID(),
      username: currentUsername,
      discord_name: '',
      body,
      created_at: new Date().toISOString(),
    }
    setPayload((prev) => ({ ...prev, messages: [...prev.messages, optimistic] }))
    setText('')
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, body }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPayload((prev) => ({ ...prev, messages: prev.messages.filter((item) => item.id !== optimistic.id) }))
        setError(data.error ?? 'تعذر إرسال الرسالة')
      } else {
        setPayload((prev) => ({ ...prev, messages: prev.messages.map((item) => item.id === optimistic.id ? data : item) }))
      }
    } finally {
      setSending(false)
    }
  }

  async function setOpen(open: boolean) {
    const res = await fetch('/api/chat', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, action: 'set_open', open }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return setError(data.error ?? 'تعذر تغيير حالة الشات')
    setPayload((prev) => ({ ...prev, open }))
  }

  async function moderateUser(action: 'mute' | 'unmute' | 'timeout' | 'clear_timeout') {
    if (!moderate) return
    const res = await fetch('/api/chat', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, action, username: moderate.username, minutes: timeoutMinutes, reason }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return setError(data.error ?? 'تعذر تنفيذ الإجراء')
    setModerate(null)
    setReason('')
    setError('تم تنفيذ الإجراء ✓')
    window.setTimeout(() => setError(''), 1800)
  }

  async function deleteMessage(id: string) {
    const res = await fetch('/api/chat', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, id }),
    })
    if (!res.ok) return setError('تعذر حذف الرسالة')
    setPayload((prev) => ({ ...prev, messages: prev.messages.filter((item) => item.id !== id) }))
  }

  const blocked = payload.restriction.muted || timedOut || (!payload.open && !payload.canManage)

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/75 p-3" onClick={onClose}>
      <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <NeonCard glow className="overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-border bg-background/70 px-4 py-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="size-5 text-primary" />
              <div>
                <h3 className="font-heading text-base font-extrabold">شات المسجلين</h3>
                <p className="text-[11px] text-muted-foreground">متاح فقط للحسابات المسجلة دخول.</p>
              </div>
              <Pill tone={payload.open ? 'neon' : 'danger'}>{payload.open ? 'مفتوح' : 'مغلق'}</Pill>
            </div>
            <div className="flex items-center gap-2">
              {payload.canManage ? (
                <button type="button" onClick={() => void setOpen(!payload.open)} className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-bold text-muted-foreground hover:text-primary">
                  {payload.open ? <Lock className="size-3.5" /> : <Unlock className="size-3.5" />}
                  {payload.open ? 'إغلاق الشات' : 'فتح الشات'}
                </button>
              ) : null}
              <button type="button" onClick={onClose} className="rounded-md border border-border p-2 text-muted-foreground hover:bg-muted/30"><X className="size-4" /></button>
            </div>
          </div>

          <div className="h-[52vh] overflow-y-auto px-4 py-3">
            <div className="space-y-2">
              {payload.messages.map((item) => (
                <div key={item.id} className="group rounded-xl border border-border/80 bg-background/45 px-3 py-2.5">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="truncate text-xs font-extrabold text-primary">{item.discord_name || item.username}</span>
                      <span className="truncate font-mono text-[10px] text-muted-foreground">@{item.username}</span>
                      <span className="text-[10px] text-muted-foreground">{new Date(item.created_at).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    {payload.canModerate && item.username !== currentUsername ? (
                      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button type="button" onClick={() => { setModerate(item); setReason('') }} title="إدارة المستخدم" className="rounded border border-border p-1 text-muted-foreground hover:text-primary"><Ban className="size-3" /></button>
                        <button type="button" onClick={() => void deleteMessage(item.id)} title="حذف الرسالة" className="rounded border border-border p-1 text-muted-foreground hover:text-destructive"><Trash2 className="size-3" /></button>
                      </div>
                    ) : null}
                  </div>
                  <p className="whitespace-pre-wrap break-words text-sm leading-6 text-foreground">{item.body}</p>
                </div>
              ))}
              {!payload.messages.length ? <p className="py-16 text-center text-sm text-muted-foreground">ما فيه رسائل للحين.</p> : null}
              <div ref={endRef} />
            </div>
          </div>

          <div className="border-t border-border bg-background/75 p-3">
            {error ? <div className="mb-2 rounded-lg border border-primary/25 bg-primary/10 px-3 py-2 text-xs text-primary">{error}</div> : null}
            {blocked ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {payload.restriction.muted
                  ? (payload.restriction.reason || 'تم منعك من الكتابة في الشات.')
                  : timedOut
                    ? 'عندك تايم أوت حتى ' + new Date(payload.restriction.timeout_until!).toLocaleString('ar')
                    : 'الشات مغلق حالياً.'}
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send() } }}
                  maxLength={800}
                  placeholder="اكتب رسالتك..."
                  className="input-base flex-1"
                />
                <button type="button" onClick={() => void send()} disabled={sending || !text.trim()} className="inline-flex size-11 items-center justify-center rounded-lg border border-primary/50 bg-primary/15 text-primary disabled:opacity-40"><Send className="size-4" /></button>
              </div>
            )}
          </div>
        </NeonCard>
      </div>

      {moderate ? (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/70 p-3" onClick={() => setModerate(null)}>
          <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <NeonCard glow className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div><h4 className="font-heading font-extrabold">إدارة @{moderate.username}</h4><p className="text-xs text-muted-foreground">{moderate.discord_name || 'بدون اسم Discord'}</p></div>
                <button type="button" onClick={() => setModerate(null)} className="rounded border border-border p-2"><X className="size-4" /></button>
              </div>
              <label className="block text-xs font-bold text-muted-foreground">سبب الإجراء (اختياري)</label>
              <input value={reason} onChange={(e) => setReason(e.target.value)} className="input-base mt-1.5" placeholder="مثال: سبام" />
              <label className="mt-3 block text-xs font-bold text-muted-foreground">مدة التايم أوت بالدقائق</label>
              <input type="number" min={1} max={10080} value={timeoutMinutes} onChange={(e) => setTimeoutMinutes(Number(e.target.value))} className="input-base mt-1.5" />
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => void moderateUser('timeout')} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-300"><Clock3 className="size-3.5" /> تايم أوت</button>
                <button type="button" onClick={() => void moderateUser('clear_timeout')} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-bold text-muted-foreground"><Unlock className="size-3.5" /> إلغاء التايم أوت</button>
                <button type="button" onClick={() => void moderateUser('mute')} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive"><VolumeX className="size-3.5" /> منع الكتابة</button>
                <button type="button" onClick={() => void moderateUser('unmute')} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-bold text-primary"><Volume2 className="size-3.5" /> السماح بالكتابة</button>
              </div>
            </NeonCard>
          </div>
        </div>
      ) : null}
    </div>
  )
}
