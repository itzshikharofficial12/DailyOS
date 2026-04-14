'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

interface ProjectFormData {
  title: string
  description: string
  status: 'active' | 'review' | 'planned'
  techStack: string[]
  projectType: string
  requirements: string
  goal: string
  githubUrl: string
  docsUrl: string
  liveUrl: string
  notes: string
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600&family=Syne:wght@400;500;600;700&display=swap');

  .form-root {
    font-family: 'Syne', sans-serif;
  }
  .mono {
    font-family: 'JetBrains Mono', monospace;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
  @keyframes scanline {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(400%); }
  }
  @keyframes pulse-ring {
    0% { box-shadow: 0 0 0 0 rgba(59,130,246,0.4); }
    70% { box-shadow: 0 0 0 6px rgba(59,130,246,0); }
    100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
  }
  @keyframes status-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  .cursor-blink::after {
    content: '▮';
    animation: blink 1s step-end infinite;
    color: #3b82f6;
    margin-left: 2px;
    font-size: 0.65em;
  }

  .scan-container {
    position: relative;
    overflow: hidden;
  }
  .scan-container::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, transparent 0%, rgba(59,130,246,0.03) 50%, transparent 100%);
    height: 40%;
    animation: scanline 4s linear infinite;
    pointer-events: none;
    z-index: 1;
  }

  .system-input {
    background: #18181b;
    border: 1px solid #27272a;
    border-radius: 6px;
    padding: 12px 12px;
    font-size: 13px;
    color: #f4f4f5;
    width: 100%;
    transition: border-color 0.2s, box-shadow 0.2s, background-color 0.2s;
    font-family: 'JetBrains Mono', monospace;
    outline: none;
    line-height: 1.6;
  }
  .system-input::placeholder { color: #a1a1aa; }
  .system-input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px #3b82f6;
    background: #18181b;
  }

  .section-panel {
    background: rgba(9,9,11,0.6);
    border: 1px solid rgba(39,39,42,1);
    border-radius: 10px;
    overflow: hidden;
  }
  .section-header {
    background: rgba(24,24,27,0.9);
    border-bottom: 1px solid rgba(39,39,42,1);
    padding: 10px 16px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .section-body {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .field-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #71717a;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
    line-height: 1.4;
  }
  .field-label::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 4px;
    border: 1px solid #3b82f6;
    border-radius: 50%;
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    animation: status-pulse 2s ease-in-out infinite;
  }

  .submit-btn {
    position: relative;
    width: 100%;
    padding: 14px;
    background: #1d4ed8;
    border: 1px solid rgba(59,130,246,0.5);
    border-radius: 8px;
    color: white;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    overflow: hidden;
  }
  .submit-btn::before {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 100%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
    transition: left 0.5s;
  }
  .submit-btn:hover { background: #2563eb; border-color: rgba(96,165,250,0.6); }
  .submit-btn:hover::before { left: 100%; }

  .corner-tl, .corner-tr, .corner-bl, .corner-br {
    position: absolute;
    width: 8px; height: 8px;
  }
  .corner-tl { top: 0; left: 0; border-top: 1px solid #3b82f6; border-left: 1px solid #3b82f6; border-radius: 2px 0 0 0; }
  .corner-tr { top: 0; right: 0; border-top: 1px solid #3b82f6; border-right: 1px solid #3b82f6; border-radius: 0 2px 0 0; }
  .corner-bl { bottom: 0; left: 0; border-bottom: 1px solid #3b82f6; border-left: 1px solid #3b82f6; border-radius: 0 0 0 2px; }
  .corner-br { bottom: 0; right: 0; border-bottom: 1px solid #3b82f6; border-right: 1px solid #3b82f6; border-radius: 0 0 2px 0; }

  .tech-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    background: rgba(59,130,246,0.1);
    border: 1px solid rgba(59,130,246,0.25);
    border-radius: 4px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: #93c5fd;
  }
  .tech-tag::before {
    content: '#';
    color: #3b82f6;
    font-size: 10px;
  }
`

const SECTION_ICONS: Record<string, string> = {
  basic: '◈',
  tech: '⬡',
  execution: '◎',
  resources: '⊞',
  notes: '≡',
}

export function ProjectForm({ onProjectAdded, projectId }: { onProjectAdded?: () => void; projectId?: number }) {
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    status: 'active',
    techStack: [],
    projectType: '',
    requirements: '',
    goal: '',
    githubUrl: '',
    docsUrl: '',
    liveUrl: '',
    notes: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch project data if editing
  useEffect(() => {
    if (projectId) {
      const fetchProject = async () => {
        try {
          setIsLoading(true)
          const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single()

          if (error) {
            console.error('Error fetching project:', error)
            return
          }

          if (data) {
            setFormData({
              title: data.title || '',
              description: data.desc || data.description || '',
              status: data.status || 'active',
              techStack: Array.isArray(data.tech_stack) ? data.tech_stack : [],
              projectType: data.project_type || '',
              requirements: data.requirements || '',
              goal: data.goal || '',
              githubUrl: data.github_url || '',
              docsUrl: data.docs_url || '',
              liveUrl: data.live_url || '',
              notes: data.notes || '',
            })
          }
        } catch (err) {
          console.error('Error loading project:', err)
        } finally {
          setIsLoading(false)
        }
      }

      fetchProject()
    }
  }, [projectId])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleTechStackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const techStack = e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
    setFormData((prev) => ({ ...prev, techStack }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prepare data - MATCH DB COLUMNS EXACTLY
    const projectData = {
      title: formData.title || '',
      description: formData.description || '',
      status: formData.status.toLowerCase(),     // Ensure lowercase
      tech_stack: formData.techStack && formData.techStack.length > 0
        ? formData.techStack
        : [],  // Convert to array if needed
      requirements: formData.requirements || '',
      goal: formData.goal || '',
      notes: formData.notes || '',
      github_url: formData.githubUrl || null,
      docs_url: formData.docsUrl || null,
      live_url: formData.liveUrl || null,
    }

    try {
      let result
      if (projectId) {
        // Update existing project
        result = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', projectId)
          .select()
      } else {
        // Insert new project
        result = await supabase
          .from('projects')
          .insert([projectData])
          .select()
      }
      
      const { data, error } = result
      console.log('SAVE DATA:', data)
      console.log('SAVE ERROR:', error)
      
      if (error) {
        console.error('Error saving project:', error.message || error)
        return
      }
      
      console.log('Project saved successfully:', data)
      
      // Reset form on success
      setFormData({
        title: '',
        description: '',
        status: 'active',
        techStack: [],
        projectType: '',
        requirements: '',
        goal: '',
        githubUrl: '',
        docsUrl: '',
        liveUrl: '',
        notes: '',
      })
      
      // Show success message
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 2500)
      
      // Trigger refetch of projects
      if (onProjectAdded) {
        onProjectAdded()
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  const now = new Date()
  const timestamp = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')} ${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')} UTC`

  return (
    <div className="form-root" style={{ maxWidth: 620, margin: '0 auto' }}>
      <style>{styles}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div className="mono" style={{ fontSize: 10, color: '#3f3f46', letterSpacing: '0.1em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#3b82f6' }}>SYS</span>
          <span style={{ color: '#27272a' }}>|</span>
          <span>PROJECT_INIT</span>
          <span style={{ color: '#27272a' }}>|</span>
          <span>{timestamp}</span>
        </div>
        <h2 className="cursor-blink" style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color: '#fafafa', margin: 0, letterSpacing: '-0.02em' }}>
          Initialize Project
        </h2>
        <p className="mono" style={{ fontSize: 11, color: '#52525b', marginTop: 6 }}>
          Registering new project context to mission database
        </p>

        {/* Status bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 14, padding: '8px 12px', background: 'rgba(9,9,11,0.8)', border: '1px solid rgba(39,39,42,0.8)', borderRadius: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className="status-dot" style={{ background: '#22c55e' }} />
            <span className="mono" style={{ fontSize: 10, color: '#52525b' }}>SERVER ONLINE</span>
          </div>
          <div style={{ width: 1, height: 12, background: '#27272a' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className="status-dot" style={{ background: '#3b82f6', animationDelay: '0.5s' }} />
            <span className="mono" style={{ fontSize: 10, color: '#52525b' }}>DB CONNECTED</span>
          </div>
          <div style={{ width: 1, height: 12, background: '#27272a' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className="status-dot" style={{ background: '#f59e0b', animationDelay: '1s' }} />
            <span className="mono" style={{ fontSize: 10, color: '#52525b' }}>AWAITING INPUT</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Basic Info */}
        <div className="section-panel scan-container">
          <div className="section-header">
            <span style={{ color: '#3b82f6', fontSize: 14 }}>{SECTION_ICONS.basic}</span>
            <span className="mono text-xs text-zinc-400 tracking-wide" style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}>BASIC_INFO</span>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 16, height: 1, background: '#27272a' }} />
              <span className="mono" style={{ fontSize: 9, color: '#3f3f46' }}>01</span>
            </div>
          </div>
          <div className="section-body">
            <div>
              <div className="field-label">Project Title</div>
              <div style={{ position: 'relative' }}>
                <div className="corner-tl" /><div className="corner-tr" /><div className="corner-bl" /><div className="corner-br" />
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter project designation..."
                  className="system-input"
                  style={{ paddingLeft: 14 }}
                />
              </div>
            </div>
            <div>
              <div className="field-label">Description</div>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Mission brief..."
                rows={3}
                className="system-input"
                style={{ resize: 'none' }}
              />
            </div>
            <div>
              <div className="field-label">Status</div>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="system-input"
                style={{ appearance: 'none', cursor: 'pointer' }}
              >
                <option value="active">● ACTIVE — Currently in development</option>
                <option value="review">◐ REVIEW — Pending evaluation</option>
                <option value="planned">○ PLANNED — Queued for execution</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="section-panel">
          <div className="section-header">
            <span style={{ color: '#3b82f6', fontSize: 14 }}>{SECTION_ICONS.tech}</span>
            <span className="mono text-xs text-zinc-400 tracking-wide" style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}>TECH_STACK</span>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 16, height: 1, background: '#27272a' }} />
              <span className="mono" style={{ fontSize: 9, color: '#3f3f46' }}>02</span>
            </div>
          </div>
          <div className="section-body">
            <div>
              <div className="field-label">Technologies (comma-separated)</div>
              <input
                type="text"
                value={formData.techStack.join(', ')}
                onChange={handleTechStackChange}
                placeholder="React, TypeScript, Supabase, Tailwind..."
                className="system-input"
              />
              {formData.techStack.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                  {formData.techStack.map((t) => (
                    <span key={t} className="tech-tag">{t}</span>
                  ))}
                </div>
              )}
            </div>
            <div>
              <div className="field-label">Project Type</div>
              <input
                type="text"
                name="projectType"
                value={formData.projectType}
                onChange={handleInputChange}
                placeholder="Frontend / Backend / Full-stack / CLI..."
                className="system-input"
              />
            </div>
          </div>
        </div>

        {/* Execution */}
        <div className="section-panel">
          <div className="section-header">
            <span style={{ color: '#3b82f6', fontSize: 14 }}>{SECTION_ICONS.execution}</span>
            <span className="mono text-xs text-zinc-400 tracking-wide" style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}>EXECUTION</span>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 16, height: 1, background: '#27272a' }} />
              <span className="mono" style={{ fontSize: 9, color: '#3f3f46' }}>03</span>
            </div>
          </div>
          <div className="section-body">
            <div>
              <div className="field-label">Requirements</div>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                placeholder="List functional and non-functional requirements..."
                rows={3}
                className="system-input"
                style={{ resize: 'none' }}
              />
            </div>
            <div>
              <div className="field-label">Mission Goal</div>
              <textarea
                name="goal"
                value={formData.goal}
                onChange={handleInputChange}
                placeholder="Define the primary objective and success metrics..."
                rows={3}
                className="system-input"
                style={{ resize: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="section-panel">
          <div className="section-header">
            <span style={{ color: '#3b82f6', fontSize: 14 }}>{SECTION_ICONS.resources}</span>
            <span className="mono text-xs text-zinc-400 tracking-wide" style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}>RESOURCE_LINKS</span>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 16, height: 1, background: '#27272a' }} />
              <span className="mono" style={{ fontSize: 9, color: '#3f3f46' }}>04</span>
            </div>
          </div>
          <div className="section-body">
            {[
              { name: 'githubUrl', label: 'GitHub Repository', placeholder: 'https://github.com/org/repo' },
              { name: 'docsUrl', label: 'Documentation', placeholder: 'https://docs.example.com' },
              { name: 'liveUrl', label: 'Live Endpoint', placeholder: 'https://app.example.com' },
            ].map((field) => (
              <div key={field.name}>
                <div className="field-label">{field.label}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                  <div className="mono" style={{
                    padding: '10px 10px',
                    background: 'rgba(39,39,42,0.5)',
                    border: '1px solid rgba(63,63,70,0.8)',
                    borderRight: 'none',
                    borderRadius: '6px 0 0 6px',
                    fontSize: 11,
                    color: '#3b82f6',
                  }}>
                    ⊹
                  </div>
                  <input
                    type="url"
                    name={field.name}
                    value={formData[field.name as keyof ProjectFormData] as string}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    className="system-input"
                    style={{ borderRadius: '0 6px 6px 0' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="section-panel">
          <div className="section-header">
            <span style={{ color: '#3b82f6', fontSize: 14 }}>{SECTION_ICONS.notes}</span>
            <span className="mono text-xs text-zinc-400 tracking-wide" style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}>MISSION_LOG</span>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 16, height: 1, background: '#27272a' }} />
              <span className="mono" style={{ fontSize: 9, color: '#3f3f46' }}>05</span>
            </div>
          </div>
          <div className="section-body">
            <div>
              <div className="field-label">Additional Notes</div>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Append supplemental data, risks, or context..."
                rows={4}
                className="system-input"
                style={{ resize: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div style={{ marginTop: 6 }}>
          <button type="submit" className="submit-btn">
            {submitted ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{ color: '#22c55e' }}>✓</span> PROJECT REGISTERED
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{ color: '#93c5fd' }}>▶</span> INITIALIZE PROJECT
              </span>
            )}
          </button>
          <p className="mono" style={{ textAlign: 'center', fontSize: 10, color: '#3f3f46', marginTop: 10 }}>
            DATA WILL BE COMMITTED TO MISSION DB · SUPABASE LAYER
          </p>
        </div>

      </form>
    </div>
  )
}