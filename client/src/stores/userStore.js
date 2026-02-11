import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { setAuthUserId } from '../api/client'

export const useUserStore = create(
  persist(
    (set) => ({
      user: null,

      setUser: (user) => {
        set({
          user: user
            ? {
                ...user,
                currentStage: user.current_stage || user.currentStage || 'stage0',
                role: user.role || 'user'
              }
            : null
        })
        setAuthUserId(user?.id ?? null)
      },

      updateStage: (stage) => set((state) => ({
        user: state.user ? { ...state.user, currentStage: stage } : null
      })),

      clearUser: () => {
        set({ user: null })
        setAuthUserId(null)
      }
    }),
    {
      name: 'onboarding-user'
    }
  )
)
