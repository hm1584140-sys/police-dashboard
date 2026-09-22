import { NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase-server'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
    const secret = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

    const { data, error } = await getServerSupabase()
      .from('pd_accounts')
      .select('username,password,role,is_banned')
      .eq('username', 'owner')
      .maybeSingle()

    if (error) {
      return NextResponse.json({
        ok: false,
        dbConnected: false,
        errorCode: error.code ?? 'unknown',
        secretKind: secret.startsWith('sb_secret_') ? 'supabase_secret' : secret.startsWith('eyJ') ? 'legacy_service_role' : secret ? 'unexpected' : 'missing',
        supabaseHost: url ? new URL(url).host : 'missing',
      }, { status: 500 })
    }

    const scheme = data?.password?.startsWith('scrypt$')
      ? 'scrypt'
      : data?.password?.startsWith('$2')
        ? 'bcrypt'
        : data?.password
          ? 'legacy_plaintext'
          : 'missing'

    return NextResponse.json({
      ok: true,
      dbConnected: true,
      ownerExists: Boolean(data),
      ownerRole: data?.role ?? null,
      ownerBanned: Boolean(data?.is_banned),
      passwordScheme: scheme,
      secretKind: secret.startsWith('sb_secret_') ? 'supabase_secret' : secret.startsWith('eyJ') ? 'legacy_service_role' : secret ? 'unexpected' : 'missing',
      supabaseHost: url ? new URL(url).host : 'missing',
    })
  } catch (error) {
    return NextResponse.json({
      ok: false,
      dbConnected: false,
      fatal: error instanceof Error ? error.message : 'unknown',
    }, { status: 500 })
  }
}
