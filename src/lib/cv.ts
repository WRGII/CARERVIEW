// src/lib/cv.ts
import { supabase } from "./supabaseClient";

export type CvGender = "female" | "male" | "nonbinary" | "unknown";

export type CvMember = {
  user_id: string;
  role: "owner" | "member";
  state: "active" | "frozen";
  joined_at: string;
  display_name: string;
  email: string;
};

export type CvInvite = {
  id: string;
  email: string;
  created_at: string;
  expires_at: string;
  consumed_at: string | null;
};

export type CreateInviteResult = { token: string; expires_at: string };

export async function cvGetActiveTeam() {
  const { data, error } = await supabase.rpc("cv_get_active_team");
  if (error) throw error;
  return data as string | null;
}

export async function cvSetActiveTeam(teamId: string) {
  const { error } = await supabase.rpc("cv_set_active_team", { p_team: teamId });
  if (error) throw error;
}

export async function cvCreateTeamWithResident(p: {
  name: string;
  plan_id: string;
  resident_name: string;
  dob?: string | null;
  gender?: CvGender;
  notes?: string | null;
}) {
  const { data, error } = await supabase.rpc("cv_create_team_with_patient", {
    p_name: p.name,
    p_plan_id: p.plan_id,
    p_patient_name: p.resident_name,
    p_dob: p.dob ?? null,
    p_gender: p.gender ?? "unknown",
    p_notes: p.notes ?? null,
  });
  if (error) throw error;
  return data as string;
}

/** @deprecated Use cvCreateTeamWithResident */
export const cvCreateTeamWithPatient = cvCreateTeamWithResident;

export async function cvListMembersWithProfile(teamId: string): Promise<CvMember[]> {
  const { data, error } = await supabase.rpc("cv_list_members_with_profile", { p_team: teamId });
  if (error) throw error;
  return (data ?? []) as CvMember[];
}

export async function cvListInvites(teamId: string): Promise<CvInvite[]> {
  const { data, error } = await supabase.rpc("cv_list_invites", { p_team: teamId });
  if (error) throw error;
  return (data ?? []) as CvInvite[];
}

export async function cvRemoveMember(teamId: string, userId: string): Promise<void> {
  const { error } = await supabase.rpc("cv_remove_member", { p_team: teamId, p_user: userId });
  if (error) throw error;
}

export async function cvGetTeamResident(teamId: string): Promise<{ full_name: string; gender: string; notes: string | null } | null> {
  const { data, error } = await supabase.rpc("cv_get_team_patient", { p_team: teamId });
  if (error) throw error;
  const rows = data as { full_name: string; gender: string; notes: string | null }[] | null;
  return rows && rows.length > 0 ? rows[0] : null;
}

/** @deprecated Use cvGetTeamResident */
export const cvGetTeamPatient = cvGetTeamResident;

export async function cvCreateInvite(teamId: string, email: string): Promise<CreateInviteResult> {
  const { data, error } = await supabase.rpc("cv_create_invite", { p_team: teamId, p_email: email });
  if (error) throw error;
  return data as CreateInviteResult;
}

export async function cvAcceptInvite(token: string) {
  const { data, error } = await supabase.rpc("cv_accept_invite", { p_token: token });
  if (error) throw error;
  return data as string;
}

export async function cvRevokeInvite(inviteId: string): Promise<void> {
  const { error } = await supabase.rpc("cv_revoke_invite", { p_invite_id: inviteId });
  if (error) throw error;
}

export async function cvGetRemaining(teamId: string) {
  const { data, error } = await supabase
    .from("cv_v_team_remaining")
    .select("remaining")
    .eq("team_id", teamId)
    .maybeSingle();
  if (error) throw error;
  return (data?.remaining ?? 0) as number;
}

export async function cvGetSoloRemaining(): Promise<number> {
  const { data, error } = await supabase.rpc("cv_get_solo_remaining");
  if (error) throw error;
  return (data ?? 0) as number;
}

export async function cvSendInviteEmail(params: {
  email: string;
  invite_link: string;
  team_name?: string;
  inviter_name?: string;
}): Promise<{ sent: boolean; error?: string }> {
  const { data, error } = await supabase.functions.invoke("send-invite-email", {
    body: params,
  });
  if (error) {
    return { sent: false, error: error.message ?? "Edge function error" };
  }
  if (!data?.sent) {
    const reason = data?.error ?? data?.method ?? "Unknown reason";
    return { sent: false, error: reason };
  }
  return { sent: true };
}

export async function cvAmIOwner(teamId: string) {
  const u = (await supabase.auth.getUser()).data.user!;
  const { data, error } = await supabase.from("cv_team").select("owner_user_id").eq("id", teamId).single();
  if (error) throw error;
  return data.owner_user_id === u.id;
}
