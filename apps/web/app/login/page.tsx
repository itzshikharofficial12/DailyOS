'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data?.session) {
        setMessage('✓ Signed in successfully')
        setTimeout(() => {
          router.push('/work')
        }, 500)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data?.user) {
        setMessage('✓ Account created! Check your email to confirm.')
        setEmail('')
        setPassword('')
        setTimeout(() => setIsSignUp(false), 2000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div style={{
        width: '100%',
        maxWidth: 400,
        padding: 32,
        background: 'rgba(9,9,11,0.8)',
        border: '1px solid rgba(39,39,42,0.5)',
        borderRadius: 12,
        boxShadow: '0 0 0 1px rgba(59,130,246,0.1)',
      }}>
        {/* Header */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <h1 style={{
            fontSize: 20,
            fontWeight: 600,
            color: '#d4d4d8',
            margin: '0 0 8px 0',
            letterSpacing: '0.05em',
          }}>
            DAILY OS
          </h1>
          <p style={{
            fontSize: 12,
            color: '#3f3f46',
            margin: 0,
            letterSpacing: '0.08em',
          }}>
            {isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={isSignUp ? handleSignUp : handleSignIn} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}>
          {/* Email Input */}
          <div>
            <label style={{
              display: 'block',
              fontSize: 11,
              color: '#a1a1aa',
              marginBottom: 8,
              letterSpacing: '0.05em',
            }}>
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: 12,
                background: 'rgba(9,9,11,0.5)',
                border: '1px solid rgba(39,39,42,0.8)',
                borderRadius: 6,
                color: '#d4d4d8',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(39,39,42,0.8)'
              }}
            />
          </div>

          {/* Password Input */}
          <div>
            <label style={{
              display: 'block',
              fontSize: 11,
              color: '#a1a1aa',
              marginBottom: 8,
              letterSpacing: '0.05em',
            }}>
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: 12,
                background: 'rgba(9,9,11,0.5)',
                border: '1px solid rgba(39,39,42,0.8)',
                borderRadius: 6,
                color: '#d4d4d8',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(39,39,42,0.8)'
              }}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '12px 14px',
              fontSize: 11,
              color: '#fca5a5',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 6,
              letterSpacing: '0.02em',
            }}>
              ✕ {error}
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div style={{
              padding: '12px 14px',
              fontSize: 11,
              color: '#86efac',
              background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.3)',
              borderRadius: 6,
              letterSpacing: '0.02em',
            }}>
              {message}
            </div>
          )}

          {/* Primary Button */}
          <button
            type="submit"
            disabled={loading || !email || !password}
            style={{
              padding: '12px 14px',
              fontSize: 12,
              fontWeight: 600,
              color: '#ffffff',
              background: '#3b82f6',
              border: 'none',
              borderRadius: 6,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              opacity: loading || !email || !password ? 0.5 : 1,
              letterSpacing: '0.05em',
            }}
            onMouseEnter={(e) => {
              if (!loading && email && password) {
                e.currentTarget.style.background = '#2563eb'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#3b82f6'
            }}
          >
            {loading ? 'PROCESSING...' : isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}
          </button>

          {/* Toggle Button */}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError(null)
              setMessage(null)
            }}
            disabled={loading}
            style={{
              padding: '12px 14px',
              fontSize: 11,
              color: '#60a5fa',
              background: 'transparent',
              border: '1px solid rgba(59,130,246,0.3)',
              borderRadius: 6,
              cursor: 'pointer',
              transition: 'all 0.2s',
              letterSpacing: '0.05em',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(59,130,246,0.1)'
              e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'
            }}
          >
            {isSignUp ? 'ALREADY HAVE ACCOUNT?' : 'CREATE NEW ACCOUNT'}
          </button>
        </form>

        {/* Footer */}
        <div style={{
          marginTop: 24,
          paddingTop: 16,
          borderTop: '1px solid rgba(39,39,42,0.3)',
          fontSize: 10,
          color: '#3f3f46',
          textAlign: 'center',
          letterSpacing: '0.03em',
        }}>
          Secure authentication powered by Supabase
        </div>
      </div>
    </div>
  )
}
