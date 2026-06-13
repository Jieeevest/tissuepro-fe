import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/store/useAuth'

export function AdminRoute() {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'admin') return <Navigate to="/" replace />

  return <Outlet />
}

export function CustomerRoute() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
}
