import { useState, useEffect, useCallback } from 'react'
import AdminSidebar from '../components/AdminSidebar'
import Overview from '../components/admin/Overview'
import Schools from '../components/admin/Schools'
import UsersList from '../components/admin/UsersList'

export default function AdminDashboard() {
  const [active, setActive] = useState('overview')
  const [stats, setStats] = useState(null)
  const [schools, setSchools] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  const fetchAll = useCallback(() => {
    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }
    setLoading(true)

    Promise.all([
      fetch('http://localhost:5000/api/admin/stats', { headers }).then((r) => r.json()),
      fetch('http://localhost:5000/api/admin/schools', { headers }).then((r) => r.json()),
      fetch('http://localhost:5000/api/admin/users', { headers }).then((r) => r.json()),
    ])
      .then(([statsData, schoolsData, usersData]) => {
        setStats(statsData)
        setSchools(schoolsData)
        setUsers(usersData)
      })
      .catch(() => setError('Failed to load admin data'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id)
    try {
      const token = localStorage.getItem('token')
      await fetch(`http://localhost:5000/api/admin/schools/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      })
      fetchAll()
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="min-h-screen flex bg-canvas text-asphalt">
      <AdminSidebar active={active} onChange={setActive} />
      <main className="flex-1 px-10 py-10">
        {loading && <p className="text-steel text-sm">Loading…</p>}
        {error && <div className="border-2 border-brake rounded-lg p-6 text-brake text-sm max-w-md">{error}</div>}

        {!loading && !error && (
          <>
            {active === 'overview' && <Overview stats={stats} />}
            {active === 'schools' && (
              <Schools schools={schools} onStatusChange={handleStatusChange} updatingId={updatingId} />
            )}
            {active === 'users' && <UsersList users={users} />}
          </>
        )}
      </main>
    </div>
  )
}