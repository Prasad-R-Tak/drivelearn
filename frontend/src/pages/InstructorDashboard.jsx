import { useState, useEffect, useCallback } from 'react'
import Navbar from '../components/Navbar'

export default function InstructorDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [savingId, setSavingId] = useState(null)

  const fetchDashboard = useCallback(() => {
    const token = localStorage.getItem('token')
    setLoading(true)
    return fetch('http://localhost:5000/api/instructor/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load dashboard')
        return res.json()
      })
      .then((json) => setData(json))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  const handleProgressChange = async (enrollmentId, progress) => {
    setSavingId(enrollmentId)
    try {
      const token = localStorage.getItem('token')
      await fetch(`http://localhost:5000/api/instructor/students/${enrollmentId}/progress`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ progress }),
      })
      fetchDashboard()
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-canvas text-asphalt">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <p className="font-mono text-xs text-steel tracking-widest mb-2">INSTRUCTOR</p>
        <h1 className="font-display text-4xl mb-8">{data?.school?.name || 'Your students'}</h1>

        {loading && <p className="text-steel text-sm">Loading…</p>}
        {error && (
          <div className="border-2 border-brake rounded-lg p-6 text-brake text-sm max-w-md">{error}</div>
        )}

        {data && data.students.length === 0 && (
          <p className="text-steel text-sm">No students assigned to you yet.</p>
        )}

        {data && data.students.length > 0 && (
          <div className="flex flex-col gap-4">
            {data.students.map((s) => (
              <div key={s.id} className="border-2 border-asphalt rounded-lg p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display text-xl">{s.studentName}</h3>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${
                      s.status === 'Completed' ? 'bg-route/10 text-route' : 'bg-signal/20 text-asphalt'
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
                <p className="text-sm text-steel mb-1">{s.course}</p>
                {s.slotDateTime && (
                  <p className="text-xs font-mono text-steel mb-4">
                    Lesson:{' '}
                    {new Date(s.slotDateTime).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                )}

                <label className="block text-xs font-mono text-steel mb-1.5 tracking-wide">
                  PROGRESS: {s.progress}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={s.progress}
                  disabled={savingId === s.id}
                  onChange={(e) => handleProgressChange(s.id, Number(e.target.value))}
                  className="w-full accent-signal"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}