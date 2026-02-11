import { create } from 'zustand'

export const useChecklistStore = create((set) => ({
  filters: {
    stage: 'stage1',
    category: null
  },
  
  setStageFilter: (stage) => set((state) => ({
    filters: { ...state.filters, stage }
  })),
  
  setCategoryFilter: (category) => set((state) => ({
    filters: { ...state.filters, category }
  })),
  
  resetFilters: () => set({
    filters: { stage: 'stage1', category: null }
  })
}))
