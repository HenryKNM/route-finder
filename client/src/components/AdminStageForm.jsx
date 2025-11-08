import { useState } from 'react'
import api from '../api/client'

// Placeholder form for adding/editing/deleting stages.
// TODO: Integrate with backend: GET/POST/PATCH/DELETE /api/stages

export default function AdminStageForm() {
  const [name, setName] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      setSubmitting(true)
      const payload = {
        name,
        location: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
      }
      await api.post('/stages', payload)
      setSuccess('Stage saved.')
      setName('')
      setLat('')
      setLng('')
    } catch (err) {
      setError('Failed to save stage')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, maxWidth: 500 }}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Stage Name" />
      <input value={lat} onChange={(e) => setLat(e.target.value)} placeholder="Latitude" />
      <input value={lng} onChange={(e) => setLng(e.target.value)} placeholder="Longitude" />
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>{success}</div>}
      <button type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save Stage'}</button>
    </form>
  )
}
