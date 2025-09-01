// src/hooks/useProfile.ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";   // ✅ fixed relative path

export type Profile = {
  id: string;            // = auth.users.id
  email: string | null;
  display_name: string | null;
  role: "admin" | "caregiver";
  disabled: boolean;
};

export function useProfile(userId?: string) {
  return useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId, // only run if we have a logged-in user
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, display_name, role, disabled")
        .eq("id", userId!)
        .single();

      if (error) throw error;
      return data as Profile;
    },
  });
}
