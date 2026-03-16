import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Users, ChevronLeft, ChevronRight, ShieldOff, UserCheck, UserX } from 'lucide-react'
import {
  listAllCommunityMembers,
  listAuthMembers,
  type CommunityProfile,
  type AuthMemberRow,
} from '../../lib/community'
import MemberDetailPanel from './MemberDetailPanel'

const PAGE_SIZE = 25

type SubTab = 'community' | 'auth'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

interface SelectedMember {
  profile: CommunityProfile | null
  authMember: AuthMemberRow | null
}

export default function MembersTab() {
  const [subTab, setSubTab] = useState<SubTab>('community')
  const [page, setPage] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selected, setSelected] = useState<SelectedMember | null>(null)
  const [showPanelMobile, setShowPanelMobile] = useState(false)

  const commQuery = useQuery({
    queryKey: ['community', 'admin', 'members', page, searchQuery],
    queryFn: () => listAllCommunityMembers({ limit: PAGE_SIZE, offset: page * PAGE_SIZE, searchQuery: searchQuery || null }),
    enabled: subTab === 'community',
    staleTime: 30_000,
    placeholderData: prev => prev,
  })

  const authQuery = useQuery({
    queryKey: ['community', 'admin', 'auth-members', page, searchQuery],
    queryFn: () => listAuthMembers({ limit: PAGE_SIZE, offset: page * PAGE_SIZE, searchQuery: searchQuery || null }),
    enabled: subTab === 'auth',
    staleTime: 30_000,
    placeholderData: prev => prev,
  })

  const isLoading = subTab === 'community' ? commQuery.isLoading : authQuery.isLoading
  const error = subTab === 'community' ? commQuery.error : authQuery.error
  const communityMembers = commQuery.data ?? []
  const authMembers = authQuery.data ?? []
  const hasNextPage = subTab === 'community'
    ? communityMembers.length === PAGE_SIZE
    : authMembers.length === PAGE_SIZE

  const handleSearch = useCallback(() => {
    setSearchQuery(searchInput.trim())
    setPage(0)
    setSelected(null)
  }, [searchInput])

  const handleSubTab = (tab: SubTab) => {
    setSubTab(tab)
    setPage(0)
    setSearchQuery('')
    setSearchInput('')
    setSelected(null)
    setShowPanelMobile(false)
  }

  const handleSelectCommunityMember = (profile: CommunityProfile) => {
    const same = selected?.profile?.user_id === profile.user_id
    const next = same ? null : { profile, authMember: null }
    setSelected(next)
    if (next) setShowPanelMobile(true)
  }

  const handleSelectAuthMember = (member: AuthMemberRow) => {
    const same = selected?.authMember?.id === member.id
    const next = same ? null : { profile: null, authMember: member }
    setSelected(next)
    if (next) setShowPanelMobile(true)
  }

  const handleClosePanel = () => {
    setSelected(null)
    setShowPanelMobile(false)
  }

  const refetch = subTab === 'community' ? commQuery.refetch : authQuery.refetch

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
      {/* List panel */}
      <div className={`bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col ${showPanelMobile ? 'hidden lg:flex' : 'flex'}`}>

        {/* Sub-tabs */}
        <div className="flex border-b border-slate-100">
          {(['community', 'auth'] as SubTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => handleSubTab(tab)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors focus:outline-none ${
                subTab === tab
                  ? 'border-b-2 border-slate-800 text-slate-800 bg-slate-50/60'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              {tab === 'community' ? (
                <><UserCheck className="w-4 h-4" /> Community Members</>
              ) : (
                <><Users className="w-4 h-4" /> All Auth Users</>
              )}
            </button>
          ))}
        </div>

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
                placeholder={subTab === 'community' ? 'Search by handle…' : 'Search by email or name…'}
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

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {isLoading ? (
            <div>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="px-4 py-4 animate-pulse flex items-center gap-3">
                  <div className="w-9 h-9 bg-slate-200 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-1/3" />
                    <div className="h-2 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-red-500">Failed to load members.</p>
              <button onClick={() => refetch()} className="mt-2 text-xs text-slate-500 underline">Retry</button>
            </div>
          ) : subTab === 'community' ? (
            communityMembers.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No community members found.</p>
              </div>
            ) : (
              communityMembers.map(member => {
                const isSelected = selected?.profile?.user_id === member.user_id
                return (
                  <button
                    key={member.user_id}
                    onClick={() => handleSelectCommunityMember(member)}
                    className={`w-full text-left px-4 py-3.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-400 ${
                      isSelected
                        ? 'bg-slate-50 border-l-2 border-l-slate-700'
                        : 'hover:bg-slate-50/70 border-l-2 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                        style={{ backgroundColor: member.avatar_color }}
                      >
                        {member.handle.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-700">@{member.handle}</p>
                          {member.is_banned && (
                            <span className="inline-flex items-center gap-0.5 text-xs text-red-600 font-medium">
                              <ShieldOff className="w-3 h-3" />
                              Banned
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          {member.post_count} posts · {member.reply_count} replies · joined {timeAgo(member.created_at)}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })
            )
          ) : (
            authMembers.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No users found.</p>
              </div>
            ) : (
              authMembers.map(member => {
                const isSelected = selected?.authMember?.id === member.id
                return (
                  <button
                    key={member.id}
                    onClick={() => handleSelectAuthMember(member)}
                    className={`w-full text-left px-4 py-3.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-400 ${
                      isSelected
                        ? 'bg-slate-50 border-l-2 border-l-slate-700'
                        : 'hover:bg-slate-50/70 border-l-2 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                        {member.disabled
                          ? <UserX className="w-4 h-4 text-red-400" />
                          : <UserCheck className="w-4 h-4 text-slate-400" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-slate-700 truncate">
                            {member.display_name || member.email || 'Unknown'}
                          </p>
                          {member.disabled && (
                            <span className="text-xs text-red-600 font-medium">Disabled</span>
                          )}
                          {member.role === 'admin' && (
                            <span className="text-xs text-slate-500 bg-slate-100 rounded px-1.5 py-0.5">admin</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 truncate">
                          {member.email}
                          {member.community_handle && (
                            <span className="ml-1.5 text-cyan-600">@{member.community_handle}</span>
                          )}
                        </p>
                        <p className="text-xs text-slate-400">{timeAgo(member.created_at)}</p>
                      </div>
                    </div>
                  </button>
                )
              })
            )
          )}
        </div>

        {/* Pagination */}
        {!isLoading && !error && (page > 0 || hasNextPage) && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/60 flex-shrink-0">
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

      {/* Detail panel */}
      {selected ? (
        <div
          className={`bg-white border border-slate-200 lg:rounded-r-2xl lg:rounded-l-none lg:border-l-0 overflow-hidden flex flex-col ${showPanelMobile ? 'block rounded-2xl' : 'hidden lg:flex'}`}
          style={{ maxHeight: '75vh', overflowY: 'auto' }}
        >
          <MemberDetailPanel
            profile={selected.profile}
            authMember={selected.authMember}
            onClose={handleClosePanel}
            onMemberUpdated={refetch}
          />
        </div>
      ) : (
        <div className="hidden lg:flex items-center justify-center bg-slate-50/50 border border-slate-200 rounded-r-2xl border-l-0">
          <div className="text-center">
            <Users className="w-8 h-8 text-slate-200 mx-auto mb-2" />
            <p className="text-sm text-slate-400">Select a member to manage</p>
          </div>
        </div>
      )}
    </div>
  )
}
