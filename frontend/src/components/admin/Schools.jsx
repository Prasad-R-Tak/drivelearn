import { useState } from 'react'
import SchoolDetailModal from './SchoolDetailModal'

export default function Schools({ schools, onStatusChange, updatingId }) {
  const [selectedSchoolId, setSelectedSchoolId] = useState(null)
  const statusColor = (status) =>
    status === 'APPROVED'
      ? 'bg-route/10 text-route'
      : status === 'REJECTED'
      ? 'bg-brake/10 text-brake'
      : 'bg-signal/20 text-asphalt'

  return (
    <div>
      <h1 className="font-display text-4xl mb-8">Schools</h1>

      {schools.length === 0 ? (
        <p className="text-steel text-sm">No schools registered yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {schools.map((s) => (
            <div key={s.id} className="border-2 border-asphalt rounded-lg p-5 flex items-center justify-between gap-4">
              <div
                onClick={() => setSelectedSchoolId(s.id)}
                className="flex items-center gap-4 cursor-pointer flex-1"
              >
                {s.ownerPhoto ? (
                  <img
                    src={`http://localhost:5000${s.ownerPhoto}`}
                    alt={s.ownerName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-asphalt"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-signal/20 flex items-center justify-center font-display text-lg">
                    {s.ownerName?.[0]}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-display text-xl">{s.name}</h3>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${statusColor(s.status)}`}>
                      {s.status}
                    </span>
                  </div>
                  <p className="text-sm text-steel">
                    {s.locality}, {s.city} · {s.courseCount} courses · {s.studentCount} students
                  </p>
                  <p className="text-xs font-mono text-steel mt-1">
                    Owner: {s.ownerName} ({s.ownerEmail}
                    {s.ownerPhone ? `, ${s.ownerPhone}` : ''})
                  </p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => onStatusChange(s.id, 'APPROVED')}
                  disabled={updatingId === s.id || s.status === 'APPROVED'}
                  className="border-2 border-route text-route text-sm font-semibold px-4 py-2 rounded-md hover:bg-route hover:text-canvas transition-colors disabled:opacity-40"
                >
                  Approve
                </button>
                <button
                  onClick={() => onStatusChange(s.id, 'REJECTED')}
                  disabled={updatingId === s.id || s.status === 'REJECTED'}
                  className="border-2 border-brake text-brake text-sm font-semibold px-4 py-2 rounded-md hover:bg-brake hover:text-canvas transition-colors disabled:opacity-40"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedSchoolId && (
        <SchoolDetailModal schoolId={selectedSchoolId} onClose={() => setSelectedSchoolId(null)} />
      )}
    </div>
  )
}