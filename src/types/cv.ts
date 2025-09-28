export type CvTeamRole = 'owner'|'member';
export type CvMemberState = 'active'|'frozen';
export type CvMember = { user_id: string; role: CvTeamRole; state: CvMemberState; joined_at: string };

import { supabase } from '../supabaseClient';
export async function cvGetActiveTeam(){ const {data,e}=await supabase.rpc('cv_get_active_team'); if(e) throw e; return data as string|null; }
export async function cvSetActiveTeam(teamId:string){ const {error}=await supabase.rpc('cv_set_active_team',{p_team:teamId}); if(error) throw error; }
export async function cvCreateTeamWithPatient(p:{name:string; plan_id:string; patient_name:string; dob?:string|null; gender?:'female'|'male'|'nonbinary'|'unknown'; notes?:string|null;}){
  const {data,error}=await supabase.rpc('cv_create_team_with_patient',{p_name:p.name,p_plan_id:p.plan_id,p_patient_name:p.patient_name,p_dob:p.dob??null,p_gender:p.gender??'unknown',p_notes:p.notes??null}); if(error) throw error; return data as string;
}
export async function cvListMembers(teamId:string){ const {data,error}=await supabase.rpc('cv_list_members',{p_team:teamId}); if(error) throw error; return data as any[]; }
export async function cvCreateInvite(teamId:string,email:string){ const {data,error}=await supabase.rpc('cv_create_invite',{p_team:teamId,p_email:email}); if(error) throw error; return data as string; }
export async function cvAcceptInvite(token:string){ const {data,error}=await supabase.rpc('cv_accept_invite',{p_token:token}); if(error) throw error; return data as string; }
export async function cvGetRemaining(teamId:string){ const {data,error}=await supabase.from('cv_v_team_remaining').select('remaining').eq('team_id',teamId).single(); if(error) throw error; return (data?.remaining??0) as number; }
export async function cvAmIOwner(teamId:string){ const u=(await supabase.auth.getUser()).data.user!; const {data,error}=await supabase.from('cv_team').select('owner_user_id').eq('id',teamId).single(); if(error) throw error; return data.owner_user_id===u.id; }
