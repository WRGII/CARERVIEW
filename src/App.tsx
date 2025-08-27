import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AdminPage } from './pages/AdminPage'
import { CaregiverPage } from './pages/CaregiverPage'
import { LandingPage } from './pages/LandingPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-slate-50" style={{ fontSize: '18px' }}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/caregiver" element={<CaregiverPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  )
}

export default App