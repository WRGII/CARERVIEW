export type CvTeamRole = 'owner'|'member';
export type CvMemberState = 'active'|'frozen';
export type CvMember = { user_id: string; role: CvTeamRole; state: CvMemberState; joined_at: string };
