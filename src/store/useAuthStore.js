import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        localStorage.setItem('authToken', token)
        localStorage.setItem('authUser', JSON.stringify(user))
        set({
          user,
          token,
          isAuthenticated: true,
        })
      },

      loadAuth: () => {
        const token = localStorage.getItem('authToken')
        const userStr = localStorage.getItem('authUser')
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr)
            set({
              user,
              token,
              isAuthenticated: true,
            })
            return true
          } catch {
            return false
          }
        }
        return false
      },

      logout: () => {
        localStorage.removeItem('authToken')
        localStorage.removeItem('authUser')
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
