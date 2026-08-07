import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import LaneDivider from '../components/LaneDivider'
import { useAuth } from '../context/AuthContext'
import { useSearchParams } from 'react-router-dom'

export default function Auth() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState(searchParams.get('mode') === 'signup' ? 'signup' : 'login')
  const [role, setRole] = useState(searchParams.get('role') === 'owner' ? 'owner' : 'learner')
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isSignup = mode === 'signup'

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (isSignup && form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const endpoint = isSignup ? 'signup' : 'login'
      const body = isSignup
        ? { name: form.name, email: form.email, password: form.password, role: role.toUpperCase() }
        : { email: form.email, password: form.password }

      const res = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      // Store the session
      login(data.user, data.token)

      // Redirect based on role
      if (data.user.role === 'OWNER') {
        navigate('/dashboard')
      } else if (data.user.role === 'INSTRUCTOR') {
        navigate('/instructor')
      } else if (data.user.role === 'ADMIN') {
        navigate('/admin')
      } else {
        navigate('/my-courses')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-canvas text-asphalt">
      {/* Left panel — brand side */}
      <div className="hidden lg:flex lg:w-2/5 bg-asphalt text-canvas flex-col justify-between p-10">
        <Link to="/" className="font-display text-3xl text-signal">
          DriveLearn
        </Link>

        <div>
          <p className="font-mono text-xs text-signal tracking-widest mb-4">
            {isSignup ? 'JOIN THE PLATFORM' : 'WELCOME BACK'}
          </p>
          <h1 className="font-display text-5xl leading-[0.95] mb-4">
            {isSignup ? 'Start your\njourney.' : 'Back on\nthe road.'}
          </h1>
          <p className="text-steel max-w-sm">
            {isSignup
              ? 'Create an account to book lessons or list your driving school.'
              : 'Log in to manage your bookings, lessons, or your school.'}
          </p>
        </div>

        <span className="font-mono text-xs text-steel">© 2026 DriveLearn India</span>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col">
        <div className="lg:hidden px-6 pt-6">
          <Link to="/" className="font-display text-2xl text-asphalt">
            DriveLearn
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">
            {/* Mode toggle */}
            <div className="flex border-2 border-asphalt rounded-md overflow-hidden mb-8">
              <button
                onClick={() => { setMode('login'); setError('') }}
                className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${mode === 'login' ? 'bg-asphalt text-canvas' : 'bg-transparent text-asphalt'
                  }`}
              >
                Log in
              </button>
              <button
                onClick={() => { setMode('signup'); setError('') }}
                className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${mode === 'signup' ? 'bg-asphalt text-canvas' : 'bg-transparent text-asphalt'
                  }`}
              >
                Sign up
              </button>
            </div>

            <h2 className="font-display text-3xl mb-1">
              {isSignup ? 'Create your account' : 'Log in'}
            </h2>
            <p className="text-steel text-sm mb-6">
              {isSignup ? 'Takes less than a minute.' : "Enter your details to continue."}
            </p>

            {error && (
              <div className="mb-4 text-sm text-brake border-2 border-brake rounded-md px-3 py-2">
                {error}
              </div>
            )}

            {/* Role selector — signup only */}
            {isSignup && (
              <div className="mb-6">
                <label className="block text-xs font-mono text-steel mb-2 tracking-wide">
                  I AM A
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('learner')}
                    className={`border-2 rounded-md py-3 text-sm font-semibold transition-colors ${role === 'learner'
                        ? 'border-signal bg-signal/10 text-asphalt'
                        : 'border-steel/40 text-steel'
                      }`}
                  >
                    Learner
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('owner')}
                    className={`border-2 rounded-md py-3 text-sm font-semibold transition-colors ${role === 'owner'
                        ? 'border-signal bg-signal/10 text-asphalt'
                        : 'border-steel/40 text-steel'
                      }`}
                  >
                    School owner
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignup && (
                <div>
                  <label className="block text-xs font-mono text-steel mb-1.5 tracking-wide">
                    FULL NAME
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border-2 border-asphalt rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-signal transition-colors"
                    placeholder="Your name"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-mono text-steel mb-1.5 tracking-wide">
                  EMAIL
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border-2 border-asphalt rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-signal transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-steel mb-1.5 tracking-wide">
                  PASSWORD
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="w-full border-2 border-asphalt rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-signal transition-colors"
                  placeholder="••••••••"
                />
              </div>

              {isSignup && (
                <div>
                  <label className="block text-xs font-mono text-steel mb-1.5 tracking-wide">
                    CONFIRM PASSWORD
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="w-full border-2 border-asphalt rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-signal transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-signal text-asphalt font-semibold py-3 rounded-md hover:bg-asphalt hover:text-signal transition-colors mt-2 disabled:opacity-60"
              >
                {loading ? 'Please wait…' : isSignup ? 'Create account' : 'Log in'}
              </button>
            </form>

            <LaneDivider className="opacity-20 my-8" />

            <p className="text-center text-sm text-steel">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => { setMode(isSignup ? 'login' : 'signup'); setError('') }}
                className="text-asphalt font-semibold hover:text-brake transition-colors"
              >
                {isSignup ? 'Log in' : 'Sign up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}