'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useCurrentProject } from '@/store/useCurrentProject'
import { getVSCodeUrl } from '@/lib/github'
import { ProjectForm } from './ProjectForm'
import { ProjectModal } from './ProjectModal'

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  : null

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
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Get current project from Zustand ID, or fallback to first active
  let currentProject = projects.find((p) => p.id.toString() === currentProjectId && p.status === 'active')
  if (!currentProject) {
    currentProject = projects.find((p) => p.status === 'active')
  }

  // If no projects, show empty state
  if (!currentProject) {
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
                <div className="mc-dot" style={{ background: '#a1a1a1' }} />
                <span className="mc-mono mc-label">SYS IDLE</span>
              </div>
              <div style={{ width: 1, height: 10, background: '#27272a' }} />
              <span className="mc-mono mc-label">NEXUS · STANDBY</span>
            </div>
          </div>

          {/* Empty state body */}
          <div style={{ padding: '40px 20px', position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <p className="mc-mono" style={{ fontSize: 14, color: '#52525b', marginBottom: 24 }}>
              No running projects detected
            </p>
            <p className="mc-mono" style={{ fontSize: 11, color: '#3f3f46', marginBottom: 12 }}>
              Create a new project to get started
            </p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="mc-btn-primary" 
              style={{ whiteSpace: 'nowrap' }}
            >
              ▶ New Project
            </button>
          </div>
        </div>

        {isModalOpen && (
          <ProjectModal onClose={() => setIsModalOpen(false)}>
            <ProjectForm onProjectAdded={() => setIsModalOpen(false)} />
          </ProjectModal>
        )}
      </>
    )
  }

  // Use project data
  const title = currentProject.title
  const description = currentProject.desc
  const stackTags = currentProject.tags || DEFAULT_STACK_TAGS
  const githubUrl = currentProject.github_url
  const docsUrl = currentProject.docs_url
  const liveUrl = currentProject.live_url
  const now = new Date()
  const ts = `${now.getUTCFullYear()}-${String(now.getUTCMonth()+1).padStart(2,'0')}-${String(now.getUTCDate()).padStart(2,'0')} ${String(now.getUTCHours()).padStart(2,'0')}:${String(now.getUTCMinutes()).padStart(2,'0')} UTC`

  const handleLetsBuild = () => {
    console.log('Let\'s Build clicked! githubUrl:', githubUrl)
    
    if (!githubUrl) {
      console.warn('No GitHub URL available for this project')
      alert('Please add a GitHub repository URL to this project first')
      return
    }

    const vscodeUrl = getVSCodeUrl(githubUrl)
    console.log('Generated VS Code URL:', vscodeUrl)

    if (!vscodeUrl) {
      console.error('Invalid GitHub URL format. Expected: https://github.com/owner/repo')
      console.log('Opening GitHub URL directly:', githubUrl)
      if (typeof window !== 'undefined') {
        window.open(githubUrl, '_blank')
      }
      return
    }

    // Open VS Code web editor with the repository
    console.log('Opening VS Code:', vscodeUrl)
    if (typeof window !== 'undefined') {
      window.open(vscodeUrl, '_blank')
    }
  }

  return (
    <>
      <div className="mc-root mc-card col-span-2" style={{ padding: 0 }}>
        <div className="mc-corner mc-corner-tl" />
        <div className="mc-corner mc-corner-tr" />
        <div className="mc-corner mc-corner-bl" />
        <div className="mc-corner mc-corner-br" />
        <div className="mc-scanline" />

        {/* Top bar */}
        <div className="mc-card-header" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div className="mc-dot" style={{ background: '#22c55e' }} />
              <span className="mc-mono mc-label">SYS ONLINE</span>
            </div>
            <div style={{ width: 1, height: 10, background: '#27272a' }} />
            <span className="mc-mono mc-label">NEXUS · MISSION CTRL</span>
          </div>
          
          {/* Project links as minimal SVG icons */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                  opacity: 0.6,
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.opacity = '1'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.opacity = '0.6'
                }}
                title="Open GitHub repository"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#a1a1aa' }}>
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.375 3.375 0 0 0-.975-2.438A3.375 3.375 0 0 1 16.5 9c1.657 0 3-1.343 3-3s-1.343-3-3-3c-1.195 0-2.235.575-2.895 1.458M9 5a3 3 0 0 0-3 3v4"></path>
                </svg>
              </a>
            )}
            {liveUrl && (
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                  opacity: 0.6,
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.opacity = '1'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.opacity = '0.6'
                }}
                title="Open live website"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#a1a1aa' }}>
                  <circle cx="12" cy="12" r="1"></circle>
                  <path d="M19.07 4.93L16.58 7.42M4.93 19.07l2.49-2.49M1 12a11 11 0 0 0 22 0 11 11 0 0 0-22 0"></path>
                  <path d="M12 1v6m0 6v6"></path>
                  <path d="M4.22 4.22l4.24 4.24m5.08 0l4.24-4.24"></path>
                </svg>
              </a>
            )}
            {docsUrl && (
              <a
                href={docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                  opacity: 0.6,
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.opacity = '1'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.opacity = '0.6'
                }}
                title="Open documentation"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#a1a1aa' }}>
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
              </a>
            )}
            <span className="mc-mono mc-label" style={{ color: '#27272a', marginLeft: 12 }}>{ts}</span>
          </div>
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
              <button 
                onClick={handleLetsBuild}
                className="mc-btn-primary" 
                style={{ whiteSpace: 'nowrap' }}
                title={githubUrl ? "Open GitHub repo and VS Code editor" : "Add GitHub repository to this project"}
              >
                ▶ Let's Build
              </button>
              <button className="mc-btn-secondary">View Log</button>
              <button className="mc-btn-secondary">Settings</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}