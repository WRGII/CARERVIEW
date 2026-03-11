import { useQuery } from '@tanstack/react-query'
import { listCommunityRooms, getRoomBySlug } from '../lib/community'

export function useCommunityRooms() {
  return useQuery({
    queryKey: ['community', 'rooms'],
    queryFn: listCommunityRooms,
    staleTime: 5 * 60_000,
  })
}

export function useCommunityRoom(slug: string | undefined) {
  return useQuery({
    queryKey: ['community', 'rooms', slug],
    enabled: !!slug,
    queryFn: () => getRoomBySlug(slug!),
    staleTime: 5 * 60_000,
  })
}
