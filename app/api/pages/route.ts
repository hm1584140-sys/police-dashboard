import { NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase-server'
import { getSession } from '@/lib/auth'
import type { PageRenderer } from '@/lib/page-types'

async function requireOwner(token: string | null) {
  const session = await getSession(token)
  return session?.role === 'owner' ? session : null
}

function cleanPage(input: Record<string, unknown>) {
  return {
    title: String(input.title ?? '').trim(),
    description: String(input.description ?? '').trim(),
    icon: String(input.icon ?? 'FileText'),
    page_type: String(input.page_type ?? 'content'),
    renderer: String(input.renderer ?? 'cms') as PageRenderer,
    is_visible: input.is_visible !== false,
    sort_order: Number(input.sort_order ?? 100),
    sector_id: input.sector_id ? String(input.sector_id) : null,
    blocks: Array.isArray(input.blocks) ? input.blocks : [],
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')
  const owner = await requireOwner(token)

  const db = getServerSupabase()
  const query = db.from('pd_pages').select('*').order('sort_order', { ascending: true })

  const { data, error } = owner
    ? await query
    : await query.eq('is_visible', true)

  if (error) return NextResponse.json({ error: 'تعذر تحميل القوائم' }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: Request) {
  try {
    const { token, slug, ...input } = await req.json()
    const owner = await requireOwner(token)
    if (!owner) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    const cleanSlug = String(slug ?? input.title ?? '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\-_\u0600-\u06ff]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50)

    if (!cleanSlug) return NextResponse.json({ error: 'معرّف القائمة مطلوب' }, { status: 400 })

    const db = getServerSupabase()
    const { data, error } = await db.from('pd_pages').insert({
      slug: cleanSlug,
      is_system: false,
      ...cleanPage(input),
    }).select('*').single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { token, id, ...input } = await req.json()
    const owner = await requireOwner(token)
    if (!owner) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    if (!id) return NextResponse.json({ error: 'المعرف مطلوب' }, { status: 400 })

    const { data, error } = await getServerSupabase()
      .from('pd_pages')
      .update({ ...cleanPage(input), updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { token, id } = await req.json()
    const owner = await requireOwner(token)
    if (!owner) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    const db = getServerSupabase()
    const { data: page } = await db.from('pd_pages').select('is_system').eq('id', id).maybeSingle()
    if (!page) return NextResponse.json({ error: 'القائمة غير موجودة' }, { status: 404 })
    if (page.is_system) return NextResponse.json({ error: 'لا يمكن حذف القوائم الأساسية' }, { status: 400 })

    const { error } = await db.from('pd_pages').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
