import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import Layout from '@/components/Layout'
import Login from '@/pages/Login'
import ChangePassword from '@/pages/ChangePassword'
import Dashboard from '@/pages/Dashboard'
import Checkout from '@/pages/Checkout'
import Return from '@/pages/Return'
import Admin from '@/pages/Admin'
import Volunteer from '@/pages/Volunteer'
import Rules from '@/pages/Rules'
import Books from '@/pages/Books'

function AppRoutes() {
  const { user, resident, isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  // Not logged in
  if (!user) {
    // Allow public access to rules page
    if (window.location.pathname === '/rules') {
      return (
        <div className="min-h-screen bg-gray-50 px-4 py-6 max-w-2xl mx-auto">
          <a href="/" className="text-sm text-blue-600 underline mb-4 inline-block">← Back to login</a>
          <Rules />
        </div>
      )
    }
    return <Login />
  }

  // Must change password
  if (resident?.must_change_password) return <ChangePassword />

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/catalog" element={<Books />} />
        <Route path="/wishlist" element={<Books />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/checkout" element={isAdmin ? <Checkout /> : <Navigate to="/dashboard" />} />
        <Route path="/return" element={isAdmin ? <Return /> : <Navigate to="/dashboard" />} />
        <Route path="/admin" element={isAdmin ? <Admin /> : <Navigate to="/dashboard" />} />
        <Route path="/volunteer" element={!isAdmin ? <Volunteer /> : <Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
