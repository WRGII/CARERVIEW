import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function useMemberFrozen(teamId: string | null) {
  const [frozen, setFrozen] = useState(false);
  useEffect(() => {
    if (!teamId) { setFrozen(false); return; }
    (async () => {
      const u = (await supabase.auth.getUser()).data.user!;
      const { data } = await supabase
        .from("cv_team_members")
        .select("state")
        .eq("team_id", teamId)
        .eq("user_id", u.id)
        .maybeSingle();
      setFrozen(data?.state === "frozen");
    })();
  }, [teamId]);
  return frozen;
}
