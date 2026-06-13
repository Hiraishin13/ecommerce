import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

interface ProtectedRouteProps {
  children: ReactNode
  role?: 'customer' | 'admin' | 'superadmin'
}

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (role && user?.role !== role) {
    // Admin routes allow both admin and superadmin
    if (role === 'admin' && (user?.role === 'admin' || user?.role === 'superadmin')) {
      return <>{children}</>
    }
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
