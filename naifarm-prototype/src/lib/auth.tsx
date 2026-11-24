import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase, supabaseEnabled } from './supabase'
import { apiEnabled, apiGet } from './api'
import type { Profile } from './seed'

/** Tài khoản demo (khớp `naifarm-api/src/seed/seed.ts`). */
export const DEMO_ACCOUNTS = [
  { email: 'ngoclinh@naifarm.demo', label: 'W01 · Người mua', workspace: 'W01', entry: '/' },
  { email: 'batu@naifarm.demo', label: 'W02 · Nhà nông', workspace: 'W02', entry: '/farmer' },
  { email: 'minhanh@naifarm.demo', label: 'W03 · Thanh niên', workspace: 'W03', entry: '/volunteer' },
  { email: 'thuha@naifarm.demo', label: 'W04 · Điều phối', workspace: 'W04', entry: '/coordinator' },
  { email: 'admin@naifarm.demo', label: 'W06 · Quản trị', workspace: 'W06', entry: '/admin' },
] as const

export const DEMO_PASSWORD = 'Naifarm@2026'

interface AuthState {
  session: Session | null
  profile: Profile | null
  loading: boolean
  /** Có cấu hình Supabase để đăng nhập hay không. */
  enabled: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(supabaseEnabled)

  useEffect(() => {
    if (!supabaseEnabled) {
      setLoading(false)
      return
    }
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    let active = true
    if (!apiEnabled || !session?.access_token) {
      setProfile(null)
      return
    }
    apiGet<{ profile: Profile }>('/v1/me')
      .then((r) => active && setProfile(r.profile))
      .catch(() => active && setProfile(null))
    return () => {
      active = false
    }
  }, [session?.access_token])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabaseEnabled) throw new Error('Chưa cấu hình Supabase (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
  }, [])

  const signOut = useCallback(async () => {
    if (supabaseEnabled) await supabase.auth.signOut()
  }, [])

  const value = useMemo<AuthState>(
    () => ({ session, profile, loading, enabled: supabaseEnabled, signIn, signOut }),
    [session, profile, loading, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth phải dùng trong AuthProvider')
  return ctx
}
