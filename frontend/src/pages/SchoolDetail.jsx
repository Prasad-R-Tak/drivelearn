import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, MapPin, ArrowLeft } from 'lucide-react'
import Navbar from '../components/Navbar'
import LaneDivider from '../components/LaneDivider'
import { useAuth } from '../context/AuthContext'

export default function SchoolDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [school, setSchool] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`http://localhost:5000/api/schools/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('School not found')
        return res.json()
      })
      .then((data) => setSchool(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <div className="min-h-screen bg-canvas text-asphalt">
      <Navbar />

      {loading && (
        <div className="max-w-4xl mx-auto px-6 py-12 text-steel text-sm">Loading school…</div>
      )}

      {error && (
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="border-2 border-brake rounded-lg p-6 text-brake text-sm">{error}</div>
        </div>
      )}

      {school && (
        <>
          {/* Header */}
          <section className="bg-asphalt text-canvas">
            <div className="max-w-4xl mx-auto px-6 py-12">
              <Link
                to="/schools"
                className="inline-flex items-center gap-2 text-sm text-steel hover:text-signal transition-colors mb-6"
              >
                <ArrowLeft size={16} />
                Back to search
              </Link>
              <h1 className="font-display text-5xl mb-3">{school.name}</h1>
              <div className="flex items-center gap-4 text-sm text-steel">
                <span className="flex items-center gap-1">
                  <MapPin size={14} />
                  {school.locality}, {school.city}
                </span>
                <span className="flex items-center gap-1 text-canvas">
                  <Star size={14} className="fill-signal text-signal" />
                  {school.rating}
                  <span className="text-steel">({school.reviews} reviews)</span>
                </span>
              </div>
            </div>
            <LaneDivider />
          </section>

          {/* Courses */}
          <div className="max-w-4xl mx-auto px-6 py-12">
            <h2 className="font-display text-3xl mb-6">Courses offered</h2>

            <div className="flex flex-col gap-4">
              {school.courses.map((c) => (
                <div
                  key={c.id}
                  className="border-2 border-asphalt rounded-lg p-6 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-display text-2xl mb-1">{c.name}</h3>
                    <p className="text-sm text-steel">{c.duration}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="font-mono text-lg font-semibold">
                      ₹{c.price.toLocaleString('en-IN')}
                    </span>
                    {user && user.role === 'LEARNER' ? (
                      <button className="bg-signal text-asphalt text-sm font-semibold px-5 py-2.5 rounded-md hover:bg-asphalt hover:text-signal transition-colors">
                        Book this course
                      </button>
                    ) : user && user.role === 'OWNER' ? (
                      <span className="text-xs text-steel font-mono">OWNER VIEW</span>
                    ) : (
                      <Link
                        to="/login"
                        className="bg-signal text-asphalt text-sm font-semibold px-5 py-2.5 rounded-md hover:bg-asphalt hover:text-signal transition-colors"
                      >
                        Log in to book
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}