import { useState } from 'react'
import Modal from '../Modal'

export default function Instructors({ instructors, onDataChanged }) {
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAdd = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:5000/api/owner/instructors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add instructor')

      setName('')
      setEmail('')
      setPassword('')
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
        <h1 className="font-display text-4xl">Instructors</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-signal text-asphalt text-sm font-semibold px-4 py-2 rounded-md hover:bg-asphalt hover:text-signal transition-colors"
        >
          Add instructor
        </button>
      </div>

      {instructors.length === 0 ? (
        <p className="text-steel text-sm">No instructors added yet.</p>
      ) : (
        <div className="border-2 border-asphalt rounded-lg overflow-hidden">
          {instructors.map((i, idx) => (
            <div
              key={i.id}
              className={`flex items-center justify-between px-5 py-3 text-sm ${
                idx !== instructors.length - 1 ? 'border-b border-asphalt/20' : ''
              }`}
            >
              <span className="font-medium">{i.name}</span>
              <span className="text-steel">{i.email}</span>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="Add instructor" onClose={() => setShowModal(false)}>
          <form onSubmit={handleAdd} className="space-y-4">
            {error && <p className="text-brake text-sm">{error}</p>}
            <div>
              <label className="block text-xs font-mono text-steel mb-1.5 tracking-wide">NAME</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border-2 border-asphalt rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-signal"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-steel mb-1.5 tracking-wide">EMAIL</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-2 border-asphalt rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-signal"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-steel mb-1.5 tracking-wide">
                TEMPORARY PASSWORD
              </label>
              <input
                type="text"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Share this with the instructor"
                className="w-full border-2 border-asphalt rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-signal"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-signal text-asphalt font-semibold py-2.5 rounded-md hover:bg-asphalt hover:text-signal transition-colors disabled:opacity-60"
            >
              {loading ? 'Adding…' : 'Add instructor'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}