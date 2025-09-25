// src/pages/NewObservationPage.tsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { Layout } from '../components/common/Layout'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { ActivitySquare, ClipboardList, Layers } from 'lucide-react'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { Loading } from '../components/ui/Loading'

type FormType = 'ADL' | 'IADL' | 'COMPREHENSIVE'

export default function NewObservationPage() {
  const navigate = useNavigate()
  const { user, profile, loading, error } = useAuth()
  const [busy, setBusy] = React.useState(false)
  const [err, setErr] = React.useState<string | null>(null)

  // Auth guards
  if (loading) return <Loading message="Preparing your new observation…" />
  if (error || !user) return <ErrorMessage message={error || 'Authentication required.'} />
  if (!profile) return <ErrorMessage message="Profile not found. Please contact support." />
  if (profile.disabled) return <ErrorMessage message="Account disabled." />

  async function createAndStart(mode: FormType) {
    try {
      setBusy(true); setErr(null)
      const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

      const { data, error } = await supabase
        .from('observations')
        .insert({
          user_id: user.id,         // relies on your new column & RLS
          form_type: mode,          // 'ADL' | 'IADL' | 'COMPREHENSIVE'
          observation_date: today,
        })
        .select('id')
        .single()

      if (error) throw error
      navigate(`/caregiver/observations/${data.id}`)
    } catch (e: any) {
      setErr(e.message ?? String(e))
    } finally {
      setBusy(false)
    }
  }

  const Tile = ({
    title,
    desc,
    icon,
    onClick,
    badge,
  }: {
    title: string
    desc: string
    icon: React.ReactNode
    onClick: () => void
    badge?: string
  }) => (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left focus:outline-none"
      aria-label={title}
      disabled={busy}
    >
      <Card className="bg-warm-white hover:shadow-lg transition-shadow duration-200 h-full disabled:opacity-60">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-primary/15 flex items-center justify-center shrink-0">
              {icon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-slate-gray">{title}</h3>
                {badge && (
                  <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-mint-green/70 text-slate-gray border border-mint-green/70">
                    {badge}
                  </span>
                )}
              </div>
              <p className="text-slate-gray/80 mt-1">{desc}</p>
              <div className="mt-4">
                <span className="inline-flex items-center gap-2 rounded-lg border-2 border-slate-gray/30 px-3 py-1.5 text-sm font-semibold text-slate-gray">
                  Start
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </button>
  )

  return (
    <Layout
      title="New Observation"
      user={{ ...user, profile }}
      hideSignOut={true}
      headerRight={<Button variant="outline" onClick={() => navigate('/caregiver')}>Back to Dashboard</Button>}
    >
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-gray">Create Observation</h1>
          <p className="text-slate-gray/70">Choose the type of form to start.</p>
        </div>

        {err && <div className="text-red-600">{err}</div>}

        <div className="grid gap-6 md:grid-cols-2">
          <Tile
            title="ADL Observation"
            desc="Activities of Daily Living (eating, dressing, bathing)"
            icon={<ActivitySquare className="w-6 h-6 text-cyan-primary" />}
            onClick={() => createAndStart('ADL')}
          />
          <Tile
            title="IADL Observation"
            desc="Instrumental ADLs (shopping, meds, housekeeping)"
            icon={<ClipboardList className="w-6 h-6 text-cyan-primary" />}
            onClick={() => createAndStart('IADL')}
          />
          <div className="md:col-span-2">
            <Tile
              title="Comprehensive Observation"
              desc="ADL + IADL combined in one report"
              icon={<Layers className="w-6 h-6 text-cyan-primary" />}
              badge="Recommended"
              onClick={() => createAndStart('COMPREHENSIVE')}
            />
          </div>
        </div>

        <div>
          <Button variant="outline" onClick={() => navigate('/caregiver')} disabled={busy}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </Layout>
  )
}
