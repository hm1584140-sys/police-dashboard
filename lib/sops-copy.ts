import type { ContentBlock } from '@/lib/page-types'

export const DEFAULT_SOPS_COPY: Record<string, string> = {
  hero_title: 'كتيب بروتوكولات وقواعد جهاز الشرطة',
  hero_subtitle: 'المرجعي المعتمد (SOPs)',
  general_1: 'قطاعات ولاية سان اندرياس تنقسم إلى: SASP بدعوة خاصة للخطوط السريعة، LSPD لقسم مشن روو والمدينة، BCSO لتأمين الضواحي والمناطق الريفية.',
  general_2: 'الهدف الأسمى هو حماية النظام والأمن القومي والمواطنين. احترام التسلسل القيادي صارم جداً، وتُمنع التحية العسكرية بالميدان أثناء المداهمات أو المطاردات وتقتصر داخل الأقسام فقط.',
  general_extra: '',
  cuffs_intro: 'تُمنع الكلبشة تماماً أثناء الاستيقاف المروري العادي. الكلبشة مسموحة في 3 حالات فقط:',
  cuffs_items: 'إذا رفع الشخص يده مستسلماً.\nبعد صعقه بالتيزر.\nبعد النطح والسيطرة الجسدية.',
  taser_intro: 'يُستخدم التيزر بعد 30 ثانية هروب مستمر على الأقدام على الأقل، مع إطلاق 3 تحذيرات شفهية بين كل تحذير وآخر 5 ثوانٍ.',
  taser_direct_intro: 'أو يُستخدم مباشرة دون تحذير في الحالات التالية:',
  taser_items: 'النطح والعرقلة.\nالتدخل الخارجي لتهريب الشخص.\nإشهار سلاح أبيض.\nاقتراب المجرم من البحار أو المسطحات المائية.',
  cuffs_extra: '',
  fire_intro: 'يتم تحذير الشخص شفهياً أولاً، ثم اتباع التسلسل التالي:',
  fire_items: 'إطلاق طلقات تحذيرية على الأطراف بعد 5 ثوانٍ بحد أقصى 3 طلقات دون احتساب الطلقات الضائعة.\nإذا استمر بإشهار السلاح أو التهديد، يتم التنبيه وإطلاق النار بشكل متقطع بمعدل طلقة واحدة كل ثانية.',
  fire_extra: '',
  arrest_intro: 'يجب على العسكري ذكر أعلى تهمة للمجرم، ثم قراءة الحقوق نصاً وحرفاً:',
  miranda: 'تم إلقاء القبض عليك من شرطة لوس سانتوس بتهمة (...) يحق لك التزام الصمت، أي شيء تقوله سيتم استخدامه ضدك في المحكمة، ويحق لك تعيين محامي وفي حال عدم قدرتك سيتم تعيين محامي من قبل الشرطة.',
  post_arrest: 'يُنقل للمركز للتفتيش الكامل وتجريده من الممنوعات والتصوير والتبصيم، وفك الكلبشة من فتحة باب الزنزانة.',
  arrest_extra: '',
  dispatch: 'يتم تحديث الدسباتش بالصوت واللاسلكي (النوع، الشارع، المعلم، الاتجاه) كل 10 ثوانٍ بالبداية ثم كل 30 ثانية من الدورية الثانية.',
  pit_intro: 'صدم المركبات وعرقلتها مسموح في 3 حالات فقط:',
  pit_items: 'اصطدام متكرر ومتعمد من المجرم بالممتلكات.\nتدخل أطراف خارجية للتهريب.\nمرور 5 دقائق على المطاردة تقديرياً.',
  pit_conditions: 'إذن من المسؤول.\nالسرعة لا تتجاوز 150km/h.\nخلو الشارع تماماً من المدنيين.\nوجود وحدة دعم مرافقة للتأمين.',
  pursuit_extra: '',
  vehicle_intro: 'يتم إطلاق النار على المركبة فوراً ودون تردد في الحالات المصرح بها.',
  vehicle_cases: 'إطلاق النار من المركبة نحو رجال الأمن|يتم الرد فوراً ودون تردد.\nمحاولة دهس الشرطي|يستهدف العسكري الإطارات أولاً.\nدهس الشرطي وإسقاطه عمداً|يستهدف العسكري الشخص القائد مباشرة لحماية روحه.',
  vehicle_extra: '',
  failsafe_items: 'نزول الشخص بسلاح\nتغيير المركبة\nاستخدام سيارات السوبر على الطرق السريعة\nتهديد المدنيين أو عكس السير\nالقفزات الخطيرة\nالدخول في الأماكن الضيقة والأنفاق\nورش التصليح\nالأوف رود وتسلق الجبال\nالتدخل الخارجي\nالصدم على الأرصفة (الحد الأقصى 3 أرصفة)\nالعكسات (الحد الأقصى 3 عكسات)\nلبس عدة الغوص والباراشوت',
  foot_escape: 'لمدة 5 ثوانٍ يستوجب إطلاق النار على الأطراف.',
  max_escape: '10 دقائق',
  failsafe_extra: '',
}

export const SOPS_COPY_FIELDS: Array<{ key: string; label: string; rows?: number }> = [
  { key: 'hero_title', label: 'العنوان الرئيسي' },
  { key: 'hero_subtitle', label: 'العنوان الفرعي' },
  { key: 'general_1', label: 'القواعد العامة — الفقرة الأولى', rows: 3 },
  { key: 'general_2', label: 'القواعد العامة — الفقرة الثانية', rows: 3 },
  { key: 'general_extra', label: 'القواعد العامة — نص إضافي', rows: 3 },
  { key: 'cuffs_intro', label: 'الكلبشة — المقدمة', rows: 2 },
  { key: 'cuffs_items', label: 'الكلبشة — البنود (سطر لكل بند)', rows: 4 },
  { key: 'taser_intro', label: 'التيزر — المقدمة', rows: 3 },
  { key: 'taser_direct_intro', label: 'التيزر — مقدمة الحالات المباشرة', rows: 2 },
  { key: 'taser_items', label: 'التيزر — الحالات (سطر لكل حالة)', rows: 5 },
  { key: 'cuffs_extra', label: 'الكلبشة والتيزر — نص إضافي', rows: 3 },
  { key: 'fire_intro', label: 'إطلاق النار — المقدمة', rows: 2 },
  { key: 'fire_items', label: 'إطلاق النار — البنود (سطر لكل بند)', rows: 4 },
  { key: 'fire_extra', label: 'إطلاق النار — نص إضافي', rows: 3 },
  { key: 'arrest_intro', label: 'الاعتقال — المقدمة', rows: 3 },
  { key: 'miranda', label: 'نص حقوق ميراندا', rows: 5 },
  { key: 'post_arrest', label: 'إجراءات ما بعد الاعتقال', rows: 3 },
  { key: 'arrest_extra', label: 'الاعتقال — نص إضافي', rows: 3 },
  { key: 'dispatch', label: 'تحديثات الدسباتش', rows: 3 },
  { key: 'pit_intro', label: 'PIT — المقدمة', rows: 2 },
  { key: 'pit_items', label: 'PIT — الحالات (سطر لكل حالة)', rows: 4 },
  { key: 'pit_conditions', label: 'PIT — الشروط (سطر لكل شرط)', rows: 5 },
  { key: 'pursuit_extra', label: 'المطاردات — نص إضافي', rows: 3 },
  { key: 'vehicle_intro', label: 'إطلاق النار على المركبة — المقدمة', rows: 2 },
  { key: 'vehicle_cases', label: 'حالات المركبات — العنوان|الوصف لكل سطر', rows: 5 },
  { key: 'vehicle_extra', label: 'المركبات — نص إضافي', rows: 3 },
  { key: 'failsafe_items', label: 'مفشلات الهروب الآمن (سطر لكل بند)', rows: 10 },
  { key: 'foot_escape', label: 'الهروب على الأقدام بسلاح', rows: 2 },
  { key: 'max_escape', label: 'الحد الأقصى الكلي للهروب' },
  { key: 'failsafe_extra', label: 'مفشلات الهروب — نص إضافي', rows: 3 },
]

export function getSopsCopy(blocks: ContentBlock[] | undefined): Record<string, string> {
  const block = (blocks ?? []).find((item) => item.type === 'sops-copy')
  if (!block || block.type !== 'sops-copy') return { ...DEFAULT_SOPS_COPY }
  return { ...DEFAULT_SOPS_COPY, ...block.values }
}

export function setSopsCopy(blocks: ContentBlock[] | undefined, values: Record<string, string>): ContentBlock[] {
  const rest = (blocks ?? []).filter((item) => item.type !== 'sops-copy')
  return [{ type: 'sops-copy', values }, ...rest]
}
