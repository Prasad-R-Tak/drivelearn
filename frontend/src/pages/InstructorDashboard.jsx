import { useState, useEffect, useCallback } from 'react'
import { Check } from 'lucide-react'
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

  const toggleAttendance = async (lessonDayId, attended) => {
    setSavingId(lessonDayId)
    try {
      const token = localStorage.getItem('token')
      await fetch(`http://localhost:5000/api/instructor/lesson-days/${lessonDayId}/attendance`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ attended }),
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
        {error && <div className="border-2 border-brake rounded-lg p-6 text-brake text-sm max-w-md">{error}</div>}

        {data && data.students.length === 0 && <p className="text-steel text-sm">No students assigned to you yet.</p>}

        {data && data.students.length > 0 && (
          <div className="flex flex-col gap-6">
            {data.students.map((s) => (
              <div key={s.id} className="border-2 border-asphalt rounded-lg p-5">
                <div className="flex items-center justify-between mb-3">
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
                <p className="text-xs font-mono text-steel mb-4">
                  Progress: {s.progress}% · {s.lessonDays.filter((d) => d.attended).length}/{s.totalLessons} lessons attended
                </p>

                <p className="text-xs font-mono text-steel tracking-wide mb-2">LESSON SCHEDULE</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {s.lessonDays.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => toggleAttendance(d.id, !d.attended)}
                      disabled={savingId === d.id}
                      className={`flex items-center justify-between text-sm px-3 py-2 rounded-md border-2 transition-colors ${
                        d.attended ? 'border-route bg-route/10 text-route' : 'border-asphalt/30 text-steel'
                      } disabled:opacity-50`}
                    >
                      <span>
                        {new Date(d.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                      {d.attended && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}