/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL Worker API, vd: https://naifarm-api.<sub>.workers.dev */
  readonly VITE_API_URL?: string
  /** URL dự án Supabase */
  readonly VITE_SUPABASE_URL?: string
  /** Khoá anon công khai của Supabase */
  readonly VITE_SUPABASE_ANON_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
