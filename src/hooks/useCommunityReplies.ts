import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listRepliesForPost, createReply, REPLIES_PAGE_SIZE } from '../lib/community'

export function useCommunityReplies(postId: string | undefined, page = 0) {
  return useQuery({
    queryKey: ['community', 'replies', postId, page],
    enabled: !!postId,
    queryFn: () => listRepliesForPost({
      postId: postId!,
      limit: REPLIES_PAGE_SIZE,
      offset: page * REPLIES_PAGE_SIZE,
    }),
    staleTime: 30_000,
  })
}

export function useCreateReply() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createReply,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['community', 'replies', data.post_id] })
      queryClient.invalidateQueries({ queryKey: ['community', 'posts', data.post_id] })
    },
  })
}
