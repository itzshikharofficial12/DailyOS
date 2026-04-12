'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Task {
  id: number
  text: string
  done: boolean
}

interface TaskListProps {
  newTask: string
  onNewTaskChange: (task: string) => void
}

export function TaskList({ newTask, onNewTaskChange }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const { data, error: supabaseError } = await supabase
        .from('tasks').select('*').order('created_at', { ascending: false })
      if (supabaseError) throw supabaseError
      setTasks(data || [])
      setError(null)
    } catch (err) {
      setError('ERR: Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTasks() }, [])

  const handleAddTask = async () => {
    if (!newTask.trim()) return
    try {
      const { data, error: supabaseError } = await supabase
        .from('tasks').insert([{ text: newTask.trim(), done: false }]).select()
      if (supabaseError) throw supabaseError
      if (data?.length) setTasks((prev) => [data[0], ...prev])
      onNewTaskChange('')
      setError(null)
    } catch {
      setError('ERR: Failed to add task')
    }
  }

  const toggleTask = async (id: number) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return
    try {
      const { error: supabaseError } = await supabase
        .from('tasks').update({ done: !task.done }).eq('id', id)
      if (supabaseError) throw supabaseError
      setTasks((prev) => prev.map((t) => t.id === id ? { ...t, done: !t.done } : t))
    } catch {
      setError('ERR: Failed to update task')
    }
  }

  const deleteTask = async (id: number) => {
    try {
      console.log('Deleting task:', id)
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('TASK DELETE ERROR:', error.message || error)
        return
      }

      console.log('Task deleted successfully')
      setTasks((prev) => prev.filter((task) => task.id !== id))
    } catch (err) {
      console.error('Delete catch error:', err)
    }
  }

  const handleEditTask = (taskId: number, currentText: string) => {
    setEditingId(taskId)
    setEditValue(currentText)
  }

  const handleSaveEdit = async (taskId: number) => {
    if (!editValue.trim()) {
      setEditingId(null)
      return
    }

    try {
      const { error: supabaseError } = await supabase
        .from('tasks')
        .update({ text: editValue })
        .eq('id', taskId)

      if (supabaseError) throw supabaseError

      console.log('Task updated successfully')
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? { ...task, text: editValue } : task))
      )
      setEditingId(null)
    } catch (err) {
      console.error('Edit save error:', err)
      setError('ERR: Failed to update task')
    }
  }

  const done = tasks.filter((t) => t.done).length

  return (
    <>
      <div className="mc-root mc-card" style={{ padding: 0 }}>
        <div className="mc-corner mc-corner-tl" /><div className="mc-corner mc-corner-tr" />
        <div className="mc-corner mc-corner-bl" /><div className="mc-corner mc-corner-br" />

        {/* Header */}
        <div className="mc-card-header" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#3b82f6', fontSize: 12 }}>◈</span>
            <span className="mc-mono mc-label">TASK_QUEUE</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="mc-mono mc-label">{done}/{tasks.length}</span>
            <div className="mc-dot" style={{ background: loading ? '#f59e0b' : '#22c55e' }} />
          </div>
        </div>

        <div className="mc-card-body" style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Add input */}
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={newTask}
              onChange={(e) => onNewTaskChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              placeholder="Append task to queue..."
              className="mc-input"
              style={{ flex: 1 }}
            />
            <button onClick={handleAddTask} className="mc-btn-primary" style={{ whiteSpace: 'nowrap' }}>
              + ADD
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mc-mono" style={{ fontSize: 10, color: '#f87171', padding: '8px 10px', background: 'rgba(239,68,68,0.06)', borderRadius: 4, border: '1px solid rgba(239,68,68,0.15)' }}>
              {error}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="mc-mono" style={{ fontSize: 10, color: '#3f3f46', textAlign: 'center', padding: '16px 0' }}>
              FETCHING TASK DATA...
            </div>
          ) : (
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="group"
                  onClick={() => toggleTask(task.id)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, cursor: 'pointer', padding: '6px 8px', borderRadius: 6, border: '1px solid transparent', transition: 'border-color 0.15s, background 0.15s' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLLIElement).style.borderColor = 'rgba(39,39,42,0.8)'
                    ;(e.currentTarget as HTMLLIElement).style.background = 'rgba(24,24,27,0.5)'
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLLIElement).style.borderColor = 'transparent'
                    ;(e.currentTarget as HTMLLIElement).style.background = 'transparent'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                    {/* Checkbox */}
                    <span style={{
                      width: 14, height: 14, borderRadius: 3, flexShrink: 0,
                      border: task.done ? '1px solid #3b82f6' : '1px solid #3f3f46',
                      background: task.done ? 'rgba(59,130,246,0.2)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}>
                      {task.done && (
                        <svg width="8" height="7" viewBox="0 0 8 7" fill="none">
                          <path d="M1 3.5l2 2 4-4" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    {editingId === task.id ? (
                      <input
                        autoFocus
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => handleSaveEdit(task.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(task.id)
                          if (e.key === 'Escape') setEditingId(null)
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="mc-mono"
                        style={{
                          fontSize: 11, flex: 1,
                          color: '#a1a1aa',
                          background: 'transparent',
                          outline: 'none',
                          border: 'none',
                          borderBottom: '1px solid rgba(59,130,246,0.5)',
                          transition: 'border-color 0.15s',
                        }}
                      />
                    ) : (
                      <span
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditTask(task.id, task.text)
                        }}
                        className="mc-mono"
                        style={{
                          fontSize: 11, flex: 1,
                          color: task.done ? '#3f3f46' : '#a1a1aa',
                          textDecoration: task.done ? 'line-through' : 'none',
                          transition: 'color 0.15s',
                          cursor: 'text',
                          padding: '0 2px',
                          borderRadius: '3px',
                        }}
                        onMouseEnter={(e) => (e.currentTarget as HTMLSpanElement).style.background = 'rgba(59,130,246,0.1)'}
                        onMouseLeave={(e) => (e.currentTarget as HTMLSpanElement).style.background = 'transparent'}
                      >
                        {task.done ? `// ${task.text}` : `→ ${task.text}`}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteTask(task.id)
                    }}
                    className="mc-mono opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      fontSize: 10,
                      color: '#71717a',
                      padding: '2px 6px',
                      cursor: 'pointer',
                      background: 'transparent',
                      border: 'none',
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'}
                    onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.color = '#71717a'}
                  >
                    ✕
                  </button>
                </li>
              ))}
              {tasks.length === 0 && (
                <li className="mc-mono" style={{ fontSize: 10, color: '#27272a', textAlign: 'center', padding: '12px 0' }}>
                  QUEUE EMPTY · ADD A TASK
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </>
  )
}