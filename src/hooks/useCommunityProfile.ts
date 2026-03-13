import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import {
  getMyProfile,
  getProfileByUserId,
  getProfileByHandle,
  createCommunityProfile,
  updateCommunityProfile,
  checkHandleAvailable,
} from '../lib/community'
import { useAuth } from './useAuth'

export function useMyCommunityProfile() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['community', 'profile', 'me'],
    enabled: !!user?.id,
    queryFn: getMyProfile,
    staleTime: 60_000,
  })
}

export function useCommunityProfileByUserId(userId: string | undefined) {
  return useQuery({
    queryKey: ['community', 'profile', userId],
    enabled: !!userId,
    queryFn: () => getProfileByUserId(userId!),
    staleTime: 60_000,
  })
}

export function useCommunityProfileByHandle(handle: string | undefined) {
  return useQuery({
    queryKey: ['community', 'profile', 'handle', handle],
    enabled: !!handle,
    queryFn: () => getProfileByHandle(handle!),
    staleTime: 60_000,
  })
}

export function useCheckHandleAvailable(handle: string) {
  const [debouncedHandle, setDebouncedHandle] = useState(handle)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedHandle(handle), 400)
    return () => clearTimeout(timer)
  }, [handle])

  return useQuery({
    queryKey: ['community', 'handle-check', debouncedHandle.toLowerCase()],
    enabled: debouncedHandle.length >= 3 && debouncedHandle === handle,
    queryFn: () => checkHandleAvailable(debouncedHandle),
    staleTime: 10_000,
  })
}

export function useCreateCommunityProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCommunityProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', 'profile', 'me'] })
    },
  })
}

export function useUpdateCommunityProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateCommunityProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', 'profile'] })
    },
  })
}
