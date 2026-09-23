import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getServerSupabase } from '@/lib/supabase-server'
import { hasPermission } from '@/lib/permissions'
import { writeAuditLog } from '@/lib/audit'

async function requireEditor(token: string | null) {
  const session = await getSession(token)
  return hasPermission(session, 'pages.manage') ? session : null
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const scope = String(searchParams.get('scope') ?? '').trim()
  if (!scope) return NextResponse.json([])
  const { data, error } = await getServerSupabase()
    .from('pd_site_overrides')
    .select('element_key,value,updated_at')
    .eq('scope', scope)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const session = await requireEditor(body.token ?? null)
    if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    const scope = String(body.scope ?? '').trim()
    const elementKey = String(body.elementKey ?? '').trim()
    const value = body.value && typeof body.value === 'object' ? body.value : {}
    if (!scope || !elementKey) return NextResponse.json({ error: 'بيانات التعديل ناقصة' }, { status: 400 })

    const { data, error } = await getServerSupabase()
      .from('pd_site_overrides')
      .upsert({
        scope,
        element_key: elementKey,
        value,
        updated_by: session.username,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'scope,element_key' })
      .select('element_key,value,updated_at')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    await writeAuditLog(session, 'site_live_edit', 'site_element', elementKey, { scope })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'تعذر حفظ التعديل' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    const session = await requireEditor(body.token ?? null)
    if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    const scope = String(body.scope ?? '').trim()
    const elementKey = String(body.elementKey ?? '').trim()
    if (!scope || !elementKey) return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 })
    const { error } = await getServerSupabase().from('pd_site_overrides').delete().eq('scope', scope).eq('element_key', elementKey)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'تعذر حذف التعديل' }, { status: 500 })
  }
}
