export type MemoryBook = {
  id: string;
  team_id: string;
  patient_id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type MemoryBookIdentity = {
  id: string;
  memory_book_id: string;
  team_id: string;
  preferred_name: string;
  birthplace: string;
  address_preference: string;
  relationship_status: string;
  cultural_preferences: string;
  language_preferences: string;
  about_me: string;
  photo_url: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type MemoryBookContact = {
  id: string;
  memory_book_id: string;
  team_id: string;
  full_name: string;
  relationship: string;
  role_tag: string;
  phone: string;
  email: string;
  notes: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type MemoryBookMedical = {
  id: string;
  memory_book_id: string;
  team_id: string;
  conditions: string;
  allergies: string;
  hearing_notes: string;
  vision_notes: string;
  medication_notes: string;
  other_medical_notes: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type MemoryBookPreferences = {
  id: string;
  memory_book_id: string;
  team_id: string;
  likes: string;
  dislikes: string;
  foods_liked: string;
  foods_disliked: string;
  music_preferences: string;
  conversation_topics: string;
  comforts: string;
  fears: string;
  sensory_preferences: string;
  things_to_avoid: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type MemoryBookProvider = {
  id: string;
  memory_book_id: string;
  team_id: string;
  name: string;
  specialty_label: string;
  practice_name: string;
  phone: string;
  address: string;
  notes: string;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type MemoryBookInsurance = {
  id: string;
  memory_book_id: string;
  team_id: string;
  primary_insurer: string;
  primary_plan: string;
  primary_member_id: string;
  primary_coverage_type: string;
  secondary_insurer: string;
  secondary_plan: string;
  secondary_member_id: string;
  secondary_coverage_type: string;
  dental_vision_insurer: string;
  dental_vision_plan: string;
  notes: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type MemoryBookFinances = {
  id: string;
  memory_book_id: string;
  team_id: string;
  bank_name: string;
  income_sources: string;
  auto_pay_bills: string;
  investment_notes: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type MemoryBookSubscription = {
  id: string;
  memory_book_id: string;
  team_id: string;
  name: string;
  category: string;
  notes: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type MemoryBookVehicle = {
  id: string;
  memory_book_id: string;
  team_id: string;
  make_model_year: string;
  license_plate: string;
  registration_due: string;
  service_provider: string;
  parking_location: string;
  notes: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type TeamMemberRole = "owner" | "member";

export type MemoryBookTab =
  | "overview"
  | "memory-book"
  | "household"
  | "daily-living"
  | "routines"
  | "calendar"
  | "tasks"
  | "observations"
  | "changes";

export type MemoryBookSection =
  | "identity"
  | "contacts"
  | "medical"
  | "preferences";

export type HouseholdSection =
  | "providers"
  | "insurance"
  | "finances"
  | "subscriptions"
  | "vehicle";
