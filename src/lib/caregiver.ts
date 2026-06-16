import { supabase } from './supabaseClient';

export interface DeleteAccountResponse {
  ok: boolean;
  deleted: boolean;
  email?: string;
  emailSent?: boolean;
  error?: string;
  message?: string;
  teamName?: string;
  activeMemberCount?: number;
}

export interface DeleteAccountError {
  error: string;
  message: string;
  teamName?: string;
  activeMemberCount?: number;
}

export async function deleteOwnAccount(): Promise<DeleteAccountResponse> {
  try {
    const { data: session } = await supabase.auth.getSession();
    const token = session?.session?.access_token;

    if (!token) {
      throw new Error('Not signed in');
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/caregiver-delete-account`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      if (data.error === 'TEAM_OWNER_HAS_MEMBERS') {
        return {
          ok: false,
          deleted: false,
          error: 'TEAM_OWNER_HAS_MEMBERS',
          message: data.message || 'You must remove all team members before deleting your account',
          teamName: data.teamName,
          activeMemberCount: data.activeMemberCount,
        };
      }

      throw new Error(data.error || data.message || 'Account deletion failed');
    }

    return {
      ok: true,
      deleted: true,
      email: data.email,
      emailSent: data.emailSent,
    };
  } catch (error: any) {
    throw error;
  }
}
