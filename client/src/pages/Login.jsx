import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import GoogleSignInButton from '../components/GoogleSignInButton'

// Placeholder Login page for users/admins.
// TODO: Wire this to real backend auth (e.g., JWT). For now, sets a localStorage flag.

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('rf_authed', 'true')
      localStorage.setItem('rf_role', data.role || 'user')
      if (data.token) localStorage.setItem('rf_token', data.token)
      window.dispatchEvent(new Event('rf-auth-changed'))
      navigate((data.role || 'user') === 'admin' ? '/admin' : '/')
    } catch (err) {
      if (err?.response?.status === 401) {
        setError('No account found for these credentials. Do you want to sign up?')
      } else {
        setError(err?.response?.data?.error || 'Login failed')
      }
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 420, margin: '40px auto' }}>
      <h1>Login</h1>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, marginTop: 16 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 8 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 8 }}
        />
        {error && (
          <div style={{ color: 'red' }}>
            {error} {error.includes('sign up') && (<Link to="/signup"> Sign up</Link>)}
          </div>
        )}
        <button type="submit">Login</button>
      </form>
      <div style={{ marginTop: 12 }}>
        <GoogleSignInButton onSuccess={() => navigate('/')} />
      </div>
      <div style={{ marginTop: 12 }}>
        <span className="muted">Don't have an account?</span>
        <Link to="/signup" style={{ marginLeft: 6 }}>Sign up</Link>
      </div>
    </div>
  )
}
