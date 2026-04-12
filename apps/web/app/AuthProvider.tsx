'use client'

import { useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check session on mount
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const isAuthPage = pathname === '/login'

      // If NOT on auth page AND no session, redirect to login
      if (!isAuthPage && !session) {
        router.push('/login')
        return
      }

      // If on auth page AND has session, redirect to work
      if (isAuthPage && session) {
        router.push('/work')
      }
    }

    checkAuth()

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const isAuthPage = pathname === '/login'

      // If no session and not on auth page, redirect to login
      if (!session && !isAuthPage) {
        router.push('/login')
      }

      // If has session and on auth page, redirect to work
      if (session && isAuthPage) {
        router.push('/work')
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [pathname, router])

  return <>{children}</>
}
