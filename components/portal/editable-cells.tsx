'use client'

import { cn } from '@/lib/utils'
import { useAdmin, type Section } from '@/lib/admin-context'

const baseField =
  'w-full rounded-md border border-border bg-background/60 px-2.5 py-1.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:bg-background focus:ring-1 focus:ring-ring'

const lockedField = 'cursor-default opacity-70 focus:border-border focus:bg-background/60 focus:ring-0'

export function TextCell({
  value,
  onChange,
  placeholder,
  type = 'text',
  className,
  section,
  alwaysEnabled = false,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: 'text' | 'number'
  className?: string
  section: Section
  /** Bypass permission checks — use for navigation/view controls, never for real data edits. */
  alwaysEnabled?: boolean
}) {
  const { canEdit } = useAdmin()
  const editable = alwaysEnabled || canEdit(section)
  return (
    <input
      type={type}
      inputMode={type === 'number' ? 'numeric' : undefined}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      readOnly={!editable}
      aria-readonly={!editable}
      className={cn(
        baseField,
        type === 'number' && 'text-center font-mono',
        !editable && lockedField,
        className,
      )}
    />
  )
}

export function SelectCell({
  value,
  onChange,
  options,
  placeholder = 'اختر…',
  className,
  section,
  alwaysEnabled = false,
}: {
  value: string
  onChange: (v: string) => void
  options: readonly string[]
  placeholder?: string
  className?: string
  section: Section
  alwaysEnabled?: boolean
}) {
  const { canEdit } = useAdmin()
  const editable = alwaysEnabled || canEdit(section)
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={!editable}
      className={cn(
        baseField,
        'appearance-none',
        editable ? 'cursor-pointer' : lockedField,
        className,
      )}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  )
}

export type SelectGroup = {
  label: string
  options: readonly string[]
}

export function GroupedSelectCell({
  value,
  onChange,
  groups,
  placeholder = 'اختر…',
  className,
  section,
  alwaysEnabled = false,
}: {
  value: string
  onChange: (v: string) => void
  groups: readonly SelectGroup[]
  placeholder?: string
  className?: string
  section: Section
  /** Bypass permission checks — use for navigation/view controls, never for real data edits. */
  alwaysEnabled?: boolean
}) {
  const { canEdit } = useAdmin()
  const editable = alwaysEnabled || canEdit(section)
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={!editable}
      className={cn(
        baseField,
        editable ? 'cursor-pointer appearance-none' : cn('appearance-none', lockedField),
        className,
      )}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {groups.map((group) => (
        <optgroup
          key={group.label}
          label={`▬▬▬  ${group.label}  ▬▬▬`}
          className="bg-secondary font-heading font-bold uppercase tracking-wider text-primary"
        >
          {group.options.map((opt) => (
            <option key={`${group.label}-${opt}`} value={opt} className="font-sans text-foreground">
              {opt}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  )
}
