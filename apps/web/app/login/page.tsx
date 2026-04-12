'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .lp-root {
    min-height: 100vh;
    width: 100%;
    background: #09090b;
    font-family: 'JetBrains Mono', monospace;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* ── GRID ── */
  .lp-grid {
    position: fixed; inset: 0;
    background-image:
      linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none; z-index: 0;
  }

  /* ── GIANT BG TEXT ── */
  .lp-bg-text {
    position: fixed;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    font-family: 'Syne', sans-serif;
    font-size: clamp(120px, 22vw, 280px);
    font-weight: 800;
    color: transparent;
    -webkit-text-stroke: 1px rgba(59,130,246,0.07);
    letter-spacing: -0.04em;
    white-space: nowrap;
    pointer-events: none;
    user-select: none;
    z-index: 0;
    line-height: 1;
  }

  /* ── SCANLINE ── */
  @keyframes lp-scan {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(1200%); }
  }
  .lp-scanline {
    position: fixed; inset: 0;
    background: linear-gradient(to bottom,
      transparent 0%,
      rgba(59,130,246,0.04) 50%,
      transparent 100%);
    height: 6%;
    animation: lp-scan 6s linear infinite;
    pointer-events: none; z-index: 1;
  }

  /* CRT lines */
  .lp-crt {
    position: fixed; inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0,0,0,0.04) 2px,
      rgba(0,0,0,0.04) 4px
    );
    pointer-events: none; z-index: 1;
  }

  /* ── TERMINAL (background) ── */
  .lp-terminal {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    padding: 48px 56px;
    display: flex;
    flex-direction: column;
    gap: 0;
    pointer-events: none;
    z-index: 2;
    overflow: hidden;
  }
  .lp-term-line {
    font-size: clamp(10px, 1.1vw, 13px);
    line-height: 1.8;
    white-space: nowrap;
    overflow: hidden;
  }
  .lp-term-line.dim   { color: rgba(39,39,42,0.9); }
  .lp-term-line.mid   { color: rgba(63,63,70,0.8); }
  .lp-term-line.blue  { color: rgba(59,130,246,0.35); }
  .lp-term-line.green { color: rgba(34,197,94,0.3); }
  .lp-term-line.bright{ color: rgba(96,165,250,0.5); }

  /* Screen corners */
  .lp-corner { position: fixed; width: 18px; height: 18px; z-index: 5; }
  .lp-corner-tl { top:18px; left:18px;  border-top:1px solid rgba(59,130,246,0.3); border-left:1px solid rgba(59,130,246,0.3); }
  .lp-corner-tr { top:18px; right:18px; border-top:1px solid rgba(59,130,246,0.3); border-right:1px solid rgba(59,130,246,0.3); }
  .lp-corner-bl { bottom:18px; left:18px;  border-bottom:1px solid rgba(59,130,246,0.3); border-left:1px solid rgba(59,130,246,0.3); }
  .lp-corner-br { bottom:18px; right:18px; border-bottom:1px solid rgba(59,130,246,0.3); border-right:1px solid rgba(59,130,246,0.3); }

  /* screen top label */
  .lp-screen-bar {
    position: fixed; top: 18px; left: 50%; transform: translateX(-50%);
    display: flex; align-items: center; gap: 12px;
    font-size: 9px; color: #27272a; letter-spacing: 0.14em;
    z-index: 6;
  }

  /* ── CARD ── */
  @keyframes card-in {
    from { opacity: 0; transform: translateY(16px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  .lp-card {
    position: relative; z-index: 10;
    width: 100%; max-width: 400px;
    background: rgba(7,7,9,0.88);
    border: 1px solid rgba(39,39,42,0.9);
    border-radius: 14px;
    padding: 32px 28px 24px;
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    box-shadow:
      0 0 0 1px rgba(59,130,246,0.07),
      0 24px 80px rgba(0,0,0,0.7),
      inset 0 1px 0 rgba(255,255,255,0.02);
    animation: card-in 0.5s cubic-bezier(0.16,1,0.3,1) 0.2s both;
  }

  /* card corners */
  .cc { position: absolute; width: 10px; height: 10px; }
  .cc-tl { top:-1px; left:-1px;   border-top:1.5px solid rgba(59,130,246,0.6); border-left:1.5px solid rgba(59,130,246,0.6);   border-radius:3px 0 0 0; }
  .cc-tr { top:-1px; right:-1px;  border-top:1.5px solid rgba(59,130,246,0.6); border-right:1.5px solid rgba(59,130,246,0.6);  border-radius:0 3px 0 0; }
  .cc-bl { bottom:-1px; left:-1px;  border-bottom:1.5px solid rgba(59,130,246,0.6); border-left:1.5px solid rgba(59,130,246,0.6);  border-radius:0 0 0 3px; }
  .cc-br { bottom:-1px; right:-1px; border-bottom:1.5px solid rgba(59,130,246,0.6); border-right:1.5px solid rgba(59,130,246,0.6); border-radius:0 0 3px 0; }

  /* ── INPUTS ── */
  .lp-input {
    width: 100%; padding: 10px 13px;
    background: rgba(9,9,11,0.9);
    border: 1px solid rgba(63,63,70,0.6);
    border-radius: 0 6px 6px 0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px; color: #e4e4e7;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .lp-input::placeholder { color: #3f3f46; }
  .lp-input:focus {
    border-color: rgba(59,130,246,0.5);
    box-shadow: 0 0 0 3px rgba(59,130,246,0.06);
  }
  .lp-input:disabled { opacity: 0.4; }

  .lp-input-prefix {
    padding: 10px 10px;
    background: rgba(39,39,42,0.4);
    border: 1px solid rgba(63,63,70,0.6);
    border-right: none;
    border-radius: 6px 0 0 6px;
    font-size: 10px; color: #3b82f6;
    flex-shrink: 0;
  }

  /* ── BUTTONS ── */
  .lp-btn-primary {
    width: 100%; padding: 11px;
    background: #1d4ed8;
    border: 1px solid rgba(59,130,246,0.35);
    border-radius: 6px; color: #fff;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px; font-weight: 600;
    letter-spacing: 0.1em; text-transform: uppercase;
    cursor: pointer; position: relative; overflow: hidden;
    transition: background 0.15s, box-shadow 0.15s;
  }
  .lp-btn-primary::after {
    content: '';
    position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
    transition: left 0.45s;
  }
  .lp-btn-primary:hover:not(:disabled)::after { left: 100%; }
  .lp-btn-primary:hover:not(:disabled) { background: #2563eb; box-shadow: 0 0 24px rgba(59,130,246,0.3); }
  .lp-btn-primary:disabled { opacity: 0.35; cursor: not-allowed; }

  .lp-btn-ghost {
    width: 100%; padding: 10px;
    background: transparent;
    border: 1px solid rgba(63,63,70,0.5);
    border-radius: 6px; color: #52525b;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase;
    cursor: pointer; transition: all 0.15s;
  }
  .lp-btn-ghost:hover:not(:disabled) {
    border-color: rgba(59,130,246,0.3);
    color: #60a5fa;
    background: rgba(59,130,246,0.04);
  }
  .lp-btn-ghost:disabled { opacity: 0.35; cursor: not-allowed; }

  /* ── LABEL ── */
  .lp-label {
    font-size: 9px; color: #52525b;
    letter-spacing: 0.14em; text-transform: uppercase;
    margin-bottom: 6px;
    display: flex; align-items: center; gap: 5px;
  }
  .lp-label::before {
    content: '';
    display: inline-block; width: 3px; height: 3px;
    border: 1px solid rgba(59,130,246,0.5); border-radius: 50%;
  }

  /* ── STATUS DOT ── */
  @keyframes sdot { 0%,100%{opacity:1} 50%{opacity:0.2} }
  .sdot {
    width: 5px; height: 5px; border-radius: 50%;
    animation: sdot 2s ease-in-out infinite; flex-shrink: 0;
  }

  /* ── BLINK CURSOR ── */
  @keyframes blink { 0%,49%{opacity:1} 50%,100%{opacity:0} }
  .blink-cursor {
    display: inline-block; width: 7px; height: 13px;
    background: rgba(59,130,246,0.7);
    border-radius: 1px;
    animation: blink 1s step-end infinite;
    vertical-align: middle; margin-left: 2px;
  }

  @keyframes slide-up {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .slide-up { animation: slide-up 0.2s ease forwards; }

  /* ── NOVA PILL ── */
  @keyframes nova-pill-glow {
    0%,100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
    50%      { box-shadow: 0 0 12px 2px rgba(59,130,246,0.12); }
  }
  .nova-pill {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 5px 12px;
    background: rgba(9,9,11,0.9);
    border: 1px solid rgba(39,39,42,0.8);
    border-radius: 20px;
    animation: nova-pill-glow 3s ease-in-out infinite;
  }
`

const BOOT_LINES = [
  { text: '> NEXUS OS v1.0.0 — initializing kernel...', cls: 'bright' },
  { text: '> loading core modules [████████████] 100%', cls: 'blue' },
  { text: '> mounting filesystem... OK', cls: 'green' },
  { text: '> establishing supabase connection... CONNECTED', cls: 'green' },
  { text: '> nova.ai — neural link handshake... SUCCESS', cls: 'blue' },
  { text: '> loading user context... OK', cls: 'green' },
  { text: '> initializing work dashboard... OK', cls: 'green' },
  { text: '> task queue synced — 4 items pending', cls: 'mid' },
  { text: '> analytics pipeline — standby', cls: 'dim' },
  { text: '> auth service — awaiting credentials', cls: 'bright' },
  { text: '', cls: 'dim' },
  { text: '─────────────────────────────────────────────────────────', cls: 'dim' },
  { text: '', cls: 'dim' },
  { text: '  NEXUS PERSONAL OS  |  built by Shikhar Srivastava', cls: 'mid' },
  { text: '  NOVA AI ASSISTANT  |  v2.1 — neural link active', cls: 'blue' },
  { text: '', cls: 'dim' },
  { text: '─────────────────────────────────────────────────────────', cls: 'dim' },
  { text: '', cls: 'dim' },
  { text: '> all systems nominal. awaiting operator login...', cls: 'bright' },
  { text: '', cls: 'dim' },
  { text: '  [AUTH PORTAL OPEN]', cls: 'green' },
  { text: '', cls: 'dim' },
]

// repeated filler lines below to fill the screen
const FILLER = [
  { text: '> memory check... 16GB available', cls: 'dim' },
  { text: '> encryption layer... AES-256 active', cls: 'dim' },
  { text: '> network ping... 12ms', cls: 'dim' },
  { text: '> scheduler daemon... running', cls: 'dim' },
  { text: '> focus timer module... standby', cls: 'dim' },
  { text: '> project registry... 4 entries loaded', cls: 'dim' },
  { text: '> idea buffer... empty', cls: 'dim' },
  { text: '> calendar sync... OK', cls: 'dim' },
  { text: '> ambient mode... OFF', cls: 'dim' },
]

const ALL_LINES = [...BOOT_LINES, ...FILLER, ...FILLER, ...FILLER]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage]   = useState<string | null>(null)
  const [visibleLines, setVisibleLines] = useState(0)

  // Boot sequence — reveal lines one by one
  useEffect(() => {
    if (visibleLines >= ALL_LINES.length) return
    const t = setTimeout(() => setVisibleLines(v => v + 1), visibleLines < 10 ? 80 : 40)
    return () => clearTimeout(t)
  }, [visibleLines])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null); setMessage(null); setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); return }
      if (data?.session) {
        setMessage('✓ Authentication successful — redirecting')
        setTimeout(() => router.push('/work'), 600)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
    } finally { setLoading(false) }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null); setMessage(null); setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message); return }
      if (data?.user) {
        setMessage('✓ Account created. Check your email to confirm.')
        setEmail(''); setPassword('')
        setTimeout(() => setIsSignUp(false), 2000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed')
    } finally { setLoading(false) }
  }

  const now = new Date()
  const ts = `${String(now.getUTCHours()).padStart(2,'0')}:${String(now.getUTCMinutes()).padStart(2,'0')}:${String(now.getUTCSeconds()).padStart(2,'0')} UTC`

  return (
    <div className="lp-root">
      <style>{STYLES}</style>

      {/* BG layers */}
      <div className="lp-grid" />
      <div className="lp-crt" />
      <div className="lp-scanline" />

      {/* Giant background NEXUS text */}
      <div className="lp-bg-text" aria-hidden>NEXUS</div>

      {/* Terminal lines filling the background */}
      <div className="lp-terminal" aria-hidden>
        {ALL_LINES.slice(0, visibleLines).map((line, i) => (
          <div key={i} className={`lp-term-line ${line.cls}`}>
            {line.text}
            {i === visibleLines - 1 && line.text !== '' && <span className="blink-cursor" />}
          </div>
        ))}
      </div>

      {/* Screen corners */}
      <div className="lp-corner lp-corner-tl" />
      <div className="lp-corner lp-corner-tr" />
      <div className="lp-corner lp-corner-bl" />
      <div className="lp-corner lp-corner-br" />

      {/* Top bar */}
      <div className="lp-screen-bar">
        <span style={{ color: '#3b82f6' }}>NEXUS</span>
        <span style={{ color: '#1f1f23' }}>|</span>
        <span>SECURE AUTH PORTAL</span>
        <span style={{ color: '#1f1f23' }}>|</span>
        <span>{ts}</span>
      </div>

      {/* ── FORM CARD ── */}
      <div className="lp-card">
        <div className="cc cc-tl" /><div className="cc cc-tr" />
        <div className="cc cc-bl" /><div className="cc cc-br" />

        {/* Card header */}
        <div style={{ marginBottom: 22 }}>

          {/* Title row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <h1 style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: 22, fontWeight: 800,
                color: '#fafafa', letterSpacing: '-0.02em',
                lineHeight: 1,
              }}>NEXUS</h1>
              <p style={{ fontSize: 8, color: '#27272a', letterSpacing: '0.16em', marginTop: 3 }}>
                PERSONAL OPERATING SYSTEM
              </p>
            </div>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              border: '1px solid rgba(59,130,246,0.3)',
              background: 'rgba(29,78,216,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 800, color: '#60a5fa' }}>N</span>
            </div>
          </div>

          {/* NOVA pill */}
          <div className="nova-pill">
            <div className="sdot" style={{ background: '#22c55e' }} />
            <span style={{ fontSize: 9, color: '#52525b', letterSpacing: '0.1em' }}>NOVA AI</span>
            <span style={{ width: 1, height: 10, background: '#27272a', display: 'inline-block' }} />
            <span style={{ fontSize: 9, color: '#3b82f6', letterSpacing: '0.06em' }}>NEURAL LINK ACTIVE</span>
            <div className="sdot" style={{ background: '#3b82f6', animationDelay: '0.5s' }} />
          </div>

          {/* Mode indicator */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginTop: 14, padding: '6px 10px',
            background: 'rgba(9,9,11,0.8)',
            border: '1px solid rgba(39,39,42,0.6)',
            borderRadius: 5,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div className="sdot" style={{ background: '#22c55e' }} />
                <span style={{ fontSize: 8, color: '#3f3f46', letterSpacing: '0.1em' }}>SYS ONLINE</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div className="sdot" style={{ background: '#3b82f6', animationDelay: '0.7s' }} />
                <span style={{ fontSize: 8, color: '#3f3f46', letterSpacing: '0.1em' }}>DB READY</span>
              </div>
            </div>
            <span style={{ fontSize: 8, color: '#27272a', letterSpacing: '0.1em' }}>
              {isSignUp ? 'REGISTER' : 'AUTH'} MODE
            </span>
          </div>
        </div>

        {/* Form */}
        <form
          key={isSignUp ? 'up' : 'in'}
          className="slide-up"
          onSubmit={isSignUp ? handleSignUp : handleSignIn}
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <div>
            <div className="lp-label">Identifier / Email</div>
            <div style={{ display: 'flex' }}>
              <div className="lp-input-prefix">@</div>
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="user@example.com"
                disabled={loading}
                className="lp-input"
              />
            </div>
          </div>

          <div>
            <div className="lp-label">Access Key / Password</div>
            <div style={{ display: 'flex' }}>
              <div className="lp-input-prefix">▣</div>
              <input
                type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={loading}
                className="lp-input"
              />
            </div>
          </div>

          {error && (
            <div className="slide-up" style={{
              padding: '9px 12px', fontSize: 10,
              color: '#fca5a5',
              background: 'rgba(239,68,68,0.06)',
              border: '1px solid rgba(239,68,68,0.18)',
              borderRadius: 6, letterSpacing: '0.04em',
            }}>
              <span style={{ color: '#f87171', marginRight: 6 }}>ERR ✕</span>{error}
            </div>
          )}

          {message && (
            <div className="slide-up" style={{
              padding: '9px 12px', fontSize: 10,
              color: '#86efac',
              background: 'rgba(34,197,94,0.06)',
              border: '1px solid rgba(34,197,94,0.18)',
              borderRadius: 6, letterSpacing: '0.04em',
            }}>
              <span style={{ color: '#4ade80', marginRight: 6 }}>SYS ✓</span>{message}
            </div>
          )}

          <button type="submit" disabled={loading || !email || !password} className="lp-btn-primary">
            {loading ? '⟳ AUTHENTICATING...' : isSignUp ? '▶ INITIALIZE ACCOUNT' : '▶ AUTHENTICATE'}
          </button>

          <button
            type="button" disabled={loading}
            className="lp-btn-ghost"
            onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null) }}
          >
            {isSignUp ? '← BACK TO SIGN IN' : '+ CREATE NEW ACCOUNT'}
          </button>
        </form>

        {/* Footer */}
        <div style={{
          marginTop: 18,
          paddingTop: 14,
          borderTop: '1px solid rgba(39,39,42,0.4)',
          display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'center',
        }}>
          <p style={{ fontSize: 9, color: '#3f3f46', letterSpacing: '0.06em' }}>
            Crafted with precision by{' '}
            <span style={{ color: '#60a5fa', fontWeight: 600 }}>Shikhar Srivastava</span>
          </p>
          <p style={{ fontSize: 8, color: '#27272a', letterSpacing: '0.1em' }}>
            © {new Date().getFullYear()} NEXUS · ALL RIGHTS RESERVED
          </p>
        </div>
      </div>
    </div>
  )
}