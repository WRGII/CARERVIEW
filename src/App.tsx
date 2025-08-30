// src/App.tsx
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from './hooks/useAuth'

// Landing is a named export (you also have default export, but this works fine)
import { LandingPage } from './pages/LandingPage'

// These are default exports
import AdminPage from './pages/AdminPage'
import CaregiverPage from './pages/CaregiverPage'
import ResetPassword from './pages/ResetPassword' // <-- added

const queryClient = new QueryClient()

function AdminGuard({ children }: { children: JSX.Element }) {
  const { loading, user, isAdmin } = useAuth()
  if (loading) return <div className="p-6">Loading…</div>
  if (!user) return <Navigate to="/" replace />
  if (!isAdmin) return <Navigate to="/caregiver" replace />
  return children
}

function CaregiverGuard({ children }: { children: JSX.Element }) {
  const { loading, user, profile } = useAuth()
  if (loading) return <div className="p-6">Loading…</div>
  if (!user) return <Navigate to="/" replace />
  // Soften this: don't redirect signed-in users to "/" while profile is still null.
  if (!profile) return <div className="p-6">Preparing your caregiver workspace…</div>
  if (profile.disabled) return <div className="p-6 text-red-600">Account disabled.</div>
  return children
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/admin"
            element={
              <AdminGuard>
                <AdminPage />
              </AdminGuard>
            }
          />
          <Route
            path="/caregiver"
            element={
              <CaregiverGuard>
                <CaregiverPage />
              </CaregiverGuard>
            }
          />
          <Route path="/reset-password" element={<ResetPassword />} /> {/* <-- added */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
