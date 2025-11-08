import { useState } from 'react'
import api from '../api/client'

// Placeholder form for adding/editing/deleting routes.
// TODO: Integrate with backend: GET/POST/PATCH/DELETE /api/routes

export default function AdminRouteForm() {
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [avgFareOffPeak, setAvgFareOffPeak] = useState('')
  const [avgFarePeak, setAvgFarePeak] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      setSubmitting(true)
      // Minimal payload matching server schema
      const payload = {
        origin: origin ? { name: origin } : undefined,
        destination: destination ? { name: destination } : undefined,
        avgFareOffPeak: avgFareOffPeak ? Number(avgFareOffPeak) : undefined,
        avgFarePeak: avgFarePeak ? Number(avgFarePeak) : undefined,
      }
      await api.post('/routes', payload)
      setSuccess('Route saved.')
      setOrigin('')
      setDestination('')
      setAvgFareOffPeak('')
      setAvgFarePeak('')
    } catch (err) {
      setError('Failed to save route')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, maxWidth: 500 }}>
      <input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Origin (e.g., CBD)" />
      <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Destination (e.g., Kahawa)" />
      <input value={avgFareOffPeak} onChange={(e) => setAvgFareOffPeak(e.target.value)} placeholder="Avg Fare Off-Peak" />
      <input value={avgFarePeak} onChange={(e) => setAvgFarePeak(e.target.value)} placeholder="Avg Fare Peak" />
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>{success}</div>}
      <button type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save Route'}</button>
    </form>
  )
}
