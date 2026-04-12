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

      const publicRoutes = ['/login', '/']
      const isPublicRoute = publicRoutes.includes(pathname)

      // If no session and trying to access protected route, redirect to login
      if (!session && !isPublicRoute) {
        router.push('/login')
      }

      // If has session and on login page, redirect to work
      if (session && pathname === '/login') {
        router.push('/work')
      }
    }

    checkAuth()

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session && pathname !== '/login' && pathname !== '/') {
        router.push('/login')
      }
      if (session && pathname === '/login') {
        router.push('/work')
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [pathname, router])

  return <>{children}</>
}
