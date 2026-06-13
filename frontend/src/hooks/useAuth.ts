import { useAuthStore } from '../store/authStore'
import { authService } from '../services/auth.service'
import toast from 'react-hot-toast'

export function useAuth() {
  const { user, token, isAuthenticated, setAuth, logout: storeLogout, updateUser } = useAuthStore()

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password })
    setAuth(response.user, response.token)
    return response
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch {
      // ignore server errors on logout
    } finally {
      storeLogout()
      toast.success('Logged out successfully')
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    updateUser,
    isAdmin: user?.role === 'admin' || user?.role === 'superadmin',
    isCustomer: user?.role === 'customer',
  }
}
