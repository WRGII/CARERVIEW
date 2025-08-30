import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { Loading } from '../ui/Loading'
import { BarChart3, Users, FileText, TrendingUp } from 'lucide-react'

interface AggregateStats {
  totalObservations: number
  totalCaregivers: number
  averageScoreByCategory: { category: string; average: number; type: string }[]
  recentActivity: { date: string; count: number }[]
}

export const AggregateData: React.FC = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['aggregate-stats'],
    queryFn: async (): Promise<AggregateStats> => {
      // Get total observations
      const { count: totalObservations } = await supabase
        .from('observations')
        .select('*', { count: 'exact', head: true })

      // Get total active caregivers
      const { count: totalCaregivers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'caregiver')
        .eq('disabled', false)

      // Get average scores by category
      const { data: avgData, error: avgError } = await supabase
        .rpc('get_average_scores_by_category')

      if (avgError) {
        console.warn('Failed to get average scores:', avgError)
      }

      // Get recent activity (last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data: recentData, error: recentError } = await supabase
        .from('observations')
        .select('observation_date')
        .gte('observation_date', sevenDaysAgo.toISOString().split('T')[0])

      if (recentError) {
        console.warn('Failed to get recent activity:', recentError)
      }

      // Group by date
      const activityMap = new Map<string, number>()
      recentData?.forEach(obs => {
        const date = obs.observation_date
        activityMap.set(date, (activityMap.get(date) || 0) + 1)
      })

      const recentActivity = Array.from(activityMap.entries()).map(([date, count]) => ({
        date,
        count
      }))

      return {
        totalObservations: totalObservations || 0,
        totalCaregivers: totalCaregivers || 0,
        averageScoreByCategory: avgData || [],
        recentActivity
      }
    }
  })

  if (isLoading) {
    return <Loading message="Loading aggregate data..." />
  }

  if (error) {
    return <div className="text-red-600">Failed to load aggregate data</div>
  }

  if (!stats) {
    return <div>No data available</div>
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Observations</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalObservations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Active Caregivers</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalCaregivers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Avg Category Score</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.averageScoreByCategory.length > 0 
                    ? (stats.averageScoreByCategory.reduce((sum, cat) => sum + cat.average, 0) / stats.averageScoreByCategory.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">This Week</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.recentActivity.reduce((sum, day) => sum + day.count, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Average Scores by Category */}
      {stats.averageScoreByCategory.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-900">Average Scores by Category</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.averageScoreByCategory.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      item.type === 'ADL' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {item.type}
                    </span>
                    <span className="text-slate-900">{item.category}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-slate-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full"
                        style={{ width: `${(item.average / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-lg font-semibold text-slate-900 w-12 text-right">
                      {item.average.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}