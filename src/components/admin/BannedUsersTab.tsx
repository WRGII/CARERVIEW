import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ShieldOff, Shield, Search, ChevronLeft, ChevronRight, TriangleAlert as AlertTriangle } from 'lucide-react'
import { listAllCommunityMembers, unbanCommunityMember, type CommunityProfile } from '../../lib/community'
import { Button } from '../ui/Button'

const PAGE_SIZE = 25

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function BannedUsersTab() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [confirmUnban, setConfirmUnban] = useState<CommunityProfile | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const { data: members = [], isLoading, error, refetch } = useQuery({
    queryKey: ['community', 'admin', 'banned', page, searchQuery],
    queryFn: () => listAllCommunityMembers({
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
      showBanned: true,
      searchQuery: searchQuery || null,
    }),
    staleTime: 30_000,
    placeholderData: prev => prev,
  })

  const unbanMut = useMutation({
    mutationFn: unbanCommunityMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', 'admin', 'banned'] })
      queryClient.invalidateQueries({ queryKey: ['community', 'admin', 'members'] })
      queryClient.invalidateQueries({ queryKey: ['community', 'admin-stats'] })
      setConfirmUnban(null)
    },
  })

  const hasNextPage = members.length === PAGE_SIZE

  const handleSearch = () => {
    setSearchQuery(searchInput.trim())
    setPage(0)
  }

  const handleUnban = async () => {
    if (!confirmUnban) return
    setActionError(null)
    try {
      await unbanMut.mutateAsync(confirmUnban.user_id)
    } catch (e: any) {
      setActionError(e?.message ?? 'Unban failed. Please try again.')
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Search */}
      <div className="px-4 py-3 border-b border-slate-100">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search banned members by handle…"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-300 bg-white"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-3 py-2 rounded-xl bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* Unban confirm */}
      {confirmUnban && (
        <div className="px-4 py-4 bg-amber-50 border-b border-amber-100">
          <div className="flex items-start gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700 font-medium">
              Remove ban for <strong>@{confirmUnban.handle}</strong>? They will be able to post and reply again.
            </p>
          </div>
          {actionError && (
            <p className="text-xs text-red-600 mb-2">{actionError}</p>
          )}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { setConfirmUnban(null); setActionError(null) }}>
              Cancel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleUnban}
              disabled={unbanMut.isPending}
              className="flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" />
              Confirm unban
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="divide-y divide-slate-100">
          {[1, 2, 3].map(i => (
            <div key={i} className="px-4 py-4 animate-pulse flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-200 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-200 rounded w-1/3" />
                <div className="h-2 bg-slate-100 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="px-6 py-12 text-center">
          <p className="text-sm text-red-500">Failed to load banned members.</p>
          <button onClick={() => refetch()} className="mt-2 text-xs text-slate-500 underline">Retry</button>
        </div>
      ) : members.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6 text-green-500" />
          </div>
          <p className="text-sm font-semibold text-slate-600">No banned members</p>
          <p className="text-xs text-slate-400 mt-1">
            {searchQuery ? 'No banned members match your search.' : 'No members are currently banned from the community.'}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {members.map(member => (
            <div
              key={member.user_id}
              className="px-4 py-4 flex items-center gap-3"
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: member.avatar_color }}
              >
                {member.handle.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-700">@{member.handle}</p>
                  <span className="inline-flex items-center gap-0.5 text-xs text-red-500">
                    <ShieldOff className="w-3 h-3" />
                    Banned
                  </span>
                </div>
                {member.ban_reason && (
                  <p className="text-xs text-slate-500 mt-0.5 italic truncate">
                    Reason: {member.ban_reason}
                  </p>
                )}
                <p className="text-xs text-slate-400">
                  {member.post_count} posts · {member.reply_count} replies
                </p>
              </div>
              <button
                onClick={() => setConfirmUnban(member)}
                disabled={unbanMut.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-50 flex-shrink-0"
              >
                <Shield className="w-3.5 h-3.5" />
                Unban
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !error && members.length > 0 && (page > 0 || hasNextPage) && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/60">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <span className="text-xs text-slate-400">Page {page + 1}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={!hasNextPage}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
