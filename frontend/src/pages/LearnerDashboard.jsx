import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Check } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

export default function LearnerDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    fetch('http://localhost:5000/api/learner/dashboard', {
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

  return (
    <div className="min-h-screen bg-canvas text-asphalt">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <p className="font-mono text-xs text-steel tracking-widest mb-2">MY DASHBOARD</p>
        <h1 className="font-display text-4xl mb-1">Hi, {user?.name?.split(' ')[0]}</h1>
        <p className="text-steel text-sm mb-10">{user?.email}</p>

        {loading && <p className="text-steel text-sm">Loading…</p>}
        {error && (
          <div className="border-2 border-brake rounded-lg p-6 text-brake text-sm max-w-md">{error}</div>
        )}

        {data && (
          <>
            {/* Stats */}
            <div className="grid sm:grid-cols-3 gap-4 mb-10">
              <div className="border-2 border-asphalt rounded-lg p-5">
                <p className="text-xs font-mono text-steel tracking-wide mb-2">TOTAL BOOKINGS</p>
                <p className="font-mono text-3xl font-semibold">{data.stats.totalBookings}</p>
              </div>
              <div className="border-2 border-asphalt rounded-lg p-5">
                <p className="text-xs font-mono text-steel tracking-wide mb-2">ACTIVE COURSES</p>
                <p className="font-mono text-3xl font-semibold">{data.stats.activeCourses}</p>
              </div>
              <div className="border-2 border-asphalt rounded-lg p-5">
                <p className="text-xs font-mono text-steel tracking-wide mb-2">COMPLETED</p>
                <p className="font-mono text-3xl font-semibold">{data.stats.completedCourses}</p>
              </div>
            </div>

            {/* Bookings */}
            <h2 className="font-display text-2xl mb-4">My courses</h2>

            {data.bookings.length === 0 ? (
              <div className="border-2 border-dashed border-steel/40 rounded-lg p-10 text-center text-steel">
                You haven't booked any courses yet.{' '}
                <Link to="/schools" className="text-asphalt font-semibold hover:text-brake">
                  Find a driving school
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {data.bookings.map((b) => (
                  <div key={b.id} className="border-2 border-asphalt rounded-lg p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-display text-xl mb-0.5">{b.courseName}</h3>
                        <Link
                          to={`/schools/${b.schoolId}`}
                          className="text-sm text-steel hover:text-asphalt flex items-center gap-1"
                        >
                          <MapPin size={13} />
                          {b.schoolName} — {b.schoolLocation}
                        </Link>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded shrink-0 ${
                          b.status === 'Completed' ? 'bg-route/10 text-route' : 'bg-signal/20 text-asphalt'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    {b.batchStartDate && (
                      <p className="text-xs font-mono text-steel mb-1">
                        Started{' '}
                        {new Date(b.batchStartDate).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                        {b.totalLessons && ` · ${b.totalLessons} daily lessons`}
                      </p>
                    )}

                    {b.instructorName && (
                      <p className="text-xs font-mono text-steel mb-3">Instructor: {b.instructorName}</p>
                    )}

                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 h-1.5 bg-asphalt/10 rounded-full overflow-hidden max-w-xs">
                        <div className="h-full bg-signal" style={{ width: `${b.progress}%` }} />
                      </div>
                      <span className="font-mono text-xs text-steel">{b.progress}%</span>
                    </div>

                    <div className="flex items-center justify-between">
                      {b.hasReviewed ? (
                        <span className="flex items-center gap-1.5 text-route text-xs font-semibold">
                          <Check size={13} /> Review submitted
                        </span>
                      ) : (
                        <Link
                          to={`/schools/${b.schoolId}`}
                          className="text-xs font-semibold text-asphalt hover:text-brake"
                        >
                          Leave a review →
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}