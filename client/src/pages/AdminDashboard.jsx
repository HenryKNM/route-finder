import { useState } from 'react'
import AdminRouteForm from '../components/AdminRouteForm'
import AdminStageForm from '../components/AdminStageForm'
import AdminSaccoForm from '../components/AdminSaccoForm'

// Admin dashboard with tabs for Routes, Stages, and Saccos.
// TODO: Replace placeholders with tables listing items from /api, with edit/delete actions.

const tabs = ['Routes', 'Stages', 'Saccos']

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Routes')

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Admin Dashboard</h1>
        <button onClick={() => { localStorage.removeItem('rf_authed'); location.href='/' }}>Logout</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              padding: '6px 10px',
              borderBottom: activeTab === t ? '2px solid black' : '2px solid transparent'
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        {activeTab === 'Routes' && (
          <div>
            <h2>Routes</h2>
            {/* TODO: Table of routes from /api/routes */}
            <AdminRouteForm />
          </div>
        )}
        {activeTab === 'Stages' && (
          <div>
            <h2>Stages</h2>
            {/* TODO: Table of stages from /api/stages */}
            <AdminStageForm />
          </div>
        )}
        {activeTab === 'Saccos' && (
          <div>
            <h2>Saccos</h2>
            {/* TODO: Table of saccos from /api/saccos */}
            <AdminSaccoForm />
          </div>
        )}
      </div>
    </div>
  )
}
