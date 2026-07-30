import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-asphalt text-canvas">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-3xl tracking-wide text-signal leading-none">
            DriveLearn
          </span>
          <span className="hidden sm:inline text-xs font-mono text-steel">INDIA</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="#how-it-works" className="hover:text-signal transition-colors">
            How it works
          </a>
          <a href="#for-schools" className="hover:text-signal transition-colors">
            For schools
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {user.role === 'OWNER' && (
                <Link
                  to="/dashboard"
                  className="text-sm font-medium hover:text-signal transition-colors"
                >
                  Dashboard
                </Link>
              )}
              <span className="text-sm text-steel hidden sm:inline">{user.name}</span>
              <button
                onClick={handleLogout}
                className="text-sm font-semibold border border-steel/40 px-3 py-1.5 rounded-md hover:border-signal hover:text-signal transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium hover:text-signal transition-colors">
                Log in
              </Link>
              <Link
                to="/schools"
                className="bg-signal text-asphalt text-sm font-semibold px-4 py-2 rounded-md hover:bg-white transition-colors"
              >
                Find a school
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}