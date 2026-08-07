export default function Overview({ stats }) {
  const cards = [
    { label: 'Total schools', value: stats.totalSchools },
    { label: 'Pending approval', value: stats.pendingSchools, highlight: stats.pendingSchools > 0 },
    { label: 'Approved schools', value: stats.approvedSchools },
    { label: 'Total learners', value: stats.totalLearners },
    { label: 'Total owners', value: stats.totalOwners },
    { label: 'Total instructors', value: stats.totalInstructors },
    { label: 'Total bookings', value: stats.totalEnrollments },
    { label: 'Total reviews', value: stats.totalReviews },
  ]

  return (
    <div>
      <h1 className="font-display text-4xl mb-8">Platform Overview</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`border-2 rounded-lg p-5 ${c.highlight ? 'border-signal bg-signal/10' : 'border-asphalt'}`}
          >
            <p className="text-xs font-mono text-steel tracking-wide mb-2">{c.label.toUpperCase()}</p>
            <p className="font-mono text-3xl font-semibold">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="border-2 border-asphalt rounded-lg p-6">
        <p className="text-xs font-mono text-steel tracking-wide mb-2">ESTIMATED PLATFORM BOOKING VALUE</p>
        <p className="font-mono text-4xl font-semibold">
          ₹{stats.estimatedRevenue.toLocaleString('en-IN')}
        </p>
        <p className="text-xs text-steel mt-2">Sum of course prices across all bookings ever made.</p>
      </div>
    </div>
  )
}