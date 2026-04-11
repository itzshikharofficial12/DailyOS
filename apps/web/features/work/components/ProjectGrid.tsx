'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MC_STYLES } from './mc-styles'
import { ProjectForm } from './ProjectForm'
import { ProjectModal } from './ProjectModal'

interface Project {
  id: number
  title: string
  desc: string
  status: string
  tags: string[]
}

interface ProjectGridProps {
  projects: Project[]
  onProjectAdded?: () => void
}

const STATUS_MAP: Record<string, { dot: string; cls: string; label: string }> = {
  active:  { dot: '#3b82f6', cls: 'mc-badge-active',  label: 'ACTIVE'  },
  review:  { dot: '#f59e0b', cls: 'mc-badge-review',  label: 'REVIEW'  },
  planned: { dot: '#52525b', cls: 'mc-badge-planned', label: 'PLANNED' },
}

export function ProjectGrid({ projects, onProjectAdded }: ProjectGridProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <>
      <style>{MC_STYLES}</style>
      <div className="mc-root mc-card col-span-2" style={{ padding: 0 }}>
        <div className="mc-corner mc-corner-tl" /><div className="mc-corner mc-corner-tr" />
        <div className="mc-corner mc-corner-bl" /><div className="mc-corner mc-corner-br" />

        {/* Header */}
        <div className="mc-card-header" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#3b82f6', fontSize: 12 }}>⬡</span>
            <span className="mc-mono mc-label">ACTIVE_PROJECTS</span>
            <div style={{ width: 1, height: 10, background: '#27272a' }} />
            <span className="mc-mono mc-label">{projects.length} REGISTERED</span>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="mc-mono"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 10px',
              background: 'rgba(59,130,246,0.08)',
              border: '1px solid rgba(59,130,246,0.2)',
              borderRadius: 5, fontSize: 10, color: '#60a5fa',
              cursor: 'pointer', letterSpacing: '0.08em', transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(59,130,246,0.15)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(59,130,246,0.08)' }}
          >
            <span>+</span> NEW PROJECT
          </button>
        </div>

        {/* Grid */}
        <div style={{ padding: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, position: 'relative', zIndex: 1 }}>
          {projects.map((p, i) => {
            const s = STATUS_MAP[p.status] ?? STATUS_MAP.planned
            return (
              <div
                key={p.id}
                onClick={() => router.push(`/work/${p.id}`)}
                style={{
                  background: 'rgba(9,9,11,0.8)',
                  border: '1px solid rgba(39,39,42,0.8)',
                  borderRadius: 8,
                  padding: 12,
                  transition: 'border-color 0.15s',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(59,130,246,0.25)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(39,39,42,0.8)' }}
              >
                {/* Index */}
                <span className="mc-mono" style={{ position: 'absolute', top: 8, right: 10, fontSize: 9, color: '#27272a' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>

                {/* Title + badge */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                  <span className="mc-mono" style={{ fontSize: 12, fontWeight: 600, color: '#d4d4d8' }}>{p.title}</span>
                  <span className={`mc-badge ${s.cls}`}>
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
                    {s.label}
                  </span>
                </div>

                <p className="mc-mono" style={{ fontSize: 10, color: '#52525b', marginBottom: 10, lineHeight: 1.5 }}>{p.desc}</p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {p.tags.map((tag) => (
                    <span key={tag} className="mc-tag" style={{ fontSize: 9 }}>
                      <span style={{ color: '#3b82f6', marginRight: 2 }}>#</span>{tag}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {open && (
        <ProjectModal onClose={() => setOpen(false)}>
          <ProjectForm onProjectAdded={() => {
            setOpen(false)
            if (onProjectAdded) onProjectAdded()
          }} />
        </ProjectModal>
      )}
    </>
  )
}