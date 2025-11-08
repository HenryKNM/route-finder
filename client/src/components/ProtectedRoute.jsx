import { Navigate, Outlet } from 'react-router-dom'

// Simple protected route checking localStorage flag set on login.
// TODO: Replace with proper auth (JWT) and role checks when backend is ready.

export default function ProtectedRoute({ roles }) {
  const hasWindow = typeof window !== 'undefined'
  const authed = hasWindow && localStorage.getItem('rf_authed') === 'true'
  const role = hasWindow ? localStorage.getItem('rf_role') : null
  if (!authed) return <Navigate to="/login" replace />
  if (roles && roles.length && !roles.includes(role)) {
    // If user lacks required role, send to Home per requirements
    return <Navigate to="/" replace />
  }
  return <Outlet />
}
