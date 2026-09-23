import { NextResponse } from 'next/server'
import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { getServerSupabase } from '@/lib/supabase-server'

export const runtime = 'nodejs'

const TOKEN_HASH = '8136e8d899dca1a549a03c3690a6c7668338c0b3a0a710097136fb029b8b4c19'
const CURRENT_OWNER_HASH = 'scrypt$bb6e97e366e809e2d26128255ff2accb$8ffa104827aab6e0dba8fc3cba9c34285696181911ea51fe474458f55f491fd5a6cffeb9f67f0b81aef005a78f95ad5da09247575a30ba7af42fb68b09c2eaae'

function derivePassword(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) reject(error)
      else resolve(derivedKey)
    })
  })
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const derived = await derivePassword(password, salt)
  return 'scrypt$' + salt + '$' + derived.toString('hex')
}

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()
    const received = createHash('sha256').update(String(token ?? '')).digest()
    const expected = Buffer.from(TOKEN_HASH, 'hex')
    if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
      return NextResponse.json({ error: 'الرابط غير صالح' }, { status: 403 })
    }

    const cleanPassword = String(password ?? '')
    if (cleanPassword.length < 8) {
      return NextResponse.json({ error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' }, { status: 400 })
    }

    const db = getServerSupabase()
    const newHash = await hashPassword(cleanPassword)
    const { data, error } = await db
      .from('pd_accounts')
      .update({ password: newHash, updated_at: new Date().toISOString() })
      .eq('username', 'owner')
      .eq('password', CURRENT_OWNER_HASH)
      .select('username')
      .maybeSingle()

    if (error) return NextResponse.json({ error: 'تعذر تحديث كلمة المرور' }, { status: 500 })
    if (!data) return NextResponse.json({ error: 'تم استخدام رابط الاستعادة مسبقًا أو تغيّرت كلمة المرور' }, { status: 410 })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
