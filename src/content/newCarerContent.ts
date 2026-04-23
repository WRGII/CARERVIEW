// src/content/newCarerContent.ts
// Structural metadata for the New Carer section.
// All user-facing strings come from the i18n system via t() keys defined here.

export interface NewCarerModule {
  id: string
  route: string
  icon: string
  titleKey: string
  descKey: string
  number: number
}

export interface CarePlanPillar {
  id: string
  number: number
  titleKey: string
  bodyKey: string
  questionKeys: string[]
}

export interface RoleArea {
  id: string
  icon: string
  titleKey: string
  bodyKey: string
}

export interface LivingOption {
  id: string
  icon: string
  titleKey: string
  bodyKey: string
}

export interface LivingDimension {
  id: string
  key: string
}

export interface DocArea {
  id: string
  icon: string
  titleKey: string
  bodyKey: string
}

export interface HealthSystem {
  id: string
  icon: string
  titleKey: string
  bodyKey: string
}

export interface SustainPressure {
  id: string
  key: string
}

export interface ReviewTrigger {
  id: string
  key: string
}

export interface WorksheetResource {
  id: string
  titleKey: string
  descKey: string
  tagKey: string
  tagColor: string
  comingSoon?: boolean
}

// -------------------------------------------------------
// Module registry — drives ModuleNavGrid
// -------------------------------------------------------
export const NEW_CARER_MODULES: NewCarerModule[] = [
  {
    id: 'big-picture',
    route: '/new-carer/big-picture',
    icon: 'Compass',
    titleKey: 'new_carer.mod_big_picture_title',
    descKey: 'new_carer.mod_big_picture_desc',
    number: 1,
  },
  {
    id: 'care-plan',
    route: '/new-carer/care-plan',
    icon: 'ClipboardList',
    titleKey: 'new_carer.mod_care_plan_title',
    descKey: 'new_carer.mod_care_plan_desc',
    number: 2,
  },
  {
    id: 'roles',
    route: '/new-carer/roles',
    icon: 'Users',
    titleKey: 'new_carer.mod_roles_title',
    descKey: 'new_carer.mod_roles_desc',
    number: 3,
  },
  {
    id: 'living-arrangements',
    route: '/new-carer/living-arrangements',
    icon: 'Home',
    titleKey: 'new_carer.mod_living_title',
    descKey: 'new_carer.mod_living_desc',
    number: 4,
  },
  {
    id: 'documents-authority',
    route: '/new-carer/documents-authority',
    icon: 'FileText',
    titleKey: 'new_carer.mod_docs_title',
    descKey: 'new_carer.mod_docs_desc',
    number: 5,
  },
  {
    id: 'health-coordination',
    route: '/new-carer/health-coordination',
    icon: 'HeartPulse',
    titleKey: 'new_carer.mod_health_title',
    descKey: 'new_carer.mod_health_desc',
    number: 6,
  },
  {
    id: 'sustainability',
    route: '/new-carer/sustainability',
    icon: 'Battery',
    titleKey: 'new_carer.mod_sustain_title',
    descKey: 'new_carer.mod_sustain_desc',
    number: 7,
  },
  {
    id: 'review-plan',
    route: '/new-carer/review-plan',
    icon: 'RefreshCw',
    titleKey: 'new_carer.mod_review_title',
    descKey: 'new_carer.mod_review_desc',
    number: 8,
  },
]

// -------------------------------------------------------
// Care Plan — 8 pillars
// -------------------------------------------------------
export const CARE_PLAN_PILLARS: CarePlanPillar[] = [
  {
    id: 'understand-need',
    number: 1,
    titleKey: 'new_carer.cp_p1_title',
    bodyKey: 'new_carer.cp_p1_body',
    questionKeys: [
      'new_carer.cp_p1_q1',
      'new_carer.cp_p1_q2',
      'new_carer.cp_p1_q3',
      'new_carer.cp_p1_q4',
    ],
  },
  {
    id: 'decision-authority',
    number: 2,
    titleKey: 'new_carer.cp_p2_title',
    bodyKey: 'new_carer.cp_p2_body',
    questionKeys: [
      'new_carer.cp_p2_q1',
      'new_carer.cp_p2_q2',
      'new_carer.cp_p2_q3',
      'new_carer.cp_p2_q4',
    ],
  },
  {
    id: 'care-team',
    number: 3,
    titleKey: 'new_carer.cp_p3_title',
    bodyKey: 'new_carer.cp_p3_body',
    questionKeys: [
      'new_carer.cp_p3_q1',
      'new_carer.cp_p3_q2',
      'new_carer.cp_p3_q3',
      'new_carer.cp_p3_q4',
      'new_carer.cp_p3_q5',
    ],
  },
  {
    id: 'care-model',
    number: 4,
    titleKey: 'new_carer.cp_p4_title',
    bodyKey: 'new_carer.cp_p4_body',
    questionKeys: [
      'new_carer.cp_p4_q1',
      'new_carer.cp_p4_q2',
      'new_carer.cp_p4_q3',
      'new_carer.cp_p4_q4',
    ],
  },
  {
    id: 'health-system',
    number: 5,
    titleKey: 'new_carer.cp_p5_title',
    bodyKey: 'new_carer.cp_p5_body',
    questionKeys: [
      'new_carer.cp_p5_q1',
      'new_carer.cp_p5_q2',
      'new_carer.cp_p5_q3',
      'new_carer.cp_p5_q4',
    ],
  },
  {
    id: 'paperwork',
    number: 6,
    titleKey: 'new_carer.cp_p6_title',
    bodyKey: 'new_carer.cp_p6_body',
    questionKeys: [
      'new_carer.cp_p6_q1',
      'new_carer.cp_p6_q2',
      'new_carer.cp_p6_q3',
      'new_carer.cp_p6_q4',
    ],
  },
  {
    id: 'sustainability',
    number: 7,
    titleKey: 'new_carer.cp_p7_title',
    bodyKey: 'new_carer.cp_p7_body',
    questionKeys: [
      'new_carer.cp_p7_q1',
      'new_carer.cp_p7_q2',
      'new_carer.cp_p7_q3',
      'new_carer.cp_p7_q4',
    ],
  },
  {
    id: 'review',
    number: 8,
    titleKey: 'new_carer.cp_p8_title',
    bodyKey: 'new_carer.cp_p8_body',
    questionKeys: [
      'new_carer.cp_p8_q1',
      'new_carer.cp_p8_q2',
      'new_carer.cp_p8_q3',
    ],
  },
]

// -------------------------------------------------------
// Roles — responsibility areas
// -------------------------------------------------------
export const ROLE_AREAS: RoleArea[] = [
  { id: 'household', icon: 'Home', titleKey: 'new_carer.roles_area_household_title', bodyKey: 'new_carer.roles_area_household_body' },
  { id: 'personal', icon: 'HeartHandshake', titleKey: 'new_carer.roles_area_personal_title', bodyKey: 'new_carer.roles_area_personal_body' },
  { id: 'emotional', icon: 'Heart', titleKey: 'new_carer.roles_area_emotional_title', bodyKey: 'new_carer.roles_area_emotional_body' },
  { id: 'health', icon: 'Stethoscope', titleKey: 'new_carer.roles_area_health_title', bodyKey: 'new_carer.roles_area_health_body' },
  { id: 'scheduling', icon: 'CalendarDays', titleKey: 'new_carer.roles_area_scheduling_title', bodyKey: 'new_carer.roles_area_scheduling_body' },
  { id: 'admin', icon: 'Briefcase', titleKey: 'new_carer.roles_area_admin_title', bodyKey: 'new_carer.roles_area_admin_body' },
  { id: 'respite', icon: 'RotateCcw', titleKey: 'new_carer.roles_area_respite_title', bodyKey: 'new_carer.roles_area_respite_body' },
]

// -------------------------------------------------------
// Living arrangements — options
// -------------------------------------------------------
export const LIVING_OPTIONS: LivingOption[] = [
  { id: 'current-home', icon: 'Home', titleKey: 'new_carer.living_opt1_title', bodyKey: 'new_carer.living_opt1_body' },
  { id: 'family-home', icon: 'Users', titleKey: 'new_carer.living_opt2_title', bodyKey: 'new_carer.living_opt2_body' },
  { id: 'in-home-support', icon: 'HeartHandshake', titleKey: 'new_carer.living_opt3_title', bodyKey: 'new_carer.living_opt3_body' },
  { id: 'care-facility', icon: 'Building2', titleKey: 'new_carer.living_opt4_title', bodyKey: 'new_carer.living_opt4_body' },
]

export const LIVING_DIMENSIONS: LivingDimension[] = [
  { id: 'safety', key: 'new_carer.living_dim_safety' },
  { id: 'space', key: 'new_carer.living_dim_space' },
  { id: 'supervision', key: 'new_carer.living_dim_supervision' },
  { id: 'transport', key: 'new_carer.living_dim_transport' },
  { id: 'help', key: 'new_carer.living_dim_help' },
  { id: 'medical', key: 'new_carer.living_dim_medical' },
  { id: 'afford', key: 'new_carer.living_dim_afford' },
  { id: 'viability', key: 'new_carer.living_dim_viability' },
]

// -------------------------------------------------------
// Documents & authority — areas
// -------------------------------------------------------
export const DOC_AREAS: DocArea[] = [
  { id: 'health', icon: 'Stethoscope', titleKey: 'new_carer.docs_area_health_title', bodyKey: 'new_carer.docs_area_health_body' },
  { id: 'financial', icon: 'Banknote', titleKey: 'new_carer.docs_area_financial_title', bodyKey: 'new_carer.docs_area_financial_body' },
  { id: 'legal', icon: 'Scale', titleKey: 'new_carer.docs_area_legal_title', bodyKey: 'new_carer.docs_area_legal_body' },
  { id: 'prefs', icon: 'MessageSquare', titleKey: 'new_carer.docs_area_prefs_title', bodyKey: 'new_carer.docs_area_prefs_body' },
  { id: 'records', icon: 'FolderOpen', titleKey: 'new_carer.docs_area_records_title', bodyKey: 'new_carer.docs_area_records_body' },
  { id: 'emergency', icon: 'AlertTriangle', titleKey: 'new_carer.docs_area_emergency_title', bodyKey: 'new_carer.docs_area_emergency_body' },
]

// -------------------------------------------------------
// Health coordination — system components
// -------------------------------------------------------
export const HEALTH_SYSTEMS: HealthSystem[] = [
  { id: 'diagnoses', icon: 'ClipboardList', titleKey: 'new_carer.health_sys_1_title', bodyKey: 'new_carer.health_sys_1_body' },
  { id: 'medications', icon: 'Pill', titleKey: 'new_carer.health_sys_2_title', bodyKey: 'new_carer.health_sys_2_body' },
  { id: 'appointments', icon: 'CalendarDays', titleKey: 'new_carer.health_sys_3_title', bodyKey: 'new_carer.health_sys_3_body' },
  { id: 'providers', icon: 'Users', titleKey: 'new_carer.health_sys_4_title', bodyKey: 'new_carer.health_sys_4_body' },
  { id: 'updates', icon: 'RefreshCw', titleKey: 'new_carer.health_sys_5_title', bodyKey: 'new_carer.health_sys_5_body' },
  { id: 'notes', icon: 'FileText', titleKey: 'new_carer.health_sys_6_title', bodyKey: 'new_carer.health_sys_6_body' },
  { id: 'emergency', icon: 'AlertTriangle', titleKey: 'new_carer.health_sys_7_title', bodyKey: 'new_carer.health_sys_7_body' },
]

// -------------------------------------------------------
// Sustainability — pressures
// -------------------------------------------------------
export const SUSTAIN_PRESSURES: SustainPressure[] = [
  { id: 'time', key: 'new_carer.sustain_pressure_1' },
  { id: 'emotional', key: 'new_carer.sustain_pressure_2' },
  { id: 'physical', key: 'new_carer.sustain_pressure_3' },
  { id: 'work', key: 'new_carer.sustain_pressure_4' },
  { id: 'isolation', key: 'new_carer.sustain_pressure_5' },
  { id: 'backup', key: 'new_carer.sustain_pressure_6' },
]

// -------------------------------------------------------
// Review plan — triggers
// -------------------------------------------------------
export const REVIEW_TRIGGERS: ReviewTrigger[] = [
  { id: 'health', key: 'new_carer.review_trigger_1' },
  { id: 'hospital', key: 'new_carer.review_trigger_2' },
  { id: 'living', key: 'new_carer.review_trigger_3' },
  { id: 'family', key: 'new_carer.review_trigger_4' },
  { id: 'strain', key: 'new_carer.review_trigger_5' },
]

// -------------------------------------------------------
// Supporting worksheet resource cards
// -------------------------------------------------------
export const WORKSHEET_RESOURCES: WorksheetResource[] = [
  {
    id: 'home-safety',
    titleKey: 'new_carer.ws_home_safety_title',
    descKey: 'new_carer.ws_home_safety_desc',
    tagKey: 'new_carer.ws_home_safety_tag',
    tagColor: 'amber',
    comingSoon: true,
  },
  {
    id: 'coordinating',
    titleKey: 'new_carer.ws_coordinating_title',
    descKey: 'new_carer.ws_coordinating_desc',
    tagKey: 'new_carer.ws_coordinating_tag',
    tagColor: 'teal',
    comingSoon: true,
  },
  {
    id: 'medications',
    titleKey: 'new_carer.ws_medications_title',
    descKey: 'new_carer.ws_medications_desc',
    tagKey: 'new_carer.ws_medications_tag',
    tagColor: 'blue',
    comingSoon: true,
  },
  {
    id: 'moving-in',
    titleKey: 'new_carer.ws_moving_in_title',
    descKey: 'new_carer.ws_moving_in_desc',
    tagKey: 'new_carer.ws_moving_in_tag',
    tagColor: 'slate',
    comingSoon: true,
  },
  {
    id: 'documents',
    titleKey: 'new_carer.ws_documents_title',
    descKey: 'new_carer.ws_documents_desc',
    tagKey: 'new_carer.ws_documents_tag',
    tagColor: 'rose',
    comingSoon: true,
  },
]
