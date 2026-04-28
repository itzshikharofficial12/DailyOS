'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { GreetingHeader } from '@/features/work/components/GreetingHeader'
import { CurrentProjectCard } from '@/features/work/components/CurrentProjectCard'
import { Hero } from '@/features/work/components/Hero'
import { TaskList } from '@/features/work/components/TaskListRefactored'
import { FocusTimer } from '@/features/work/components/FocusTimerRefactored'
import { ProjectGrid } from '@/features/work/components/ProjectGrid'
import { ScheduleList } from '@/features/work/components/ScheduleList'
import { QuickStats } from '@/features/work/components/QuickStatsRefactored'
import { IdeasPanel } from '@/features/work/components/IdeasPanelRefactored'
import { LinksPanel } from '@/features/work/components/LinksPanelRefactored'
import { ProjectForm } from '@/features/work/components/ProjectForm'
import { ProjectModal } from '@/features/work/components/ProjectModal'

// Initialize Supabase client - only if env vars exist
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  : null

const SCHEDULE = [
  { label: 'Standup call',        time: '9:00 AM',   type: 'upcoming' },
  { label: 'Design review',       time: '11:30 AM',  type: 'upcoming' },
  { label: 'Merged feature/auth', time: 'Yesterday', type: 'done'     },
  { label: 'Deployed v1.4.2',     time: 'Yesterday', type: 'done'     },
  { label: 'Team retrospective',  time: 'Tomorrow',  type: 'upcoming' },
]

const LINKS = [
  { label: 'GitHub',   href: 'https://github.com'   },
  { label: 'LinkedIn', href: 'https://linkedin.com' },
  { label: 'Figma',    href: 'https://figma.com'    },
  { label: 'Notion',   href: 'https://notion.so'    },
  { label: 'Vercel',   href: 'https://vercel.com'   },
]

const STATS = [
  { label: 'Tasks Done', value: '24'  },
  { label: 'PRs Merged', value: '8'   },
  { label: 'Focus Hrs',  value: '3.5' },
  { label: 'Streak',     value: '12d' },
]

export default function WorkPage() {
  const [newTask, setNewTask] = useState('')
  const [goal, setGoal]       = useState('')
  const [projects, setProjects] = useState<any[]>([])  // Start with empty array
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()

  // Fetch projects from Supabase
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
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching projects:', error)
        setError(error.message)
        setProjects([])  // Show empty state instead of fallback
        return
      }

      if (data && data.length > 0) {
        // Map Supabase columns to component props
        const mappedProjects = data.map((project: any) => ({
          id: project.id,
          title: project.title,
          desc: project.description,  // Map DB 'description' to 'desc'
          status: project.status,
          tags: project.tech_stack || [],  // Map DB 'tech_stack' to 'tags'
          github_url: project.github_url,
          docs_url: project.docs_url,
          live_url: project.live_url,
        }))
        setProjects(mappedProjects)
      } else {
        // No projects in DB - show empty
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

  const activeProjects = projects.filter(project => ['active', 'planned'].includes(project.status))
  const doneProjects = projects.filter(project => project.status === 'done')

  const handleStatusChange = (projectId: number, newStatus: string) => {
    setProjects(prev =>
      prev.map(p =>
        p.id === projectId
          ? { ...p, status: newStatus }
          : p
      )
    )
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
      {/* GREETING HEADER */}
      <div style={{ marginBottom: 24 }}>
        <GreetingHeader />
      </div>

      {/* MAIN CONTENT */}
      <div
        style={{
          display: 'flex',
          gap: 16,
        }}
      >
        {/* LEFT MAIN */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Top grid: Hero, Task, FocusTimer */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Hero goal={goal} onGoalChange={setGoal} projects={projects} />
            <TaskList newTask={newTask} onNewTaskChange={setNewTask} />
            <FocusTimer />

          </div>

          {/* Full width: Active Projects */}
          <ProjectGrid 
            projects={activeProjects} 
            onProjectAdded={fetchProjects}
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            onStatusChange={handleStatusChange}
          />
          <ScheduleList schedule={SCHEDULE} />
        </div>

        {/* RIGHT PANEL */}
        <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <CurrentProjectCard projects={projects} />
          <QuickStats stats={STATS} />
          <IdeasPanel />
          <LinksPanel links={LINKS} />
        </div>
      </div>

      {isModalOpen && (
        <ProjectModal onClose={() => setIsModalOpen(false)}>
          <ProjectForm onProjectAdded={() => {
            setIsModalOpen(false)
            fetchProjects()
          }} />
        </ProjectModal>
      )}
    </div>
  )
}