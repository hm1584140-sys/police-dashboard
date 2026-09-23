import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getServerSupabase } from '@/lib/supabase-server'
import { hasPermission } from '@/lib/permissions'
import { writeAuditLog } from '@/lib/audit'

function cleanSlug(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9\-_؀-ۿ]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 50)
}

async function requireManager(token: string | null) {
  const session = await getSession(token)
  return hasPermission(session, 'roster.manage') ? session : null
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const slug = searchParams.get('slug')
  const db = getServerSupabase()
  let query = db.from('pd_custom_lists').select('id,slug,title,description,sector_id,columns,is_visible,created_by,created_at,updated_at')
  if (id) query = query.eq('id', id)
  if (slug) query = query.eq('slug', slug)
  const { data, error } = id || slug ? await query.maybeSingle() : await query.order('created_at', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? (id || slug ? null : []))
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const session = await requireManager(body.token ?? null)
    if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    const title = String(body.title ?? '').trim()
    const slug = cleanSlug(String(body.slug ?? title))
    const sectorId = body.sectorId ? String(body.sectorId).trim() : null
    const columns = Array.isArray(body.columns)
      ? body.columns.map((col: unknown, index: number) => {
          const item = col as { key?: string; label?: string; kind?: string; options?: string[] }
          const key = cleanSlug(String(item.key ?? item.label ?? 'field-' + index)).replace(/-/g, '_')
          return {
            key: key || 'field_' + index,
            label: String(item.label ?? item.key ?? 'حقل').trim(),
            kind: ['text','number','select'].includes(String(item.kind)) ? String(item.kind) : 'text',
            options: Array.isArray(item.options) ? item.options.map(String) : [],
            width: Math.max(90, Math.min(Number((item as { width?: number }).width) || 170, 600)),
          }
        })
      : []

    if (!title || !slug) return NextResponse.json({ error: 'اسم القائمة مطلوب' }, { status: 400 })
    if (!columns.length) return NextResponse.json({ error: 'أضف عموداً واحداً على الأقل' }, { status: 400 })

    const db = getServerSupabase()
    const { data: list, error } = await db.from('pd_custom_lists').insert({
      slug,
      title,
      description: String(body.description ?? '').trim(),
      sector_id: sectorId,
      columns,
      is_visible: body.isVisible !== false,
      created_by: session.username,
    }).select('id,slug,title,description,sector_id,columns,is_visible,created_by,created_at,updated_at').single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    const { error: pageError } = await db.from('pd_pages').insert({
      slug: 'list-' + slug,
      title,
      description: String(body.description ?? '').trim(),
      icon: 'List',
      page_type: 'table',
      renderer: 'custom-list',
      is_visible: body.isVisible !== false,
      is_system: false,
      sort_order: Number(body.sortOrder ?? 80),
      sector_id: sectorId,
      blocks: [{ type: 'custom-list-config', listId: list.id }],
    })

    if (pageError) {
      await db.from('pd_custom_lists').delete().eq('id', list.id)
      return NextResponse.json({ error: pageError.message }, { status: 400 })
    }

    await writeAuditLog(session, 'custom_list_create', 'custom_list', String(list.id), { title, sectorId })
    return NextResponse.json(list, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'تعذر إنشاء القائمة' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const session = await requireManager(body.token ?? null)
    if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    const id = String(body.id ?? '')
    if (!id) return NextResponse.json({ error: 'المعرف مطلوب' }, { status: 400 })

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (body.title !== undefined) patch.title = String(body.title).trim()
    if (body.description !== undefined) patch.description = String(body.description).trim()
    if (body.sectorId !== undefined) patch.sector_id = body.sectorId ? String(body.sectorId).trim() : null
    if (body.columns !== undefined && Array.isArray(body.columns)) patch.columns = body.columns
    if (body.isVisible !== undefined) patch.is_visible = Boolean(body.isVisible)

    const db = getServerSupabase()
    const { data: list, error } = await db.from('pd_custom_lists').update(patch).eq('id', id).select('id,slug,title,description,sector_id,columns,is_visible,created_by,created_at,updated_at').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    const pagePatch: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (body.title !== undefined) pagePatch.title = String(body.title).trim()
    if (body.description !== undefined) pagePatch.description = String(body.description).trim()
    if (body.sectorId !== undefined) pagePatch.sector_id = body.sectorId ? String(body.sectorId).trim() : null
    if (body.isVisible !== undefined) pagePatch.is_visible = Boolean(body.isVisible)
    await db.from('pd_pages').update(pagePatch).eq('slug', 'list-' + list.slug)

    await writeAuditLog(session, 'custom_list_update', 'custom_list', id, { title: list.title })
    return NextResponse.json(list)
  } catch {
    return NextResponse.json({ error: 'تعذر تعديل القائمة' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    const session = await requireManager(body.token ?? null)
    if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    const id = String(body.id ?? '')
    const db = getServerSupabase()
    const { data: list } = await db.from('pd_custom_lists').select('slug,title').eq('id', id).maybeSingle()
    if (!list) return NextResponse.json({ error: 'القائمة غير موجودة' }, { status: 404 })
    await db.from('pd_pages').delete().eq('slug', 'list-' + list.slug)
    const { error } = await db.from('pd_custom_lists').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    await writeAuditLog(session, 'custom_list_delete', 'custom_list', id, { title: list.title })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'تعذر حذف القائمة' }, { status: 500 })
  }
}
