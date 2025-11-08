import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { GoogleMap, Marker, Polyline, Circle, useJsApiLoader } from '@react-google-maps/api'
import api from '../api/client'

// Home page with basic Google Map
// Notes:
// - Set VITE_GOOGLE_MAPS_API_KEY in client/.env.local
// - TODO: Add Places Autocomplete + use axios client (src/api/client.js) for /api calls.

const NAIROBI_CBD = { lat: -1.286389, lng: 36.817223 }
const MAP_CONTAINER_STYLE = { width: '100%', height: '360px' }

export default function Home() {
  const [query, setQuery] = useState('')
  const [stages, setStages] = useState([])
  const [routes, setRoutes] = useState([])
  const [allRoutes, setAllRoutes] = useState([])
  const [saccos, setSaccos] = useState([])
  const [selectedRouteId, setSelectedRouteId] = useState('')
  const [selectedSaccoId, setSelectedSaccoId] = useState('')
  const [activeRoutePath, setActiveRoutePath] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userPos, setUserPos] = useState(null)
  const [userAcc, setUserAcc] = useState(null)

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const { isLoaded } = useJsApiLoader({ id: 'google-map-script', googleMapsApiKey: apiKey || '' })

  const center = useMemo(() => NAIROBI_CBD, [])
  const mapRef = useRef(null)
  const onLoad = useCallback((map) => { mapRef.current = map }, [])
  const onUnmount = useCallback(() => { mapRef.current = null }, [])

  // Load filters (routes and saccos)
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [r, s] = await Promise.all([
          api.get('/routes'),
          api.get('/saccos'),
        ])
        setAllRoutes(r.data?.routes || [])
        setSaccos(s.data?.saccos || [])
      } catch (_) {
        // ignore
      }
    }
    loadFilters()
  }, [])

  const onSearch = async () => {
    try {
      setLoading(true)
      setError('')
      const { data } = await api.get(`/search`, { params: { text: query } })
      const safeStages = (data?.stages || []).filter(s => Array.isArray(s?.location?.coordinates) && s.location.coordinates.length === 2)
      setStages(safeStages)
      setRoutes(data?.routes || [])
      // Center map to first stage if available
      if (safeStages.length && mapRef.current) {
        const [lng, lat] = safeStages[0].location.coordinates
        mapRef.current.panTo({ lat, lng })
      }
      setActiveRoutePath([])
      setSelectedRouteId('')
    } catch (e) {
      setError('Failed to search. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const onSelectRoute = async (routeId) => {
    setSelectedRouteId(routeId)
    if (!routeId) {
      setActiveRoutePath([])
      return
    }
    try {
      setLoading(true)
      const { data } = await api.get(`/routes/${routeId}`)
      // Expect populated stages with coordinates
      const path = (data?.stages || [])
        .filter(st => Array.isArray(st?.location?.coordinates) && st.location.coordinates.length === 2)
        .map(st => ({ lat: st.location.coordinates[1], lng: st.location.coordinates[0] }))
      setActiveRoutePath(path)
      // Show markers also
      const safeStages = (data?.stages || [])
        .filter(st => Array.isArray(st?.location?.coordinates) && st.location.coordinates.length === 2)
      setStages(safeStages)
      setRoutes([data])
      if (safeStages.length && mapRef.current) {
        const [lng, lat] = safeStages[0].location.coordinates
        mapRef.current.panTo({ lat, lng })
      }
    } catch (_) {
      setError('Failed to load route details.')
    } finally {
      setLoading(false)
    }
  }

  const filteredRoutes = useMemo(() => {
    if (!selectedSaccoId) return allRoutes
    return allRoutes.filter(r => (r.saccos || []).some(id => (id?._id || id) === selectedSaccoId))
  }, [allRoutes, selectedSaccoId])

  // Geolocation: locate and center map
  const locateMe = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by your browser.')
      return
    }
    setError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords
        const point = { lat: latitude, lng: longitude }
        setUserPos(point)
        setUserAcc(accuracy || null)
        if (mapRef.current) mapRef.current.panTo(point)
      },
      (err) => {
        setError(err?.message || 'Unable to get your location.')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    )
  }, [])

  // Try to locate user once on load (non-blocking)
  useEffect(() => {
    locateMe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="home">
      <header className="home-header">
        <h1 style={{ margin: 0 }}>Route Finder</h1>
        <p className="muted" style={{ margin: 0 }}>Find matatu pickup stages, fares, and Saccos.</p>
        <div className="search-row">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Where are you going? (e.g., Kahawa Sukari)"
            style={{ flex: 1 }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !loading) onSearch() }}
          />
          <button onClick={onSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
          <button onClick={locateMe} title="Center on my location" aria-label="Locate me">Locate me</button>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          <select value={selectedRouteId} onChange={(e) => onSelectRoute(e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--border)' }}>
            <option value="">Filter by Route</option>
            {filteredRoutes.map(r => (
              <option key={r._id} value={r._id}>{r?.origin?.name} → {r?.destination?.name}</option>
            ))}
          </select>
          <select value={selectedSaccoId} onChange={(e) => setSelectedSaccoId(e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--border)' }}>
            <option value="">Filter by Sacco</option>
            {saccos.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>
      </header>

      <main className="home-main">
        <section className="panel" aria-label="Map panel">
          <div className="panel-header">Map</div>
          <div className="panel-body">
            <div className="map-wrap">
              {apiKey ? (
                isLoaded ? (
                  <GoogleMap mapContainerStyle={{ width: '100%', height: '100%' }} center={center} zoom={12} onLoad={onLoad} onUnmount={onUnmount}>
                    {stages.map((s) => (
                      <Marker key={s._id}
                        position={{ lat: s.location?.coordinates?.[1], lng: s.location?.coordinates?.[0] }}
                      />
                    ))}
                    {userPos && (
                      <Marker
                        position={userPos}
                        icon={{
                          path: google.maps.SymbolPath.CIRCLE,
                          scale: 8,
                          fillColor: '#3b82f6',
                          fillOpacity: 1,
                          strokeColor: '#ffffff',
                          strokeWeight: 2,
                        }}
                        title="You are here"
                      />
                    )}
                    {userPos && userAcc && (
                      <Circle center={userPos} radius={userAcc}
                        options={{ fillColor: '#3b82f6', fillOpacity: 0.08, strokeColor: '#3b82f6', strokeOpacity: 0.2 }} />
                    )}
                    {activeRoutePath.length >= 2 && (
                      <Polyline
                        path={activeRoutePath}
                        options={{ strokeColor: '#ef4444', strokeWeight: 4, strokeOpacity: 0.85 }}
                      />
                    )}
                  </GoogleMap>
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading map…</div>
                )
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span>Set VITE_GOOGLE_MAPS_API_KEY in client/.env.local to enable the map.</span>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="panel" aria-label="Results panel">
          <div className="panel-header">Results</div>
          <div className="panel-body">
            {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}

            <h3 style={{ marginTop: 0 }}>Stages</h3>
            {stages.length === 0 && !loading && <div className="muted">No stages yet. Try a search.</div>}
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {stages.map((s) => (
                <li key={s._id} className="list-item">
                  <div style={{ fontWeight: 600 }}>{s.name}</div>
                  <div className="muted">{s?.routes?.length || 0} routes · Avg fare: {s?.avgFare ?? 'N/A'}</div>
                </li>
              ))}
            </ul>

            <h3 style={{ marginTop: 16 }}>Routes</h3>
            {routes.length === 0 && !loading && <div className="muted">No routes yet. Try a search.</div>}
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {routes.map((r) => (
                <li key={r._id} className="list-item">
                  <div style={{ fontWeight: 600 }}>{r?.origin?.name || 'Origin'} → {r?.destination?.name || 'Destination'}</div>
                  <div className="muted">Off-peak: {r?.avgFareOffPeak ?? 'N/A'} · Peak: {r?.avgFarePeak ?? 'N/A'}</div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  )
}
