import { useState, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import Modal from './Modal'

export default function BatchesManager({ course, onClose }) {
  const [batches, setBatches] = useState([])
  const [instructors, setInstructors] = useState([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [instructorId, setInstructorId] = useState('')
  const [error, setError] = useState('')
  const [adding, setAdding] = useState(false)

  const loadBatches = () => {
    const token = localStorage.getItem('token')
    setLoading(true)
    fetch(`http://localhost:5000/api/owner/courses/${course.id}/batches`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setBatches(data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadBatches()
    const token = localStorage.getItem('token')
    fetch('http://localhost:5000/api/owner/instructors', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setInstructors(Array.isArray(data) ? data : []))
  }, [course.id])

  const handleAdd = async (e) => {
    e.preventDefault()
    setError('')
    setAdding(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:5000/api/owner/courses/${course.id}/batches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ startDate, instructorId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create batch')

      setStartDate('')
      setInstructorId('')
      loadBatches()
    } catch (err) {
      setError(err.message)
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (batchId) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:5000/api/owner/batches/${batchId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete batch')
      loadBatches()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <Modal title={`Batches — ${course.name}`} onClose={onClose}>
      <form onSubmit={handleAdd} className="flex flex-col gap-2 mb-6">
        <label className="text-xs font-mono text-steel tracking-wide">FIRST LESSON DATE & TIME</label>
        <input
          type="datetime-local"
          required
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border-2 border-asphalt rounded-md px-3 py-2 text-sm focus:outline-none focus:border-signal"
        />
        <label className="text-xs font-mono text-steel tracking-wide">INSTRUCTOR</label>
        <select
          required
          value={instructorId}
          onChange={(e) => setInstructorId(e.target.value)}
          className="border-2 border-asphalt rounded-md px-3 py-2 text-sm focus:outline-none focus:border-signal bg-canvas"
        >
          <option value="">Select an instructor</option>
          {instructors.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-steel">
          Lessons run daily at this time from the start date, one per day, for the course's full duration.
        </p>
        <button
          type="submit"
          disabled={adding}
          className="bg-signal text-asphalt text-sm font-semibold px-4 py-2 rounded-md hover:bg-asphalt hover:text-signal transition-colors disabled:opacity-60 mt-1"
        >
          {adding ? 'Creating…' : 'Create batch'}
        </button>
      </form>

      {error && <p className="text-brake text-sm mb-4">{error}</p>}

      {loading ? (
        <p className="text-steel text-sm">Loading batches…</p>
      ) : batches.length === 0 ? (
        <p className="text-steel text-sm">No batches yet. Create one above.</p>
      ) : (
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
          {batches.map((b) => (
            <div
              key={b.id}
              className="flex items-center justify-between border-2 border-asphalt/30 rounded-md px-3 py-2 text-sm"
            >
              <div>
                <span className="font-medium">
                  {new Date(b.startDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
                <span className="ml-2 text-xs font-mono text-steel">
                  {b.totalLessons} lessons · {b.instructor.user.name}
                </span>
                {b.isBooked && (
                  <span className="ml-2 text-xs font-mono text-route">
                    Booked{b.enrollment?.studentName ? ` — ${b.enrollment.studentName}` : ''}
                  </span>
                )}
              </div>
              {!b.isBooked && (
                <button onClick={() => handleDelete(b.id)} className="text-brake hover:text-brake/70">
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