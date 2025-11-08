import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './App.css'
import Home from './pages/Home'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import UserDashboard from './pages/UserDashboard'
import Signup from './pages/Signup'

function App() {
  const navigate = useNavigate()
  const [authed, setAuthed] = useState(typeof window !== 'undefined' && localStorage.getItem('rf_authed') === 'true')
  const [role, setRole] = useState(typeof window !== 'undefined' ? localStorage.getItem('rf_role') : null)

  useEffect(() => {
    const refresh = () => {
      setAuthed(localStorage.getItem('rf_authed') === 'true')
      setRole(localStorage.getItem('rf_role'))
    }
    window.addEventListener('storage', refresh)
    window.addEventListener('rf-auth-changed', refresh)
    return () => {
      window.removeEventListener('storage', refresh)
      window.removeEventListener('rf-auth-changed', refresh)
    }
  }, [])

  const logout = () => {
    localStorage.removeItem('rf_authed')
    localStorage.removeItem('rf_role')
    localStorage.removeItem('rf_token')
    setAuthed(false)
    setRole(null)
    navigate('/')
  }
  return (
    <div>
      <nav className="site-nav" style={{ padding: 12, borderBottom: '1px solid #e5e7eb', display: 'flex', gap: 12, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/">Home</Link>
          {!authed && <Link to="/login">Sign In</Link>}
          {authed && role === 'admin' && <Link to="/admin">Admin</Link>}
          {authed && role !== 'admin' && <Link to="/dashboard">Dashboard</Link>}
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ fontWeight: 700 }}>Route Finder</div>
          {authed && <button onClick={logout}>Logout</button>}
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<ProtectedRoute />}> 
          <Route path="/dashboard" element={<UserDashboard />} />
        </Route>
        <Route element={<ProtectedRoute roles={["admin"]} />}> 
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
