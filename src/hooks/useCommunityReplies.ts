import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listRepliesForPost, createReply } from '../lib/community'

export function useCommunityReplies(postId: string | undefined) {
  return useQuery({
    queryKey: ['community', 'replies', postId],
    enabled: !!postId,
    queryFn: () => listRepliesForPost(postId!),
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
