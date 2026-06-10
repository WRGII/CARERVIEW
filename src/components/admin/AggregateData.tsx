import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '../ui/Card'
import { Loading } from '../ui/Loading'
import { CreditCard, Users, FileText, TrendingUp } from 'lucide-react'
import { useLocale } from '../../i18n/LocaleContext'
import { getAdminToken } from '../../hooks/useAdminSession'

interface AggregateStats {
  totalObservations: number
  totalCaregivers: number
  paidSubscribers: number
  thisWeek: number
}

async function fetchAggregateStats(): Promise<AggregateStats> {
  const token = getAdminToken()
  if (!token) throw new Error('Not authenticated as admin')
  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-data`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action: 'get_aggregate_stats' }),
    }
  )
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error || 'Failed to load stats')
  return json.data as AggregateStats
}

type AggregateDataProps = {
  caregiversLink?: string
}

export const AggregateData: React.FC<AggregateDataProps> = ({ caregiversLink }) => {
  const { t } = useLocale()
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['aggregate-stats'],
    queryFn: fetchAggregateStats,
    staleTime: 60_000,
  })

  if (isLoading) return <Loading message={t('admin.loading_aggregate')} />
  if (error) return <div className="text-red-600">{t('admin.error_aggregate')}</div>
  if (!stats) return <div>{t('admin.no_data')}</div>

  const caregiversCard = (
    <Card className="bg-warm-white transition hover:shadow-md">
      <CardContent>
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-mint-green/60 rounded-lg">
            <Users className="w-6 h-6 text-slate-gray" />
          </div>
          <div>
            <p className="text-sm text-slate-gray/70">{t('admin.active_caregivers')}</p>
            <p className="text-2xl font-bold text-slate-gray">{stats.totalCaregivers}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Observations */}
        <Card className="bg-warm-white">
          <CardContent>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-cyan-primary/20 rounded-lg">
                <FileText className="w-6 h-6 text-cyan-primary" />
              </div>
              <div>
                <p className="text-sm text-slate-gray/70">{t('admin.total_obs')}</p>
                <p className="text-2xl font-bold text-slate-gray">{stats.totalObservations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Caregivers (optionally clickable) */}
        {caregiversLink ? (
          <Link
            to={caregiversLink}
            className="block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-primary/60"
            aria-label="View and manage active caregivers"
          >
            {caregiversCard}
          </Link>
        ) : (
          caregiversCard
        )}

        {/* Paid Subscribers */}
        <Card className="bg-warm-white">
          <CardContent>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-peach-blush/60 rounded-lg">
                <CreditCard className="w-6 h-6 text-slate-gray" />
              </div>
              <div>
                <p className="text-sm text-slate-gray/70">Paid Subscribers</p>
                <p className="text-2xl font-bold text-slate-gray">{stats.paidSubscribers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* This Week */}
        <Card className="bg-warm-white">
          <CardContent>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-cyan-primary/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-cyan-primary" />
              </div>
              <div>
                <p className="text-sm text-slate-gray/70">{t('admin.this_week')}</p>
                <p className="text-2xl font-bold text-slate-gray">{stats.thisWeek}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
