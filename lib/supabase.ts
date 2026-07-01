import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wijlmmzafidcrbgymofv.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'sb_publishable_pWPYQXpEN9XyUg-Ntbjsfg_0SX-HynW'

export const supabase = createClient(supabaseUrl, supabaseKey)
