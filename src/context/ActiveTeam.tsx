import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { cvGetActiveTeam, cvSetActiveTeam } from '../lib/cv';
import { supabase } from "../lib/supabaseClient";

type CtxValue = {
  teamId: string | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  set: (id: string) => Promise<void>;
};

const Ctx = createContext<CtxValue>({
  teamId: null,
  loading: false,
  error: null,
  refresh: async () => {},
  set: async () => {},
});

export function ActiveTeamProvider({ children }: { children: React.ReactNode }) {
  const [teamId, setTeamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const id = await cvGetActiveTeam(); // reads profiles.active_team_id
      setTeamId(id ?? null);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load active team');
    } finally {
      setLoading(false);
    }
  }

  async function set(id: string) {
    setLoading(true);
    setError(null);
    try {
      await cvSetActiveTeam(id);
      await refresh();
    } catch (e: any) {
      setError(e.message ?? 'Failed to set active team');
      setLoading(false);
    }
  }

  // Load once on mount, then on auth state changes (login/logout)
  useEffect(() => {
    refresh();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      refresh();
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo(
    () => ({ teamId, loading, error, refresh, set }),
    [teamId, loading, error]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useActiveTeam = () => useContext(Ctx);
