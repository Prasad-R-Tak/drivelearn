import { useState, useEffect } from 'react'
import Modal from '../Modal'

export default function SchoolDetailModal({ schoolId, onClose }) {
  const [school, setSchool] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    fetch(`http://localhost:5000/api/admin/schools/${schoolId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setSchool(data))
      .finally(() => setLoading(false))
  }, [schoolId])

  return (
    <Modal title={loading ? 'Loading…' : school?.name || 'School'} onClose={onClose}>
      {loading && <p className="text-steel text-sm">Loading…</p>}

      {school && (
        <div className="max-h-[70vh] overflow-y-auto">
          <p className="text-sm text-steel mb-1">
            {school.locality}, {school.city} · {school.status}
          </p>

          <div className="border-2 border-asphalt/30 rounded-md p-3 text-sm mb-6 mt-4">
            <p className="text-xs font-mono text-steel mb-1">OWNER</p>
            <div className="flex items-center gap-3">
              {school.owner.photoUrl ? (
                <img
                  src={`http://localhost:5000${school.owner.photoUrl}`}
                  alt={school.owner.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-signal/20 flex items-center justify-center font-semibold">
                  {school.owner.name?.[0]}
                </div>
              )}
              <div>
                <p className="font-semibold">{school.owner.name}</p>
                <p className="text-xs text-steel">
                  {school.owner.email}
                  {school.owner.phone && ` · ${school.owner.phone}`}
                </p>
              </div>
            </div>
          </div>

          <p className="font-display text-lg mb-2">
            Instructors <span className="text-steel text-sm font-body">({school.instructors.length})</span>
          </p>
          {school.instructors.length === 0 ? (
            <p className="text-steel text-sm mb-6">No instructors added yet.</p>
          ) : (
            <div className="flex flex-col gap-2 mb-6">
              {school.instructors.map((i) => (
                <div key={i.id} className="border-2 border-asphalt/30 rounded-md p-3 text-sm flex justify-between">
                  <div>
                    <p className="font-semibold">{i.name}</p>
                    <p className="text-xs text-steel">{i.email}</p>
                  </div>
                  <span className="text-xs font-mono text-steel self-center">{i.studentCount} students</span>
                </div>
              ))}
            </div>
          )}

          <p className="font-display text-lg mb-2">
            Students <span className="text-steel text-sm font-body">({school.students.length})</span>
          </p>
          {school.students.length === 0 ? (
            <p className="text-steel text-sm">No students enrolled yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {school.students.map((s) => (
                <div key={s.id} className="border-2 border-asphalt/30 rounded-md p-3 text-sm">
                  <p className="font-semibold">{s.studentName}</p>
                  <p className="text-xs text-steel">
                    {s.courseName} · Instructor: {s.instructorName}
                  </p>
                  <p className="text-xs font-mono text-steel">
                    {s.status} · {s.progress}% complete
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}