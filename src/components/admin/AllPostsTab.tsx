import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Filter, ChevronLeft, ChevronRight, FileText, EyeOff, Trash2, MessageCircle } from 'lucide-react'
import { listAllPosts, listCommunityRooms, type CommunityPost, type PostStatus } from '../../lib/community'
import CommunityStatusBadge from '../community/CommunityStatusBadge'
import PostActionPanel from './PostActionPanel'

const PAGE_SIZE = 25

const STATUS_OPTIONS: { value: PostStatus | ''; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'hidden', label: 'Hidden' },
  { value: 'removed', label: 'Removed' },
  { value: 'pending_review', label: 'Pending review' },
]

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

function StatusIcon({ status }: { status: PostStatus }) {
  if (status === 'hidden') return <EyeOff className="w-3.5 h-3.5 text-amber-500" />
  if (status === 'removed') return <Trash2 className="w-3.5 h-3.5 text-red-500" />
  return null
}

export default function AllPostsTab() {
  const [page, setPage] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRoom, setFilterRoom] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<PostStatus | ''>('')
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null)
  const [showPanelMobile, setShowPanelMobile] = useState(false)

  const { data: rooms = [] } = useQuery({
    queryKey: ['community', 'rooms'],
    queryFn: listCommunityRooms,
    staleTime: 300_000,
  })

  const { data: posts, isLoading, error, refetch } = useQuery({
    queryKey: ['community', 'admin', 'posts', page, filterRoom, filterStatus, searchQuery],
    queryFn: () => listAllPosts({
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
      roomId: filterRoom || null,
      status: filterStatus || null,
      searchQuery: searchQuery || null,
    }),
    staleTime: 15_000,
    placeholderData: prev => prev,
  })

  const hasNextPage = (posts?.length ?? 0) === PAGE_SIZE

  const handleSearch = useCallback(() => {
    setSearchQuery(searchInput.trim())
    setPage(0)
  }, [searchInput])

  const handleSelectPost = (post: CommunityPost) => {
    const next = selectedPost?.id === post.id ? null : post
    setSelectedPost(next)
    if (next) setShowPanelMobile(true)
  }

  const handleClosePanel = () => {
    setSelectedPost(null)
    setShowPanelMobile(false)
  }

  const handleFilterChange = () => {
    setPage(0)
    setSelectedPost(null)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
      {/* List panel */}
      <div className={`bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col ${showPanelMobile ? 'hidden lg:flex' : 'flex'}`}>
        {/* Filters */}
        <div className="px-4 py-3 border-b border-slate-100 space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Search by title…"
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

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <select
                value={filterRoom}
                onChange={e => { setFilterRoom(e.target.value); handleFilterChange() }}
                className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-300 appearance-none"
              >
                <option value="">All rooms</option>
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <select
              value={filterStatus}
              onChange={e => { setFilterStatus(e.target.value as PostStatus | ''); handleFilterChange() }}
              className="flex-1 px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-300 appearance-none"
            >
              {STATUS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Post list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {isLoading ? (
            <div className="space-y-0">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="px-4 py-4 animate-pulse">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-slate-200 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-100 rounded w-full" />
                      <div className="h-2 bg-slate-100 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-red-500">Failed to load posts.</p>
              <button onClick={() => refetch()} className="mt-2 text-xs text-slate-500 underline">Retry</button>
            </div>
          ) : !posts?.length ? (
            <div className="px-6 py-16 text-center">
              <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No posts found.</p>
            </div>
          ) : (
            posts.map(post => {
              const isSelected = selectedPost?.id === post.id
              return (
                <button
                  key={post.id}
                  onClick={() => handleSelectPost(post)}
                  className={`w-full text-left px-4 py-3.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-400 ${
                    isSelected
                      ? 'bg-slate-50 border-l-2 border-l-slate-700'
                      : 'hover:bg-slate-50/70 border-l-2 border-l-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FileText className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <p className="text-sm font-semibold text-slate-700 truncate flex-1">{post.title}</p>
                        {post.post_status !== 'active' && (
                          <CommunityStatusBadge status={post.post_status} size="sm" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 mb-1.5">{post.body}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                        {post.room && (
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: post.room.color }} />
                            {post.room.name}
                          </span>
                        )}
                        <span>·</span>
                        <span className="flex items-center gap-0.5">
                          <MessageCircle className="w-3 h-3" />
                          {post.reply_count}
                        </span>
                        <span>·</span>
                        <span>{timeAgo(post.created_at)}</span>
                        {post.is_anonymous && (
                          <>
                            <span>·</span>
                            <span className="text-slate-400">anon</span>
                          </>
                        )}
                      </div>
                    </div>
                    <StatusIcon status={post.post_status} />
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* Pagination */}
        {!isLoading && !error && (page > 0 || hasNextPage) && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/60 flex-shrink-0">
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
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Action panel */}
      {selectedPost ? (
        <div
          className={`bg-white border border-slate-200 lg:rounded-r-2xl lg:rounded-l-none lg:border-l-0 overflow-hidden flex flex-col ${showPanelMobile ? 'block rounded-2xl' : 'hidden lg:flex'}`}
          style={{ maxHeight: '75vh', overflowY: 'auto' }}
        >
          <PostActionPanel
            post={selectedPost}
            onClose={handleClosePanel}
            onPostUpdated={refetch}
          />
        </div>
      ) : (
        <div className="hidden lg:flex items-center justify-center bg-slate-50/50 border border-slate-200 rounded-r-2xl border-l-0">
          <div className="text-center">
            <FileText className="w-8 h-8 text-slate-200 mx-auto mb-2" />
            <p className="text-sm text-slate-400">Select a post to review</p>
          </div>
        </div>
      )}
    </div>
  )
}
