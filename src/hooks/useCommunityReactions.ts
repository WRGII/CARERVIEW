import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getMyReactionsForPost,
  getReactionCountsForPost,
  addReaction,
  removeReaction,
  type ReactionType,
} from '../lib/community'
import { useAuth } from './useAuth'

export function useMyReactions(postId: string | undefined) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['community', 'reactions', 'me', postId],
    enabled: !!postId && !!user?.id,
    queryFn: () => getMyReactionsForPost(postId!),
    staleTime: 60_000,
  })
}

export function useReactionCounts(postId: string | undefined) {
  return useQuery({
    queryKey: ['community', 'reactions', 'counts', postId],
    enabled: !!postId,
    queryFn: () => getReactionCountsForPost(postId!),
    staleTime: 30_000,
  })
}

export function useToggleReaction(postId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      reaction_type,
      isActive,
    }: {
      reaction_type: ReactionType
      isActive: boolean
    }) => {
      if (isActive) {
        await removeReaction({ post_id: postId, reaction_type })
      } else {
        await addReaction({ post_id: postId, reaction_type })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', 'reactions', 'me', postId] })
      queryClient.invalidateQueries({ queryKey: ['community', 'reactions', 'counts', postId] })
      queryClient.invalidateQueries({ queryKey: ['community', 'posts', postId] })
    },
  })
}
