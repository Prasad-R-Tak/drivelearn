import { LayoutDashboard, School, Users, LogOut } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'schools', label: 'Schools', icon: School },
  { key: 'users', label: 'Users', icon: Users },
]

export default function AdminSidebar({ active, onChange }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <aside className="w-56 shrink-0 bg-asphalt text-canvas min-h-screen flex flex-col justify-between">
      <div>
        <div className="px-6 py-6">
          <Link to="/" className="font-display text-2xl text-signal">
            DriveLearn
          </Link>
          <p className="text-xs font-mono text-steel mt-1">SUPER ADMIN</p>
        </div>

        <nav className="px-3 flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = active === item.key
            return (
              <button
                key={item.key}
                onClick={() => onChange(item.key)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive ? 'bg-signal text-asphalt font-semibold' : 'text-steel hover:text-canvas hover:bg-white/5'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>

      <div className="px-3 pb-6">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-steel hover:text-canvas hover:bg-white/5 transition-colors w-full"
        >
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </aside>
  )
}