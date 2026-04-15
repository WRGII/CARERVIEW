export type MemoryBook = {
  id: string;
  team_id: string;
  resident_id: string;
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

export type MemoryBookSocialAccount = {
  id: string;
  memory_book_id: string;
  team_id: string;
  platform: string;
  username: string;
  url: string;
  notes: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type InsuranceEntryCategory =
  | "health_primary"
  | "health_secondary"
  | "dental_vision"
  | "medicare_ab"
  | "medicare_d"
  | "long_term_care"
  | "life"
  | "disability"
  | "auto"
  | "home_contents"
  | "renters"
  | "other";

export type MemoryBookInsuranceEntry = {
  id: string;
  memory_book_id: string;
  team_id: string;
  label: string;
  insurer: string;
  policy_number: string;
  member_id: string;
  coverage_type: string;
  notes: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type FinanceEntryCategory = "bank" | "income" | "auto_pay" | "investment";

export type MemoryBookFinanceEntry = {
  id: string;
  memory_book_id: string;
  team_id: string;
  label: string;
  category: FinanceEntryCategory;
  company: string;
  value: string;
  notes: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type MedicalEntryCategory =
  | "condition"
  | "allergy"
  | "medication"
  | "hearing"
  | "vision"
  | "other";

export type MemoryBookMedicalEntry = {
  id: string;
  memory_book_id: string;
  team_id: string;
  label: string;
  category: MedicalEntryCategory;
  value: string;
  notes: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type PreferenceEntryCategory =
  | "likes"
  | "dislikes"
  | "food_liked"
  | "food_disliked"
  | "music"
  | "conversation"
  | "comfort"
  | "fear"
  | "sensory"
  | "avoid";

export type MemoryBookPreferenceEntry = {
  id: string;
  memory_book_id: string;
  team_id: string;
  label: string;
  category: PreferenceEntryCategory;
  value: string;
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
  | "preferences"
  | "insurance"
  | "finances"
  | "subscriptions"
  | "vehicle"
  | "social_accounts";

export type HouseholdSection =
  | "providers"
  | "insurance"
  | "finances"
  | "subscriptions"
  | "vehicle";

export type DailyLivingSection = "adl" | "iadl";

export type ADLCategory =
  | "bathing"
  | "dressing"
  | "grooming"
  | "mobility"
  | "transfers"
  | "eating"
  | "continence"
  | "toileting"
  | "other";

export type IADLCategory =
  | "meal_prep"
  | "medications"
  | "housekeeping"
  | "laundry"
  | "transportation"
  | "shopping"
  | "finances_mgmt"
  | "communication"
  | "other";

export type IndependenceLevel =
  | "independent"
  | "needs_reminders"
  | "supervision"
  | "assistance"
  | "fully_dependent";

export type MemoryBookDailyLivingEntry = {
  id: string;
  memory_book_id: string;
  team_id: string;
  section: DailyLivingSection;
  category: ADLCategory | IADLCategory;
  label: string;
  independence_level: IndependenceLevel;
  notes: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};
