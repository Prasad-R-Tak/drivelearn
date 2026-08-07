import { useState } from 'react'
import Modal from '../Modal'
import BatchesManager from '../BatchesManager'

export default function Courses({ courses, onDataChanged }) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [managingBatchesFor, setManagingBatchesFor] = useState(null)
  

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-4xl">Courses</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-signal text-asphalt text-sm font-semibold px-4 py-2 rounded-md hover:bg-asphalt hover:text-signal transition-colors"
        >
          Add course
        </button>
      </div>

      {courses.length === 0 ? (
        <p className="text-steel text-sm">No courses yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((c) => (
            <div key={c.id} className="border-2 border-asphalt rounded-lg p-5">
              <h3 className="font-display text-2xl mb-1">{c.name}</h3>
              <p className="text-sm text-steel mb-4">{c.duration}</p>
              <div className="flex items-center justify-between text-sm mb-4">
                <span className="font-mono font-semibold">₹{c.price.toLocaleString('en-IN')}</span>
                <span className="text-steel">{c.enrolled} enrolled</span>
              </div>
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setEditingCourse(c)}
                  className="flex-1 border-2 border-asphalt text-sm font-semibold py-2 rounded-md hover:bg-asphalt hover:text-canvas transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="border-2 border-brake text-brake text-sm font-semibold px-3 py-2 rounded-md hover:bg-brake hover:text-canvas transition-colors"
                >
                  Delete
                </button>
              </div>
              <button
                onClick={() => setManagingBatchesFor(c)}
                className="w-full border-2 border-route text-route text-sm font-semibold py-2 rounded-md hover:bg-route hover:text-canvas transition-colors"
              >
                Manage batches
              </button>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <CourseForm title="Add course" onClose={() => setShowAddModal(false)} onSaved={onDataChanged} />
      )}

      {editingCourse && (
        <CourseForm
          title="Edit course"
          initial={editingCourse}
          onClose={() => setEditingCourse(null)}
          onSaved={onDataChanged}
        />
      )}

      {managingBatchesFor && (
        <BatchesManager course={managingBatchesFor} onClose={() => setManagingBatchesFor(null)} />
      )}
    </div>
  )
}

function CourseForm({ title, initial, onClose, onSaved }) {
  const [name, setName] = useState(initial?.name || '')
  const [duration, setDuration] = useState(initial?.duration || '')
  const [price, setPrice] = useState(initial?.price || '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const url = initial
        ? `http://localhost:5000/api/owner/courses/${initial.id}`
        : 'http://localhost:5000/api/owner/courses'
      const method = initial ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, duration, price }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save course')

      onSaved()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-brake text-sm">{error}</p>}
        <div>
          <label className="block text-xs font-mono text-steel mb-1.5 tracking-wide">
            COURSE NAME
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border-2 border-asphalt rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-signal"
            placeholder="e.g. 4-Wheeler Standard"
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-steel mb-1.5 tracking-wide">
            DURATION
          </label>
          <input
            type="text"
            required
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full border-2 border-asphalt rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-signal"
            placeholder="e.g. 20 lessons"
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-steel mb-1.5 tracking-wide">
            PRICE (₹)
          </label>
          <input
            type="number"
            required
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full border-2 border-asphalt rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-signal"
            placeholder="e.g. 3500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-signal text-asphalt font-semibold py-2.5 rounded-md hover:bg-asphalt hover:text-signal transition-colors disabled:opacity-60"
        >
          {loading ? 'Saving…' : 'Save course'}
        </button>
      </form>
    </Modal>
  )
}