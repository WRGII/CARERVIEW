import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./useAuth";

export function useMemberFrozen(teamId: string | null) {
  const { user } = useAuth();
  const [frozen, setFrozen] = useState(false);
  useEffect(() => {
    if (!teamId || !user?.id) { setFrozen(false); return; }
    (async () => {
      try {
        const { data } = await supabase
          .from("cv_team_members")
          .select("state")
          .eq("team_id", teamId)
          .eq("user_id", user.id)
          .maybeSingle();
        setFrozen(data?.state === "frozen");
      } catch {
        setFrozen(false);
      }
    })();
  }, [teamId, user?.id]);
  return frozen;
}
