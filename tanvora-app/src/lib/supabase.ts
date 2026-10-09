import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const isDemo = !url || !key
export const supabase = isDemo ? null : createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
