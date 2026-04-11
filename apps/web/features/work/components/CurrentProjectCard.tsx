'use client'

import { useState, useEffect } from 'react'
import { useCurrentProject } from '@/store/useCurrentProject'
import { createPortal } from 'react-dom'

interface Project {
  id: string | number
  title: string
  status: 'active' | 'review' | 'planned'
  [key: string]: any
}

interface CurrentProjectCardProps {
  projects: Project[]
}

export function CurrentProjectCard({ projects }: CurrentProjectCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null)
  const { currentProjectId, setCurrentProject } = useCurrentProject()

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-select first active project on mount if none selected
  useEffect(() => {
    if (mounted && !currentProjectId && projects.length > 0) {
      const firstActive = projects.find((p) => p.status === 'active')
      if (firstActive) {
        setCurrentProject(firstActive.id.toString())
      }
    }
  }, [mounted, projects, currentProjectId, setCurrentProject])

  if (!mounted) {
    return (
      <div className="mc-card" style={{ position: 'relative' }}>
        <div className="mc-card-header" style={{ justifyContent: 'space-between' }}>
          <span className="mc-mono mc-label">CURRENT_PROJECT</span>
          <button className="text-xs text-zinc-400" disabled>
            Switch
          </button>
        </div>
        <div className="mc-card-body">
          <div className="text-sm text-zinc-300">Loading...</div>
        </div>
      </div>
    )
  }

  const activeProjects = projects.filter((p) => p.status === 'active')
  const currentProject = activeProjects.find((p) => p.id.toString() === currentProjectId)

  const handleSwitchClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setButtonRect(rect)
    setIsOpen(!isOpen)
  }

  const handleSelectProject = (projectId: string | number) => {
    setCurrentProject(projectId.toString())
    setIsOpen(false)
  }

  return (
    <>
      <div className="mc-card" style={{ position: 'relative' }}>
        <div className="mc-card-header" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="mc-mono mc-label">CURRENT_PROJECT</span>
          <button
            type="button"
            onClick={handleSwitchClick}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              color: '#a1a1aa',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ffffff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#a1a1aa'
            }}
          >
            Switch
          </button>
        </div>

        <div className="mc-card-body">
          <div className="text-sm text-zinc-300">
            {currentProject ? currentProject.title : 'No project selected'}
          </div>
        </div>
      </div>

      {/* Dropdown Portal */}
      {isOpen && buttonRect && createPortal(
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99998,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: buttonRect.bottom + 8,
              right: window.innerWidth - buttonRect.right,
              background: '#18181b',
              border: '1px solid #27272a',
              borderRadius: 8,
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              padding: 8,
              minWidth: 220,
              zIndex: 99999,
            }}
          >
            {activeProjects.map((project) => {
              const isSelected = project.id.toString() === currentProjectId
              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => handleSelectProject(project.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 12px',
                    fontSize: '14px',
                    color: '#e4e4e7',
                    borderRadius: '6px',
                    border: isSelected ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid transparent',
                    background: isSelected ? '#27272a' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = '#252529'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'transparent'
                    }
                  }}
                >
                  {isSelected && (
                    <div style={{
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      background: '#3b82f6',
                      flexShrink: 0,
                    }} />
                  )}
                  <span>{project.title}</span>
                </button>
              )
            })}
            {activeProjects.length === 0 && (
              <div className="px-3 py-2 text-sm text-zinc-500">No active projects</div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
