'use client'

import { useState } from 'react'
import { useCurrentProject } from '@/store/useCurrentProject'

interface Project {
  id: string | number
  title: string
  desc: string
  status: string
  tags?: string[]
  github_url?: string | null
  docs_url?: string | null
  live_url?: string | null
}

interface HeroProps {
  goal: string
  onGoalChange: (goal: string) => void
  projects?: Project[]
}

const DEFAULT_STACK_TAGS = ['React', 'Supabase', 'Tailwind', 'Next.js']

export function Hero({ goal, onGoalChange, projects = [] }: HeroProps) {
  const { currentProjectId } = useCurrentProject()

  // Get current project from Zustand ID, or fallback to first active
  let currentProject = projects.find((p) => p.id.toString() === currentProjectId && p.status === 'active')
  if (!currentProject) {
    currentProject = projects.find((p) => p.status === 'active')
  }

  // Use project data if available, otherwise use defaults
  const title = currentProject?.title || 'DailyOS Dashboard'
  const description = currentProject?.desc || 'Personal operating system · focused, intentional work'
  const stackTags = currentProject?.tags || DEFAULT_STACK_TAGS
  const githubUrl = currentProject?.github_url
  const docsUrl = currentProject?.docs_url
  const liveUrl = currentProject?.live_url
  const now = new Date()
  const ts = `${now.getUTCFullYear()}-${String(now.getUTCMonth()+1).padStart(2,'0')}-${String(now.getUTCDate()).padStart(2,'0')} ${String(now.getUTCHours()).padStart(2,'0')}:${String(now.getUTCMinutes()).padStart(2,'0')} UTC`

  return (
    <>
      <div className="mc-root mc-card col-span-2" style={{ padding: 0 }}>
        <div className="mc-corner mc-corner-tl" />
        <div className="mc-corner mc-corner-tr" />
        <div className="mc-corner mc-corner-bl" />
        <div className="mc-corner mc-corner-br" />
        <div className="mc-scanline" />

        {/* Top bar */}
        <div className="mc-card-header" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div className="mc-dot" style={{ background: '#22c55e' }} />
              <span className="mc-mono mc-label">SYS ONLINE</span>
            </div>
            <div style={{ width: 1, height: 10, background: '#27272a' }} />
            <span className="mc-mono mc-label">NEXUS · MISSION CTRL</span>
          </div>
          <span className="mc-mono mc-label" style={{ color: '#27272a' }}>{ts}</span>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 20px 18px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24 }}>
            {/* Left */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Stack tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                {stackTags.map((t: string) => (
                  <span key={t} className="mc-tag mc-mono" style={{ fontSize: 9 }}>
                    <span style={{ color: '#3b82f6', marginRight: 3 }}>#</span>{t}
                  </span>
                ))}
              </div>

              <h1
                className="mc-mono"
                style={{
                  fontSize: 22, fontWeight: 700, color: '#fafafa',
                  letterSpacing: '-0.01em', margin: '0 0 4px',
                  fontFamily: 'Syne, sans-serif',
                }}
              >
                {title}
              </h1>
              <p className="mc-mono" style={{ fontSize: 11, color: '#52525b', marginBottom: 16 }}>
                {description}</p>

              {/* Goal input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                <div
                  className="mc-mono"
                  style={{
                    padding: '9px 10px',
                    background: 'rgba(39,39,42,0.5)',
                    border: '1px solid rgba(63,63,70,0.7)',
                    borderRight: 'none',
                    borderRadius: '6px 0 0 6px',
                    fontSize: 10,
                    color: '#3b82f6',
                  }}
                >
                  ▶
                </div>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => onGoalChange(e.target.value)}
                  placeholder="Set today's mission objective..."
                  className="mc-input"
                  style={{ borderRadius: '0 6px 6px 0', flex: 1 }}
                />
              </div>
            </div>

            {/* Right actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
              <button className="mc-btn-primary" style={{ whiteSpace: 'nowrap' }}>
                ▶ Let's Build
              </button>
              <button className="mc-btn-secondary">View Log</button>
              <button className="mc-btn-secondary">Settings</button>
              
              {/* Project links */}
              {(githubUrl || docsUrl || liveUrl) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8, paddingTop: 8, borderTop: '1px solid #27272a' }}>
                  {githubUrl && (
                    <a
                      href={githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mc-btn-secondary"
                      style={{ fontSize: 10, padding: '6px 10px', textAlign: 'center' }}
                    >
                      GitHub
                    </a>
                  )}
                  {docsUrl && (
                    <a
                      href={docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mc-btn-secondary"
                      style={{ fontSize: 10, padding: '6px 10px', textAlign: 'center' }}
                    >
                      Docs
                    </a>
                  )}
                  {liveUrl && (
                    <a
                      href={liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mc-btn-secondary"
                      style={{ fontSize: 10, padding: '6px 10px', textAlign: 'center' }}
                    >
                      Live
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}