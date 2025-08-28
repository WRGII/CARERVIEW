import React from 'react'
import { Activity, LogOut } from 'lucide-react'
import { signOut } from '../../lib/auth'
import type { AuthUser } from '../../lib/auth'
import { Button } from '../ui/Button'

interface LayoutProps {
  children: React.ReactNode
  title: string
  user: AuthUser
}

export const Layout: React.FC<LayoutProps> = ({ children, title, user }) => {
  const handleSignOut = async () => {
    try {
      await signOut()
      window.location.href = '/'
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

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
                  <p className="text-sm text-slate-500 capitalize">{user.profile?.role} Portal</p>
                  <span className="text-slate-300">•</span>
                  <div className="text-sm text-slate-600">
                    <span className="font-medium">{user.profile?.display_name}</span>
                    <span className="text-slate-500 ml-1">({user.email})</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </Button>
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