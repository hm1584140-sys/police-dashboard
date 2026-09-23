import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getServerSupabase } from '@/lib/supabase-server'
import { SECTOR_THEME_PRESETS, getBuiltinSectors } from '@/lib/sector-types'
import { writeAuditLog } from '@/lib/audit'
import { hasPermission } from '@/lib/permissions'

const json = (body: unknown, status = 200) =>
  NextResponse.json(body, { status })

const SECTOR_COLUMNS = 'id,name,arabic_name,description,tagline,theme,ranks,is_visible,is_template,created_at'

async function requireAccess(token: string | null) {
  if (!token) return null
  const session = await getSession(token)
  return session?.role === 'owner' ? session : null
}

function slugify(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9\u0600-\u06FF]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40)
}

function normaliseTheme(theme: unknown, themeKey?: string) {
  if (themeKey && SECTOR_THEME_PRESETS[themeKey]) {
    return { vars: SECTOR_THEME_PRESETS[themeKey].vars, tagline: SECTOR_THEME_PRESETS[themeKey].tagline }
  }
  if (theme && typeof theme === 'object') return theme as Record<string, unknown>
  return { vars: SECTOR_THEME_PRESETS.blue.vars, tagline: SECTOR_THEME_PRESETS.blue.tagline }
}

function dbToSector(row: Record<string, unknown>) {
  const theme = (row.theme as { vars?: Record<string, string> } | null) ?? {}
  return {
    id: String(row.id),
    name: String(row.name ?? row.id),
    arabic: String(row.arabic_name ?? row.name ?? row.id),
    description: String(row.description ?? ''),
    tagline: String(row.tagline ?? ''),
    vars: theme.vars ?? SECTOR_THEME_PRESETS.blue.vars,
    ranks: Array.isArray(row.ranks) ? row.ranks.map(String) : [],
    is_visible: Boolean(row.is_visible),
    is_template: Boolean(row.is_template),
  }
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  const adminMode = request.nextUrl.searchParams.get('mode') === 'admin'

  try {
    const db = getServerSupabase()

    if (adminMode) {
      const owner = await requireAccess(token)
      if (!owner) return json({ error: 'غير مصرح' }, 403)

      const { data, error } = await db
        .from('pd_sectors')
        .select(SECTOR_COLUMNS)
        .order('created_at', { ascending: true })

      if (error) return json({ error: error.message }, 500)
      return json({ sectors: (data ?? []).map((row) => dbToSector(row)) })
    }

    const { data, error } = await db
      .from('pd_sectors')
      .select(SECTOR_COLUMNS)
      .eq('is_visible', true)
      .order('created_at', { ascending: true })

    if (error) {
      return json({ sectors: getBuiltinSectors() })
    }

    return json({ sectors: (data ?? []).map((row) => dbToSector(row)) })
  } catch {
    if (adminMode) return json({ error: 'قاعدة بيانات القطاعات غير مهيأة بعد' }, 500)
    return json({ sectors: getBuiltinSectors() })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const owner = await requireAccess(body.token ?? null)
    if (!owner) return json({ error: 'هذه العملية للمالك فقط' }, 403)

    const db = getServerSupabase()

    if (body.templateId) {
      const { data: template, error: findError } = await db
        .from('pd_sectors')
        .select(SECTOR_COLUMNS)
        .eq('id', String(body.templateId))
        .eq('is_template', true)
        .single()

      if (findError || !template) return json({ error: 'القطاع الجاهز غير موجود' }, 404)

      const { data, error } = await db
        .from('pd_sectors')
        .update({ is_visible: true, updated_at: new Date().toISOString() })
        .eq('id', template.id)
        .select(SECTOR_COLUMNS)
        .single()

      if (error) return json({ error: error.message }, 500)
      await writeAuditLog(owner, 'sector_update', 'sector', String(template.id), { action: 'show_template' })
      return json({ sector: dbToSector(data) })
    }

    const rawId = String(body.id ?? '').trim()
    const id = slugify(rawId || String(body.name ?? ''))
    const name = String(body.name ?? '').trim()
    const arabicName = String(body.arabicName ?? name).trim()
    const description = String(body.description ?? '').trim()
    const ranks = Array.isArray(body.ranks) ? body.ranks.map((rank: unknown) => String(rank).trim()).filter(Boolean) : []
    const theme = normaliseTheme(body.theme, body.themeKey)
    const tagline = String(body.tagline ?? theme.tagline ?? '').trim()

    if (!id || !name) return json({ error: 'اسم القطاع ومعرفه مطلوبان' }, 400)
    if (id === 'LSPD' || id === 'BCSO' || id === 'SASP') {
      return json({ error: 'هذا المعرف محجوز لقطاع أساسي' }, 409)
    }

    const { data, error } = await db
      .from('pd_sectors')
      .insert({
        id,
        name,
        arabic_name: arabicName,
        description,
        tagline,
        theme,
        ranks,
        is_visible: true,
        is_template: false,
      })
      .select(SECTOR_COLUMNS)
      .single()

    if (error) return json({ error: error.message }, 500)
    await writeAuditLog(owner, 'sector_create', 'sector', String(data.id), { name: data.name })
    return json({ sector: dbToSector(data) }, 201)
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'تعذر إنشاء القطاع' }, 500)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const owner = await requireAccess(body.token ?? null)
    if (!owner) return json({ error: 'هذه العملية للمالك فقط' }, 403)
    if (!body.id) return json({ error: 'معرف القطاع مطلوب' }, 400)

    const db = getServerSupabase()
    const originalId = String(body.id).trim()
    const requestedId = body.newId !== undefined ? slugify(String(body.newId)) : originalId
    const protectedIds = ['LSPD', 'BCSO', 'SASP']

    const { data: currentSector, error: currentError } = await db
      .from('pd_sectors')
      .select('id,is_template')
      .eq('id', originalId)
      .maybeSingle()

    if (currentError || !currentSector) return json({ error: 'القطاع غير موجود' }, 404)

    if (requestedId !== originalId) {
      if (!requestedId) return json({ error: 'معرف القطاع الجديد غير صالح' }, 400)
      if (protectedIds.includes(originalId) || currentSector.is_template) {
        return json({ error: 'لا يمكن تغيير معرف قطاع أساسي أو قالب جاهز' }, 400)
      }
      if (protectedIds.includes(requestedId)) {
        return json({ error: 'هذا المعرف محجوز لقطاع أساسي' }, 409)
      }
      const { data: duplicate } = await db
        .from('pd_sectors')
        .select('id')
        .eq('id', requestedId)
        .maybeSingle()
      if (duplicate) return json({ error: 'معرف القطاع مستخدم بالفعل' }, 409)
    }

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (requestedId !== originalId) patch.id = requestedId

    if (body.name !== undefined) patch.name = String(body.name).trim()
    if (body.arabicName !== undefined) patch.arabic_name = String(body.arabicName).trim()
    if (body.description !== undefined) patch.description = String(body.description).trim()
    if (body.ranks !== undefined) patch.ranks = Array.isArray(body.ranks) ? body.ranks.map((rank: unknown) => String(rank).trim()).filter(Boolean) : []
    if (body.isVisible !== undefined) patch.is_visible = Boolean(body.isVisible)

    if (body.themeKey || body.theme) {
      const theme = normaliseTheme(body.theme, body.themeKey)
      patch.theme = theme
      if (body.tagline === undefined && 'tagline' in theme) patch.tagline = String((theme as { tagline?: string }).tagline ?? '')
    }

    if (body.tagline !== undefined) patch.tagline = String(body.tagline).trim()

    const { data, error } = await db
      .from('pd_sectors')
      .update(patch)
      .eq('id', originalId)
      .select(SECTOR_COLUMNS)
      .single()

    if (error) return json({ error: error.message }, 500)

    if (requestedId !== originalId) {
      await Promise.all([
        db.from('officers').update({ sector: requestedId }).eq('sector', originalId),
        db.from('pd_roster_columns').update({ sector_id: requestedId }).eq('sector_id', originalId),
        db.from('pd_pages').update({ sector_id: requestedId }).eq('sector_id', originalId),
      ])
    }

    await writeAuditLog(owner, 'sector_update', 'sector', requestedId, { originalId, changedId: requestedId !== originalId })
    return json({ sector: dbToSector(data) })
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'تعذر تعديل القطاع' }, 500)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const owner = await requireAccess(body.token ?? null)
    if (!owner) return json({ error: 'هذه العملية للمالك فقط' }, 403)
    if (!body.id) return json({ error: 'معرف القطاع مطلوب' }, 400)
    if (['LSPD', 'BCSO', 'SASP'].includes(String(body.id))) {
      return json({ error: 'القطاعات الأساسية لا تُحذف، يمكنك إخفاؤها فقط' }, 400)
    }

    const db = getServerSupabase()
    const { error } = await db
      .from('pd_sectors')
      .delete()
      .eq('id', String(body.id))

    if (error) return json({ error: error.message }, 500)
    await writeAuditLog(owner, 'sector_delete', 'sector', String(body.id))
    return json({ ok: true })
  } catch {
    return json({ error: 'تعذر حذف القطاع' }, 500)
  }
}
