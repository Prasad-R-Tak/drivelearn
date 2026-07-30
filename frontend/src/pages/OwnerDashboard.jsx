import { useState } from 'react'
import DashboardSidebar from '../components/DashboardSidebar'
import Overview from '../components/dashboard/Overview'
import Students from '../components/dashboard/Students'
import Courses from '../components/dashboard/Courses'

export default function OwnerDashboard() {
  const [active, setActive] = useState('overview')

  return (
    <div className="min-h-screen flex bg-canvas text-asphalt">
      <DashboardSidebar active={active} onChange={setActive} />
      <main className="flex-1 px-10 py-10">
        {active === 'overview' && <Overview />}
        {active === 'students' && <Students />}
        {active === 'courses' && <Courses />}
      </main>
    </div>
  )
}