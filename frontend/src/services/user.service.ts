import api from './api'
import type { User } from '../store/authStore'

export interface UpdateProfilePayload {
  name?: string
  email?: string
  avatar?: string
}

export interface ChangePasswordPayload {
  current_password: string
  new_password: string
  confirm_password: string
}

export const userService = {
  async getProfile(): Promise<User> {
    const { data } = await api.get<{ user: User }>('/me')
    return data.user
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const { data } = await api.put<{ user: User }>('/me', payload)
    return data.user
  },

  async changePassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
    const { data } = await api.put<{ message: string }>('/me/password', payload)
    return data
  },
}
