import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './useAuth'

export type SectionKey =
  | 'situation'
  | 'authority'
  | 'responsibilities'
  | 'living_arrangement'
  | 'sustainability'
  | 'review'

export type CompletionStatus = 'not_started' | 'in_progress' | 'complete'

export interface CarePlan {
  id: string
  team_id: string
  created_by: string | null
  status: 'draft' | 'active'
  created_at: string
  updated_at: string
}

export interface CarePlanSection {
  id: string
  care_plan_id: string
  section_key: SectionKey
  content_json: Record<string, unknown>
  completion_status: CompletionStatus
  created_at: string
  updated_at: string
}

export const SECTION_KEYS: SectionKey[] = [
  'situation',
  'authority',
  'responsibilities',
  'living_arrangement',
  'sustainability',
  'review',
]

export const SECTION_LABELS: Record<SectionKey, string> = {
  situation: 'Situation',
  authority: 'Authority',
  responsibilities: 'Responsibilities',
  living_arrangement: 'Living Arrangement',
  sustainability: 'Sustainability',
  review: 'Review',
}

export const SECTION_SUBTITLES: Record<SectionKey, string> = {
  situation: 'What is happening and what needs attention',
  authority: 'Who can make decisions and access information',
  responsibilities: 'Who owns which care responsibilities',
  living_arrangement: 'Where and how care should happen',
  sustainability: 'Protecting the caregiver from overload',
  review: 'Keeping the plan current over time',
}

// ── Get or create the care plan for a team ──────────────────────────────────

export function useCarePlan(teamId: string | null) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['care_plans', teamId],
    enabled: !!teamId && !!user?.id,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<CarePlan | null> => {
      if (!teamId || !user?.id) return null

      // Try to find existing
      const { data: existing, error: fetchErr } = await supabase
        .from('care_plans')
        .select('*')
        .eq('team_id', teamId)
        .maybeSingle()

      if (fetchErr) throw fetchErr
      if (existing) return existing as CarePlan

      // Create new (owner only — RLS enforces this)
      const { data: created, error: createErr } = await supabase
        .from('care_plans')
        .insert({ team_id: teamId, created_by: user.id, status: 'draft' })
        .select()
        .single()

      if (createErr) throw createErr
      return created as CarePlan
    },
    retry: 2,
  })
}

// ── Get all sections for a care plan ────────────────────────────────────────

export function useCarePlanSections(carePlanId: string | null | undefined) {
  return useQuery({
    queryKey: ['care_plan_sections', carePlanId],
    enabled: !!carePlanId,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<CarePlanSection[]> => {
      if (!carePlanId) return []

      const { data, error } = await supabase
        .from('care_plan_sections')
        .select('*')
        .eq('care_plan_id', carePlanId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return (data ?? []) as CarePlanSection[]
    },
    retry: 2,
  })
}

// ── Upsert a section (insert or update by care_plan_id + section_key) ────────

export function useUpsertCarePlanSection() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({
      carePlanId,
      sectionKey,
      contentJson,
      completionStatus,
    }: {
      carePlanId: string
      sectionKey: SectionKey
      contentJson: Record<string, unknown>
      completionStatus: CompletionStatus
    }) => {
      const { data, error } = await supabase
        .from('care_plan_sections')
        .upsert(
          {
            care_plan_id: carePlanId,
            section_key: sectionKey,
            content_json: contentJson,
            completion_status: completionStatus,
          },
          { onConflict: 'care_plan_id,section_key' }
        )
        .select()
        .single()

      if (error) throw error
      return data as CarePlanSection
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['care_plan_sections', vars.carePlanId] })
    },
  })
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getSectionByKey(
  sections: CarePlanSection[],
  key: SectionKey
): CarePlanSection | undefined {
  return sections.find((s) => s.section_key === key)
}

export function countCompletedSections(sections: CarePlanSection[]): number {
  return sections.filter((s) => s.completion_status === 'complete').length
}
