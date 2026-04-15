'use client'

import { useState, useRef, useEffect } from 'react'
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
  onProjectAdded: () => void
  isModalOpen?: boolean
  setIsModalOpen?: (open: boolean) => void
}

const STATUS_MAP: Record<string, { dot: string; cls: string; label: string }> = {
  active:  { dot: '#22c55e', cls: 'mc-badge-active',  label: 'ACTIVE'  },
  review:  { dot: '#3b82f6', cls: 'mc-badge-review',  label: 'REVIEW'  },
  planned: { dot: '#a1a1aa', cls: 'mc-badge-planned', label: 'PLANNED' },
}

const STATUS_OPTIONS = ['planned', 'active', 'review']

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  : null

export function ProjectGrid({ projects, onProjectAdded, isModalOpen = false, setIsModalOpen }: ProjectGridProps) {
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [statusDropdownId, setStatusDropdownId] = useState<number | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const statusDropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setStatusDropdownId(null)
      }
    }
    if (statusDropdownId) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [statusDropdownId])

  const handleStatusChange = async (projectId: number, newStatus: string) => {
    if (!supabase) return
    
    setUpdatingId(projectId)
    setStatusDropdownId(null)

    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', projectId)

      if (error) {
        console.error('Error updating status:', error)
      } else {
        // Trigger parent to refetch projects
        if (onProjectAdded) onProjectAdded()
      }
    } catch (err) {
      console.error('Error updating status:', err)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleEditProject = (projectId: number) => {
    setEditingId(projectId)
  }

  return (
    <>
      <style>{MC_STYLES}</style>
      <div className="mc-root mc-card" style={{ padding: 0 }}>
      {/* Header with title and action buttons */}
      <div className="mc-card-header" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div className="mc-dot" style={{ background: '#22c55e' }} />
          <span className="mc-mono mc-label">ACTIVE PROJECTS</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => router.push('/done')}
            className="mc-mono"
            style={{
              fontSize: 12,
              color: '#a1a1aa',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'color 150ms ease-out',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = '#fafafa'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = '#a1a1aa'
            }}
          >
            Completed →
          </button>

          <button
            onClick={() => setIsModalOpen?.(true)}
            className="mc-mono"
            style={{
              fontSize: 12,
              whiteSpace: 'nowrap',
              padding: '4px 10px',
              background: 'transparent',
              border: '1px solid #3b82f6',
              color: '#3b82f6',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 150ms ease-out',
            }}
            onMouseEnter={(e) => {
              const target = e.currentTarget as HTMLButtonElement
              target.style.borderColor = '#60a5fa'
              target.style.color = '#60a5fa'
              target.style.background = 'rgba(59, 130, 246, 0.05)'
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget as HTMLButtonElement
              target.style.borderColor = '#3b82f6'
              target.style.color = '#3b82f6'
              target.style.background = 'transparent'
            }}
          >
            + New Project
          </button>
        </div>
      </div>        {/* Grid */}
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
                    {/* Status badge - clickable with dropdown */}
                    <div
                      ref={statusDropdownId === p.id ? statusDropdownRef : null}
                      style={{ position: 'relative' }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setStatusDropdownId(statusDropdownId === p.id ? null : p.id)
                        }}
                        disabled={updatingId === p.id}
                        className="mc-mono"
                        style={{
                          fontSize: 9,
                          padding: '4px 8px',
                          color: s.dot,
                          border: `1px solid ${s.dot}40`,
                          borderRadius: '4px',
                          background: `${s.dot}08`,
                          cursor: updatingId === p.id ? 'not-allowed' : 'pointer',
                          transition: 'all 0.15s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          opacity: updatingId === p.id ? 0.6 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (updatingId !== p.id) {
                            const elem = e.currentTarget as HTMLButtonElement
                            elem.style.background = `${s.dot}12`
                            elem.style.borderColor = `${s.dot}80`
                          }
                        }}
                        onMouseLeave={(e) => {
                          const elem = e.currentTarget as HTMLButtonElement
                          elem.style.background = `${s.dot}08`
                          elem.style.borderColor = `${s.dot}40`
                        }}
                        title="Click to change status"
                      >
                        <span style={{ width: 4, height: 4, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
                        {s.label}
                      </button>

                      {/* Status dropdown menu */}
                      {statusDropdownId === p.id && (
                        <div
                          style={{
                            position: 'absolute',
                            right: 0,
                            marginTop: 2,
                            background: '#18181b',
                            border: '1px solid #27272a',
                            borderRadius: '6px',
                            zIndex: 1000,
                            minWidth: 100,
                            overflow: 'hidden',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                          }}
                        >
                          {STATUS_OPTIONS.map((option) => {
                            const optionStatus = STATUS_MAP[option]
                            return (
                              <button
                                key={option}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleStatusChange(p.id, option)
                                }}
                                style={{
                                  width: '100%',
                                  padding: '6px 10px',
                                  background: p.status === option ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                  border: 'none',
                                  color: optionStatus.dot,
                                  fontSize: 11,
                                  fontWeight: 500,
                                  cursor: 'pointer',
                                  fontFamily: 'JetBrains Mono, monospace',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  transition: 'background 0.15s',
                                  borderBottom: option !== STATUS_OPTIONS[STATUS_OPTIONS.length - 1] ? '1px solid #27272a' : 'none',
                                  textAlign: 'left',
                                }}
                                onMouseEnter={(e) => {
                                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(59, 130, 246, 0.08)'
                                }}
                                onMouseLeave={(e) => {
                                  (e.currentTarget as HTMLButtonElement).style.background = p.status === option ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
                                }}
                              >
                                <span style={{ width: 4, height: 4, borderRadius: '50%', background: optionStatus.dot, flexShrink: 0 }} />
                                {option.charAt(0).toUpperCase() + option.slice(1)}
                                {p.status === option && <span style={{ marginLeft: 'auto', fontSize: 9 }}>✓</span>}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
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