import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Property } from '@/types'

interface AppState {
  selectedProperty: Property | null
  setSelectedProperty: (property: Property | null) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedProperty: null,
      setSelectedProperty: (property) => set({ selectedProperty: property }),
    }),
    { name: 'app-storage' }
  )
)
