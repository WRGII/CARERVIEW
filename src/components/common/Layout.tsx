// src/components/layout/Layout.tsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import type { AuthUser } from '../../lib/auth'
import { Button } from '../ui/Button'
import { useUserPlan } from '../../hooks/useUserPlan'
import { PLANS } from '../../config/stripe'

interface LayoutProps {
  children: React.ReactNode
  title: string
  user: AuthUser
}

export const Layout: React.FC<LayoutProps> = ({ children, title, user }) => {
  const navigate = useNavigate()
  const [signOutError, setSignOutError] = useState<string | null>(null)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const { data: plan } = useUserPlan()

  const handleSignOut = async () => {
    console.log('[Layout] Sign out clicked')
    setSignOutError(null)
    setIsSigningOut(true)

    try {
      // Supabase v2: returns { error }
      console.log('[Layout] Calling supabase.auth.signOut()')
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('[Layout] signOut error:', error)
        setSignOutError(`Sign out failed: ${error.message}`)
        setIsSigningOut(false)
        return
      }

      console.log('[Layout] signOut success → navigating to "/"')
      // Primary SPA navigation
      navigate('/', { replace: true })

      // Absolute fallback in case router is mid-transition / stale
      setTimeout(() => {
        if (window.location.pathname !== '/') {
          console.log('[Layout] Forcing hard reload to "/" fallback')
          window.location.assign('/')
        }
      }, 120)
    } catch (err: any) {
      console.error('[Layout] signOut unexpected error:', err)
      setSignOutError(`Sign out failed: ${err?.message ?? 'Unknown error'}`)
    } finally {
      setIsSigningOut(false)
    }
  }

  const planInfo = plan?.plan_id ? PLANS[plan.plan_id as keyof typeof PLANS] : null

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
                  {planInfo && (
                    <>
                      <span className="text-sm text-slate-gray/60">{planInfo.label}</span>
                      <span className="text-slate-gray/40">•</span>
                    </>
                  )}
                  <div className="text-sm text-slate-gray/80">
                    <span className="font-medium">{user.profile?.display_name}</span>
                    <span className="text-slate-gray/60 ml-1">({user.email})</span>
                    {user.profile?.display_name && (
                      <>
                        <span className="text-slate-gray/40">•</span>
                        <div className="text-sm text-slate-gray/70">
                          Welcome <span className="font-medium text-slate-gray">{user.profile.display_name}</span>
                        </div>
                      </>
                    )}
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
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                disabled={isSigningOut}
                aria-busy={isSigningOut}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>{isSigningOut ? 'Signing Out…' : 'Sign Out'}</span>
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
