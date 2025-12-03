import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Reminder from './pages/Reminder'
import AiSuggestions from './pages/AiSuggestions'
import Profile from './pages/Profile'

function AppRoutes() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <Routes>

      {/* LOGIN */}
      <Route 
        path="/login" 
        element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
      />

      {/* SIGNUP */}
      <Route 
        path="/signup" 
        element={user ? <Navigate to="/dashboard" replace /> : <Signup />} 
      />

      {/* DASHBOARD */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* REDIRECT ROOT */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* REMINDER — FIXED */}
      <Route
        path="/reminder"
        element={
          <ProtectedRoute>
            <Reminder />
          </ProtectedRoute>
        }
      />

      {/* AI INSIGHTS — FIXED */}
      <Route
        path="/ai"
        element={
          <ProtectedRoute>
            <AiSuggestions />
          </ProtectedRoute>
        }
      />

      {/* PROFILE */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* UNKNOWN ROUTES */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />

    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  )
}
