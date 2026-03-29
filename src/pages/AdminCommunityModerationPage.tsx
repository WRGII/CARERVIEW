import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft, Flag, RefreshCw, Users, MessageCircle, FileText,
  ShieldOff, TriangleAlert as AlertTriangle, ChevronLeft, ChevronRight as ChevronRightIcon,
  CircleCheck as CheckCircle, Circle as XCircle,
} from 'lucide-react'
import { useLocale } from '../i18n/LocaleContext'
import { useModerationQueue, MODERATION_PAGE_SIZE } from '../hooks/useCommunityReports'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import type { ModerationReportRow, ReportStatus } from '../lib/community'
import ModerationQueueList from '../components/admin/ModerationQueueList'
import ModerationDetailPanel from '../components/admin/ModerationDetailPanel'
import AllPostsTab from '../components/admin/AllPostsTab'
import MembersTab from '../components/admin/MembersTab'
import BannedUsersTab from '../components/admin/BannedUsersTab'

type MainTab = 'reports' | 'posts' | 'members' | 'banned'
type QueueTab = ReportStatus

const QUEUE_TABS: { value: QueueTab; label: string; icon: React.ElementType }[] = [
  { value: 'pending', label: 'Pending', icon: AlertTriangle },
  { value: 'reviewed', label: 'Reviewed', icon: CheckCircle },
  { value: 'dismissed', label: 'Dismissed', icon: XCircle },
]

interface CommunityStats {
  totalPosts: number
  totalReplies: number
  totalMembers: number
  totalAuthUsers: number
  pendingReports: number
  bannedMembers: number
}

const MAIN_TABS: { value: MainTab; label: string; icon: React.ElementType; description: string }[] = [
  { value: 'reports', label: 'Reports Queue', icon: Flag, description: 'User-flagged content' },
  { value: 'posts', label: 'All Posts', icon: FileText, description: 'Browse & moderate all posts' },
  { value: 'members', label: 'Members', icon: Users, description: 'Community & auth users' },
  { value: 'banned', label: 'Banned', icon: ShieldOff, description: 'Banned community members' },
]

export default function AdminCommunityModerationPage() {
  const { t } = useLocale()
  const [mainTab, setMainTab] = useState<MainTab>('reports')
  const [activeQueueTab, setActiveQueueTab] = useState<QueueTab>('pending')
  const [selectedReport, setSelectedReport] = useState<ModerationReportRow | null>(null)
  const [page, setPage] = useState(0)
  const [showDetailMobile, setShowDetailMobile] = useState(false)

  const { data: reports, isLoading, error, refetch, isRefetching } = useModerationQueue(activeQueueTab, page)

  const { data: stats, refetch: refetchStats } = useQuery<CommunityStats>({
    queryKey: ['community', 'admin-stats'],
    queryFn: async () => {
      const [postsRes, repliesRes, membersRes, authRes, reportsRes, bannedRes] = await Promise.all([
        supabase.from('community_posts').select('*', { count: 'exact', head: true }),
        supabase.from('community_replies').select('*', { count: 'exact', head: true }),
        supabase.from('community_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('community_reports').select('*', { count: 'exact', head: true }).eq('report_status', 'pending'),
        supabase.from('community_profiles').select('*', { count: 'exact', head: true }).eq('is_banned', true),
      ])
      return {
        totalPosts: postsRes.count ?? 0,
        totalReplies: repliesRes.count ?? 0,
        totalMembers: membersRes.count ?? 0,
        totalAuthUsers: authRes.count ?? 0,
        pendingReports: reportsRes.count ?? 0,
        bannedMembers: bannedRes.count ?? 0,
      }
    },
    staleTime: 30_000,
  })

  const hasNextPage = (reports?.length ?? 0) === MODERATION_PAGE_SIZE

  const handleSelectReport = (report: ModerationReportRow) => {
    const next = selectedReport?.id === report.id ? null : report
    setSelectedReport(next)
    if (next) setShowDetailMobile(true)
  }

  const handleClosePanel = () => {
    setSelectedReport(null)
    setShowDetailMobile(false)
  }

  const handleQueueTabChange = (tab: QueueTab) => {
    setActiveQueueTab(tab)
    setSelectedReport(null)
    setShowDetailMobile(false)
    setPage(0)
  }

  const handleMainTabChange = (tab: MainTab) => {
    setMainTab(tab)
    setSelectedReport(null)
    setShowDetailMobile(false)
    setPage(0)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page header */}
        <div className="mb-6">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors group mb-4"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            {t('admin.return_to_dashboard')}
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Flag className="w-5 h-5 text-slate-600" />
                <h1 className="text-2xl font-bold text-slate-800">Community Moderation</h1>
              </div>
              <p className="text-slate-500 text-sm">
                Full control over all community content, members, and forum activity.
              </p>
            </div>

            <button
              onClick={() => { refetch(); refetchStats() }}
              disabled={isRefetching}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:opacity-60 self-start sm:self-auto"
            >
              <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats row */}
        {stats && (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
            <StatCard icon={Users} label="Auth users" value={stats.totalAuthUsers} />
            <StatCard icon={Users} label="Members" value={stats.totalMembers} />
            <StatCard icon={FileText} label="Posts" value={stats.totalPosts} />
            <StatCard icon={MessageCircle} label="Replies" value={stats.totalReplies} />
            <StatCard
              icon={Flag}
              label="Pending reports"
              value={stats.pendingReports}
              highlight={stats.pendingReports > 0}
              highlightColor="text-amber-600 bg-amber-50"
            />
            <StatCard
              icon={ShieldOff}
              label="Banned"
              value={stats.bannedMembers}
              highlight={stats.bannedMembers > 0}
              highlightColor="text-red-600 bg-red-50"
            />
          </div>
        )}

        {/* Main navigation tabs */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-6">
          <div className="flex divide-x divide-slate-100 overflow-x-auto">
            {MAIN_TABS.map(tab => {
              const Icon = tab.icon
              const isActive = mainTab === tab.value
              const badge =
                tab.value === 'reports' && (stats?.pendingReports ?? 0) > 0
                  ? stats?.pendingReports
                  : tab.value === 'banned' && (stats?.bannedMembers ?? 0) > 0
                  ? stats?.bannedMembers
                  : null
              return (
                <button
                  key={tab.value}
                  onClick={() => handleMainTabChange(tab.value)}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 px-4 py-4 transition-colors min-w-[120px] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-400 ${
                    isActive
                      ? 'bg-slate-50 border-b-2 border-b-slate-800'
                      : 'hover:bg-slate-50/50 border-b-2 border-b-transparent'
                  }`}
                  aria-selected={isActive}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-slate-800' : 'text-slate-400'}`} />
                    <span className={`text-sm font-semibold ${isActive ? 'text-slate-800' : 'text-slate-500'}`}>
                      {tab.label}
                    </span>
                    {badge !== null && badge !== undefined && (
                      <span className={`text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center ${
                        tab.value === 'reports' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 hidden sm:block">{tab.description}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab content */}
        {mainTab === 'posts' && <AllPostsTab />}
        {mainTab === 'members' && <MembersTab />}
        {mainTab === 'banned' && <BannedUsersTab />}

        {mainTab === 'reports' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Queue panel */}
            <div className={`bg-white rounded-2xl border border-slate-200 overflow-hidden ${showDetailMobile ? 'hidden lg:block' : 'block'}`}>

              {/* Queue tabs */}
              <div className="flex border-b border-slate-100">
                {QUEUE_TABS.map(tab => {
                  const Icon = tab.icon
                  const isPending = tab.value === 'pending'
                  const count = isPending ? (stats?.pendingReports ?? null) : null
                  return (
                    <button
                      key={tab.value}
                      onClick={() => handleQueueTabChange(tab.value)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-400 ${
                        activeQueueTab === tab.value
                          ? 'border-b-2 border-slate-800 text-slate-800 bg-slate-50/60'
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                      }`}
                      aria-selected={activeQueueTab === tab.value}
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
                  <button onClick={() => refetch()} className="mt-3 text-sm text-slate-500 underline hover:text-slate-700">
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

              {/* Pagination */}
              {!isLoading && !error && (page > 0 || hasNextPage) && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/60">
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <span className="text-xs text-slate-400">Page {page + 1}</span>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={!hasNextPage}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Detail panel */}
            {selectedReport ? (
              <div
                className={`bg-white border border-slate-200 lg:rounded-r-2xl lg:rounded-l-none lg:border-l-0 overflow-hidden ${showDetailMobile ? 'block rounded-2xl' : 'hidden lg:block'}`}
                style={{ maxHeight: '80vh', overflowY: 'auto' }}
              >
                <ModerationDetailPanel
                  report={selectedReport}
                  onClose={handleClosePanel}
                />
              </div>
            ) : (
              <div className="hidden lg:flex items-center justify-center bg-slate-50/50 border border-slate-200 rounded-r-2xl border-l-0">
                <div className="text-center">
                  <Flag className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Select a report to review</p>
                </div>
              </div>
            )}
          </div>
        )}

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
  const colorClass = highlightColor ?? ''
  const textClass = colorClass.split(' ').find(c => c.startsWith('text-')) ?? (highlight ? 'text-amber-600' : 'text-slate-800')
  const bgClass = colorClass.split(' ').find(c => c.startsWith('bg-')) ?? (highlight ? 'bg-amber-50' : 'bg-slate-50')

  return (
    <div className={`bg-white rounded-xl border border-slate-200 px-3 py-3 flex items-center gap-2.5 ${highlight ? 'border-amber-200' : ''}`}>
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${bgClass}`}>
        <Icon className={`w-3.5 h-3.5 ${textClass}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400 truncate leading-tight">{label}</p>
        <p className={`text-base font-bold leading-tight ${textClass}`}>{value}</p>
      </div>
    </div>
  )
}
