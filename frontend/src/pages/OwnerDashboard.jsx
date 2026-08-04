import { useState, useEffect, useCallback } from 'react'
import DashboardSidebar from '../components/DashboardSidebar'
import Overview from '../components/dashboard/Overview'
import Students from '../components/dashboard/Students'
import Courses from '../components/dashboard/Courses'
import RegisterSchool from './RegisterSchool'

export default function OwnerDashboard() {
  const [active, setActive] = useState('overview')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDashboard = useCallback(() => {
    const token = localStorage.getItem('token')
    setLoading(true)
    return fetch('http://localhost:5000/api/owner/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load dashboard')
        return res.json()
      })
      .then((json) => setData(json))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-steel text-sm">Loading…</div>
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="border-2 border-brake rounded-lg p-6 text-brake text-sm max-w-md">{error}</div>
      </div>
    )
  }

  if (data && !data.hasSchool) {
    return <RegisterSchool onRegistered={fetchDashboard} />
  }

  return (
    <div className="min-h-screen flex bg-canvas text-asphalt">
      <DashboardSidebar active={active} onChange={setActive} />
      <main className="flex-1 px-10 py-10">
        {data && (
          <>
            {active === 'overview' && <Overview stats={data.stats} students={data.students} />}
            {active === 'students' && (
              <Students students={data.students} courses={data.courses} onDataChanged={fetchDashboard} />
            )}
            {active === 'courses' && (
              <Courses courses={data.courses} onDataChanged={fetchDashboard} />
            )}
          </>
        )}
      </main>
    </div>
  )
}