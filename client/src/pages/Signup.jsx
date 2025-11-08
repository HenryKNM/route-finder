import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import GoogleSignInButton from '../components/GoogleSignInButton'

export default function Signup() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      setLoading(true)
      const { data } = await api.post('/auth/signup', { email, password, role })
      // Store basic session info
      localStorage.setItem('rf_authed', 'true')
      localStorage.setItem('rf_role', data.role || 'user')
      if (data.token) localStorage.setItem('rf_token', data.token)
      window.dispatchEvent(new Event('rf-auth-changed'))
      // Redirect to Home after signup
      navigate((data.role || 'user') === 'admin' ? '/admin' : '/')
    } catch (err) {
      setError(err?.response?.data?.error || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  // Google Sign-In handled via GoogleSignInButton which posts idToken to backend

  return (
    <div style={{ padding: 16, maxWidth: 420, margin: '40px auto' }}>
      <h1>Sign Up</h1>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, marginTop: 16 }}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: 8 }} />
        <input type="password" placeholder="Password (min 6)" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: 8 }} />
        <select value={role} onChange={(e) => setRole(e.target.value)} style={{ padding: 8 }}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button type="submit" disabled={loading}>{loading ? 'Signing up…' : 'Create account'}</button>
      </form>
      <div style={{ marginTop: 12 }}>
        <GoogleSignInButton onSuccess={() => navigate('/')} />
      </div>
    </div>
  )
}
