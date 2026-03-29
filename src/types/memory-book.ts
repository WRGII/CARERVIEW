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

export type TeamMemberRole = "owner" | "member";

export type MemoryBookTab =
  | "overview"
  | "memory-book"
  | "daily-living"
  | "routines"
  | "calendar"
  | "tasks"
  | "journal"
  | "changes";

export type MemoryBookSection =
  | "identity"
  | "contacts"
  | "medical"
  | "preferences";
