import { useState, useEffect } from 'react'
import Modal from '../Modal'

export default function UserDetailModal({ userId, onClose }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    fetch(`http://localhost:5000/api/admin/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setDetail(data))
      .finally(() => setLoading(false))
  }, [userId])

  return (
    <Modal title={loading ? 'Loading…' : detail?.name || 'User'} onClose={onClose}>
      {loading && <p className="text-steel text-sm">Loading…</p>}

      {detail && (
        <div>
          <div className="flex items-center gap-4 mb-6">
            {detail.photoUrl ? (
              <img
                src={`http://localhost:5000${detail.photoUrl}`}
                alt={detail.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-asphalt"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-signal/20 flex items-center justify-center font-display text-xl">
                {detail.name?.[0]}
              </div>
            )}
            <div>
              <p className="font-display text-xl">{detail.name}</p>
              <p className="text-sm text-steel">{detail.email}</p>
              <span className="text-xs font-semibold font-mono">{detail.role}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm mb-6">
            <div>
              <p className="text-xs font-mono text-steel">PHONE</p>
              <p>{detail.phone || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-mono text-steel">CITY</p>
              <p>{detail.city || '—'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-mono text-steel">ADDRESS</p>
              <p>
                {[detail.address, detail.city, detail.state, detail.pincode].filter(Boolean).join(', ') || '—'}
              </p>
            </div>
            {detail.bio && (
              <div className="col-span-2">
                <p className="text-xs font-mono text-steel">BIO</p>
                <p>{detail.bio}</p>
              </div>
            )}
          </div>

          {/* Learner: enrollments */}
          {detail.role === 'LEARNER' && (
            <div>
              <p className="font-display text-lg mb-2">Enrolled courses</p>
              {!detail.enrollments || detail.enrollments.length === 0 ? (
                <p className="text-steel text-sm">No bookings yet.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {detail.enrollments.map((e) => (
                    <div key={e.id} className="border-2 border-asphalt/30 rounded-md p-3 text-sm">
                      <p className="font-semibold">{e.courseName}</p>
                      <p className="text-xs text-steel">
                        {e.schoolName}, {e.schoolCity}
                        {e.instructorName && ` · Instructor: ${e.instructorName}`}
                      </p>
                      <p className="text-xs font-mono text-steel">
                        {e.status} · {e.progress}% complete
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Owner: school */}
          {detail.role === 'OWNER' && (
            <div>
              <p className="font-display text-lg mb-2">School</p>
              {!detail.school ? (
                <p className="text-steel text-sm">No school registered yet.</p>
              ) : (
                <div className="border-2 border-asphalt/30 rounded-md p-3 text-sm">
                  <p className="font-semibold">{detail.school.name}</p>
                  <p className="text-xs text-steel">
                    {detail.school.locality}, {detail.school.city} · {detail.school.status}
                  </p>
                  <p className="text-xs font-mono text-steel">
                    {detail.school.courseCount} courses · {detail.school.studentCount} students ·{' '}
                    {detail.school.instructors.length} instructors
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Instructor: school + students */}
          {detail.role === 'INSTRUCTOR' && (
            <div>
              <p className="font-display text-lg mb-1">
                {detail.school ? `Works at ${detail.school.name}` : 'Not linked to a school'}
              </p>
              <p className="font-display text-lg mt-4 mb-2">Assigned students</p>
              {!detail.students || detail.students.length === 0 ? (
                <p className="text-steel text-sm">No students assigned yet.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {detail.students.map((s) => (
                    <div key={s.id} className="border-2 border-asphalt/30 rounded-md p-3 text-sm">
                      <p className="font-semibold">{s.studentName}</p>
                      <p className="text-xs text-steel">{s.courseName}</p>
                      <p className="text-xs font-mono text-steel">
                        {s.status} · {s.progress}% complete
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}