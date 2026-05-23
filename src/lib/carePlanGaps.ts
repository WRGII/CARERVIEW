import type { CarePlanSection } from '../hooks/useCarePlan'
import { getSectionByKey } from '../hooks/useCarePlan'

export type GapSeverity = 'critical' | 'important' | 'monitor'

export interface GapItem {
  label: string
  action: string
  severity: GapSeverity
  sectionKey: string
}

// ── Auth field keys mapped to i18n keys ───────────────────────────────────────

const AUTH_FIELD_I18N: Record<string, string> = {
  health_decisions: 'care_plan_gaps.auth_health_decisions',
  financial_authority: 'care_plan_gaps.auth_financial_authority',
  legal_documents: 'care_plan_gaps.auth_legal_documents',
  document_location: 'care_plan_gaps.auth_document_location',
}

const AUTH_FIELDS_CHECKED = Object.keys(AUTH_FIELD_I18N)

// ── Responsibility area keys mapped to i18n keys ──────────────────────────────

const RESP_AREA_I18N: Record<string, string> = {
  household: 'care_plan_gaps.resp_household',
  personal_care: 'care_plan_gaps.resp_personal_care',
  emotional: 'care_plan_gaps.resp_emotional',
  health: 'care_plan_gaps.resp_health',
  scheduling: 'care_plan_gaps.resp_scheduling',
  admin: 'care_plan_gaps.resp_admin',
  respite: 'care_plan_gaps.resp_respite',
}

const RESP_AREAS_CHECKED = Object.keys(RESP_AREA_I18N)

// ── Core detection ────────────────────────────────────────────────────────────

export function detectGaps(sections: CarePlanSection[], t: (key: string) => string): GapItem[] {
  const gaps: GapItem[] = []

  // Situation
  const situation = getSectionByKey(sections, 'situation')
  if (situation && situation.completion_status !== 'not_started') {
    const d = situation.content_json as Record<string, unknown>
    if (d.urgent_decisions && String(d.urgent_decisions).trim().length > 0 && !d.current_situation) {
      gaps.push({
        label: t('care_plan_gaps.situation_no_context_label'),
        action: t('care_plan_gaps.situation_no_context_action'),
        severity: 'important',
        sectionKey: 'situation',
      })
    }
  }

  // Authority
  const auth = getSectionByKey(sections, 'authority')
  if (!auth || auth.completion_status === 'not_started') {
    gaps.push({
      label: t('care_plan_gaps.authority_not_completed_label'),
      action: t('care_plan_gaps.authority_not_completed_action'),
      severity: 'critical',
      sectionKey: 'authority',
    })
  } else {
    const d = auth.content_json as Record<string, string>
    for (const f of AUTH_FIELDS_CHECKED) {
      const fieldName = t(AUTH_FIELD_I18N[f])
      if (d[f] === 'missing') {
        gaps.push({
          label: t('care_plan_gaps.authority_field_missing_label').replace('{field}', fieldName),
          action: t('care_plan_gaps.authority_field_missing_action').replace('{field}', fieldName),
          severity: 'critical',
          sectionKey: 'authority',
        })
      } else if (d[f] === 'unclear') {
        gaps.push({
          label: t('care_plan_gaps.authority_field_unclear_label').replace('{field}', fieldName),
          action: t('care_plan_gaps.authority_field_unclear_action').replace('{field}', fieldName),
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
      const areaName = t(RESP_AREA_I18N[k])
      if (d[k]?.status === 'gap') {
        gaps.push({
          label: t('care_plan_gaps.resp_no_owner_label').replace('{area}', areaName),
          action: t('care_plan_gaps.resp_no_owner_action').replace('{area}', areaName),
          severity: 'important',
          sectionKey: 'responsibilities',
        })
      } else if (d[k]?.status === 'unclear') {
        gaps.push({
          label: t('care_plan_gaps.resp_unclear_label').replace('{area}', areaName),
          action: t('care_plan_gaps.resp_unclear_action').replace('{area}', areaName),
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
        label: t('care_plan_gaps.living_not_working_label'),
        action: t('care_plan_gaps.living_not_working_action'),
        severity: 'critical',
        sectionKey: 'living_arrangement',
      })
    } else if (d.currently_working === 'Struggling') {
      gaps.push({
        label: t('care_plan_gaps.living_struggling_label'),
        action: t('care_plan_gaps.living_struggling_action'),
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
        label: t('care_plan_gaps.sustain_very_high_stress_label'),
        action: t('care_plan_gaps.sustain_very_high_stress_action'),
        severity: 'critical',
        sectionKey: 'sustainability',
      })
    } else if (d.stress_level === 'High') {
      gaps.push({
        label: t('care_plan_gaps.sustain_high_stress_label'),
        action: t('care_plan_gaps.sustain_high_stress_action'),
        severity: 'important',
        sectionKey: 'sustainability',
      })
    }

    const stressFactors = (d.stress_factors as string[]) ?? []
    const noBackupSelected = stressFactors.some((f) => f.startsWith('No backup'))

    const backupMissing = !d.backup_person || String(d.backup_person).trim() === ''
    if (backupMissing) {
      gaps.push({
        label: noBackupSelected
          ? t('care_plan_gaps.sustain_no_backup_acknowledged_label')
          : t('care_plan_gaps.sustain_no_backup_label'),
        action: t('care_plan_gaps.sustain_no_backup_action'),
        severity: noBackupSelected ? 'critical' : 'important',
        sectionKey: 'sustainability',
      })
    }

    const respiteMissing = !d.respite_plan || String(d.respite_plan).trim() === ''
    if (respiteMissing) {
      gaps.push({
        label: t('care_plan_gaps.sustain_no_respite_label'),
        action: t('care_plan_gaps.sustain_no_respite_action'),
        severity: 'monitor',
        sectionKey: 'sustainability',
      })
    }
  }

  // Review
  const review = getSectionByKey(sections, 'review')
  if (!review || review.completion_status === 'not_started') {
    gaps.push({
      label: t('care_plan_gaps.review_not_set_label'),
      action: t('care_plan_gaps.review_not_set_action'),
      severity: 'monitor',
      sectionKey: 'review',
    })
  } else {
    const d = review.content_json as Record<string, string>
    if (!d.next_review_date) {
      gaps.push({
        label: t('care_plan_gaps.review_no_date_label'),
        action: t('care_plan_gaps.review_no_date_action'),
        severity: 'monitor',
        sectionKey: 'review',
      })
    }
    if (!d.review_owner) {
      gaps.push({
        label: t('care_plan_gaps.review_no_owner_label'),
        action: t('care_plan_gaps.review_no_owner_action'),
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
export function getSustainabilityFlags(data: Record<string, unknown>, t: (key: string) => string): string[] {
  const flags: string[] = []

  const backupPerson = String(data.backup_person ?? '').trim()
  if (!backupPerson) {
    const stressFactors = (data.stress_factors as string[]) ?? []
    const noBackupSelected = stressFactors.some((f) => f.startsWith('No backup'))
    flags.push(
      noBackupSelected
        ? t('care_plan_gaps.flag_no_backup_acknowledged')
        : t('care_plan_gaps.flag_no_backup')
    )
  }

  const respitePlan = String(data.respite_plan ?? '').trim()
  if (!respitePlan) flags.push(t('care_plan_gaps.flag_no_respite'))

  const stress = data.stress_level as string
  if (stress === 'Very high') flags.push(t('care_plan_gaps.flag_very_high_stress'))
  else if (stress === 'High') flags.push(t('care_plan_gaps.flag_high_stress'))

  return flags
}
