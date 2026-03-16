import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { useEffect } from 'react'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loadAuth } = useAuthStore()

  useEffect(() => {
    loadAuth()
  }, [loadAuth])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}
