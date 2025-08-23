import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface AccessToken {
  id: string
  token_hash: string
  role: 'admin' | 'caregiver'
  created_at: string
  expires_at?: string
  is_active: boolean
}

export interface Legend {
  id: string
  score: number
  description: string
  created_at: string
}

export interface Category {
  id: string
  name: string
  type: 'ADL' | 'IADL'
  ada_definition: string
  ot_definition: string
  sort_order: number
  created_at: string
}

export interface Question {
  id: string
  category_id: string
  question_text: string
  sort_order: number
  created_at: string
}

export interface Observation {
  id: string
  token_id: string
  patient_name: string
  observation_date: string
  notes: string
  created_at: string
  updated_at: string
}

export interface Response {
  id: string
  observation_id: string
  question_id: string
  score: number
  notes: string
  created_at: string
  updated_at: string
}

// Enhanced types with relationships
export interface CategoryWithQuestions extends Category {
  questions: Question[]
}

export interface ObservationWithResponses extends Observation {
  responses: (Response & { question: Question & { category: Category } })[]
}