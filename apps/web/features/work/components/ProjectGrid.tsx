'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MC_STYLES } from './mc-styles'
import { ProjectForm } from './ProjectForm'
import { ProjectModal } from './ProjectModal'
import { createClient } from '@supabase/supabase-js'

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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export function ProjectGrid({ projects, onProjectAdded }: ProjectGridProps) {
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const router = useRouter()

  const handleEditProject = (projectId: number) => {
    setEditingId(projectId)
  }

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
            const isHovered = hoveredId === p.id
            const isEditing = editingId === p.id
            return (
              <div
                key={p.id}
                onMouseEnter={() => setHoveredId(p.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => !isEditing && router.push(`/work/${p.id}`)}
                style={{
                  background: isHovered ? 'rgba(39,39,42,0.5)' : 'rgba(9,9,11,0.8)',
                  border: '1px solid rgba(39,39,42,0.8)',
                  borderRadius: 8,
                  padding: 12,
                  transition: 'background 0.15s, border-color 0.15s',
                  cursor: isHovered ? 'text' : 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Index */}
                <span className="mc-mono" style={{ position: 'absolute', top: 8, right: 10, fontSize: 9, color: '#27272a' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>

                {/* Title + badge + edit button */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                  <div style={{ flex: 1 }}>
                    <span className="mc-mono" style={{ fontSize: 12, fontWeight: 600, color: '#d4d4d8' }}>
                      {p.title}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditProject(p.id)
                      }}
                      className="mc-mono"
                      style={{
                        fontSize: 9,
                        padding: '4px 6px',
                        color: '#3b82f6',
                        border: '1px solid rgba(59,130,246,0.3)',
                        borderRadius: '4px',
                        background: 'rgba(59,130,246,0.05)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        const elem = e.currentTarget as HTMLButtonElement
                        elem.style.background = 'rgba(59,130,246,0.12)'
                        elem.style.borderColor = 'rgba(59,130,246,0.5)'
                      }}
                      onMouseLeave={(e) => {
                        const elem = e.currentTarget as HTMLButtonElement
                        elem.style.background = 'rgba(59,130,246,0.05)'
                        elem.style.borderColor = 'rgba(59,130,246,0.3)'
                      }}
                    >
                      ✎
                    </button>
                    <span className={`mc-badge ${s.cls}`}>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
                      {s.label}
                    </span>
                  </div>
                </div>

                <p className="mc-mono" style={{ fontSize: 10, color: '#52525b', marginBottom: 10, lineHeight: 1.5 }}>
                  {p.desc}
                </p>

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

      {editingId && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
        }} onClick={() => setEditingId(null)}>
          <div style={{
            background: '#0f0f0f',
            border: '1px solid rgba(39,39,42,0.5)',
            borderRadius: 12,
            padding: 20,
            maxWidth: 500,
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="mc-mono" style={{ fontSize: 14, color: '#d4d4d8' }}>EDIT_PROJECT</h2>
              <button
                onClick={() => setEditingId(null)}
                className="mc-mono"
                style={{
                  fontSize: 16,
                  color: '#52525b',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
            <ProjectForm projectId={editingId} onProjectAdded={() => {
              setEditingId(null)
            }} />
          </div>
        </div>
      )}
    </>
  )
}