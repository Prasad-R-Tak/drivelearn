import { useState, useEffect, useCallback } from 'react'
import Navbar from '../components/Navbar'

export default function AdminDashboard() {
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  const fetchSchools = useCallback(() => {
    const token = localStorage.getItem('token')
    setLoading(true)
    return fetch('http://localhost:5000/api/admin/schools', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load schools')
        return res.json()
      })
      .then((json) => setSchools(json))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchSchools()
  }, [fetchSchools])

  const handleStatus = async (id, status) => {
    setUpdatingId(id)
    try {
      const token = localStorage.getItem('token')
      await fetch(`http://localhost:5000/api/admin/schools/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      })
      fetchSchools()
    } finally {
      setUpdatingId(null)
    }
  }

  const statusColor = (status) =>
    status === 'APPROVED'
      ? 'bg-route/10 text-route'
      : status === 'REJECTED'
      ? 'bg-brake/10 text-brake'
      : 'bg-signal/20 text-asphalt'

  return (
    <div className="min-h-screen bg-canvas text-asphalt">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-12">
        <p className="font-mono text-xs text-steel tracking-widest mb-2">SUPER ADMIN</p>
        <h1 className="font-display text-4xl mb-8">All schools</h1>

        {loading && <p className="text-steel text-sm">Loading…</p>}
        {error && (
          <div className="border-2 border-brake rounded-lg p-6 text-brake text-sm max-w-md">{error}</div>
        )}

        {!loading && !error && (
          <div className="flex flex-col gap-4">
            {schools.map((s) => (
              <div
                key={s.id}
                className="border-2 border-asphalt rounded-lg p-5 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-display text-xl">{s.name}</h3>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${statusColor(s.status)}`}>
                      {s.status}
                    </span>
                  </div>
                  <p className="text-sm text-steel">
                    {s.locality}, {s.city} · {s.courseCount} courses
                  </p>
                  <p className="text-xs font-mono text-steel mt-1">
                    Owner: {s.ownerName} ({s.ownerEmail})
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleStatus(s.id, 'APPROVED')}
                    disabled={updatingId === s.id || s.status === 'APPROVED'}
                    className="border-2 border-route text-route text-sm font-semibold px-4 py-2 rounded-md hover:bg-route hover:text-canvas transition-colors disabled:opacity-40"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatus(s.id, 'REJECTED')}
                    disabled={updatingId === s.id || s.status === 'REJECTED'}
                    className="border-2 border-brake text-brake text-sm font-semibold px-4 py-2 rounded-md hover:bg-brake hover:text-canvas transition-colors disabled:opacity-40"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}