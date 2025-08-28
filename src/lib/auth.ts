import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

export interface Profile {
  id: string
  user_id: string
  role: 'admin' | 'caregiver'
  display_name: string
  email: string
  created_at: string
  updated_at: string
}

export interface AuthUser extends User {
  profile?: Profile
}

export const signUp = async (email: string, password: string, displayName: string, role: 'admin' | 'caregiver' = 'caregiver') => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
        role: role
      }
    }
  })

  if (error) throw error
  return data
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Fetch profile
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.warn('Failed to fetch profile:', error)
    return user as AuthUser
  }

  return { ...user, profile } as AuthUser
}