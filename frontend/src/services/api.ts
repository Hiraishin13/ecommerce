import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — attach token + tenant ID
api.interceptors.request.use((config) => {
  const { token, tenant } = useAuthStore.getState()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (tenant?.id) {
    config.headers['X-Tenant-ID'] = String(tenant.id)
  }
  return config
})

// Response interceptor — unwrap { success, message, data: {...} } envelope + handle 401
api.interceptors.response.use(
  (response) => {
    if (
      response.data &&
      typeof response.data === 'object' &&
      'success' in response.data &&
      response.data.success === true &&
      'data' in response.data
    ) {
      response.data = response.data.data
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      const isSuperAdmin = window.location.pathname.startsWith('/superadmin')
      window.location.href = isSuperAdmin ? '/superadmin/login' : '/login'
    }
    return Promise.reject(error)
  }
)

export default api
