import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { AdminPage } from './pages/AdminPage'
import { CaregiverPage } from './pages/CaregiverPage'
import { LandingPage } from './pages/LandingPage'
import { Loading } from './components/ui/Loading'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <Loading message="Loading..." />
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function RoleGuard({ role, children }: { role: 'admin' | 'caregiver', children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <Loading message="Loading..." />
  }

  if (!user || !user.profile || user.profile.role !== role) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return <Loading message="Loading application..." />
  }

  return (
    <Routes>
      <Route path="/" element={
        user ? (
          <Navigate to={user.profile?.role === 'admin' ? '/admin' : '/caregiver'} replace />
        ) : (
          <LandingPage />
        )
      } />
      <Route path="/admin" element={
        <AuthGuard>
          <RoleGuard role="admin">
            <AdminPage />
          </RoleGuard>
        </AuthGuard>
      } />
      <Route path="/caregiver" element={
        <AuthGuard>
          <RoleGuard role="caregiver">
            <CaregiverPage />
          </RoleGuard>
        </AuthGuard>
      } />
    </Routes>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-slate-50" style={{ fontSize: '18px' }}>
          <AppRoutes />
        </div>
      </Router>
    </QueryClientProvider>
  )
}

export default App