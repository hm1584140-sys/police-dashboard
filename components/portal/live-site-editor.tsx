'use client'

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Move, Pencil, Save, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type OverrideValue = { text?: string; x?: number; y?: number }
type OverrideRow = { element_key: string; value: OverrideValue }

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
  const overrides = useRef(new Map<string, OverrideValue>())
  const rootRef = useRef<HTMLElement | null>(null)

  async function load() {
    try {
      const res = await fetch('/api/site-overrides?scope=' + encodeURIComponent(scope), { cache: 'no-store' })
      if (!res.ok) return
      const rows = await res.json() as OverrideRow[]
      overrides.current = new Map(rows.map((row) => [row.element_key, row.value ?? {}]))
      applyAll()
    } catch {}
  }

  function keyFor(el: HTMLElement) {
    const root = rootRef.current
    if (!root) return ''
    return elementPath(el, root)
  }

  function applyOne(el: HTMLElement) {
    const key = keyFor(el)
    if (!key) return
    const value = overrides.current.get(key)
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

  async function saveValue(el: HTMLElement, patch: OverrideValue) {
    const key = keyFor(el)
    if (!key) return
    const next = { ...(overrides.current.get(key) ?? {}), ...patch }
    overrides.current.set(key, next)
    await fetch('/api/site-overrides', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, scope, elementKey: key, value: next }),
    }).catch(() => {})
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
          void saveValue(el, { text: next })
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
      const key = keyFor(el)
      const current = overrides.current.get(key) ?? {}
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
        void saveValue(el, { x, y })
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
          <button type="button" onClick={() => setMoving((value) => !value)} className={cn('inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold', moving ? 'bg-primary/20 text-primary' : 'bg-muted/50 text-muted-foreground')}>
            <Move className="size-3.5" /> {moving ? 'السحب مفعّل' : 'سحب العناصر'}
          </button>
        ) : null}
      </div>
      {enabled ? <div className="max-w-sm rounded-lg border border-border bg-background/90 px-3 py-2 text-[10px] leading-5 text-muted-foreground">اضغط مرتين على أي نص أو عنوان لتعديله في مكانه. للسحب: فعّل «سحب العناصر» أو اضغط Shift واسحب العنصر، ثم يثبت مكانه تلقائياً.</div> : null}
    </div>
  )
}
