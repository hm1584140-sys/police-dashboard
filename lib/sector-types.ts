import { sectorRanks, sectorThemes } from '@/lib/police-data'

export type SectorId = string

export type SectorDefinition = {
  id: SectorId
  name: string
  code: string
  arabic: string
  tagline: string
  description: string
  vars: Record<string, string>
  ranks: string[]
  is_visible: boolean
  is_template: boolean
}

export type SectorThemePreset = {
  label: string
  tagline: string
  vars: Record<string, string>
}

const theme = (vars: Record<string, string>, tagline: string, label: string): SectorThemePreset => ({
  label,
  tagline,
  vars,
})

export const SECTOR_THEME_PRESETS: Record<string, SectorThemePreset> = {
  blue: theme({
    '--background': 'oklch(0.15 0.045 264)',
    '--card': 'oklch(0.21 0.05 264)',
    '--popover': 'oklch(0.19 0.05 264)',
    '--primary': 'oklch(0.74 0.16 220)',
    '--primary-foreground': 'oklch(0.14 0.04 264)',
    '--accent': 'oklch(0.34 0.1 262)',
    '--muted': 'oklch(0.25 0.05 264)',
    '--neon': 'oklch(0.8 0.17 218)',
    '--ring': 'oklch(0.74 0.16 220)',
    '--border': 'oklch(0.45 0.1 235 / 45%)',
  }, 'Dark Navy • Cyan Neon', 'أزرق شرطة'),
  gold: theme({
    '--background': 'oklch(0.17 0.018 70)',
    '--card': 'oklch(0.22 0.022 68)',
    '--popover': 'oklch(0.2 0.022 68)',
    '--primary': 'oklch(0.79 0.14 80)',
    '--primary-foreground': 'oklch(0.16 0.02 70)',
    '--accent': 'oklch(0.34 0.05 70)',
    '--muted': 'oklch(0.26 0.025 70)',
    '--neon': 'oklch(0.82 0.15 82)',
    '--ring': 'oklch(0.79 0.14 80)',
    '--border': 'oklch(0.5 0.07 80 / 42%)',
  }, 'Desert Charcoal • Gold Amber', 'ذهبي شريف'),
  royal: theme({
    '--background': 'oklch(0.13 0.008 260)',
    '--card': 'oklch(0.18 0.012 260)',
    '--popover': 'oklch(0.16 0.012 260)',
    '--primary': 'oklch(0.58 0.18 268)',
    '--primary-foreground': 'oklch(0.96 0.01 260)',
    '--accent': 'oklch(0.3 0.04 265)',
    '--muted': 'oklch(0.23 0.012 260)',
    '--neon': 'oklch(0.85 0.025 255)',
    '--ring': 'oklch(0.58 0.18 268)',
    '--border': 'oklch(0.55 0.03 260 / 40%)',
  }, 'Matte Black • Royal Blue', 'أزرق ملكي'),
  red: theme({
    '--background': 'oklch(0.14 0.02 25)',
    '--card': 'oklch(0.2 0.025 25)',
    '--popover': 'oklch(0.17 0.025 25)',
    '--primary': 'oklch(0.68 0.2 28)',
    '--primary-foreground': 'oklch(0.98 0.02 25)',
    '--accent': 'oklch(0.34 0.08 28)',
    '--muted': 'oklch(0.24 0.03 25)',
    '--neon': 'oklch(0.76 0.2 30)',
    '--ring': 'oklch(0.68 0.2 28)',
    '--border': 'oklch(0.48 0.1 28 / 48%)',
  }, 'Tactical Black • Red', 'تكتيكي أحمر'),
  green: theme({
    '--background': 'oklch(0.15 0.025 155)',
    '--card': 'oklch(0.21 0.03 155)',
    '--popover': 'oklch(0.18 0.03 155)',
    '--primary': 'oklch(0.7 0.16 155)',
    '--primary-foreground': 'oklch(0.14 0.03 155)',
    '--accent': 'oklch(0.34 0.08 155)',
    '--muted': 'oklch(0.24 0.03 155)',
    '--neon': 'oklch(0.78 0.17 155)',
    '--ring': 'oklch(0.7 0.16 155)',
    '--border': 'oklch(0.46 0.08 155 / 45%)',
  }, 'Forest Black • Emerald', 'أخضر ميداني'),
  purple: theme({
    '--background': 'oklch(0.15 0.035 300)',
    '--card': 'oklch(0.21 0.04 300)',
    '--popover': 'oklch(0.18 0.04 300)',
    '--primary': 'oklch(0.68 0.18 300)',
    '--primary-foreground': 'oklch(0.98 0.01 300)',
    '--accent': 'oklch(0.34 0.08 300)',
    '--muted': 'oklch(0.25 0.035 300)',
    '--neon': 'oklch(0.78 0.18 300)',
    '--ring': 'oklch(0.68 0.18 300)',
    '--border': 'oklch(0.48 0.1 300 / 45%)',
  }, 'Deep Violet • Neon', 'بنفسجي'),
}

export const SYSTEM_SECTOR_IDS = ['LSPD', 'BCSO', 'SASP'] as const

const SYSTEM_DESCRIPTIONS: Record<string, string> = {
  LSPD: 'قطاع شرطة لوس سانتوس ومسؤوليات المدينة والمناطق الحضرية.',
  BCSO: 'قطاع شريف مقاطعة بلين والمسؤوليات الريفية والضواحي.',
  SASP: 'شرطة ولاية سان أندرياس والطرق السريعة والعمليات على مستوى الولاية.',
}

export function getBuiltinSectors(): SectorDefinition[] {
  return SYSTEM_SECTOR_IDS.map((id) => {
    const t = sectorThemes[id as keyof typeof sectorThemes]
    return {
      id,
      name: t.name,
      code: id,
      arabic: t.arabic,
      tagline: t.tagline,
      description: SYSTEM_DESCRIPTIONS[id] ?? '',
      vars: t.vars,
      ranks: sectorRanks[id as keyof typeof sectorRanks],
      is_visible: true,
      is_template: false,
    }
  })
}
