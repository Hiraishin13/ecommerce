import api from './api'
import type { User } from '../store/authStore'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export interface AuthResponse {
  user: User
  token: string
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    // Backend returns { user, access_token } after interceptor unwrap
    const { data } = await api.post<{ user: User; access_token: string }>('/auth/login', payload)
    return { user: data.user, token: data.access_token }
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post<{ user: User; access_token: string }>('/auth/register', payload)
    return { user: data.user, token: data.access_token }
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>('/auth/forgot-password', { email })
    return data
  },

  async resetPassword(payload: {
    token: string
    password: string
  }): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>('/auth/reset-password', payload)
    return data
  },

  async getMe(): Promise<User> {
    // Backend returns { user: {...} } after interceptor unwrap
    const { data } = await api.get<{ user: User }>('/me')
    return data.user
  },
}
