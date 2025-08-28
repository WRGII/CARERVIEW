import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Layout } from '../components/common/Layout'
import { Loading } from '../components/ui/Loading'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { Button } from '../components/ui/Button'
import { AggregateData } from '../components/admin/AggregateData'
import { BarChart3 } from 'lucide-react'

type AdminView = 'dashboard'

export const AdminPage: React.FC = () => {
  const { user, loading, error } = useAuth()
  const [currentView, setCurrentView] = useState<AdminView>('dashboard')

  if (loading) return <Loading message="Loading admin dashboard..." />

  if (error || !user || !user.profile || user.profile.role !== 'admin') {
    return <ErrorMessage message={error || 'Access denied. Administrator access required.'} />
  }

  const renderContent = () => {
    switch (currentView) {
      default:
        return <AggregateData />
    }
  }

  return (
    <Layout title="Administrator Dashboard" user={user}>
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
        {renderContent()}
      </div>
    </Layout>
  )
}