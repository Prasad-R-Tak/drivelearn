import { useState } from 'react'
import UserDetailModal from './UserDetailModal'

const roleFilters = ['ALL', 'LEARNER', 'OWNER', 'INSTRUCTOR', 'ADMIN']

export default function UsersList({ users }) {
  const [filter, setFilter] = useState('ALL')
  const [selectedUserId, setSelectedUserId] = useState(null)

  const filtered = filter === 'ALL' ? users : users.filter((u) => u.role === filter)

  const roleColor = (role) =>
    role === 'ADMIN'
      ? 'bg-brake/10 text-brake'
      : role === 'OWNER'
      ? 'bg-signal/20 text-asphalt'
      : role === 'INSTRUCTOR'
      ? 'bg-route/10 text-route'
      : 'bg-steel/10 text-steel'

  return (
    <div>
      <h1 className="font-display text-4xl mb-6">Users</h1>

      <div className="flex gap-2 mb-6">
        {roleFilters.map((r) => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            className={`text-xs font-mono px-3 py-1.5 rounded-md border-2 transition-colors ${
              filter === r ? 'border-signal bg-signal/10 font-semibold' : 'border-steel/30 text-steel'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-steel text-sm">No users found.</p>
      ) : (
        <div className="border-2 border-asphalt rounded-lg overflow-hidden">
          {filtered.map((u, idx) => (
            <div
              key={u.id}
              onClick={() => setSelectedUserId(u.id)}
              className={`flex items-center justify-between px-5 py-3 text-sm cursor-pointer hover:bg-signal/5 transition-colors ${
                idx !== filtered.length - 1 ? 'border-b border-asphalt/20' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                {u.photoUrl ? (
                  <img
                    src={`http://localhost:5000${u.photoUrl}`}
                    alt={u.name}
                    className="w-8 h-8 rounded-full object-cover border border-steel/40"
                  />
                ) : (
                  <span className="w-8 h-8 rounded-full bg-signal/20 flex items-center justify-center text-xs font-semibold">
                    {u.name?.[0]}
                  </span>
                )}
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-steel">{u.email}</p>
                </div>
              </div>
              <span className="text-xs text-steel hidden sm:inline">{u.city || '—'}</span>
              <span className={`text-xs font-semibold px-2 py-1 rounded ${roleColor(u.role)}`}>{u.role}</span>
            </div>
          ))}
        </div>
      )}

      {selectedUserId && (
        <UserDetailModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}
    </div>
  )
}