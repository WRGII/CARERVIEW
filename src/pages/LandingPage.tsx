// src/pages/LandingPage.tsx
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

/**
 * LandingPage:
 * - If not authenticated: render the public landing content (login/register lives here)
 * - If authenticated:
 *    - Admin (by email): go to /admin
 *    - Otherwise: go to /caregiver
 *
 * NOTE: We intentionally key routing off `isAdmin` (email-based) to avoid race conditions
 * with DB triggers that later set profile.role = 'admin'.
 */
export function LandingPage() {
  const navigate = useNavigate()
  const { user, isAdmin, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    if (!user) return // not signed in -> stay on landing

    if (isAdmin) {
      navigate('/admin', { replace: true })
      return
    }

    // default for MVP: every non-admin is a caregiver
    navigate('/caregiver', { replace: true })
  }, [loading, user, isAdmin, navigate])

  // ===== Public landing content (shown when not authenticated) =====
  return (
    <main className="mx-auto max-w-4xl p-6">
      <section className="text-center">
        <h1 className="text-3xl font-semibold mb-3">CarerView</h1>
        <p className="text-gray-600">
          Record daily functional abilities using ADA/OT categories. Caregivers can log observations and export reports.
        </p>

        {/* 
          Keep your existing sign-in / sign-up UI here.
          If you have Supabase Auth UI or buttons, render them below.
          Example placeholder:
        */}
        <div className="mt-8">
          {/* <AuthButtons /> */}
        </div>
      </section>
    </main>
  )
}
