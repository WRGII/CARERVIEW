import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Layout } from '../components/common/Layout'
import { Loading } from '../components/ui/Loading'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { Button } from '../components/ui/Button'
import { AggregateData } from '../components/admin/AggregateData'
import { BarChart3 } from 'lucide-react'

type AdminView = 'dashboard'

export default function AdminPage() {
  const { loading, error, user, profile } = useAuth()
  const [currentView, setCurrentView] = useState<AdminView>('dashboard')

  // Guards (App also has route guards, but this is a friendly fallback)
  if (loading) return <Loading message="Loading admin dashboard..." />
  if (error) return <ErrorMessage message={error} />
  if (!user || !profile) return <ErrorMessage message="Authentication required." />
  if (profile.role !== 'admin') return <ErrorMessage message="Admin access required." />

  return (
    <Layout title="Administrator Dashboard">
      <div className="space-y-6">
        {/* Navigation */}
        <div className="flex space-x-4 border-b border-slate-200 pb-4">
          <Button
            variant={currentView === 'dashboard' ? 'primary' : 'ghost'}
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center space-x-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Dashboard</span>
          </Button>
        </div>

        {/* Content */}
        {currentView === 'dashboard' && <AggregateData />}
      </div>
    </Layout>
  )
}
