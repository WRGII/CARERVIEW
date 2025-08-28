import React from 'react'
import { Activity } from 'lucide-react'
import { useCaregiverInfo } from '../../hooks/useCaregiverInfo'

interface LayoutProps {
  children: React.ReactNode
  title: string
  role: 'admin' | 'caregiver'
  tokenId?: string
}

export const Layout: React.FC<LayoutProps> = ({ children, title, role, tokenId }) => {
  const { data: caregiverInfo, isLoading: caregiverLoading } = useCaregiverInfo(
    role === 'caregiver' ? tokenId || null : null
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Activity className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-slate-900">CarerView</h1>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-slate-500 capitalize">{role} Portal</p>
                  {role === 'caregiver' && caregiverInfo && !caregiverLoading && (
                    <>
                      <span className="text-slate-300">•</span>
                      <div className="text-sm text-slate-600">
                        <span className="font-medium">{caregiverInfo.display_name}</span>
                        {caregiverInfo.email && (
                          <span className="text-slate-500 ml-1">({caregiverInfo.email})</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}