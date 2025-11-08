import { useEffect, useRef } from 'react'
import api from '../api/client'

export default function GoogleSignInButton({ onSuccess }) {
  const divRef = useRef(null)
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  useEffect(() => {
    if (!clientId) return
    const google = window.google
    if (!google || !google.accounts || !google.accounts.id) return

    google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        try {
          const idToken = response.credential
          if (!idToken) return
          const { data } = await api.post('/auth/google', { idToken })
          localStorage.setItem('rf_authed', 'true')
          localStorage.setItem('rf_role', data.role || 'user')
          if (data.token) localStorage.setItem('rf_token', data.token)
          window.dispatchEvent(new Event('rf-auth-changed'))
          onSuccess && onSuccess()
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Google sign-in failed', err)
          alert('Google sign-in failed')
        }
      },
    })

    if (divRef.current) {
      google.accounts.id.renderButton(divRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        width: 320,
      })
    }
  }, [clientId, onSuccess])

  if (!clientId) {
    return null
  }

  return (
    <div>
      <div ref={divRef} />
    </div>
  )
}
