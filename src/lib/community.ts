import { supabase } from './supabaseClient'

// ============================================================
// TYPES
// ============================================================

export type PostStatus = 'active' | 'hidden' | 'removed' | 'pending_review'
export type ReplyStatus = 'active' | 'hidden' | 'removed' | 'pending_review'
export type ReportStatus = 'pending' | 'reviewed' | 'dismissed'
export type ReactionType = 'heart' | 'hug' | 'helpful'
export type ReportReason =
  | 'harassment'
  | 'unsafe_advice'
  | 'privacy_violation'
  | 'spam'
  | 'inappropriate_content'
  | 'other'

export interface CommunityRoom {
  id: string
  slug: string
  name: string
  description: string
  icon_name: string
  color: string
  sort_order: number
  is_active: boolean
  post_count: number
  created_at: string
}

export interface CommunityProfile {
  user_id: string
  handle: string
  bio: string
  avatar_color: string
  is_banned: boolean
  ban_reason: string | null
  post_count: number
  reply_count: number
  created_at: string
  updated_at: string
}

export type HelpType =
  | 'emotional_support'
  | 'practical_tips'
  | 'similar_experiences'
  | 'question'
  | 'resource'

export interface CommunityPost {
  id: string
  room_id: string
  author_user_id: string
  is_anonymous: boolean
  title: string
  body: string
  post_status: PostStatus
  is_locked: boolean
  help_type: HelpType | null
  reply_count: number
  reaction_count: number
  last_activity_at: string
  created_at: string
  updated_at: string
  room?: Pick<CommunityRoom, 'id' | 'slug' | 'name' | 'color' | 'icon_name'>
  author_profile?: Pick<CommunityProfile, 'handle' | 'avatar_color'> | null
}

export interface CommunityReply {
  id: string
  post_id: string
  author_user_id: string
  is_anonymous: boolean
  body: string
  reply_status: ReplyStatus
  created_at: string
  updated_at: string
  author_profile?: Pick<CommunityProfile, 'handle' | 'avatar_color'> | null
}

export interface CommunityReaction {
  id: string
  post_id: string
  user_id: string
  reaction_type: ReactionType
  created_at: string
}

export interface CommunityReport {
  id: string
  reporter_user_id: string
  post_id: string | null
  reply_id: string | null
  reason: ReportReason
  details: string
  report_status: ReportStatus
  reviewed_by: string | null
  reviewed_at: string | null
  mod_note: string | null
  created_at: string
}

export interface ModerationReportRow extends CommunityReport {
  post?: Pick<CommunityPost, 'id' | 'title' | 'body' | 'author_user_id' | 'is_anonymous'> | null
  reply?: Pick<CommunityReply, 'id' | 'body' | 'author_user_id' | 'is_anonymous' | 'post_id'> | null
  reporter_profile?: Pick<CommunityProfile, 'handle'> | null
}

// ============================================================
// ROOMS
// ============================================================

export async function listCommunityRooms(): Promise<CommunityRoom[]> {
  const { data, error } = await supabase
    .from('community_rooms')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function getRoomBySlug(slug: string): Promise<CommunityRoom | null> {
  const { data, error } = await supabase
    .from('community_rooms')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()
  if (error) throw error
  return data
}

// ============================================================
// COMMUNITY PROFILES
// ============================================================

export async function getMyProfile(): Promise<CommunityProfile | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('community_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function getProfileByUserId(userId: string): Promise<CommunityProfile | null> {
  const { data, error } = await supabase
    .from('community_profiles')
    .select('user_id, handle, bio, avatar_color, post_count, reply_count, created_at, updated_at')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function getProfileByHandle(handle: string): Promise<CommunityProfile | null> {
  const { data, error } = await supabase
    .from('community_profiles')
    .select('user_id, handle, bio, avatar_color, post_count, reply_count, created_at, updated_at')
    .ilike('handle', handle)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function checkHandleAvailable(handle: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('community_profiles')
    .select('user_id')
    .ilike('handle', handle)
    .maybeSingle()
  if (error) throw error
  return data === null
}

export async function createCommunityProfile(params: {
  handle: string
  bio?: string
  avatar_color?: string
}): Promise<CommunityProfile> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('community_profiles')
    .insert({
      user_id: user.id,
      handle: params.handle.trim(),
      bio: params.bio?.trim() ?? '',
      avatar_color: params.avatar_color ?? '#00BCD4',
    })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function updateCommunityProfile(params: {
  handle?: string
  bio?: string
  avatar_color?: string
}): Promise<CommunityProfile> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const updates: Record<string, string> = {}
  if (params.handle !== undefined) updates.handle = params.handle.trim()
  if (params.bio !== undefined) updates.bio = params.bio.trim()
  if (params.avatar_color !== undefined) updates.avatar_color = params.avatar_color

  const { data, error } = await supabase
    .from('community_profiles')
    .update(updates)
    .eq('user_id', user.id)
    .select('*')
    .single()
  if (error) throw error
  return data
}

// ============================================================
// POSTS
// ============================================================

const POST_LIST_SELECT = `
  id, room_id, author_user_id, is_anonymous, title, body,
  post_status, is_locked, help_type, reply_count, reaction_count,
  last_activity_at, created_at, updated_at,
  room:community_rooms ( id, slug, name, color, icon_name ),
  author_profile:community_profiles ( handle, avatar_color )
`

export type PostSortMode = 'activity' | 'newest' | 'most_replies'

export async function listPostsForRoom(params: {
  roomId: string
  limit?: number
  offset?: number
  sortBy?: PostSortMode
}): Promise<CommunityPost[]> {
  const { roomId, limit = 20, offset = 0, sortBy = 'activity' } = params
  let query = supabase
    .from('community_posts')
    .select(POST_LIST_SELECT)
    .eq('room_id', roomId)
    .eq('post_status', 'active')

  if (sortBy === 'activity') {
    query = query.order('last_activity_at', { ascending: false })
  } else if (sortBy === 'newest') {
    query = query.order('created_at', { ascending: false })
  } else if (sortBy === 'most_replies') {
    query = query.order('reply_count', { ascending: false }).order('last_activity_at', { ascending: false })
  }

  const { data, error } = await query.range(offset, offset + limit - 1)
  if (error) throw error
  return (data ?? []) as CommunityPost[]
}

export async function listRecentPosts(params: {
  limit?: number
  offset?: number
} = {}): Promise<CommunityPost[]> {
  const { limit = 10, offset = 0 } = params
  const { data, error } = await supabase
    .from('community_posts')
    .select(POST_LIST_SELECT)
    .eq('post_status', 'active')
    .order('last_activity_at', { ascending: false })
    .range(offset, offset + limit - 1)
  if (error) throw error
  return (data ?? []) as CommunityPost[]
}

export async function getPostById(postId: string): Promise<CommunityPost | null> {
  const { data, error } = await supabase
    .from('community_posts')
    .select(POST_LIST_SELECT)
    .eq('id', postId)
    .maybeSingle()
  if (error) throw error
  return data as CommunityPost | null
}

export async function createPost(params: {
  room_id: string
  title: string
  body: string
  is_anonymous?: boolean
  help_type?: HelpType | null
}): Promise<CommunityPost> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('community_posts')
    .insert({
      room_id: params.room_id,
      author_user_id: user.id,
      title: params.title.trim(),
      body: params.body.trim(),
      is_anonymous: params.is_anonymous ?? false,
      ...(params.help_type ? { help_type: params.help_type } : {}),
    })
    .select(POST_LIST_SELECT)
    .single()
  if (error) throw error
  return data as CommunityPost
}

export async function updatePost(params: {
  postId: string
  title?: string
  body?: string
}): Promise<CommunityPost> {
  const updates: Record<string, string> = {}
  if (params.title !== undefined) updates.title = params.title.trim()
  if (params.body !== undefined) updates.body = params.body.trim()

  const { data, error } = await supabase
    .from('community_posts')
    .update(updates)
    .eq('id', params.postId)
    .select(POST_LIST_SELECT)
    .single()
  if (error) throw error
  return data as CommunityPost
}

// ============================================================
// REPLIES
// ============================================================

const REPLY_SELECT = `
  id, post_id, author_user_id, is_anonymous, body,
  reply_status, created_at, updated_at,
  author_profile:community_profiles ( handle, avatar_color )
`

export async function listRepliesForPost(postId: string): Promise<CommunityReply[]> {
  const { data, error } = await supabase
    .from('community_replies')
    .select(REPLY_SELECT)
    .eq('post_id', postId)
    .eq('reply_status', 'active')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as CommunityReply[]
}

export async function createReply(params: {
  post_id: string
  body: string
  is_anonymous?: boolean
}): Promise<CommunityReply> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('community_replies')
    .insert({
      post_id: params.post_id,
      author_user_id: user.id,
      body: params.body.trim(),
      is_anonymous: params.is_anonymous ?? false,
    })
    .select(REPLY_SELECT)
    .single()
  if (error) throw error
  return data as CommunityReply
}

// ============================================================
// REACTIONS
// ============================================================

export async function getMyReactionsForPost(postId: string): Promise<CommunityReaction[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('community_reactions')
    .select('*')
    .eq('post_id', postId)
    .eq('user_id', user.id)
  if (error) throw error
  return data ?? []
}

export async function getReactionCountsForPost(
  postId: string
): Promise<Record<ReactionType, number>> {
  const { data, error } = await supabase
    .from('community_reactions')
    .select('reaction_type')
    .eq('post_id', postId)
  if (error) throw error

  const counts: Record<ReactionType, number> = { heart: 0, hug: 0, helpful: 0 }
  for (const row of data ?? []) {
    counts[row.reaction_type as ReactionType] = (counts[row.reaction_type as ReactionType] ?? 0) + 1
  }
  return counts
}

export async function addReaction(params: {
  post_id: string
  reaction_type: ReactionType
}): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('community_reactions')
    .insert({
      post_id: params.post_id,
      user_id: user.id,
      reaction_type: params.reaction_type,
    })
  if (error && error.code !== '23505') throw error
}

export async function removeReaction(params: {
  post_id: string
  reaction_type: ReactionType
}): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('community_reactions')
    .delete()
    .eq('post_id', params.post_id)
    .eq('user_id', user.id)
    .eq('reaction_type', params.reaction_type)
  if (error) throw error
}

// ============================================================
// REPORTS
// ============================================================

export async function submitReport(params: {
  post_id?: string
  reply_id?: string
  reason: ReportReason
  details?: string
}): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('community_reports')
    .insert({
      reporter_user_id: user.id,
      post_id: params.post_id ?? null,
      reply_id: params.reply_id ?? null,
      reason: params.reason,
      details: params.details?.trim() ?? '',
    })
  if (error) throw error
}

// ============================================================
// MODERATION (admin-only, uses service role via edge function
// for destructive actions; read-only queries run client-side
// using the admin's auth token which bypasses user-only RLS
// through a service-role backed admin policy)
// ============================================================

export async function listPendingReports(params: {
  status?: ReportStatus
  limit?: number
  offset?: number
} = {}): Promise<ModerationReportRow[]> {
  const { status = 'pending', limit = 50, offset = 0 } = params

  const { data, error } = await supabase
    .from('community_reports')
    .select(`
      *,
      reporter_profile:community_profiles!reporter_user_id ( handle ),
      post:community_posts ( id, title, body, author_user_id, is_anonymous ),
      reply:community_replies ( id, body, author_user_id, is_anonymous, post_id )
    `)
    .eq('report_status', status)
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1)
  if (error) throw error
  return (data ?? []) as ModerationReportRow[]
}

export async function resolveReport(params: {
  reportId: string
  action: 'reviewed' | 'dismissed'
  mod_note?: string
}): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('community_reports')
    .update({
      report_status: params.action,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      mod_note: params.mod_note?.trim() ?? null,
    })
    .eq('id', params.reportId)
  if (error) throw error
}

export async function moderatePost(params: {
  postId: string
  post_status: PostStatus
}): Promise<void> {
  const { error } = await supabase
    .from('community_posts')
    .update({ post_status: params.post_status })
    .eq('id', params.postId)
  if (error) throw error
}

export async function moderateReply(params: {
  replyId: string
  reply_status: ReplyStatus
}): Promise<void> {
  const { error } = await supabase
    .from('community_replies')
    .update({ reply_status: params.reply_status })
    .eq('id', params.replyId)
  if (error) throw error
}

export async function banCommunityMember(params: {
  userId: string
  reason?: string
}): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('community_profiles')
    .update({
      is_banned: true,
      ban_reason: params.reason?.trim() ?? null,
    })
    .eq('user_id', params.userId)
  if (error) throw error

  await supabase.from('community_bans').insert({
    user_id: params.userId,
    banned_by: user.id,
    reason: params.reason?.trim() ?? '',
  })
}

export async function unbanCommunityMember(userId: string): Promise<void> {
  const { error } = await supabase
    .from('community_profiles')
    .update({ is_banned: false, ban_reason: null })
    .eq('user_id', userId)
  if (error) throw error
}

// ============================================================
// HELPERS
// ============================================================

export function maskAuthor(
  post: Pick<CommunityPost, 'is_anonymous' | 'author_user_id' | 'author_profile'>,
  currentUserId: string | undefined
): {
  displayHandle: string
  avatarColor: string
  isCurrentUser: boolean
  isAnonymous: boolean
} {
  const isCurrentUser = post.author_user_id === currentUserId

  if (post.is_anonymous && !isCurrentUser) {
    return {
      displayHandle: 'Anonymous Caregiver',
      avatarColor: '#90A4AE',
      isCurrentUser: false,
      isAnonymous: true,
    }
  }

  return {
    displayHandle: post.author_profile?.handle ?? 'Caregiver',
    avatarColor: post.author_profile?.avatar_color ?? '#00BCD4',
    isCurrentUser,
    isAnonymous: false,
  }
}

export const AVATAR_COLORS = [
  '#00BCD4', '#26A69A', '#66BB6A', '#FFA726',
  '#EF5350', '#AB47BC', '#5C6BC0', '#8D6E63',
]

export function generateAvatarColor(handle: string): string {
  let hash = 0
  for (let i = 0; i < handle.length; i++) {
    hash = handle.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}
