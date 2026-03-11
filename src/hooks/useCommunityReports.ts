import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  submitReport,
  listPendingReports,
  resolveReport,
  moderatePost,
  moderateReply,
  banCommunityMember,
  unbanCommunityMember,
  type ReportStatus,
  type PostStatus,
  type ReplyStatus,
} from '../lib/community'

export function useSubmitReport() {
  return useMutation({
    mutationFn: submitReport,
  })
}

export function useModerationQueue(status: ReportStatus = 'pending') {
  return useQuery({
    queryKey: ['community', 'moderation', 'reports', status],
    queryFn: () => listPendingReports({ status }),
    staleTime: 15_000,
  })
}

export function useResolveReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: resolveReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', 'moderation', 'reports'] })
    },
  })
}

export function useModeratePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: { postId: string; post_status: PostStatus }) =>
      moderatePost(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', 'posts'] })
      queryClient.invalidateQueries({ queryKey: ['community', 'moderation'] })
    },
  })
}

export function useModerateReply() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: { replyId: string; reply_status: ReplyStatus }) =>
      moderateReply(params),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['community', 'replies'] })
      queryClient.invalidateQueries({ queryKey: ['community', 'moderation'] })
    },
  })
}

export function useBanCommunityMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: banCommunityMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', 'profile'] })
      queryClient.invalidateQueries({ queryKey: ['community', 'moderation'] })
    },
  })
}

export function useUnbanCommunityMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: unbanCommunityMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', 'profile'] })
    },
  })
}
