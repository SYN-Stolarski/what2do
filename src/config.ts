export const SUPABASE_URL: string = import.meta.env.VITE_SUPABASE_URL ?? ''
export const SUPABASE_KEY: string = import.meta.env.VITE_SUPABASE_KEY ?? ''
export const APP_VERSION = '0.2.0'

export const backendConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY)
