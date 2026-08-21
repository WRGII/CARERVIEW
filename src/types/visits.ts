export type VisitType = 'Personal Care' | 'Companionship' | 'Medical Support' | 'Other';

export interface CaregiverVisit {
  id: string;
  team_id: string | null;
  resident_id: string | null;
  created_by: string;
  date: string; // YYYY-MM-DD
  time_in: string; // HH:MM or HH:MM:SS
  time_out: string;
  caregiver_name: string;
  visit_type: VisitType;
  notes: string | null;
  hourly_rate: number | null;
  created_at: string;
  updated_at: string;
}

export interface VisitFormData {
  date: string;
  time_in: string;
  time_out: string;
  caregiver_name: string;
  visit_type: VisitType;
  notes: string;
  hourly_rate: number | null;
}

export const VISIT_TYPES: VisitType[] = [
  'Personal Care',
  'Companionship',
  'Medical Support',
  'Other',
];

export const EDIT_WINDOW_HOURS = 48;
