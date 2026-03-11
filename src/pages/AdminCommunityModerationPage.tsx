import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Flag, RefreshCw, Users, MessageCircle, CircleCheck as CheckCircle, Circle as XCircle, TriangleAlert as AlertTriangle } from 'lucide-react'
import { useModerationQueue } from '../hooks/useCommunityReports'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import type { ModerationReportRow, ReportStatus } from '../lib/community'
import ModerationQueueList from '../components/admin/ModerationQueueList'
import ModerationDetailPanel from '../components/admin/ModerationDetailPanel'

type QueueTab = ReportStatus

const TABS: { value: QueueTab; label: string; icon: React.ElementType }[] = [
  { value: 'pending', label: 'Pending', icon: AlertTriangle },
  { value: 'reviewed', label: 'Reviewed', icon: CheckCircle },
  { value: 'dismissed', label: 'Dismissed', icon: XCircle },
]

interface CommunityStats {
  totalPosts: number
  totalReplies: number
  totalMembers: number
  pendingReports: number
  bannedMembers: number
}

export default function AdminCommunityModerationPage() {
  const [activeTab, setActiveTab] = useState<QueueTab>('pending')
  const [selectedReport, setSelectedReport] = useState<ModerationReportRow | null>(null)

  const { data: reports, isLoading, error, refetch, isRefetching } = useModerationQueue(activeTab)

  const { data: stats } = useQuery<CommunityStats>({
    queryKey: ['community', 'admin-stats'],
    queryFn: async () => {
      const [postsRes, repliesRes, membersRes, reportsRes, bannedRes] = await Promise.all([
        supabase.from('community_posts').select('*', { count: 'exact', head: true }),
        supabase.from('community_replies').select('*', { count: 'exact', head: true }),
        supabase.from('community_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('community_reports').select('*', { count: 'exact', head: true }).eq('report_status', 'pending'),
        supabase.from('community_profiles').select('*', { count: 'exact', head: true }).eq('is_banned', true),
      ])
      return {
        totalPosts: postsRes.count ?? 0,
        totalReplies: repliesRes.count ?? 0,
        totalMembers: membersRes.count ?? 0,
        pendingReports: reportsRes.count ?? 0,
        bannedMembers: bannedRes.count ?? 0,
      }
    },
    staleTime: 30_000,
  })

  const handleSelectReport = (report: ModerationReportRow) => {
    setSelectedReport(prev => prev?.id === report.id ? null : report)
  }

  const handleClosePanel = () => setSelectedReport(null)

  const handleTabChange = (tab: QueueTab) => {
    setActiveTab(tab)
    setSelectedReport(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page header */}
        <div className="mb-8">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors group mb-4"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Admin dashboard
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Flag className="w-5 h-5 text-slate-600" />
                <h1 className="text-2xl font-bold text-slate-800">Community Moderation</h1>
              </div>
              <p className="text-slate-500 text-sm">
                Review reported content, moderate posts and replies, and manage community members.
              </p>
            </div>

            <button
              onClick={() => refetch()}
              disabled={isRefetching}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:opacity-60 self-start sm:self-auto"
              title="Refresh queue"
            >
              <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats row */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
            <StatCard icon={Users} label="Members" value={stats.totalMembers} />
            <StatCard icon={MessageCircle} label="Posts" value={stats.totalPosts} />
            <StatCard icon={MessageCircle} label="Replies" value={stats.totalReplies} />
            <StatCard
              icon={Flag}
              label="Pending reports"
              value={stats.pendingReports}
              highlight={stats.pendingReports > 0}
            />
            <StatCard
              icon={XCircle}
              label="Banned members"
              value={stats.bannedMembers}
              highlight={stats.bannedMembers > 0}
              highlightColor="text-red-600 bg-red-50"
            />
          </div>
        )}

        {/* Main two-column layout */}
        <div className={`${selectedReport ? 'grid grid-cols-1 lg:grid-cols-2 gap-0' : ''}`}>

          {/* Queue panel */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">

            {/* Tabs */}
            <div className="flex border-b border-slate-100">
              {TABS.map(tab => {
                const Icon = tab.icon
                const isPending = tab.value === 'pending'
                const count = isPending ? (stats?.pendingReports ?? null) : null
                return (
                  <button
                    key={tab.value}
                    onClick={() => handleTabChange(tab.value)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-400 ${
                      activeTab === tab.value
                        ? 'border-b-2 border-slate-800 text-slate-800 bg-slate-50/60'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                    aria-selected={activeTab === tab.value}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {count !== null && count > 0 && (
                      <span className="ml-1 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Queue content */}
            {isLoading ? (
              <div className="space-y-0 divide-y divide-slate-100">
                {[1, 2, 3].map(i => (
                  <div key={i} className="px-4 py-4 animate-pulse">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-slate-200 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-slate-200 rounded w-1/3" />
                        <div className="h-3 bg-slate-100 rounded w-full" />
                        <div className="h-3 bg-slate-100 rounded w-2/3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="px-6 py-8 text-center">
                <AlertTriangle className="w-8 h-8 text-red-300 mx-auto mb-2" />
                <p className="text-sm text-red-600">Failed to load moderation queue.</p>
                <button
                  onClick={() => refetch()}
                  className="mt-3 text-sm text-slate-500 underline hover:text-slate-700"
                >
                  Try again
                </button>
              </div>
            ) : (
              <ModerationQueueList
                reports={reports ?? []}
                selectedId={selectedReport?.id ?? null}
                onSelect={handleSelectReport}
              />
            )}
          </div>

          {/* Detail panel */}
          {selectedReport && (
            <div className="bg-white border border-slate-200 rounded-2xl lg:rounded-l-none lg:border-l-0 overflow-hidden" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
              <ModerationDetailPanel
                report={selectedReport}
                onClose={handleClosePanel}
              />
            </div>
          )}
        </div>

        {/* Privacy notice */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-xl">
          <p className="text-xs text-amber-700 leading-relaxed">
            <strong className="font-semibold">Moderator access:</strong> Internal author identity, including the identity behind anonymous posts, is visible only to admins and is used exclusively for moderation. It must not be shared with other users or used for any other purpose.
          </p>
        </div>

      </div>
    </div>
  )
}

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: number
  highlight?: boolean
  highlightColor?: string
}

function StatCard({ icon: Icon, label, value, highlight, highlightColor }: StatCardProps) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-3 ${highlight ? 'border-amber-200' : ''}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
        highlight
          ? (highlightColor ? highlightColor : 'bg-amber-50')
          : 'bg-slate-50'
      }`}>
        <Icon className={`w-4 h-4 ${highlight ? (highlightColor ? '' : 'text-amber-500') : 'text-slate-400'}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400 truncate">{label}</p>
        <p className={`text-lg font-bold ${highlight ? 'text-amber-600' : 'text-slate-800'} ${highlightColor ? highlightColor.split(' ').find(c => c.startsWith('text-')) ?? '' : ''}`}>
          {value}
        </p>
      </div>
    </div>
  )
}
