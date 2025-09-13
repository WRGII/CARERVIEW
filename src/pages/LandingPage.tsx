// src/pages/LandingPage.tsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Heart, Shield, Users, FileText, ArrowRight, CheckCircle, Clock, Lock } from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card'
import Footer from '../components/common/Footer'
import { useQueryClient } from '@tanstack/react-query'
import { prefetchChoosePlanAssets } from '../hooks/usePrefetchStatic'

export default function LandingPage() {
  const navigate = useNavigate()

  // react-query client (used to pre-warm Choose Plan)
  const queryClient = useQueryClient()
  const kickoffPrefetch = React.useCallback(() => {
    prefetchChoosePlanAssets(queryClient)
  }, [queryClient])

  const [isSignUp, setIsSignUp] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [sendingReset, setSendingReset] = useState(false)

  // --- helpers ---------------------------------------------------------------

  const upsertProfileIfMissing = async (uid: string, displayName: string, emailAddr: string) => {
    const { data: prof, error: selErr } = await supabase
      .from('profiles')
      .select('id, disabled, role')
      .eq('id', uid)
      .maybeSingle()
    if (selErr) throw selErr

    if (!prof) {
      const { error: upErr } = await supabase.from('profiles').upsert({
        id: uid,
        email: emailAddr ?? '',
        display_name: displayName ?? '',
        role: 'caregiver',
        disabled: false,
      })
      if (upErr) throw upErr
    } else if (prof.disabled) {
      await supabase.auth.signOut()
      throw new Error('Account disabled. Please contact support.')
    }
  }

  const routeByRole = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      navigate('/', { replace: true })
      return
    }

    const { data: prof } = await supabase
      .from('profiles')
      .select('role, disabled, email, display_name')
      .eq('id', user.id)
      .maybeSingle()

    if (!prof) {
      await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        display_name: (user.user_metadata && user.user_metadata.display_name) || '',
        role: 'caregiver',
        disabled: false,
      })
      const { data: prof2 } = await supabase
        .from('profiles')
        .select('role, disabled')
        .eq('id', user.id)
        .single()

      if (prof2?.disabled) {
        await supabase.auth.signOut()
        navigate('/', { replace: true })
        return
      }
      navigate(prof2?.role === 'admin' ? '/admin' : '/caregiver', { replace: true })
      return
    }

    if (prof.disabled) {
      await supabase.auth.signOut()
      navigate('/', { replace: true })
      return
    }
    navigate(prof.role === 'admin' ? '/admin' : '/caregiver', { replace: true })
  }

  // --- submit handlers -------------------------------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setInfo(null)

    // 👇 warm up Choose Plan data ASAP for faster subsequent load
    kickoffPrefetch()

    try {
      if (isSignUp) {
        const { data, error: signUpErr } = await supabase.auth.signUp({
          email,
