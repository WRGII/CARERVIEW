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
  const { user, profile, loading, error } = useAuth()
  const [currentView, setCurrentView] = useState<AdminView>('dashboard')

  if (loading) return <Loading message="Loading admin dashboard..." />
  if (error || !user) return <ErrorMessage message={error || 'Authentication required.'} />
  if (!profile || profile.role !== 'admin') return <ErrorMessage message="Admin access required." />

  const renderContent = () => {
    switch (currentView) {
      default:
        return <AggregateData />
    }
  }

  return (
    // pass both user + profile to Layout (spread them together)
    <Layout title="Administrator Dashboard" user={{ ...user, profile }}>
      <div className="space-y-6">
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
        {renderContent()}
      </div>
    </Layout>
  )
}
