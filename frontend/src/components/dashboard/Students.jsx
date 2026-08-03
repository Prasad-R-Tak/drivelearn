import { useState } from 'react'
import Modal from '../Modal'

export default function Students({ students, courses, onDataChanged }) {
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [courseId, setCourseId] = useState(courses[0]?.id || '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAdd = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:5000/api/owner/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ studentName: name, courseId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add student')

      setName('')
      setShowModal(false)
      onDataChanged()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-4xl">Students</h1>
        <button
          onClick={() => setShowModal(true)}
          disabled={courses.length === 0}
          title={courses.length === 0 ? 'Add a course first' : ''}
          className="bg-signal text-asphalt text-sm font-semibold px-4 py-2 rounded-md hover:bg-asphalt hover:text-signal transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add student
        </button>
      </div>

      {courses.length === 0 && (
        <p className="text-steel text-sm mb-4">Add a course before adding students.</p>
      )}

      {students.length === 0 ? (
        <p className="text-steel text-sm">No students enrolled yet.</p>
      ) : (
        <div className="border-2 border-asphalt rounded-lg overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1.5fr_1fr] px-5 py-3 bg-asphalt text-canvas text-xs font-mono tracking-wide">
            <span>NAME</span>
            <span>COURSE</span>
            <span>PROGRESS</span>
            <span>STATUS</span>
          </div>
          {students.map((s, i) => (
            <div
              key={s.id}
              className={`grid grid-cols-[2fr_1fr_1.5fr_1fr] items-center px-5 py-4 text-sm ${
                i !== students.length - 1 ? 'border-b border-asphalt/20' : ''
              }`}
            >
              <span className="font-medium">{s.name}</span>
              <span className="text-steel">{s.course}</span>
              <div className="flex items-center gap-2 pr-4">
                <div className="flex-1 h-1.5 bg-asphalt/10 rounded-full overflow-hidden">
                  <div className="h-full bg-signal" style={{ width: `${s.progress}%` }} />
                </div>
                <span className="font-mono text-xs text-steel w-8">{s.progress}%</span>
              </div>
              <span
                className={`text-xs font-semibold w-fit px-2 py-1 rounded ${
                  s.status === 'Completed' ? 'bg-route/10 text-route' : 'bg-signal/20 text-asphalt'
                }`}
              >
                {s.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="Add student" onClose={() => setShowModal(false)}>
          <form onSubmit={handleAdd} className="space-y-4">
            {error && <p className="text-brake text-sm">{error}</p>}
            <div>
              <label className="block text-xs font-mono text-steel mb-1.5 tracking-wide">
                STUDENT NAME
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border-2 border-asphalt rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-signal"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-steel mb-1.5 tracking-wide">
                COURSE
              </label>
              <select
                required
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full border-2 border-asphalt rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-signal bg-canvas"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-signal text-asphalt font-semibold py-2.5 rounded-md hover:bg-asphalt hover:text-signal transition-colors disabled:opacity-60"
            >
              {loading ? 'Adding…' : 'Add student'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}