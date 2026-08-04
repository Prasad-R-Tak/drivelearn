import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LaneDivider from '../components/LaneDivider'

export default function RegisterSchool({ onRegistered }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', city: '', locality: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:5000/api/owner/school', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to register school')

      onRegistered()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-canvas text-asphalt flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <p className="font-mono text-xs text-brake tracking-widest mb-3">ONE MORE STEP</p>
        <h1 className="font-display text-4xl mb-2">Register your school</h1>
        <p className="text-steel text-sm mb-8">
          Tell us about your driving school so learners can find you.
        </p>

        {error && (
          <div className="mb-4 text-sm text-brake border-2 border-brake rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-steel mb-1.5 tracking-wide">
              SCHOOL NAME
            </label>
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full border-2 border-asphalt rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-signal"
              placeholder="e.g. Highway Heroes Driving School"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-steel mb-1.5 tracking-wide">
              CITY
            </label>
            <input
              type="text"
              name="city"
              required
              value={form.city}
              onChange={handleChange}
              className="w-full border-2 border-asphalt rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-signal"
              placeholder="e.g. Pune"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-steel mb-1.5 tracking-wide">
              LOCALITY
            </label>
            <input
              type="text"
              name="locality"
              required
              value={form.locality}
              onChange={handleChange}
              className="w-full border-2 border-asphalt rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-signal"
              placeholder="e.g. Kothrud"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-signal text-asphalt font-semibold py-3 rounded-md hover:bg-asphalt hover:text-signal transition-colors mt-2 disabled:opacity-60"
          >
            {loading ? 'Registering…' : 'Register school'}
          </button>
        </form>

        <LaneDivider className="opacity-20 my-8" />
      </div>
    </div>
  )
}