'use client'

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Move, Pencil, Undo2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type OverrideValue = { text?: string; x?: number; y?: number }
type OverrideRow = { element_key: string; value: OverrideValue }
type HistoryEntry = {
  el: HTMLElement
  scope: string
  key: string
  before: OverrideValue
  beforeText: string
  beforeStyle: { transform: string; position: string; zIndex: string }
}

const TEXT_TAGS = new Set(['H1','H2','H3','H4','H5','H6','P','SPAN','LI','TH','TD','LABEL','STRONG','SMALL','B','EM','BUTTON','A','DIV'])

function elementPath(element: HTMLElement, root: HTMLElement) {
  const parts: string[] = []
  let node: HTMLElement | null = element
  while (node && node !== root) {
    const parent: HTMLElement | null = node.parentElement
    if (!parent) break
    const same = Array.from(parent.children).filter((child) => child.tagName === node!.tagName)
    const index = same.indexOf(node) + 1
    parts.unshift(node.tagName.toLowerCase() + ':' + index)
    node = parent
  }
  return parts.join('/')
}

function hasOwnReadableText(el: HTMLElement) {
  if (!TEXT_TAGS.has(el.tagName)) return false
  if (el.closest('[data-live-editor-ui="true"]')) return false
  if (el.matches('input,textarea,select,option,[contenteditable="true"]')) return false
  const direct = Array.from(el.childNodes).some((node) => node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim())
  if (direct) return true
  return el.children.length === 0 && Boolean(el.textContent?.trim())
}

function closestTextElement(target: EventTarget | null, root: HTMLElement) {
  let el = target instanceof HTMLElement ? target : null
  while (el && el !== root) {
    if (hasOwnReadableText(el)) return el
    el = el.parentElement
  }
  return null
}

function closestMovable(target: EventTarget | null, root: HTMLElement) {
  let el = target instanceof HTMLElement ? target : null
  while (el && el !== root) {
    if (el.closest('[data-live-editor-ui="true"]')) return null
    if (el.matches('section,article,[class*="rounded"],[class*="grid"],[class*="flex"],h1,h2,h3,h4,p,table')) return el
    el = el.parentElement
  }
  return null
}

export function LiveSiteEditor({ token, scope }: { token: string; scope: string }) {
  const [enabled, setEnabled] = useState(false)
  const [moving, setMoving] = useState(false)
  const [message, setMessage] = useState('')
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const overrides = useRef(new Map<string, OverrideValue>())
  const rootRef = useRef<HTMLElement | null>(null)

  async function load() {
    try {
      const [pageRes, globalRes] = await Promise.all([
        fetch('/api/site-overrides?scope=' + encodeURIComponent(scope), { cache: 'no-store' }),
        fetch('/api/site-overrides?scope=' + encodeURIComponent('__global__'), { cache: 'no-store' }),
      ])
      const pageRows = pageRes.ok ? await pageRes.json() as OverrideRow[] : []
      const globalRows = globalRes.ok ? await globalRes.json() as OverrideRow[] : []
      overrides.current = new Map([
        ...pageRows.map((row) => [scope + '::' + row.element_key, row.value ?? {}] as const),
        ...globalRows.map((row) => ['__global__::' + row.element_key, row.value ?? {}] as const),
      ])
      applyAll()
    } catch {}
  }

  function targetScope(el: HTMLElement) {
    return el.closest('main') ? scope : '__global__'
  }

  function keyFor(el: HTMLElement) {
    const root = rootRef.current
    if (!root) return ''
    return elementPath(el, root)
  }

  function mapKey(el: HTMLElement) {
    return targetScope(el) + '::' + keyFor(el)
  }

  function applyOne(el: HTMLElement) {
    const key = keyFor(el)
    if (!key) return
    const value = overrides.current.get(mapKey(el))
    if (!value) return
    if (typeof value.text === 'string' && hasOwnReadableText(el) && el.getAttribute('data-live-editing') !== 'true') {
      const directText = Array.from(el.childNodes).find((node) => node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim())
      if (directText) directText.textContent = value.text
      else if (el.children.length === 0) el.textContent = value.text
    }
    if (typeof value.x === 'number' || typeof value.y === 'number') {
      el.style.position = 'relative'
      el.style.transform = `translate(${value.x ?? 0}px, ${value.y ?? 0}px)`
      el.style.zIndex = '2'
    }
  }

  function applyAll() {
    const root = rootRef.current
    if (!root) return
    root.querySelectorAll<HTMLElement>('*').forEach(applyOne)
  }

  async function saveValue(el: HTMLElement, patch: OverrideValue, snapshot?: { before: OverrideValue; beforeText: string; beforeStyle: { transform: string; position: string; zIndex: string } }) {
    const key = keyFor(el)
    if (!key) return
    const resolvedScope = targetScope(el)
    const composite = resolvedScope + '::' + key
    const before = snapshot?.before ?? { ...(overrides.current.get(composite) ?? {}) }
    setHistory((prev) => [...prev.slice(-19), {
      el,
      scope: resolvedScope,
      key,
      before,
      beforeText: snapshot?.beforeText ?? (el.textContent ?? ''),
      beforeStyle: snapshot?.beforeStyle ?? {
        transform: el.style.transform,
        position: el.style.position,
        zIndex: el.style.zIndex,
      },
    }])

    const next = { ...before, ...patch }
    overrides.current.set(composite, next)
    await fetch('/api/site-overrides', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, scope: resolvedScope, elementKey: key, value: next }),
    }).catch(() => {})
  }

  async function undoLast() {
    const last = history[history.length - 1]
    if (!last) return
    setHistory((prev) => prev.slice(0, -1))
    const composite = last.scope + '::' + last.key

    if (Object.keys(last.before).length === 0) {
      overrides.current.delete(composite)
      await fetch('/api/site-overrides', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, scope: last.scope, elementKey: last.key }),
      }).catch(() => {})
    } else {
      overrides.current.set(composite, last.before)
      await fetch('/api/site-overrides', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, scope: last.scope, elementKey: last.key, value: last.before }),
      }).catch(() => {})
    }

    if (last.el.isConnected) {
      if (typeof last.before.text === 'string') {
        const directText = Array.from(last.el.childNodes).find((node) => node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim())
        if (directText) directText.textContent = last.before.text
        else if (last.el.children.length === 0) last.el.textContent = last.before.text
      } else if (last.beforeText) {
        const directText = Array.from(last.el.childNodes).find((node) => node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim())
        if (directText) directText.textContent = last.beforeText
        else if (last.el.children.length === 0) last.el.textContent = last.beforeText
      }

      if (typeof last.before.x === 'number' || typeof last.before.y === 'number') {
        last.el.style.position = 'relative'
        last.el.style.transform = `translate(${last.before.x ?? 0}px, ${last.before.y ?? 0}px)`
        last.el.style.zIndex = '2'
      } else {
        last.el.style.transform = last.beforeStyle.transform
        last.el.style.position = last.beforeStyle.position
        last.el.style.zIndex = last.beforeStyle.zIndex
      }
    }

    setMessage('تم التراجع عن آخر تعديل ✓')
    window.setTimeout(() => setMessage(''), 1400)
  }

  useEffect(() => {
    rootRef.current = document.querySelector<HTMLElement>('[data-live-root="true"]')
    void load()
    const root = rootRef.current
    if (!root) return
    const observer = new MutationObserver(() => applyAll())
    observer.observe(root, { subtree: true, childList: true })
    return () => observer.disconnect()
  }, [scope])

  useEffect(() => {
    if (!enabled) return
    const root = rootRef.current
    if (!root) return

    const onDblClick = (event: MouseEvent) => {
      const el = closestTextElement(event.target, root)
      if (!el) return
      event.preventDefault()
      event.stopPropagation()
      const original = el.textContent ?? ''
      const editSnapshot = {
        before: { ...(overrides.current.get(mapKey(el)) ?? {}) },
        beforeText: original,
        beforeStyle: { transform: el.style.transform, position: el.style.position, zIndex: el.style.zIndex },
      }
      el.setAttribute('data-live-editing', 'true')
      el.contentEditable = 'true'
      el.spellcheck = false
      el.focus()
      const range = document.createRange()
      range.selectNodeContents(el)
      const selection = window.getSelection()
      selection?.removeAllRanges()
      selection?.addRange(range)

      const finish = () => {
        el.removeEventListener('blur', finish)
        el.contentEditable = 'false'
        el.removeAttribute('data-live-editing')
        const next = (el.textContent ?? '').trim()
        if (next !== original.trim()) {
          void saveValue(el, { text: next }, editSnapshot)
          setMessage('تم حفظ النص مباشرة ✓')
          window.setTimeout(() => setMessage(''), 1200)
        }
      }
      el.addEventListener('blur', finish)
    }

    const onPointerDown = (event: PointerEvent) => {
      if (!event.shiftKey && !moving) return
      if (event.button !== 0) return
      const el = closestMovable(event.target, root)
      if (!el) return
      event.preventDefault()
      event.stopPropagation()
      const current = overrides.current.get(mapKey(el)) ?? {}
      const dragSnapshot = {
        before: { ...current },
        beforeText: el.textContent ?? '',
        beforeStyle: { transform: el.style.transform, position: el.style.position, zIndex: el.style.zIndex },
      }
      const startX = event.clientX
      const startY = event.clientY
      const baseX = current.x ?? 0
      const baseY = current.y ?? 0
      document.body.style.userSelect = 'none'
      document.body.style.cursor = 'grabbing'

      const move = (ev: PointerEvent) => {
        const x = baseX + ev.clientX - startX
        const y = baseY + ev.clientY - startY
        el.style.position = 'relative'
        el.style.transform = `translate(${x}px, ${y}px)`
        el.style.zIndex = '2'
      }
      const up = (ev: PointerEvent) => {
        window.removeEventListener('pointermove', move)
        window.removeEventListener('pointerup', up)
        document.body.style.userSelect = ''
        document.body.style.cursor = ''
        const x = baseX + ev.clientX - startX
        const y = baseY + ev.clientY - startY
        void saveValue(el, { x, y }, dragSnapshot)
        setMessage('تم تثبيت مكان العنصر ✓')
        window.setTimeout(() => setMessage(''), 1200)
      }
      window.addEventListener('pointermove', move)
      window.addEventListener('pointerup', up)
    }

    root.addEventListener('dblclick', onDblClick, true)
    root.addEventListener('pointerdown', onPointerDown, true)
    return () => {
      root.removeEventListener('dblclick', onDblClick, true)
      root.removeEventListener('pointerdown', onPointerDown, true)
    }
  }, [enabled, moving, scope])

  return (
    <div data-live-editor-ui="true" className="fixed bottom-4 left-4 z-[220] flex flex-col items-start gap-2">
      {message ? <div className="rounded-lg border border-primary/40 bg-background/95 px-3 py-2 text-xs font-bold text-primary shadow-xl">{message}</div> : null}
      <div className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-background/95 p-2 shadow-2xl backdrop-blur">
        <button type="button" onClick={() => setEnabled((value) => !value)} className={cn('inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold', enabled ? 'bg-primary/20 text-primary' : 'bg-muted/50 text-muted-foreground')}>
          {enabled ? <X className="size-3.5" /> : <Pencil className="size-3.5" />}
          {enabled ? 'إنهاء التحرير المباشر' : 'تحرير مباشر لكل النصوص'}
        </button>
        {enabled ? (
          <>
            <button type="button" onClick={() => setMoving((value) => !value)} className={cn('inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold', moving ? 'bg-primary/20 text-primary' : 'bg-muted/50 text-muted-foreground')}>
              <Move className="size-3.5" /> {moving ? 'السحب مفعّل' : 'سحب العناصر'}
            </button>
            <button type="button" onClick={() => void undoLast()} disabled={!history.length} className="inline-flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-2 text-xs font-bold text-muted-foreground hover:text-primary disabled:opacity-35">
              <Undo2 className="size-3.5" /> تراجع
            </button>
          </>
        ) : null}
      </div>
      {enabled ? <div className="max-w-sm rounded-lg border border-border bg-background/90 px-3 py-2 text-[10px] leading-5 text-muted-foreground">اضغط مرتين على أي نص أو عنوان لتعديله في مكانه. للسحب: فعّل «سحب العناصر» أو اضغط Shift واسحب العنصر. وإذا تحرك شيء بالغلط استخدم «تراجع» لإرجاع آخر تعديل.</div> : null}
    </div>
  )
}
