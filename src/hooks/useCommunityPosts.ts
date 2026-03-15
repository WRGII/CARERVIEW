import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listPostsForRoom,
  listRecentPosts,
  getPostById,
  createPost,
  updatePost,
  type PostSortMode,
} from '../lib/community'

export function useCommunityPosts(roomId: string | undefined, sortBy: PostSortMode = 'activity') {
  return useQuery({
    queryKey: ['community', 'posts', 'room', roomId, sortBy],
    enabled: !!roomId,
    queryFn: () => listPostsForRoom({ roomId: roomId!, sortBy }),
    staleTime: 30_000,
  })
}

export function useRecentCommunityPosts(limit = 10) {
  return useQuery({
    queryKey: ['community', 'posts', 'recent', limit],
    queryFn: () => listRecentPosts({ limit }),
    staleTime: 30_000,
  })
}

export function useCommunityPost(postId: string | undefined) {
  return useQuery({
    queryKey: ['community', 'posts', postId],
    enabled: !!postId,
    queryFn: () => getPostById(postId!),
    staleTime: 30_000,
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createPost,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['community', 'posts', 'room', data.room_id] })
      queryClient.invalidateQueries({ queryKey: ['community', 'posts', 'recent'] })
      queryClient.invalidateQueries({ queryKey: ['community', 'rooms'] })
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['community', 'posts', 'recent'] })
      queryClient.invalidateQueries({ queryKey: ['community', 'rooms'] })
    },
  })
}

export function useUpdatePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updatePost,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['community', 'posts', data.id] })
      queryClient.invalidateQueries({ queryKey: ['community', 'posts', 'room', data.room_id] })
    },
    onError: (_err, vars) => {
      queryClient.invalidateQueries({ queryKey: ['community', 'posts', vars.postId] })
    },
  })
}
