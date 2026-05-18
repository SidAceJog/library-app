import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Resident } from '@/lib/types'

interface AuthContextType {
  user: User | null
  resident: Resident | null
  session: Session | null
  isAdmin: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshResident: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [resident, setResident] = useState<Resident | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  async function fetchResident(userId: string) {
    const { data } = await supabase
      .from('residents')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (data) {
      setResident(data)
      // Check permanent admin or temp admin
      if (data.role === 'admin') {
        setIsAdmin(true)
      } else {
        const today = new Date()
        const todayStr = today.getFullYear() + '-' + 
          String(today.getMonth() + 1).padStart(2, '0') + '-' + 
          String(today.getDate()).padStart(2, '0')
        const { data: tempAccess } = await supabase
          .from('temp_admin_access')
          .select('id')
          .eq('resident_id', userId)
          .eq('granted_date', todayStr)
          .gt('expires_at', new Date().toISOString())
          .limit(1)
        setIsAdmin(!!tempAccess && tempAccess.length > 0)
      }
    }
  }

  async function refreshResident() {
    if (user) await fetchResident(user.id)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchResident(session.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchResident(session.user.id)
      } else {
        setResident(null)
        setIsAdmin(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  async function signOut() {
    await supabase.auth.signOut({ scope: 'local' })
    setResident(null)
    setIsAdmin(false)
    // Clear all Supabase auth data from storage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-')) localStorage.removeItem(key)
    })
    sessionStorage.clear()
    // Use replace to prevent back-button restoring session
    window.location.href = window.location.origin + window.location.pathname.split('/').slice(0, 2).join('/') + '/'
  }

  return (
    <AuthContext.Provider value={{ user, resident, session, isAdmin, loading, signIn, signOut, refreshResident }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
