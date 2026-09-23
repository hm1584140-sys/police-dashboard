'use client'

import { FormEvent, useEffect, useState } from 'react'

export default function OwnerResetPage() {
  const [token, setToken] = useState('')
  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get('token') ?? '')
  }, [])
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setMessage('')
    if (password !== confirm) {
      setMessage('كلمتا المرور غير متطابقتين')
      return
    }
    setBusy(true)
    try {
      const res = await fetch('/api/auth/owner-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      setMessage(res.ok ? 'تم تغيير كلمة المرور بنجاح. ارجع للموقع وسجل الدخول.' : (data.error ?? 'حدث خطأ'))
    } catch {
      setMessage('حدث خطأ')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#050b14', color: 'white', padding: 24, direction: 'rtl' }}>
      <form onSubmit={submit} style={{ width: '100%', maxWidth: 420, display: 'grid', gap: 14, border: '1px solid #0ea5e9', borderRadius: 16, padding: 24, background: '#0b1526' }}>
        <h1 style={{ margin: 0 }}>إعادة تعيين كلمة مرور المالك</h1>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="كلمة المرور الجديدة" minLength={8} required style={{ padding: 12, borderRadius: 8 }} />
        <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="تأكيد كلمة المرور" minLength={8} required style={{ padding: 12, borderRadius: 8 }} />
        <button disabled={busy || !token} style={{ padding: 12, borderRadius: 8, cursor: 'pointer' }}>{busy ? 'جاري الحفظ...' : 'حفظ كلمة المرور'}</button>
        {message && <p style={{ margin: 0 }}>{message}</p>}
      </form>
    </main>
  )
}
