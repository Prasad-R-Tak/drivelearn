import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import SchoolSearch from './pages/SchoolSearch'
import SchoolDetail from './pages/SchoolDetail'
import OwnerDashboard from './pages/OwnerDashboard'
import Settings from './pages/Settings'
import InstructorDashboard from './pages/InstructorDashboard'
import AdminDashboard from './pages/AdminDashboard'
import LearnerDashboard from './pages/LearnerDashboard'

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />

  return children
}

function AppRoutes() {
  return (
    <Routes>

      <Route
        path="/my-courses"
        element={
          <ProtectedRoute role="LEARNER">
            <LearnerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor"
        element={
          <ProtectedRoute role="INSTRUCTOR">
            <InstructorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/schools" element={<SchoolSearch />} />
      <Route path="/schools/:id" element={<SchoolDetail />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute role="OWNER">
            <OwnerDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App