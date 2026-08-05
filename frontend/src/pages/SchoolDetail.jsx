import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, MapPin, ArrowLeft, Check } from 'lucide-react'
import Navbar from '../components/Navbar'
import LaneDivider from '../components/LaneDivider'
import { useAuth } from '../context/AuthContext'

export default function SchoolDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [school, setSchool] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [bookingSlotId, setBookingSlotId] = useState(null)
  const [bookedSlotIds, setBookedSlotIds] = useState([])
  const [bookingError, setBookingError] = useState('')

  const [myBookings, setMyBookings] = useState([]) // [{ courseId, courseName, review }]

  const loadSchool = () => {
    fetch(`http://localhost:5000/api/schools/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('School not found')
        return res.json()
      })
      .then((data) => setSchool(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  const loadMyBookings = () => {
    if (user?.role !== 'LEARNER') return
    const token = localStorage.getItem('token')
    fetch(`http://localhost:5000/api/schools/${id}/my-bookings`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setMyBookings(data))
      .catch(() => {})
  }

  useEffect(() => {
    loadSchool()
    loadMyBookings()
  }, [id, user])

  const handleBook = async (slotId) => {
    setBookingError('')
    setBookingSlotId(slotId)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ slotId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Booking failed')
      setBookedSlotIds((prev) => [...prev, slotId])
      loadMyBookings() // refresh so the review form appears for this newly booked course
      loadSchool() // refresh so the booked slot disappears from available list
    } catch (err) {
      setBookingError(err.message)
    } finally {
      setBookingSlotId(null)
    }
  }

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
                  {school.rating || 'No ratings yet'}
                  {school.reviews > 0 && <span className="text-steel">({school.reviews} reviews)</span>}
                </span>
              </div>
            </div>
            <LaneDivider />
          </section>

          {/* Courses */}
          <div className="max-w-4xl mx-auto px-6 py-12">
            <h2 className="font-display text-3xl mb-2">Courses offered</h2>

            {bookingError && <p className="text-brake text-sm mb-4">{bookingError}</p>}

            <div className="flex flex-col gap-4 mt-6">
              {school.courses.map((c) => (
                <div key={c.id} className="border-2 border-asphalt rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-display text-2xl mb-1">{c.name}</h3>
                      <p className="text-sm text-steel">{c.duration}</p>
                    </div>
                    <span className="font-mono text-lg font-semibold">
                      ₹{c.price.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {!user && (
                    <Link
                      to="/login"
                      className="inline-block bg-signal text-asphalt text-sm font-semibold px-5 py-2.5 rounded-md hover:bg-asphalt hover:text-signal transition-colors"
                    >
                      Log in to view available slots
                    </Link>
                  )}

                  {user?.role === 'OWNER' && (
                    <span className="text-xs text-steel font-mono">OWNER VIEW</span>
                  )}

                  {user?.role === 'LEARNER' && (
                    <div>
                      <p className="text-xs font-mono text-steel tracking-wide mb-2">
                        AVAILABLE SLOTS
                      </p>
                      {c.slots.length === 0 ? (
                        <p className="text-sm text-steel">No upcoming slots available.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {c.slots.map((slot) => {
                            const isBooked = bookedSlotIds.includes(slot.id)
                            const isBooking = bookingSlotId === slot.id
                            return (
                              <button
                                key={slot.id}
                                onClick={() => handleBook(slot.id)}
                                disabled={isBooking || isBooked}
                                className={`text-sm font-medium px-3 py-2 rounded-md border-2 transition-colors ${
                                  isBooked
                                    ? 'border-route bg-route/10 text-route'
                                    : 'border-asphalt hover:bg-signal hover:border-signal'
                                } disabled:cursor-default`}
                              >
                                {isBooked ? (
                                  <span className="flex items-center gap-1">
                                    <Check size={14} /> Booked
                                  </span>
                                ) : isBooking ? (
                                  'Booking…'
                                ) : (
                                  new Date(slot.dateTime).toLocaleString('en-IN', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short',
                                  })
                                )}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <LaneDivider className="opacity-20" />

          {/* Reviews */}
          <div className="max-w-4xl mx-auto px-6 py-12">
            <h2 className="font-display text-3xl mb-6">Reviews</h2>

            {/* One review form per course this learner has booked */}
            {myBookings.length > 0 && (
              <div className="flex flex-col gap-6 mb-10">
                {myBookings.map((b) => (
                  <ReviewForm
                    key={b.courseId}
                    courseId={b.courseId}
                    courseName={b.courseName}
                    existingReview={b.review}
                    onSaved={() => {
                      loadSchool()
                      loadMyBookings()
                    }}
                  />
                ))}
              </div>
            )}

            {/* Public review list */}
            {school.reviewsList.length === 0 ? (
              <p className="text-steel text-sm">No reviews yet.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {school.reviewsList.map((r) => (
                  <div key={r.id} className="border-2 border-asphalt rounded-lg p-5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm">{r.user.name}</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            size={14}
                            className={n <= r.rating ? 'fill-signal text-signal' : 'text-steel/30'}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-steel font-mono mb-2">{r.course.name}</p>
                    {r.comment && <p className="text-sm text-steel">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function ReviewForm({ courseId, courseName, existingReview, onSaved }) {
  const [rating, setRating] = useState(existingReview?.rating || 5)
  const [comment, setComment] = useState(existingReview?.comment || '')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSavedMsg('')
    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ courseId, rating, comment }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit review')

      setSavedMsg(existingReview ? 'Review updated.' : 'Review posted.')
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-2 border-asphalt rounded-lg p-6">
      <h3 className="font-display text-xl mb-1">
        {existingReview ? 'Edit your review' : 'Leave a review'}
      </h3>
      <p className="text-xs font-mono text-steel mb-4">{courseName}</p>

      {error && <p className="text-brake text-sm mb-3">{error}</p>}
      {savedMsg && <p className="text-route text-sm mb-3">{savedMsg}</p>}

      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)} className="p-0.5">
            <Star size={22} className={n <= rating ? 'fill-signal text-signal' : 'text-steel/40'} />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="How was your experience? (optional)"
        rows={3}
        className="w-full border-2 border-asphalt rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-signal mb-4"
      />

      <button
        type="submit"
        disabled={submitting}
        className="bg-signal text-asphalt text-sm font-semibold px-5 py-2.5 rounded-md hover:bg-asphalt hover:text-signal transition-colors disabled:opacity-60"
      >
        {submitting ? 'Saving…' : existingReview ? 'Update review' : 'Submit review'}
      </button>
    </form>
  )
}