// src/lib/cv.ts
import { supabase } from "./supabaseClient"; // if your client is elsewhere, fix this path

export type CvGender = "female" | "male" | "nonbinary" | "unknown";

export async function cvGetActiveTeam() {
  const { data, error } = await supabase.rpc("cv_get_active_team");
  if (error) throw error;
  return data as string | null;
}

export async function cvSetActiveTeam(teamId: string) {
  const { error } = await supabase.rpc("cv_set_active_team", { p_team: teamId });
  if (error) throw error;
}

export async function cvCreateTeamWithPatient(p: {
  name: string;
  plan_id: string; // 'family_qtr'
  patient_name: string;
  dob?: string | null;
  gender?: CvGender;
  notes?: string | null;
}) {
  const { data, error } = await supabase.rpc("cv_create_team_with_patient", {
    p_name: p.name,
    p_plan_id: p.plan_id,
    p_patient_name: p.patient_name,
    p_dob: p.dob ?? null,
    p_gender: p.gender ?? "unknown",
    p_notes: p.notes ?? null,
  });
  if (error) throw error;
  return data as string; // team_id
}

export async function cvListMembers(teamId: string) {
  const { data, error } = await supabase.rpc("cv_list_members", { p_team: teamId });
  if (error) throw error;
  return data as { user_id: string; role: "owner" | "member"; state: "active" | "frozen"; joined_at: string }[];
}

export type CreateInviteResult = { token: string; expires_at: string };

export async function cvCreateInvite(teamId: string, email: string): Promise<CreateInviteResult> {
  const { data, error } = await supabase.rpc("cv_create_invite", { p_team: teamId, p_email: email });
  if (error) throw error;
  return data as CreateInviteResult;
}

export async function cvAcceptInvite(token: string) {
  const { data, error } = await supabase.rpc("cv_accept_invite", { p_token: token });
  if (error) throw error;
  return data as string; // team_id
}

export async function cvGetRemaining(teamId: string) {
  const { data, error } = await supabase
    .from("cv_v_team_remaining")
    .select("remaining")
    .eq("team_id", teamId)
    .single();
  if (error) throw error;
  return (data?.remaining ?? 0) as number;
}

export async function cvAmIOwner(teamId: string) {
  const u = (await supabase.auth.getUser()).data.user!;
  const { data, error } = await supabase.from("cv_team").select("owner_user_id").eq("id", teamId).single();
  if (error) throw error;
  return data.owner_user_id === u.id;
}
