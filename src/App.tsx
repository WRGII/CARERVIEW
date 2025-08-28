// src/App.tsx
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from './hooks/useAuth'

// IMPORTANT: LandingPage is a *named* export in your code
import { LandingPage } from './pages/LandingPage'

// IMPORTANT: AdminPage and CaregiverPage should be default exports.
// If you get “no default export” build errors, open those files and
// make sure they end with:  export default function AdminPage() { … }
import AdminPage from './pages/AdminPage'
import CaregiverPage from './pages/CaregiverPage'

const queryClient = new QueryClient()

function AdminGuard({ children }: { children: JSX.Element }) {
  const { loading, user, profile } = useAuth()
  if (loading) return <div className="p-6">Loading…</div>
  if (!user || !profile) return <Navigate to="/" replace />
  if (profile.role !== 'admin') return <Navigate to="/caregiver" replace />
  return children
}

function CaregiverGuard({ children }: { children: JSX.Element }) {
  const { loading, user, profile } = useAuth()
  if (loading) return <div className="p-6">Loading…</div>
  if (!user || !profile) return <Navigate to="/" replace />
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
