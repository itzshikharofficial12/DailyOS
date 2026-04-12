'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import TaskList from '@/features/work/components/TaskList'
import { IdeasPanel } from '@/features/work/components/IdeasPanelRefactored'
import { getVSCodeUrl } from '@/lib/github'

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  : null

interface Project {
  id: number
  title: string
  description: string
  status: 'active' | 'review' | 'planned'
  tech_stack: string[]
  requirements: string
  goal: string
  notes: string
  github_url: string | null
  docs_url: string | null
  live_url: string | null
  created_at: string
}

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  active: { color: '#3b82f6', label: 'ACTIVE' },
  review: { color: '#f59e0b', label: 'REVIEW' },
  planned: { color: '#52525b', label: 'PLANNED' },
}

export default function ProjectDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true)
        setError(null)

        if (!supabase) {
          setError('Database not configured')
          setLoading(false)
          return
        }

        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single()

        if (error) {
          console.error('Error fetching project:', error)
          setError(error.message)
          return
        }

        if (data) {
          setProject(data)
        } else {
          setError('Project not found')
        }
      } catch (err) {
        console.error('Error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [id])

  const handleDeleteProject = async () => {
    const confirmDelete = confirm("Are you sure you want to delete this project?")

    if (!confirmDelete) return

    if (!supabase) {
      setError('Database not configured')
      return
    }

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("PROJECT DELETE ERROR:", error.message || error)
      return
    }

    // redirect after delete
    router.push("/work")
  }

  const handleBuild = () => {
    if (!project?.github_url) {
      console.warn('No GitHub URL available')
      return
    }

    const vscodeUrl = getVSCodeUrl(project.github_url)

    if (!vscodeUrl) {
      console.error('Failed to generate VS Code URL from:', project.github_url)
      return
    }

    console.log('Opening VS Code URL:', vscodeUrl)
    
    // Open VS Code web editor
    if (typeof window !== 'undefined') {
      window.open(vscodeUrl, "_blank")
    }
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#09090b',
        color: '#a1a1aa',
        fontFamily: 'Syne, sans-serif',
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 14, marginBottom: 8 }}>Loading project...</p>
          <div style={{
            width: 24,
            height: 24,
            border: '2px solid #27272a',
            borderTop: '2px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto',
          }} />
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#09090b',
        color: '#ef4444',
        fontFamily: 'Syne, sans-serif',
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 14 }}>Error: {error || 'Project not found'}</p>
          <a
            href="/work"
            style={{
              display: 'inline-block',
              marginTop: 16,
              padding: '8px 16px',
              background: '#1d4ed8',
              color: '#ffffff',
              border: '1px solid rgba(59, 130, 246, 0.5)',
              borderRadius: 6,
              fontSize: 12,
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = '#2563eb'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = '#1d4ed8'
            }}
          >
            ← Back to Projects
          </a>
        </div>
      </div>
    )
  }

  const statusInfo = STATUS_MAP[project.status] || STATUS_MAP.planned

  return (
    <div style={{
      background: '#09090b',
      minHeight: '100vh',
      padding: '40px 20px',
      fontFamily: 'Syne, sans-serif',
      color: '#e4e4e7',
    }}>
      <div style={{
        maxWidth: '56rem',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}>
        {/* Back button */}
        <button
          onClick={() => router.push('/work')}
          style={{
            background: 'none',
            border: 'none',
            color: '#a1a1aa',
            fontSize: 14,
            cursor: 'pointer',
            transition: 'color 0.2s',
            padding: 0,
            fontFamily: 'Syne, sans-serif',
            textAlign: 'left',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.color = '#ffffff'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.color = '#a1a1aa'
          }}
        >
          ← Back
        </button>

        {/* Header section */}
        <div style={{
          paddingBottom: '24px',
          borderBottom: '1px solid rgba(39,39,42,0.6)',
        }}>
          {/* Status badge and delete button */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: statusInfo.color,
              }} />
              <span style={{
                fontSize: 11,
                color: '#a1a1aa',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontFamily: 'JetBrains Mono, monospace',
              }}>
                {statusInfo.label}
              </span>
            </div>
            <button
              onClick={handleDeleteProject}
              style={{
                fontSize: 11,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: '#f87171',
                border: '1px solid rgba(244, 63, 94, 0.2)',
                padding: '6px 12px',
                borderRadius: '6px',
                background: 'transparent',
                cursor: 'pointer',
                fontFamily: 'JetBrains Mono, monospace',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.color = '#fca5a5'
                el.style.background = 'rgba(244, 63, 94, 0.1)'
                el.style.borderColor = 'rgba(244, 63, 94, 0.3)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.color = '#f87171'
                el.style.background = 'transparent'
                el.style.borderColor = 'rgba(244, 63, 94, 0.2)'
              }}
            >
              DELETE
            </button>
            <button
              onClick={handleBuild}
              disabled={!project?.github_url}
              style={{
                fontSize: 11,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: project?.github_url ? '#60a5fa' : '#71717a',
                border: `1px solid ${project?.github_url ? 'rgba(59,130,246,0.2)' : 'rgba(113,113,122,0.2)'}`,
                padding: '6px 12px',
                borderRadius: '6px',
                background: 'transparent',
                cursor: project?.github_url ? 'pointer' : 'not-allowed',
                fontFamily: 'JetBrains Mono, monospace',
                transition: 'all 0.2s',
                opacity: project?.github_url ? 1 : 0.5,
              }}
              onMouseEnter={(e) => {
                if (project?.github_url) {
                  const el = e.currentTarget as HTMLButtonElement
                  el.style.color = '#93c5fd'
                  el.style.background = 'rgba(59,130,246,0.1)'
                  el.style.borderColor = 'rgba(59,130,246,0.3)'
                }
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.color = project?.github_url ? '#60a5fa' : '#71717a'
                el.style.background = 'transparent'
                el.style.borderColor = project?.github_url ? 'rgba(59,130,246,0.2)' : 'rgba(113,113,122,0.2)'
              }}
            >
              OPEN IN VSCODE
            </button>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: 36,
            fontWeight: 700,
            margin: 0,
            marginBottom: 12,
            color: '#fafafa',
            letterSpacing: '-0.01em',
            lineHeight: 1.2,
          }}>
            {project.title}
          </h1>

          {/* Description */}
          <p style={{
            fontSize: 14,
            color: '#a1a1aa',
            margin: 0,
            lineHeight: 1.6,
            maxWidth: '90%',
          }}>
            {project.description}
          </p>

          {/* Meta info */}
          <div style={{
            marginTop: 12,
            fontSize: 11,
            color: '#71717a',
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            Created {new Date(project.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </div>
        </div>

        {/* Tech stack */}
        {project.tech_stack && project.tech_stack.length > 0 && (
          <div style={{
            paddingBottom: '24px',
            borderBottom: '1px solid rgba(39,39,42,0.6)',
          }}>
            <div style={{
              fontSize: 11,
              color: '#71717a',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: 14,
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              TECH STACK
            </div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
            }}>
              {project.tech_stack.map((tech) => (
                <span
                  key={tech}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '6px 12px',
                    background: 'rgba(59,130,246,0.08)',
                    border: '1px solid rgba(59,130,246,0.25)',
                    borderRadius: 4,
                    fontSize: 12,
                    color: '#60a5fa',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  <span style={{ color: '#3b82f6', fontSize: 10 }}>#</span>{tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Execution section */}
        {(project.requirements || project.goal) && (
          <div style={{
            paddingBottom: '24px',
            borderBottom: '1px solid rgba(39,39,42,0.6)',
          }}>
            <div style={{
              fontSize: 11,
              color: '#71717a',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: 14,
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              EXECUTION
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}>
              {/* Requirements */}
              {project.requirements && (
                <div>
                  <div style={{
                    fontSize: 11,
                    color: '#a1a1aa',
                    letterSpacing: '0.08em',
                    marginBottom: 8,
                    fontFamily: 'JetBrains Mono, monospace',
                  }}>
                    Requirements
                  </div>
                  <div style={{
                    background: 'rgba(24,24,27,0.5)',
                    border: '1px solid rgba(39,39,42,0.8)',
                    borderRadius: 6,
                    padding: 12,
                    fontSize: 13,
                    color: '#d4d4d8',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}>
                    {project.requirements}
                  </div>
                </div>
              )}

              {/* Goal */}
              {project.goal && (
                <div>
                  <div style={{
                    fontSize: 11,
                    color: '#a1a1aa',
                    letterSpacing: '0.08em',
                    marginBottom: 8,
                    fontFamily: 'JetBrains Mono, monospace',
                  }}>
                    Mission Goal
                  </div>
                  <div style={{
                    background: 'rgba(24,24,27,0.5)',
                    border: '1px solid rgba(39,39,42,0.8)',
                    borderRadius: 6,
                    padding: 12,
                    fontSize: 13,
                    color: '#d4d4d8',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}>
                    {project.goal}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes section */}
        {project.notes && (
          <div style={{
            paddingBottom: '24px',
            borderBottom: '1px solid rgba(39,39,42,0.6)',
          }}>
            <div style={{
              fontSize: 11,
              color: '#71717a',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: 14,
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              NOTES
            </div>
            <div style={{
              background: 'rgba(24,24,27,0.5)',
              border: '1px solid rgba(39,39,42,0.8)',
              borderRadius: 6,
              padding: 12,
              fontSize: 13,
              color: '#d4d4d8',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              {project.notes}
            </div>
          </div>
        )}

        {/* Links section */}
        {(project.github_url || project.docs_url || project.live_url) && (
          <div>
            <div style={{
              fontSize: 11,
              color: '#71717a',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: 14,
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              RESOURCES
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 10,
            }}>
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '10px 14px',
                    background: 'rgba(59,130,246,0.08)',
                    border: '1px solid rgba(59,130,246,0.2)',
                    borderRadius: 6,
                    color: '#60a5fa',
                    fontSize: 12,
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    fontFamily: 'JetBrains Mono, monospace',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement
                    el.style.background = 'rgba(59,130,246,0.15)'
                    el.style.borderColor = 'rgba(59,130,246,0.4)'
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement
                    el.style.background = 'rgba(59,130,246,0.08)'
                    el.style.borderColor = 'rgba(59,130,246,0.2)'
                  }}
                >
                  <span>⊹</span> GitHub
                </a>
              )}
              {project.docs_url && (
                <a
                  href={project.docs_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '10px 14px',
                    background: 'rgba(59,130,246,0.08)',
                    border: '1px solid rgba(59,130,246,0.2)',
                    borderRadius: 6,
                    color: '#60a5fa',
                    fontSize: 12,
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    fontFamily: 'JetBrains Mono, monospace',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement
                    el.style.background = 'rgba(59,130,246,0.15)'
                    el.style.borderColor = 'rgba(59,130,246,0.4)'
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement
                    el.style.background = 'rgba(59,130,246,0.08)'
                    el.style.borderColor = 'rgba(59,130,246,0.2)'
                  }}
                >
                  <span>📖</span> Documentation
                </a>
              )}
              {project.live_url && (
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '10px 14px',
                    background: 'rgba(59,130,246,0.08)',
                    border: '1px solid rgba(59,130,246,0.2)',
                    borderRadius: 6,
                    color: '#60a5fa',
                    fontSize: 12,
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    fontFamily: 'JetBrains Mono, monospace',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement
                    el.style.background = 'rgba(59,130,246,0.15)'
                    el.style.borderColor = 'rgba(59,130,246,0.4)'
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement
                    el.style.background = 'rgba(59,130,246,0.08)'
                    el.style.borderColor = 'rgba(59,130,246,0.2)'
                  }}
                >
                  <span>🚀</span> Live
                </a>
              )}
            </div>
          </div>
        )}

        {/* Task List */}
        {project.id && <TaskList/>}

        {/* Ideas Panel */}
        {project.id && <IdeasPanel/>}

        {/* Metadata footer */}
        <div style={{
          paddingTop: 16,
          borderTop: '1px solid rgba(39,39,42,0.6)',
          fontSize: 11,
          color: '#71717a',
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          ID: {project.id}
        </div>
      </div>
    </div>
  )
}
