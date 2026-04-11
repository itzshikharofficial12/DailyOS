import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface CurrentProjectState {
  currentProjectId: string | null
  setCurrentProject: (id: string) => void
  clearCurrentProject: () => void
}

export const useCurrentProject = create<CurrentProjectState>()(
  persist(
    (set) => ({
      currentProjectId: null,
      
      setCurrentProject: (id: string) => set({ currentProjectId: id }),
      
      clearCurrentProject: () => set({ currentProjectId: null }),
    }),
    {
      name: 'current-project-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
