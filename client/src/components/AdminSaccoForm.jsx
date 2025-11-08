import { useState } from 'react'
import api from '../api/client'

// Placeholder form for adding/editing/deleting saccos.
// TODO: Integrate with backend: GET/POST/PATCH/DELETE /api/saccos

export default function AdminSaccoForm() {
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      setSubmitting(true)
      await api.post('/saccos', { name, contacts: contact ? [contact] : [] })
      setSuccess('Sacco saved.')
      setName('')
      setContact('')
    } catch (err) {
      setError('Failed to save sacco')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, maxWidth: 500 }}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Sacco Name" />
      <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Contact" />
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>{success}</div>}
      <button type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save Sacco'}</button>
    </form>
  )
}
