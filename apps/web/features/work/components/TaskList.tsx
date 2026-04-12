'use client'

import { useTaskStore } from '@/store/taskStore'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

interface Task {
  id: number
  text: string
  done: boolean
}

export default function TaskList() {
  const { tasks, addTask, toggleTask, removeTask } = useTaskStore()
  const [input, setInput] = useState('')
  const [projectTasks, setProjectTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')

  console.log('TaskList component rendered')

  // Fetch all global tasks
  useEffect(() => {
    console.log('TaskList useEffect hook triggered')
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    console.log('fetchTasks function started')
    try {
      setLoading(true)
      console.log('Making Supabase query...')

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('TASKS DATA:', data)
      console.log('TASKS ERROR:', error)

      if (error) {
        console.error('ERROR OBJECT:', error)
        return
      }

      if (!data) {
        console.log('No data returned, setting empty array')
        setProjectTasks([])
        return
      }

      console.log('Setting tasks:', data.length, 'items')
      setProjectTasks(data)
    } catch (err) {
      console.error('Catch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTask = async () => {
    if (!input.trim()) return
    
    try {
      console.log('Adding task:', input)
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ text: input.trim(), done: false }])
        .select()

      if (error) {
        console.error('TASK ADD ERROR:', error.message || error)
        return
      }

      if (data?.length) {
        setProjectTasks((prev) => [data[0], ...prev])
      }
      
      setInput('')
    } catch (err) {
      console.error('Add task error:', err)
    }
  }

  const handleDeleteTask = async (taskId: number) => {
    try {
      console.log('Deleting task:', taskId)
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) {
        console.error('TASK DELETE ERROR:', error.message || error)
        return
      }

      console.log('Task deleted successfully')
      setProjectTasks((prev) => prev.filter((task) => task.id !== taskId))
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
      const { error } = await supabase
        .from('tasks')
        .update({ text: editValue })
        .eq('id', taskId)

      if (error) {
        console.error('TASK UPDATE ERROR:', error.message || error)
        return
      }

      console.log('Task updated successfully')
      setProjectTasks((prev) =>
        prev.map((task) => (task.id === taskId ? { ...task, text: editValue } : task))
      )
      setEditingId(null)
    } catch (err) {
      console.error('Edit save error:', err)
    }
  }

  const handleToggleTask = async (taskId: number, currentDone: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ done: !currentDone })
        .eq('id', taskId)

      if (error) {
        console.error('TASK TOGGLE ERROR:', error.message || error)
        return
      }

      console.log('Task toggled successfully')
      setProjectTasks((prev) =>
        prev.map((task) => (task.id === taskId ? { ...task, done: !currentDone } : task))
      )
    } catch (err) {
      console.error('Toggle error:', err)
    }
  }

  console.log('Rendering with projectTasks:', projectTasks)

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg hover:border-blue-500/40 hover:shadow-blue-500/10 transition-all duration-200">
      <h2 className="text-lg font-semibold text-white mb-4">Tasks</h2>

      {/* Add Task Input */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
          placeholder="Add a new task..."
          className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
        <button
          onClick={handleAddTask}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Add
        </button>
      </div>

      {/* Tasks List */}
      <div className="space-y-2">
        {projectTasks.length > 0 ? (
          projectTasks.map((task) => (
            <div
              key={task.id}
              className="group flex justify-between items-center gap-3 p-3 bg-zinc-800 rounded-lg border border-zinc-700 hover:bg-zinc-900/40 hover:border-zinc-600 transition-all duration-150 cursor-text"
            >
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => handleToggleTask(task.id, task.done)}
                className="w-4 h-4 rounded border-zinc-600 accent-blue-500 cursor-pointer flex-shrink-0"
              />
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
                  className="flex-1 text-sm bg-transparent outline-none text-zinc-200 border-b border-zinc-700 focus:border-blue-500 transition-colors"
                />
              ) : (
                <span
                  onClick={() => handleEditTask(task.id, task.text)}
                  className={`flex-1 text-sm hover:bg-zinc-900/50 px-1 py-0.5 rounded transition-colors cursor-text ${
                    task.done ? 'line-through text-zinc-400' : 'text-zinc-200'
                  }`}
                >
                  {task.text}
                </span>
              )}
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-zinc-500 hover:text-red-400 cursor-pointer flex-shrink-0"
              >
                ✕
              </button>
            </div>
          ))
        ) : (
          <p className="text-zinc-400 text-sm text-center py-4">No tasks yet</p>
        )}
      </div>
    </div>
  )
}
