import { stats, students } from '../../data/ownerData'

export default function Overview() {
  const cards = [
    { label: 'Total students', value: stats.totalStudents },
    { label: 'Active courses', value: stats.activeCourses },
    { label: 'Bookings this month', value: stats.bookingsThisMonth },
    { label: 'Average rating', value: stats.avgRating },
  ]

  const recent = students.slice(0, 4)

  return (
    <div>
      <h1 className="font-display text-4xl mb-8">Overview</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map((c) => (
          <div key={c.label} className="border-2 border-asphalt rounded-lg p-5">
            <p className="text-xs font-mono text-steel tracking-wide mb-2">
              {c.label.toUpperCase()}
            </p>
            <p className="font-mono text-3xl font-semibold">{c.value}</p>
          </div>
        ))}
      </div>

      <h2 className="font-display text-2xl mb-4">Recent students</h2>
      <div className="border-2 border-asphalt rounded-lg overflow-hidden">
        {recent.map((s, i) => (
          <div
            key={s.id}
            className={`flex items-center justify-between px-5 py-3 text-sm ${
              i !== recent.length - 1 ? 'border-b border-asphalt/20' : ''
            }`}
          >
            <span className="font-medium">{s.name}</span>
            <span className="text-steel font-mono text-xs">{s.course}</span>
            <span
              className={`text-xs font-semibold px-2 py-1 rounded ${
                s.status === 'Completed' ? 'bg-route/10 text-route' : 'bg-signal/20 text-asphalt'
              }`}
            >
              {s.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}