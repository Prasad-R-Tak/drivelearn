import { useState, useEffect, useRef } from 'react'
import { Camera } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const { user, login, refreshUser } = useAuth()
  const fileInputRef = useRef(null)

  const [profile, setProfile] = useState({
    name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '', bio: '',
  })
  const [profileMsg, setProfileMsg] = useState('')
  const [profileError, setProfileError] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)

  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoError, setPhotoError] = useState('')

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' })
  const [passwordMsg, setPasswordMsg] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)

  const [school, setSchool] = useState({ name: '', city: '', locality: '' })
  const [schoolMsg, setSchoolMsg] = useState('')
  const [schoolError, setSchoolError] = useState('')
  const [schoolLoading, setSchoolLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
        bio: user.bio || '',
      })
    }
  }, [user])

  useEffect(() => {
    if (user?.role === 'OWNER') {
      const token = localStorage.getItem('token')
      fetch('http://localhost:5000/api/owner/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.hasSchool) {
            setSchool({ name: data.school.name, city: data.school.city, locality: data.school.locality })
          }
        })
        .catch(() => {})
    }
  }, [user])

  const handlePhotoSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPhotoError('')
    setPhotoUploading(true)
    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('photo', file)

      const res = await fetch('http://localhost:5000/api/auth/me/photo', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to upload photo')

      refreshUser({ ...user, photoUrl: data.photoUrl })
    } catch (err) {
      setPhotoError(err.message)
    } finally {
      setPhotoUploading(false)
    }
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileMsg('')
    setProfileError('')
    setProfileLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:5000/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(profile),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update profile')

      login({ ...user, ...data }, token)
      setProfileMsg('Profile updated.')
    } catch (err) {
      setProfileError(err.message)
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordMsg('')
    setPasswordError('')
    setPasswordLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:5000/api/auth/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(passwords),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update password')

      setPasswords({ currentPassword: '', newPassword: '' })
      setPasswordMsg('Password updated.')
    } catch (err) {
      setPasswordError(err.message)
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleSchoolSubmit = async (e) => {
    e.preventDefault()
    setSchoolMsg('')
    setSchoolError('')
    setSchoolLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:5000/api/owner/school', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(school),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update school')

      setSchoolMsg('School details updated.')
    } catch (err) {
      setSchoolError(err.message)
    } finally {
      setSchoolLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-canvas text-asphalt">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="font-display text-4xl mb-10">Settings</h1>

        {/* Photo */}
        <section className="mb-12 flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-asphalt/10 border-2 border-asphalt overflow-hidden flex items-center justify-center">
              {user.photoUrl ? (
                <img
                  src={`http://localhost:5000${user.photoUrl}`}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-display text-3xl text-steel">{user.name?.[0]}</span>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current.click()}
              disabled={photoUploading}
              className="absolute -bottom-1 -right-1 bg-signal text-asphalt rounded-full p-2 border-2 border-canvas hover:bg-asphalt hover:text-signal transition-colors disabled:opacity-60"
            >
              <Camera size={14} />
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handlePhotoSelect}
              className="hidden"
            />
          </div>
          <div>
            <p className="font-display text-2xl">{user.name}</p>
            <p className="text-sm text-steel">{user.role.charAt(0) + user.role.slice(1).toLowerCase()}</p>
            {photoUploading && <p className="text-xs text-steel mt-1">Uploading…</p>}
            {photoError && <p className="text-xs text-brake mt-1">{photoError}</p>}
          </div>
        </section>

        {/* Profile */}
        <section className="mb-12">
          <h2 className="font-display text-2xl mb-4">Profile</h2>
          {profileMsg && <p className="text-route text-sm mb-3">{profileMsg}</p>}
          {profileError && <p className="text-brake text-sm mb-3">{profileError}</p>}
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-steel mb-1.5 tracking-wide">NAME</label>
                <input
                  type="text"
                  required
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full border-2 border-asphalt rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-signal"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-steel mb-1.5 tracking-wide">EMAIL</label>
                <input
                  type="email"
                  required
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full border-2 border-asphalt rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-signal"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-steel mb-1.5 tracking-wide">PHONE NUMBER</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full border-2 border-asphalt rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-signal"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-steel mb-1.5 tracking-wide">ADDRESS</label>
              <input
                type="text"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                placeholder="Street address"
                className="w-full border-2 border-asphalt rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-signal"
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono text-steel mb-1.5 tracking-wide">CITY</label>
                <input
                  type="text"
                  value={profile.city}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  className="w-full border-2 border-asphalt rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-signal"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-steel mb-1.5 tracking-wide">STATE</label>
                <input
                  type="text"
                  value={profile.state}
                  onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                  className="w-full border-2 border-asphalt rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-signal"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-steel mb-1.5 tracking-wide">PINCODE</label>
                <input
                  type="text"
                  value={profile.pincode}
                  onChange={(e) => setProfile({ ...profile, pincode: e.target.value })}
                  className="w-full border-2 border-asphalt rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-signal"
                />
              </div>
            </div>

            {(user.role === 'INSTRUCTOR' || user.role === 'OWNER') && (
              <div>
                <label className="block text-xs font-mono text-steel mb-1.5 tracking-wide">
                  BIO {user.role === 'INSTRUCTOR' ? '(shown to students)' : ''}
                </label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={3}
                  className="w-full border-2 border-asphalt rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-signal"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={profileLoading}
              className="bg-signal text-asphalt text-sm font-semibold px-5 py-2.5 rounded-md hover:bg-asphalt hover:text-signal transition-colors disabled:opacity-60"
            >
              {profileLoading ? 'Saving…' : 'Save profile'}
            </button>
          </form>
        </section>

        {/* Password */}
        <section className="mb-12">
          <h2 className="font-display text-2xl mb-4">Change password</h2>
          {passwordMsg && <p className="text-route text-sm mb-3">{passwordMsg}</p>}
          {passwordError && <p className="text-brake text-sm mb-3">{passwordError}</p>}
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-steel mb-1.5 tracking-wide">CURRENT PASSWORD</label>
              <input
                type="password"
                required
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                className="w-full border-2 border-asphalt rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-signal"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-steel mb-1.5 tracking-wide">NEW PASSWORD</label>
              <input
                type="password"
                required
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                className="w-full border-2 border-asphalt rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-signal"
              />
            </div>
            <button
              type="submit"
              disabled={passwordLoading}
              className="bg-signal text-asphalt text-sm font-semibold px-5 py-2.5 rounded-md hover:bg-asphalt hover:text-signal transition-colors disabled:opacity-60"
            >
              {passwordLoading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </section>

        {/* School details — owners only */}
        {user.role === 'OWNER' && (
          <section>
            <h2 className="font-display text-2xl mb-4">School details</h2>
            {schoolMsg && <p className="text-route text-sm mb-3">{schoolMsg}</p>}
            {schoolError && <p className="text-brake text-sm mb-3">{schoolError}</p>}
            <form onSubmit={handleSchoolSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-steel mb-1.5 tracking-wide">SCHOOL NAME</label>
                <input
                  type="text"
                  required
                  value={school.name}
                  onChange={(e) => setSchool({ ...school, name: e.target.value })}
                  className="w-full border-2 border-asphalt rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-signal"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-steel mb-1.5 tracking-wide">CITY</label>
                <input
                  type="text"
                  required
                  value={school.city}
                  onChange={(e) => setSchool({ ...school, city: e.target.value })}
                  className="w-full border-2 border-asphalt rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-signal"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-steel mb-1.5 tracking-wide">LOCALITY</label>
                <input
                  type="text"
                  required
                  value={school.locality}
                  onChange={(e) => setSchool({ ...school, locality: e.target.value })}
                  className="w-full border-2 border-asphalt rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-signal"
                />
              </div>
              <button
                type="submit"
                disabled={schoolLoading}
                className="bg-signal text-asphalt text-sm font-semibold px-5 py-2.5 rounded-md hover:bg-asphalt hover:text-signal transition-colors disabled:opacity-60"
              >
                {schoolLoading ? 'Saving…' : 'Save school details'}
              </button>
            </form>
          </section>
        )}
      </div>
    </div>
  )
}