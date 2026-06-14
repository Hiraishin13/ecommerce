import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: number
  name: string
  email: string
  role: 'customer' | 'admin' | 'superadmin'
  avatar?: string
  tenant_id?: number
}

export interface Tenant {
  id: number
  name: string
  slug: string
  status: string
  plan_id: number
  sector: string
  branding: {
    logo?: string
    primary_color?: string
    secondary_color?: string
    font?: string
  } | null
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  tenant: Tenant | null
  setAuth: (user: User, token: string, tenant?: Tenant | null) => void
  setTenant: (tenant: Tenant) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      tenant: null,

      setAuth: (user, token, tenant = null) =>
        set({ user, token, isAuthenticated: true, tenant: tenant ?? null }),

      setTenant: (tenant) => set({ tenant }),

      logout: () =>
        set({ user: null, token: null, isAuthenticated: false, tenant: null }),

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),
    }),
    {
      name: 'auth-storage-v2',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        tenant: state.tenant,
      }),
    }
  )
)
