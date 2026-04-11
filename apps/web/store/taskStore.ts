import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Task } from '@/lib/types/task'

interface TaskStore {
  tasks: Task[]
  addTask: (title: string, projectId?: string) => void
  toggleTask: (id: string) => void
  removeTask: (id: string) => void
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      tasks: [],
      addTask: (title: string, projectId?: string) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              id: `task_${Date.now()}`,
              title,
              completed: false,
              createdAt: new Date().toISOString(),
              ...(projectId && { projectId }),
            },
          ],
        })),
      toggleTask: (id: string) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, completed: !task.completed } : task
          ),
        })),
      removeTask: (id: string) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),
    }),
    {
      name: 'task-store',
    }
  )
)
