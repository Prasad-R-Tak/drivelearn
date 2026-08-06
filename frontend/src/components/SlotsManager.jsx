import { useState, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import Modal from './Modal'

export default function SlotsManager({ course, onClose }) {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateTime, setDateTime] = useState('')
  const [instructorId, setInstructorId] = useState('')
  const [instructors, setInstructors] = useState([])
  const [error, setError] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    fetch('http://localhost:5000/api/owner/instructors', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setInstructors(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  const loadSlots = () => {
    const token = localStorage.getItem('token')
    setLoading(true)
    fetch(`http://localhost:5000/api/owner/courses/${course.id}/slots`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setSlots(data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadSlots()
  }, [course.id])

  const handleAdd = async (e) => {
    e.preventDefault()
    setError('')
    setAdding(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:5000/api/owner/courses/${course.id}/slots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ dateTime, instructorId: instructorId || null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add slot')

      setDateTime('')
      loadSlots()
    } catch (err) {
      setError(err.message)
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (slotId) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:5000/api/owner/slots/${slotId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete slot')
      loadSlots()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <Modal title={`Slots — ${course.name}`} onClose={onClose}>
      <form onSubmit={handleAdd} className="flex flex-col gap-2 mb-6">
        <div className="flex gap-2">
          <input
            type="datetime-local"
            required
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            className="flex-1 border-2 border-asphalt rounded-md px-3 py-2 text-sm focus:outline-none focus:border-signal"
          />
          <button
            type="submit"
            disabled={adding}
            className="bg-signal text-asphalt text-sm font-semibold px-4 py-2 rounded-md hover:bg-asphalt hover:text-signal transition-colors disabled:opacity-60"
          >
            {adding ? 'Adding…' : 'Add'}
          </button>
        </div>
        <select
          value={instructorId}
          onChange={(e) => setInstructorId(e.target.value)}
          className="border-2 border-asphalt rounded-md px-3 py-2 text-sm focus:outline-none focus:border-signal bg-canvas"
        >
          <option value="">No instructor assigned</option>
          {instructors.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </select>
      </form>

      {error && <p className="text-brake text-sm mb-4">{error}</p>}

      {loading ? (
        <p className="text-steel text-sm">Loading slots…</p>
      ) : slots.length === 0 ? (
        <p className="text-steel text-sm">No slots yet. Add one above.</p>
      ) : (
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
          {slots.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between border-2 border-asphalt/30 rounded-md px-3 py-2 text-sm"
            >
              <div>
                <span className="font-medium">
                  {new Date(s.dateTime).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
                {s.isBooked && (
                  <span className="ml-2 text-xs font-mono text-route">
                    Booked{s.enrollment?.studentName ? ` — ${s.enrollment.studentName}` : ''}
                  </span>
                )}
                {s.instructor && (
                  <span className="ml-2 text-xs font-mono text-steel">
                    Instructor: {s.instructor.user.name}
                  </span>
                )}
              </div>
              {!s.isBooked && (
                <button
                  onClick={() => handleDelete(s.id)}
                  className="text-brake hover:text-brake/70"
                  title="Delete slot"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}