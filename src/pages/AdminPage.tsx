// src/pages/AdminPage.tsx
import React from 'react'
import { useAuth } from '../hooks/useAuth'
import AggregateData from '../components/admin/AggregateData'

export default function AdminPage() {
  const { user, isAdmin, loading, error } = useAuth()

  if (loading) return <div className="p-6">Loading admin dashboard...</div>
  if (error || !user) return <div className="p-6 text-red-600">{error || 'Authentication required.'}</div>
  if (!isAdmin) return <div className="p-6 text-red-600">Admin access required.</div>

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>

      {/* System-wide aggregates / KPIs */}
      <div className="mt-6">
        <AggregateData />
      </div>

      {/* Add any other existing admin widgets/components below */}
      {/* <OtherAdminWidget /> */}
    </div>
  )
}
