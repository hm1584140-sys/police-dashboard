import {
  AlertTriangle,
  BookMarked,
  Car,
  FileText,
  Gavel,
  HelpCircle,
  List,
  MessageSquare,
  Radio,
  ScrollText,
  Shield,
  Shirt,
  TrafficCone,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

export type PageRenderer = 'cms' | 'sops' | 'radio' | 'roster' | 'outfits' | 'strikes' | 'violations'

export type ContentBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; title?: string; items: string[] }
  | { type: 'callout'; tone?: 'info' | 'warn' | 'danger'; title: string; text: string }
  | { type: 'table'; title?: string; columns: string[]; rows: string[][] }
  | { type: 'stats'; items: Array<{ value: string; label: string; hint?: string }> }

export type PageDefinition = {
  id: string
  slug: string
  title: string
  description: string
  icon: string
  page_type: string
  renderer: PageRenderer
  is_visible: boolean
  is_system: boolean
  sort_order: number
  sector_id?: string | null
  blocks: ContentBlock[]
}

export const BUILTIN_PAGES: PageDefinition[] = [
  { id: 'builtin-sops', slug: 'sops', title: 'كتيب البروتوكولات', description: 'المرجع المعتمد للبروتوكولات والقواعد الداخلية.', icon: 'BookMarked', page_type: 'handbook', renderer: 'sops', is_visible: true, is_system: true, sort_order: 10, sector_id: null, blocks: [] },
  { id: 'builtin-radio', slug: 'radio', title: 'بروتوكولات اللاسلكي', description: 'جداول الأكواد والاتصالات اللاسلكية.', icon: 'Radio', page_type: 'table', renderer: 'radio', is_visible: true, is_system: true, sort_order: 20, sector_id: null, blocks: [] },
  { id: 'builtin-roster', slug: 'roster', title: 'كشف القوات الرقمي', description: 'الجدول الرئيسي للأفراد والرتب والقطاعات.', icon: 'Users', page_type: 'roster', renderer: 'roster', is_visible: true, is_system: true, sort_order: 30, sector_id: null, blocks: [] },
  { id: 'builtin-outfits', slug: 'outfits', title: 'دليل ملابس الرتب', description: 'دليل الـ Decals والـ Textures لكل رتبة.', icon: 'Shirt', page_type: 'table', renderer: 'outfits', is_visible: true, is_system: true, sort_order: 40, sector_id: null, blocks: [] },
  { id: 'builtin-strikes', slug: 'strikes', title: 'كتيب الجزاءات', description: 'نظام الجزاءات والمخالفات العسكرية.', icon: 'Gavel', page_type: 'table', renderer: 'strikes', is_visible: true, is_system: true, sort_order: 50, sector_id: null, blocks: [] },
  { id: 'builtin-violations', slug: 'violations', title: 'المخالفات المرورية', description: 'دليل درجات التهم والمخالفات والعقوبات.', icon: 'TrafficCone', page_type: 'table', renderer: 'violations', is_visible: true, is_system: true, sort_order: 60, sector_id: null, blocks: [] },
]

export const PAGE_ICON_OPTIONS: Array<{ name: string; label: string; icon: LucideIcon }> = [
  { name: 'BookMarked', label: 'كتاب', icon: BookMarked },
  { name: 'Radio', label: 'لاسلكي', icon: Radio },
  { name: 'Users', label: 'أفراد', icon: Users },
  { name: 'Shirt', label: 'ملابس', icon: Shirt },
  { name: 'Gavel', label: 'جزاءات', icon: Gavel },
  { name: 'TrafficCone', label: 'مرور', icon: TrafficCone },
  { name: 'Shield', label: 'درع', icon: Shield },
  { name: 'ScrollText', label: 'مستند', icon: ScrollText },
  { name: 'Car', label: 'مركبات', icon: Car },
  { name: 'MessageSquare', label: 'رسائل', icon: MessageSquare },
  { name: 'List', label: 'قائمة', icon: List },
  { name: 'Wrench', label: 'إدارة', icon: Wrench },
  { name: 'AlertTriangle', label: 'تنبيه', icon: AlertTriangle },
  { name: 'FileText', label: 'ملف', icon: FileText },
  { name: 'HelpCircle', label: 'مساعدة', icon: HelpCircle },
]

export const PAGE_ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  PAGE_ICON_OPTIONS.map((item) => [item.name, item.icon]),
) as Record<string, LucideIcon>
