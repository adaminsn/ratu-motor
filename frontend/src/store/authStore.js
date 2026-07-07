// src/store/authStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      role: null,

      setAuth: (token, user) => {
        // Ambil role dari user, support berbagai format
        let role = null
        if (user?.roles) {
          if (Array.isArray(user.roles)) {
            role = user.roles[0]?.name || user.roles[0] || null
          } else if (typeof user.roles === 'string') {
            role = user.roles
          } else if (typeof user.roles === 'object' && user.roles.name) {
            role = user.roles.name
          }
        }
        
        set({
          token,
          user,
          role: role
        })
        
        // Simpan token ke localStorage untuk axios interceptor
        if (token) {
          localStorage.setItem('token', token)
        }
      },

      // ===== TAMBAHKAN: setUser =====
      setUser: (user) => {
        // Ambil role dari user baru
        let role = null
        if (user?.roles) {
          if (Array.isArray(user.roles)) {
            role = user.roles[0]?.name || user.roles[0] || null
          } else if (typeof user.roles === 'string') {
            role = user.roles
          } else if (typeof user.roles === 'object' && user.roles.name) {
            role = user.roles.name
          }
        }
        
        set({
          user,
          role: role
        })
        
        // Update localStorage
        const currentState = JSON.parse(localStorage.getItem('auth-storage') || '{}')
        if (currentState.state) {
          localStorage.setItem('auth-storage', JSON.stringify({
            ...currentState,
            state: { 
              ...currentState.state, 
              user: user,
              role: role 
            }
          }))
        }
      },

      // ===== TAMBAHKAN: updateUser =====
      updateUser: (userData) => {
        const currentUser = get().user
        const updatedUser = { ...currentUser, ...userData }
        
        // Ambil role dari user yang diupdate
        let role = get().role
        if (userData?.roles) {
          if (Array.isArray(userData.roles)) {
            role = userData.roles[0]?.name || userData.roles[0] || null
          } else if (typeof userData.roles === 'string') {
            role = userData.roles
          } else if (typeof userData.roles === 'object' && userData.roles.name) {
            role = userData.roles.name
          }
        }
        
        set({
          user: updatedUser,
          role: role || get().role
        })
        
        // Update localStorage
        const currentState = JSON.parse(localStorage.getItem('auth-storage') || '{}')
        if (currentState.state) {
          localStorage.setItem('auth-storage', JSON.stringify({
            ...currentState,
            state: { 
              ...currentState.state, 
              user: updatedUser,
              role: role || get().role
            }
          }))
        }
      },

      logout: () => {
        localStorage.removeItem('token')
        set({
          token: null,
          user: null,
          role: null
        })
      },

      isAdmin: () => {
        const role = get().role
        return ['super_admin', 'admin', 'kasir', 'teknisi'].includes(role)
      },

      isCustomer: () => {
        const role = get().role
        return role === 'customer'
      },

      // Tambahan helper
      getToken: () => {
        return get().token || localStorage.getItem('token')
      },

      isAuthenticated: () => {
        return !!get().token || !!localStorage.getItem('token')
      }
    }),
    {
      name: 'auth-storage',
      // Hanya persist field yang diperlukan
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        role: state.role
      })
    }
  )
)

export default useAuthStore