import type { CarePlanSection } from '../hooks/useCarePlan'
import { getSectionByKey } from '../hooks/useCarePlan'

export type GapSeverity = 'critical' | 'important' | 'monitor'

export interface GapItem {
  label: string
  action: string
  severity: GapSeverity
  sectionKey: string
}

// ── Authority field metadata ──────────────────────────────────────────────────

const AUTH_FIELD_LABELS: Record<string, string> = {
  health_decisions: 'Health decision authority',
  financial_authority: 'Financial authority',
  legal_documents: 'Legal documents',
  document_location: 'Organised records',
}

const AUTH_FIELDS_CHECKED = Object.keys(AUTH_FIELD_LABELS)

// ── Responsibility area metadata ──────────────────────────────────────────────

const RESP_AREA_LABELS: Record<string, string> = {
  household: 'Household support',
  personal_care: 'Personal care and mobility',
  emotional: 'Emotional support',
  health: 'Health coordination',
  scheduling: 'Appointments and transport',
  admin: 'Financial and administration',
  respite: 'Backup and respite',
}

const RESP_AREAS_CHECKED = Object.keys(RESP_AREA_LABELS)

// ── Core detection ────────────────────────────────────────────────────────────

export function detectGaps(sections: CarePlanSection[]): GapItem[] {
  const gaps: GapItem[] = []

  // Authority
  const auth = getSectionByKey(sections, 'authority')
  if (!auth || auth.completion_status === 'not_started') {
    gaps.push({
      label: 'Authority section not completed',
      action: 'Complete the Authority section to identify who can make key decisions.',
      severity: 'critical',
      sectionKey: 'authority',
    })
  } else {
    const d = auth.content_json as Record<string, string>
    for (const f of AUTH_FIELDS_CHECKED) {
      if (d[f] === 'missing') {
        gaps.push({
          label: `${AUTH_FIELD_LABELS[f]} is missing`,
          action: `Resolve the "${AUTH_FIELD_LABELS[f]}" gap in the Authority section.`,
          severity: 'critical',
          sectionKey: 'authority',
        })
      } else if (d[f] === 'unclear') {
        gaps.push({
          label: `${AUTH_FIELD_LABELS[f]} is unclear`,
          action: `Clarify the "${AUTH_FIELD_LABELS[f]}" in the Authority section.`,
          severity: 'important',
          sectionKey: 'authority',
        })
      }
    }
  }

  // Responsibilities
  const resp = getSectionByKey(sections, 'responsibilities')
  if (resp && resp.completion_status !== 'not_started') {
    const d = resp.content_json as Record<string, Record<string, string>>
    for (const k of RESP_AREAS_CHECKED) {
      if (d[k]?.status === 'gap') {
        gaps.push({
          label: `${RESP_AREA_LABELS[k]} has no owner`,
          action: `Assign a responsible person for "${RESP_AREA_LABELS[k]}" in the Responsibilities section.`,
          severity: 'important',
          sectionKey: 'responsibilities',
        })
      } else if (d[k]?.status === 'unclear') {
        gaps.push({
          label: `${RESP_AREA_LABELS[k]} responsibility is unclear`,
          action: `Clarify ownership of "${RESP_AREA_LABELS[k]}" in the Responsibilities section.`,
          severity: 'monitor',
          sectionKey: 'responsibilities',
        })
      }
    }
  }

  // Living arrangement
  const living = getSectionByKey(sections, 'living_arrangement')
  if (living && living.completion_status !== 'not_started') {
    const d = living.content_json as Record<string, string>
    if (d.currently_working === 'No') {
      gaps.push({
        label: 'Current living arrangement is not working',
        action: 'Review the Living Arrangement section — consider alternatives urgently.',
        severity: 'critical',
        sectionKey: 'living_arrangement',
      })
    } else if (d.currently_working === 'Struggling') {
      gaps.push({
        label: 'Current living arrangement is under strain',
        action: 'Review the Living Arrangement section — consider alternatives before a crisis.',
        severity: 'important',
        sectionKey: 'living_arrangement',
      })
    }
  }

  // Sustainability
  const sustain = getSectionByKey(sections, 'sustainability')
  if (sustain && sustain.completion_status !== 'not_started') {
    const d = sustain.content_json as Record<string, unknown>
    if (d.stress_level === 'Very high') {
      gaps.push({
        label: 'Primary caregiver reports very high stress',
        action: 'Review sustainability and backup arrangements urgently.',
        severity: 'critical',
        sectionKey: 'sustainability',
      })
    } else if (d.stress_level === 'High') {
      gaps.push({
        label: 'Primary caregiver reports high stress',
        action: 'Review sustainability and backup arrangements.',
        severity: 'important',
        sectionKey: 'sustainability',
      })
    }
    if (!d.backup_person) {
      gaps.push({
        label: 'No backup caregiver identified',
        action: 'Identify a backup caregiver in the Sustainability section.',
        severity: 'important',
        sectionKey: 'sustainability',
      })
    }
    if (!d.respite_plan) {
      gaps.push({
        label: 'No respite plan in place',
        action: 'Add a respite plan in the Sustainability section.',
        severity: 'monitor',
        sectionKey: 'sustainability',
      })
    }
  }

  // Review
  const review = getSectionByKey(sections, 'review')
  if (!review || review.completion_status === 'not_started') {
    gaps.push({
      label: 'No review schedule set',
      action: 'Complete the Review section and set a next review date.',
      severity: 'monitor',
      sectionKey: 'review',
    })
  } else {
    const d = review.content_json as Record<string, string>
    if (!d.next_review_date) {
      gaps.push({
        label: 'No next review date set',
        action: 'Set a next review date in the Review section.',
        severity: 'monitor',
        sectionKey: 'review',
      })
    }
    if (!d.review_owner) {
      gaps.push({
        label: 'No review owner named',
        action: 'Identify who is responsible for leading reviews.',
        severity: 'monitor',
        sectionKey: 'review',
      })
    }
  }

  return gaps
}

// ── Derived helpers ───────────────────────────────────────────────────────────

export function getTopPriorities(gaps: GapItem[], n = 3): GapItem[] {
  const order: Record<GapSeverity, number> = { critical: 0, important: 1, monitor: 2 }
  return [...gaps].sort((a, b) => order[a.severity] - order[b.severity]).slice(0, n)
}

export function getNextStep(gaps: GapItem[]): string | null {
  if (gaps.length === 0) return null
  const top = getTopPriorities(gaps, 1)[0]
  return top?.action ?? null
}

export function countBySeverity(gaps: GapItem[]): Record<GapSeverity, number> {
  return {
    critical: gaps.filter((g) => g.severity === 'critical').length,
    important: gaps.filter((g) => g.severity === 'important').length,
    monitor: gaps.filter((g) => g.severity === 'monitor').length,
  }
}

// Derives the inline risk flags shown in SustainabilityForm
export function getSustainabilityFlags(data: Record<string, unknown>): string[] {
  const flags: string[] = []
  if (!(data.backup_person as string)) flags.push('No backup caregiver identified')
  if (!(data.respite_plan as string)) flags.push('No respite plan in place')
  const stress = data.stress_level as string
  if (stress === 'High' || stress === 'Very high') flags.push('Primary caregiver reports high stress')
  return flags
}
