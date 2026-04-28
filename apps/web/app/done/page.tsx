'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

// Initialize Supabase client - only if env vars exist
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  : null

export default function DoneProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Fetch done projects from Supabase
  const fetchProjects = async () => {
    try {
      setIsLoading(true)
      setError(null)

      if (!supabase) {
        setError('Database not configured')
        setProjects([])
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'done')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching projects:', error)
        setError(error.message)
        setProjects([])
        return
      }

      if (data && data.length > 0) {
        // Map Supabase columns to component props
        const mappedProjects = data.map((project: any) => ({
          id: project.id,
          title: project.title,
          desc: project.description,
          status: project.status,
          tags: project.tech_stack || [],
          github_url: project.github_url,
          docs_url: project.docs_url,
          live_url: project.live_url,
        }))
        setProjects(mappedProjects)
      } else {
        setProjects([])
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
      setProjects([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const doneProjects = projects.filter(p => p.status === 'done')

  const handleStatusChange = async (projectId: number, newStatus: string) => {
    if (!supabase) return

    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', projectId)

      if (error) {
        console.error(error)
        return
      }

      // Update state immediately
      setProjects(prev =>
        prev.map(p =>
          p.id === projectId
            ? { ...p, status: newStatus }
            : p
        )
      )
    } catch (err) {
      console.error('Error updating status:', err)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: 20,
        background: '#09090b',
        minHeight: '100vh',
        fontFamily: 'Syne, sans-serif',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h1 className="mc-mono" style={{ fontSize: 18, fontWeight: 600, color: '#fafafa', margin: 0 }}>
          Done Projects
        </h1>

        <button
          onClick={() => router.push('/work')}
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
            const target = e.currentTarget as HTMLButtonElement
            target.style.color = '#fafafa'
          }}
          onMouseLeave={(e) => {
            const target = e.currentTarget as HTMLButtonElement
            target.style.color = '#a1a1aa'
          }}
        >
          ← Back
        </button>
      </div>

      {/* Projects Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {doneProjects.length === 0 ? (
          <p className="mc-mono" style={{ fontSize: 12, color: '#52525b', margin: 0 }}>
            No completed projects yet.
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {doneProjects.map(project => (
              <div
                key={project.id}
                style={{
                  background: 'rgba(9,9,11,0.8)',
                  border: '1px solid rgba(39,39,42,0.8)',
                  borderRadius: 8,
                  padding: 12,
                  transition: 'background 0.15s, border-color 0.15s',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'visible',
                }}
              >
                <span className="mc-mono" style={{ position: 'absolute', top: 8, right: 10, fontSize: 9, color: '#27272a' }}>
                  {String(doneProjects.indexOf(project) + 1).padStart(2, '0')}
                </span>

                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                  <div style={{ flex: 1 }}>
                    <span className="mc-mono" style={{ fontSize: 12, fontWeight: 600, color: '#d4d4d8' }}>
                      {project.title}
                    </span>
                  </div>
                </div>

                <p className="mc-mono" style={{ fontSize: 10, color: '#52525b', marginBottom: 10, lineHeight: 1.5 }}>
                  {project.desc}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {project.tags?.map((tag: string) => (
                    <span key={tag} className="mc-tag" style={{ fontSize: 9 }}>
                      <span style={{ color: '#3b82f6', marginRight: 2 }}>#</span>{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}