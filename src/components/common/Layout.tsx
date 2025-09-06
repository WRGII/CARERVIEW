import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, LogOut } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import type { AuthUser } from '../../lib/auth'
import { Button } from '../ui/Button'

interface LayoutProps {
  children: React.ReactNode
  title: string
  user: AuthUser
}

export const Layout: React.FC<LayoutProps> = ({ children, title, user }) => {
  const navigate = useNavigate()
  const [signOutError, setSignOutError] = useState<string | null>(null)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    console.log('Sign out button clicked - starting sign out process')
    setSignOutError(null)
    setIsSigningOut(true)
    
    try {
      console.log('Calling supabase.auth.signOut()')
      await supabase.auth.signOut()
      console.log('supabase.auth.signOut() completed successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      console.error('Sign out error:', err)
      setSignOutError(`Sign out failed: ${errorMessage}`)
      setIsSigningOut(false)
      return // Don't proceed with navigation if sign out failed
    } finally {
      if (!signOutError) {
        console.log('Attempting navigation to landing page')
        // Try router navigation
        navigate('/', { replace: true })
        // Fallback: force hard reload to LandingPage
        setTimeout(() => {
          if (window.location.pathname !== '/') {
            console.log('Router navigation may have failed, forcing page reload')
            window.location.assign('/')
          }
        }, 100) // Increased timeout slightly
      }
      setIsSigningOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-warm-white">
      <header className="bg-warm-white shadow-sm border-b border-slate-gray/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img 
                src="/CareView_logo_1_colored_highres.png" 
                alt="CarerView Logo" 
                className="w-8 h-8 object-contain mr-3"
              />
              <div>
                <h1 className="text-xl font-bold text-slate-gray">CarerView</h1>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-slate-gray/60 capitalize">{user.profile?.role} Portal</p>
                  <span className="text-slate-gray/40">•</span>
                  <div className="text-sm text-slate-gray/80">
                    <span className="font-medium">{user.profile?.display_name}</span>
                    <span className="text-slate-gray/60 ml-1">({user.email})</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-slate-gray">{title}</h2>
              {signOutError && (
                <div className="text-sm text-slate-gray bg-peach-blush/30 px-2 py-1 rounded">
                  {signOutError}
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>{isSigningOut ? 'Signing Out...' : 'Sign Out'}</span>
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