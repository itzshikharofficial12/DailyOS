"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MC_STYLES } from "@/features/work/components/mc-styles";
import { supabase } from "@/lib/supabaseClient";

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: "WORK",     href: "/work"     },
  { label: "ACADS",    href: "/acads"    },
  { label: "CALENDAR", href: "/calendar" },
  { label: "SETTINGS", href: "/settings" },
];

const SIDEBAR_EXTRA = `
  @keyframes nova-ring-s     { to { transform: rotate(360deg);  } }
  @keyframes nova-ring-s-rev { to { transform: rotate(-360deg); } }
  .nova-btn-ring-s     { animation: nova-ring-s     7s linear infinite; }
  .nova-btn-ring-s-rev { animation: nova-ring-s-rev 11s linear infinite; }

  @keyframes nova-btn-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.0); }
    50%       { box-shadow: 0 0 18px 2px rgba(59,130,246,0.18); }
  }
  .nova-btn-glow { animation: nova-btn-pulse 3s ease-in-out infinite; }

  @keyframes nova-live-blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.2; }
  }
  .nova-live-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #22c55e;
    animation: nova-live-blink 2s ease-in-out infinite;
    flex-shrink: 0;
  }

  .nova-sidebar-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    padding: 16px 12px;
    background: rgba(9,9,11,0.9);
    border: 1px solid rgba(59,130,246,0.25);
    border-radius: 10px;
    cursor: pointer;
    text-decoration: none;
    position: relative;
    overflow: hidden;
    transition: border-color 0.2s, background 0.2s;
  }
  .nova-sidebar-btn::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(59,130,246,0.05) 0%, transparent 60%);
    pointer-events: none;
  }
  .nova-sidebar-btn:hover {
    border-color: rgba(59,130,246,0.5);
    background: rgba(29,78,216,0.1);
  }
  .nova-sidebar-btn-active {
    border-color: rgba(59,130,246,0.55) !important;
    background: rgba(29,78,216,0.14) !important;
  }

  .nsc { position: absolute; width: 6px; height: 6px; }
  .nsc-tl { top:0; left:0;  border-top:1px solid rgba(59,130,246,0.6); border-left:1px solid rgba(59,130,246,0.6);  border-radius:2px 0 0 0; }
  .nsc-tr { top:0; right:0; border-top:1px solid rgba(59,130,246,0.6); border-right:1px solid rgba(59,130,246,0.6); border-radius:0 2px 0 0; }
  .nsc-bl { bottom:0; left:0;  border-bottom:1px solid rgba(59,130,246,0.6); border-left:1px solid rgba(59,130,246,0.6);  border-radius:0 0 0 2px; }
  .nsc-br { bottom:0; right:0; border-bottom:1px solid rgba(59,130,246,0.6); border-right:1px solid rgba(59,130,246,0.6); border-radius:0 0 2px 0; }
`

function NovaAvatar({ active }: { active: boolean }) {
  const size = 40
  const c = size / 2
  const r1 = c - 3
  const r2 = c - 8
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <g className="nova-btn-ring-s" style={{ transformOrigin: `${c}px ${c}px` }}>
        <circle cx={c} cy={c} r={r1} fill="none"
          stroke={active ? "rgba(59,130,246,0.45)" : "rgba(59,130,246,0.25)"}
          strokeWidth="1" strokeDasharray="3 5" />
      </g>
      <g className="nova-btn-ring-s-rev" style={{ transformOrigin: `${c}px ${c}px` }}>
        <circle cx={c} cy={c} r={r2} fill="none"
          stroke={active ? "rgba(59,130,246,0.3)" : "rgba(59,130,246,0.15)"}
          strokeWidth="1" strokeDasharray="2 7" />
      </g>
      <circle cx={c} cy={c} r={c - 13}
        fill={active ? "rgba(29,78,216,0.25)" : "rgba(29,78,216,0.12)"}
        stroke={active ? "rgba(59,130,246,0.7)" : "rgba(59,130,246,0.4)"}
        strokeWidth="1" />
      <text x={c} y={c + 5} textAnchor="middle" fill={active ? "#bfdbfe" : "#93c5fd"}
        style={{ fontSize: 13, fontFamily: 'JetBrains Mono,monospace', fontWeight: 700 }}>
        N
      </text>
      <circle cx={c + r1 * 0.68} cy={c - r1 * 0.68} r="2.5" fill="#22c55e" />
    </svg>
  )
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href);
  const novaActive = isActive("/ai");

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <>
      <style>{MC_STYLES}{SIDEBAR_EXTRA}</style>

      <aside className="w-60 bg-zinc-950 border-r border-zinc-800 flex flex-col h-full" suppressHydrationWarning>

        {/* HEADER */}
        <div className="px-5 py-6 border-b border-zinc-800 flex items-center justify-between">
          <span className="mc-mono text-sm font-semibold text-zinc-100 tracking-wide">
            NEXUS
          </span>
          <span className="mc-mono text-xs text-zinc-500 tracking-wide">v1.0</span>
        </div>

        {/* NAV */}
        <nav className="flex-1 px-3 py-4">
          <div className="flex flex-col gap-1">
            {navItems.map((item, i) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`mc-mono flex items-center justify-between px-3 py-2 text-xs tracking-wide border border-transparent transition-all rounded-sm ${
                    active
                      ? "text-blue-400 border-zinc-800 bg-zinc-900"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span style={{
                      width: 4, height: 4, borderRadius: "50%",
                      background: active ? "#3b82f6" : "#3f3f46",
                      flexShrink: 0,
                    }} />
                    {item.label}
                  </div>
                  <span className="mc-mono text-xs text-zinc-700">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* NOVA BUTTON */}
        <div className="px-3 pb-3">

          {/* divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, padding: '0 2px' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(63,63,70,0.5)' }} />
            <span className="mc-mono" style={{ fontSize: 9, color: '#52525b', letterSpacing: '0.14em' }}>AI CORE</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(63,63,70,0.5)' }} />
          </div>

          <Link
            href="/ai"
            className={`nova-sidebar-btn nova-btn-glow ${novaActive ? 'nova-sidebar-btn-active' : ''}`}
          >
            <div className="nsc nsc-tl" /><div className="nsc nsc-tr" />
            <div className="nsc nsc-bl" /><div className="nsc nsc-br" />

            <NovaAvatar active={novaActive} />

            {/* Text block */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>

              {/* Name + badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  fontFamily: 'Syne, sans-serif',
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: novaActive ? '#bfdbfe' : '#93c5fd',
                }}>
                  NOVA
                </span>
                <span className="mc-mono" style={{
                  fontSize: 9,
                  color: '#60a5fa',
                  background: 'rgba(59,130,246,0.1)',
                  border: '1px solid rgba(59,130,246,0.25)',
                  borderRadius: 3,
                  padding: '1px 5px',
                  letterSpacing: '0.08em',
                }}>
                  v2.1
                </span>
              </div>

              {/* Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div className="nova-live-dot" />
                <span className="mc-mono" style={{
                  fontSize: 9,
                  color: '#71717a',
                  letterSpacing: '0.08em',
                }}>
                  NEURAL LINK ACTIVE
                </span>
              </div>
            </div>

            {/* bottom scan line */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.35), transparent)',
            }} />
          </Link>
        </div>

        {/* FOOTER */}
        <div className="px-4 py-4 border-t border-zinc-800">
          <div className="mc-mono text-xs text-zinc-500 tracking-wide uppercase">
            System Status
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="mc-mono text-xs text-zinc-400 tracking-wide">OPERATIONAL</span>
          </div>
        </div>

        {/* USER SECTION */}
        <div className="px-4 py-4 border-t border-zinc-800 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 rounded-lg transition-colors"
            style={{
              fontSize: '12px',
              color: '#d4d4d8',
              cursor: 'pointer',
              letterSpacing: '0.05em',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            LOGOUT
          </button>
        </div>

      </aside>
    </>
  );
}