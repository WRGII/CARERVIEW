import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import type {
  MemoryBook,
  MemoryBookIdentity,
  MemoryBookContact,
  MemoryBookMedical,
  MemoryBookPreferences,
  MemoryBookProvider,
  MemoryBookInsurance,
  MemoryBookFinances,
  MemoryBookSubscription,
  MemoryBookVehicle,
  MemoryBookSocialAccount,
  MemoryBookInsuranceEntry,
  MemoryBookFinanceEntry,
  MemoryBookMedicalEntry,
  MemoryBookPreferenceEntry,
  MemoryBookDailyLivingEntry,
  MemoryBookHouseholdProvider,
  MemoryBookHomeAddress,
  TeamMemberRole,
} from "../types/memory-book";

export function useMemoryBook(teamId: string | null, isOwner: boolean, roleResolved: boolean) {
  return useQuery({
    queryKey: ["memory-book", teamId, isOwner],
    queryFn: async () => {
      if (!teamId) return null;

      if (isOwner) {
        const { data, error } = await supabase
          .rpc("mb_get_or_create", { p_team_id: teamId });
        if (error) throw error;
        const bookId = data as string;
        const { data: book, error: bookError } = await supabase
          .from("memory_books")
          .select("*")
          .eq("id", bookId)
          .maybeSingle();
        if (bookError) throw bookError;
        return book as MemoryBook | null;
      }

      const { data, error } = await supabase
        .from("memory_books")
        .select("*")
        .eq("team_id", teamId)
        .maybeSingle();
      if (error) throw error;
      return data as MemoryBook | null;
    },
    enabled: !!teamId && roleResolved,
    staleTime: 5 * 60 * 1000,
    retry: isOwner ? 2 : false,
  });
}

export function useTeamRole(teamId: string | null, userId?: string | null) {
  const query = useQuery({
    queryKey: ["team-role", teamId, userId],
    queryFn: async () => {
      if (!teamId || !userId) return null;
      const { data, error } = await supabase
        .from("cv_team_members")
        .select("role, state")
        .eq("team_id", teamId)
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      if (!data || data.state !== "active") return null;
      return data.role as TeamMemberRole;
    },
    enabled: !!teamId && !!userId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const pendingEnable = !!teamId && !userId;
  return {
    ...query,
    isLoading: query.isLoading || pendingEnable,
  };
}

export type TeamResident = {
  team_id: string;
  full_name: string;
  preferred_name: string | null;
  date_of_birth: string | null;
  gender: string;
  notes: string | null;
  birthplace: string | null;
  address_preference: string | null;
  relationship_status: string | null;
  cultural_preferences: string | null;
  language_preferences: string | null;
  about_me: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
};

export function useTeamResident(teamId: string | null) {
  return useQuery({
    queryKey: ["team-resident", teamId],
    queryFn: async () => {
      if (!teamId) return null;
      const { data, error } = await supabase
        .from("cv_team_patient")
        .select("*")
        .eq("team_id", teamId)
        .maybeSingle();
      if (error) throw error;
      return data as TeamResident | null;
    },
    enabled: !!teamId,
    staleTime: 5 * 60 * 1000,
  });
}

/** @deprecated Use useTeamResident */
export const useTeamPatient = useTeamResident;

export type ResidentOption = {
  teamId: string;
  teamName: string;
  residentName: string;
  preferredName: string | null;
};

export function useUserTeamsResidents(userId?: string | null) {
  return useQuery({
    queryKey: ["user-teams-residents", userId],
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<ResidentOption[]> => {
      if (!userId) return [];

      const { data: memberships, error: memberErr } = await supabase
        .from("cv_team_members")
        .select("team_id, cv_team:team_id(id, name)")
        .eq("user_id", userId)
        .eq("state", "active");

      if (memberErr) throw memberErr;
      if (!memberships || memberships.length === 0) return [];

      const teamIds = memberships.map((m) => m.team_id);

      const { data: residents, error: resErr } = await supabase
        .from("cv_team_patient")
        .select("team_id, full_name, preferred_name")
        .in("team_id", teamIds);

      if (resErr) throw resErr;

      const residentMap = new Map(
        (residents ?? []).map((r) => [r.team_id, r])
      );

      return memberships
        .map((m) => {
          const res = residentMap.get(m.team_id);
          if (!res) return null;
          const team = Array.isArray(m.cv_team) ? m.cv_team[0] : (m.cv_team as any);
          return {
            teamId: m.team_id,
            teamName: team?.name ?? "",
            residentName: res.full_name,
            preferredName: res.preferred_name ?? null,
          } as ResidentOption;
        })
        .filter((o): o is ResidentOption => o !== null);
    },
  });
}

export function useUpsertResident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: {
      teamId: string;
      full_name: string;
      preferred_name?: string;
      date_of_birth?: string | null;
      gender?: string;
      notes?: string;
      birthplace?: string;
      address_preference?: string;
      relationship_status?: string;
      cultural_preferences?: string;
      language_preferences?: string;
      about_me?: string;
      photo_url?: string;
    }) => {
      const { teamId, ...rest } = values;
      const { error } = await supabase
        .from("cv_team_patient")
        .update(rest)
        .eq("team_id", teamId);
      if (error) throw error;
      // Sync to memory_book_identity so Memory Book stays current
      await supabase.rpc("cv_sync_resident_to_memory_book_identity", {
        p_team_id: teamId,
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["team-resident", variables.teamId] });
      queryClient.invalidateQueries({ queryKey: ["memory-book-identity"] });
    },
  });
}

export function useMemoryBookIdentity(memoryBookId: string | null) {
  return useQuery({
    queryKey: ["memory-book-identity", memoryBookId],
    queryFn: async () => {
      if (!memoryBookId) return null;
      const { data, error } = await supabase
        .from("memory_book_identity")
        .select("*")
        .eq("memory_book_id", memoryBookId)
        .maybeSingle();
      if (error) throw error;
      return data as MemoryBookIdentity | null;
    },
    enabled: !!memoryBookId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpsertMemoryBookIdentity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      memoryBookId: string;
      teamId: string;
      values: Partial<Omit<MemoryBookIdentity, "id" | "memory_book_id" | "team_id" | "created_at" | "updated_at">>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: existing } = await supabase
        .from("memory_book_identity")
        .select("id")
        .eq("memory_book_id", params.memoryBookId)
        .eq("team_id", params.teamId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("memory_book_identity")
          .update({ ...params.values, updated_at: new Date().toISOString(), updated_by: user.id })
          .eq("id", existing.id)
          .eq("team_id", params.teamId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("memory_book_identity")
          .insert({
            memory_book_id: params.memoryBookId,
            team_id: params.teamId,
            ...params.values,
            created_by: user.id,
            updated_by: user.id,
          });
        if (error) throw error;
      }
    },
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: ["memory-book-identity", params.memoryBookId] });
    },
  });
}

export function useMemoryBookContacts(memoryBookId: string | null) {
  return useQuery({
    queryKey: ["memory-book-contacts", memoryBookId],
    queryFn: async () => {
      if (!memoryBookId) return [];
      const { data, error } = await supabase
        .from("memory_book_contacts")
        .select("*")
        .eq("memory_book_id", memoryBookId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as MemoryBookContact[];
    },
    enabled: !!memoryBookId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpsertMemoryBookContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      memoryBookId: string;
      teamId: string;
      contact: Partial<MemoryBookContact> & { id?: string };
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (params.contact.id) {
        const { error } = await supabase
          .from("memory_book_contacts")
          .update({
            ...params.contact,
            updated_at: new Date().toISOString(),
            updated_by: user.id,
          })
          .eq("id", params.contact.id)
          .eq("team_id", params.teamId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("memory_book_contacts")
          .insert({
            memory_book_id: params.memoryBookId,
            team_id: params.teamId,
            ...params.contact,
            created_by: user.id,
            updated_by: user.id,
          });
        if (error) throw error;
      }
    },
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: ["memory-book-contacts", params.memoryBookId] });
    },
  });
}

export function useDeleteMemoryBookContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: string; memoryBookId: string; teamId: string }) => {
      const { error } = await supabase
        .from("memory_book_contacts")
        .delete()
        .eq("id", params.id)
        .eq("team_id", params.teamId);
      if (error) throw error;
    },
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: ["memory-book-contacts", params.memoryBookId] });
    },
  });
}

export function useMemoryBookMedical(memoryBookId: string | null) {
  return useQuery({
    queryKey: ["memory-book-medical", memoryBookId],
    queryFn: async () => {
      if (!memoryBookId) return null;
      const { data, error } = await supabase
        .from("memory_book_medical")
        .select("*")
        .eq("memory_book_id", memoryBookId)
        .maybeSingle();
      if (error) throw error;
      return data as MemoryBookMedical | null;
    },
    enabled: !!memoryBookId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpsertMemoryBookMedical() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      memoryBookId: string;
      teamId: string;
      values: Partial<Omit<MemoryBookMedical, "id" | "memory_book_id" | "team_id" | "created_at" | "updated_at">>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: existing } = await supabase
        .from("memory_book_medical")
        .select("id")
        .eq("memory_book_id", params.memoryBookId)
        .eq("team_id", params.teamId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("memory_book_medical")
          .update({ ...params.values, updated_at: new Date().toISOString(), updated_by: user.id })
          .eq("id", existing.id)
          .eq("team_id", params.teamId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("memory_book_medical")
          .insert({
            memory_book_id: params.memoryBookId,
            team_id: params.teamId,
            ...params.values,
            created_by: user.id,
            updated_by: user.id,
          });
        if (error) throw error;
      }
    },
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: ["memory-book-medical", params.memoryBookId] });
    },
  });
}

export function useMemoryBookPreferences(memoryBookId: string | null) {
  return useQuery({
    queryKey: ["memory-book-preferences", memoryBookId],
    queryFn: async () => {
      if (!memoryBookId) return null;
      const { data, error } = await supabase
        .from("memory_book_preferences")
        .select("*")
        .eq("memory_book_id", memoryBookId)
        .maybeSingle();
      if (error) throw error;
      return data as MemoryBookPreferences | null;
    },
    enabled: !!memoryBookId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpsertMemoryBookPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      memoryBookId: string;
      teamId: string;
      values: Partial<Omit<MemoryBookPreferences, "id" | "memory_book_id" | "team_id" | "created_at" | "updated_at">>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: existing } = await supabase
        .from("memory_book_preferences")
        .select("id")
        .eq("memory_book_id", params.memoryBookId)
        .eq("team_id", params.teamId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("memory_book_preferences")
          .update({ ...params.values, updated_at: new Date().toISOString(), updated_by: user.id })
          .eq("id", existing.id)
          .eq("team_id", params.teamId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("memory_book_preferences")
          .insert({
            memory_book_id: params.memoryBookId,
            team_id: params.teamId,
            ...params.values,
            created_by: user.id,
            updated_by: user.id,
          });
        if (error) throw error;
      }
    },
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: ["memory-book-preferences", params.memoryBookId] });
    },
  });
}

export function useMemoryBookProviders(memoryBookId: string | null) {
  return useQuery({
    queryKey: ["memory-book-providers", memoryBookId],
    queryFn: async () => {
      if (!memoryBookId) return [];
      const { data, error } = await supabase
        .from("memory_book_providers")
        .select("*")
        .eq("memory_book_id", memoryBookId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as MemoryBookProvider[];
    },
    enabled: !!memoryBookId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpsertMemoryBookProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      memoryBookId: string;
      teamId: string;
      provider: Partial<MemoryBookProvider> & { id?: string };
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (params.provider.id) {
        const { error } = await supabase
          .from("memory_book_providers")
          .update({
            ...params.provider,
            updated_at: new Date().toISOString(),
            updated_by: user.id,
          })
          .eq("id", params.provider.id)
          .eq("team_id", params.teamId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("memory_book_providers")
          .insert({
            memory_book_id: params.memoryBookId,
            team_id: params.teamId,
            ...params.provider,
            created_by: user.id,
            updated_by: user.id,
          });
        if (error) throw error;
      }
    },
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: ["memory-book-providers", params.memoryBookId] });
    },
  });
}

export function useDeleteMemoryBookProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: string; memoryBookId: string; teamId: string }) => {
      const { error } = await supabase
        .from("memory_book_providers")
        .delete()
        .eq("id", params.id)
        .eq("team_id", params.teamId);
      if (error) throw error;
    },
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: ["memory-book-providers", params.memoryBookId] });
    },
  });
}

export function useMemoryBookInsurance(memoryBookId: string | null) {
  return useQuery({
    queryKey: ["memory-book-insurance", memoryBookId],
    queryFn: async () => {
      if (!memoryBookId) return null;
      const { data, error } = await supabase
        .from("memory_book_insurance")
        .select("*")
        .eq("memory_book_id", memoryBookId)
        .maybeSingle();
      if (error) throw error;
      return data as MemoryBookInsurance | null;
    },
    enabled: !!memoryBookId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpsertMemoryBookInsurance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      memoryBookId: string;
      teamId: string;
      values: Partial<Omit<MemoryBookInsurance, "id" | "memory_book_id" | "team_id" | "created_at" | "updated_at">>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: existing } = await supabase
        .from("memory_book_insurance")
        .select("id")
        .eq("memory_book_id", params.memoryBookId)
        .eq("team_id", params.teamId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("memory_book_insurance")
          .update({ ...params.values, updated_at: new Date().toISOString(), updated_by: user.id })
          .eq("id", existing.id)
          .eq("team_id", params.teamId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("memory_book_insurance")
          .insert({
            memory_book_id: params.memoryBookId,
            team_id: params.teamId,
            ...params.values,
            created_by: user.id,
            updated_by: user.id,
          });
        if (error) throw error;
      }
    },
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: ["memory-book-insurance", params.memoryBookId] });
    },
  });
}

export function useMemoryBookFinances(memoryBookId: string | null) {
  return useQuery({
    queryKey: ["memory-book-finances", memoryBookId],
    queryFn: async () => {
      if (!memoryBookId) return null;
      const { data, error } = await supabase
        .from("memory_book_finances")
        .select("*")
        .eq("memory_book_id", memoryBookId)
        .maybeSingle();
      if (error) throw error;
      return data as MemoryBookFinances | null;
    },
    enabled: !!memoryBookId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpsertMemoryBookFinances() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      memoryBookId: string;
      teamId: string;
      values: Partial<Omit<MemoryBookFinances, "id" | "memory_book_id" | "team_id" | "created_at" | "updated_at">>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: existing } = await supabase
        .from("memory_book_finances")
        .select("id")
        .eq("memory_book_id", params.memoryBookId)
        .eq("team_id", params.teamId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("memory_book_finances")
          .update({ ...params.values, updated_at: new Date().toISOString(), updated_by: user.id })
          .eq("id", existing.id)
          .eq("team_id", params.teamId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("memory_book_finances")
          .insert({
            memory_book_id: params.memoryBookId,
            team_id: params.teamId,
            ...params.values,
            created_by: user.id,
            updated_by: user.id,
          });
        if (error) throw error;
      }
    },
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: ["memory-book-finances", params.memoryBookId] });
    },
  });
}

export function useMemoryBookSubscriptions(memoryBookId: string | null) {
  return useQuery({
    queryKey: ["memory-book-subscriptions", memoryBookId],
    queryFn: async () => {
      if (!memoryBookId) return [];
      const { data, error } = await supabase
        .from("memory_book_subscriptions")
        .select("*")
        .eq("memory_book_id", memoryBookId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as MemoryBookSubscription[];
    },
    enabled: !!memoryBookId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpsertMemoryBookSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      memoryBookId: string;
      teamId: string;
      subscription: Partial<MemoryBookSubscription> & { id?: string };
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (params.subscription.id) {
        const { error } = await supabase
          .from("memory_book_subscriptions")
          .update({
            ...params.subscription,
            updated_at: new Date().toISOString(),
            updated_by: user.id,
          })
          .eq("id", params.subscription.id)
          .eq("team_id", params.teamId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("memory_book_subscriptions")
          .insert({
            memory_book_id: params.memoryBookId,
            team_id: params.teamId,
            ...params.subscription,
            created_by: user.id,
            updated_by: user.id,
          });
        if (error) throw error;
      }
    },
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: ["memory-book-subscriptions", params.memoryBookId] });
    },
  });
}

export function useDeleteMemoryBookSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: string; memoryBookId: string; teamId: string }) => {
      const { error } = await supabase
        .from("memory_book_subscriptions")
        .delete()
        .eq("id", params.id)
        .eq("team_id", params.teamId);
      if (error) throw error;
    },
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: ["memory-book-subscriptions", params.memoryBookId] });
    },
  });
}

export function useMemoryBookVehicles(memoryBookId: string | null) {
  return useQuery({
    queryKey: ["memory-book-vehicles", memoryBookId],
    queryFn: async () => {
      if (!memoryBookId) return [];
      const { data, error } = await supabase
        .from("memory_book_vehicle")
        .select("*")
        .eq("memory_book_id", memoryBookId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as MemoryBookVehicle[];
    },
    enabled: !!memoryBookId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpsertMemoryBookVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      memoryBookId: string;
      teamId: string;
      vehicle: Partial<MemoryBookVehicle> & { id?: string };
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (params.vehicle.id) {
        const { error } = await supabase
          .from("memory_book_vehicle")
          .update({
            ...params.vehicle,
            updated_at: new Date().toISOString(),
            updated_by: user.id,
          })
          .eq("id", params.vehicle.id)
          .eq("team_id", params.teamId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("memory_book_vehicle")
          .insert({
            memory_book_id: params.memoryBookId,
            team_id: params.teamId,
            ...params.vehicle,
            created_by: user.id,
            updated_by: user.id,
          });
        if (error) throw error;
      }
    },
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: ["memory-book-vehicles", params.memoryBookId] });
    },
  });
}

export function useDeleteMemoryBookVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: string; memoryBookId: string; teamId: string }) => {
      const { error } = await supabase
        .from("memory_book_vehicle")
        .delete()
        .eq("id", params.id)
        .eq("team_id", params.teamId);
      if (error) throw error;
    },
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: ["memory-book-vehicles", params.memoryBookId] });
    },
  });
}

export function useMemoryBookInsuranceEntries(memoryBookId: string | null) {
  return useQuery({
    queryKey: ["memory-book-insurance-entries", memoryBookId],
    queryFn: async () => {
      if (!memoryBookId) return [];
      const { data, error } = await supabase
        .from("memory_book_insurance_entries")
        .select("*")
        .eq("memory_book_id", memoryBookId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as MemoryBookInsuranceEntry[];
    },
    enabled: !!memoryBookId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpsertMemoryBookInsuranceEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      memoryBookId: string;
      teamId: string;
      entry: Partial<MemoryBookInsuranceEntry> & { id?: string };
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (params.entry.id) {
        const { error } = await supabase
          .from("memory_book_insurance_entries")
          .update({ ...params.entry, updated_at: new Date().toISOString(), updated_by: user.id })
          .eq("id", params.entry.id)
          .eq("team_id", params.teamId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("memory_book_insurance_entries")
          .insert({
            memory_book_id: params.memoryBookId,
            team_id: params.teamId,
            ...params.entry,
            created_by: user.id,
            updated_by: user.id,
          });
        if (error) throw error;
      }
    },
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: ["memory-book-insurance-entries", params.memoryBookId] });
    },
  });
}

export function useDeleteMemoryBookInsuranceEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: string; memoryBookId: string; teamId: string }) => {
      const { error } = await supabase
        .from("memory_book_insurance_entries")
        .delete()
        .eq("id", params.id)
        .eq("team_id", params.teamId);
      if (error) throw error;
    },
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: ["memory-book-insurance-entries", params.memoryBookId] });
    },
  });
}

export function useMemoryBookFinanceEntries(memoryBookId: string | null) {
  return useQuery({
    queryKey: ["memory-book-finance-entries", memoryBookId],
    queryFn: async () => {
      if (!memoryBookId) return [];
      const { data, error } = await supabase
        .from("memory_book_finance_entries")
        .select("*")
        .eq("memory_book_id", memoryBookId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as MemoryBookFinanceEntry[];
    },
    enabled: !!memoryBookId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpsertMemoryBookFinanceEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      memoryBookId: string;
      teamId: string;
      entry: Partial<MemoryBookFinanceEntry> & { id?: string };
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (params.entry.id) {
        const { error } = await supabase
          .from("memory_book_finance_entries")
          .update({ ...params.entry, updated_at: new Date().toISOString(), updated_by: user.id })
          .eq("id", params.entry.id)
          .eq("team_id", params.teamId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("memory_book_finance_entries")
          .insert({
            memory_book_id: params.memoryBookId,
            team_id: params.teamId,
            ...params.entry,
            created_by: user.id,
            updated_by: user.id,
          });
        if (error) throw error;
      }
    },
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: ["memory-book-finance-entries", params.memoryBookId] });
    },
  });
}

export function useDeleteMemoryBookFinanceEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: string; memoryBookId: string; teamId: string }) => {
      const { error } = await supabase
        .from("memory_book_finance_entries")
        .delete()
        .eq("id", params.id)
        .eq("team_id", params.teamId);
      if (error) throw error;
    },
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: ["memory-book-finance-entries", params.memoryBookId] });
    },
  });
}

export function useMemoryBookMedicalEntries(memoryBookId: string | null) {
  return useQuery({
    queryKey: ["memory-book-medical-entries", memoryBookId],
    queryFn: async () => {
      if (!memoryBookId) return [];
      const { data, error } = await supabase
        .from("memory_book_medical_entries")
        .select("*")
        .eq("memory_book_id", memoryBookId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as MemoryBookMedicalEntry[];
    },
    enabled: !!memoryBookId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpsertMemoryBookMedicalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      memoryBookId: string;
      teamId: string;
      entry: Partial<MemoryBookMedicalEntry> & { id?: string };
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (params.entry.id) {
        const { error } = await supabase
          .from("memory_book_medical_entries")
          .update({ ...params.entry, updated_at: new Date().toISOString(), updated_by: user.id })
          .eq("id", params.entry.id)
          .eq("team_id", params.teamId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("memory_book_medical_entries")
          .insert({
            memory_book_id: params.memoryBookId,
            team_id: params.teamId,
            ...params.entry,
            created_by: user.id,
            updated_by: user.id,
          });
        if (error) throw error;
      }
    },
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: ["memory-book-medical-entries", params.memoryBookId] });
    },
  });
}

export function useDeleteMemoryBookMedicalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: string; memoryBookId: string; teamId: string }) => {
      const { error } = await supabase
        .from("memory_book_medical_entries")
        .delete()
        .eq("id", params.id)
        .eq("team_id", params.teamId);
      if (error) throw error;
    },
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: ["memory-book-medical-entries", params.memoryBookId] });
    },
  });
}

export function useMemoryBookPreferenceEntries(memoryBookId: string | null) {
  return useQuery({
    queryKey: ["memory-book-preference-entries", memoryBookId],
    queryFn: async () => {
      if (!memoryBookId) return [];
      const { data, error } = await supabase
        .from("memory_book_preference_entries")
        .select("*")
        .eq("memory_book_id", memoryBookId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as MemoryBookPreferenceEntry[];
    },
    enabled: !!memoryBookId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpsertMemoryBookPreferenceEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      memoryBookId: string;
      teamId: string;
      entry: Partial<MemoryBookPreferenceEntry> & { id?: string };
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (params.entry.id) {
        const { error } = await supabase
          .from("memory_book_preference_entries")
          .update({ ...params.entry, updated_at: new Date().toISOString(), updated_by: user.id })
          .eq("id", params.entry.id)
          .eq("team_id", params.teamId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("memory_book_preference_entries")
          .insert({
            memory_book_id: params.memoryBookId,
            team_id: params.teamId,
            ...params.entry,
            created_by: user.id,
            updated_by: user.id,
          });
        if (error) throw error;
      }
    },
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: ["memory-book-preference-entries", params.memoryBookId] });
    },
  });
}

export function useDeleteMemoryBookPreferenceEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: string; memoryBookId: string; teamId: string }) => {
      const { error } = await supabase
        .from("memory_book_preference_entries")
        .delete()
        .eq("id", params.id)
        .eq("team_id", params.teamId);
      if (error) throw error;
    },
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: ["memory-book-preference-entries", params.memoryBookId] });
    },
  });
}

export function useMemoryBookDailyLivingEntries(memoryBookId: string | null) {
  return useQuery({
    queryKey: ["memory-book-daily-living-entries", memoryBookId],
    queryFn: async () => {
      if (!memoryBookId) return [];
      const { data, error } = await supabase
        .from("memory_book_daily_living_entries")
        .select("*")
        .eq("memory_book_id", memoryBookId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as MemoryBookDailyLivingEntry[];
    },
    enabled: !!memoryBookId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpsertMemoryBookDailyLivingEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      memoryBookId: string;
      teamId: string;
      entry: Partial<MemoryBookDailyLivingEntry> & { id?: string };
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (params.entry.id) {
        const { error } = await supabase
          .from("memory_book_daily_living_entries")
          .update({ ...params.entry, updated_at: new Date().toISOString(), updated_by: user.id })
          .eq("id", params.entry.id)
          .eq("team_id", params.teamId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("memory_book_daily_living_entries")
          .insert({
            memory_book_id: params.memoryBookId,
            team_id: params.teamId,
            ...params.entry,
            created_by: user.id,
            updated_by: user.id,
          });
        if (error) throw error;
      }
    },
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: ["memory-book-daily-living-entries", params.memoryBookId] });
    },
  });
}

export function useDeleteMemoryBookDailyLivingEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: string; memoryBookId: string; teamId: string }) => {
      const { error } = await supabase
        .from("memory_book_daily_living_entries")
        .delete()
        .eq("id", params.id)
        .eq("team_id", params.teamId);
      if (error) throw error;
    },
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: ["memory-book-daily-living-entries", params.memoryBookId] });
    },
  });
}

export function useMemoryBookSocialAccounts(memoryBookId: string | null) {
  return useQuery({
    queryKey: ["memory-book-social-accounts", memoryBookId],
    queryFn: async () => {
      if (!memoryBookId) return [];
      const { data, error } = await supabase
        .from("memory_book_social_accounts")
        .select("*")
        .eq("memory_book_id", memoryBookId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as MemoryBookSocialAccount[];
    },
    enabled: !!memoryBookId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpsertMemoryBookSocialAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      memoryBookId: string;
      teamId: string;
      account: Partial<MemoryBookSocialAccount> & { id?: string };
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (params.account.id) {
        const { error } = await supabase
          .from("memory_book_social_accounts")
          .update({
            ...params.account,
            updated_at: new Date().toISOString(),
            updated_by: user.id,
          })
          .eq("id", params.account.id)
          .eq("team_id", params.teamId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("memory_book_social_accounts")
          .insert({
            memory_book_id: params.memoryBookId,
            team_id: params.teamId,
            ...params.account,
            created_by: user.id,
            updated_by: user.id,
          });
        if (error) throw error;
      }
    },
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: ["memory-book-social-accounts", params.memoryBookId] });
    },
  });
}

export function useDeleteMemoryBookSocialAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: string; memoryBookId: string; teamId: string }) => {
      const { error } = await supabase
        .from("memory_book_social_accounts")
        .delete()
        .eq("id", params.id)
        .eq("team_id", params.teamId);
      if (error) throw error;
    },
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: ["memory-book-social-accounts", params.memoryBookId] });
    },
  });
}

export function useMemoryBookHouseholdProviders(memoryBookId: string | null) {
  return useQuery({
    queryKey: ["memory-book-household-providers", memoryBookId],
    queryFn: async () => {
      if (!memoryBookId) return [];
      const { data, error } = await supabase
        .from("memory_book_household_providers")
        .select("*")
        .eq("memory_book_id", memoryBookId)
        .order("category", { ascending: true })
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as MemoryBookHouseholdProvider[];
    },
    enabled: !!memoryBookId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpsertMemoryBookHouseholdProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      memoryBookId: string;
      teamId: string;
      provider: Partial<MemoryBookHouseholdProvider> & { id?: string };
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (params.provider.id) {
        const { error } = await supabase
          .from("memory_book_household_providers")
          .update({
            ...params.provider,
            updated_at: new Date().toISOString(),
            updated_by: user.id,
          })
          .eq("id", params.provider.id)
          .eq("team_id", params.teamId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("memory_book_household_providers")
          .insert({
            memory_book_id: params.memoryBookId,
            team_id: params.teamId,
            ...params.provider,
            created_by: user.id,
            updated_by: user.id,
          });
        if (error) throw error;
      }
    },
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: ["memory-book-household-providers", params.memoryBookId] });
    },
  });
}

export function useDeleteMemoryBookHouseholdProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: string; memoryBookId: string; teamId: string }) => {
      const { error } = await supabase
        .from("memory_book_household_providers")
        .delete()
        .eq("id", params.id)
        .eq("team_id", params.teamId);
      if (error) throw error;
    },
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: ["memory-book-household-providers", params.memoryBookId] });
    },
  });
}

// ── Vehicle Care ─────────────────────────────────────────────────────────────

export function useMemoryBookVehicleCare(memoryBookId: string | null) {
  return useQuery({
    queryKey: ["memory-book-vehicle-care", memoryBookId],
    queryFn: async () => {
      if (!memoryBookId) return [];
      const { data, error } = await supabase
        .from("memory_book_vehicle_care")
        .select("*")
        .eq("memory_book_id", memoryBookId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!memoryBookId,
  });
}

export function useUpsertMemoryBookVehicleCare() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      memoryBookId: string;
      teamId: string;
      provider: {
        id?: string;
        provider_name: string;
        sub_category: string;
        phone: string;
        website: string;
        notes: string;
        sort_order?: number;
      };
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const now = new Date().toISOString();
      if (params.provider.id) {
        const { error } = await supabase
          .from("memory_book_vehicle_care")
          .update({
            provider_name: params.provider.provider_name,
            sub_category:  params.provider.sub_category,
            phone:         params.provider.phone,
            website:       params.provider.website,
            notes:         params.provider.notes,
            updated_at:    now,
            updated_by:    user?.id ?? null,
          })
          .eq("id", params.provider.id)
          .eq("team_id", params.teamId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("memory_book_vehicle_care")
          .insert({
            memory_book_id: params.memoryBookId,
            team_id:        params.teamId,
            provider_name:  params.provider.provider_name,
            sub_category:   params.provider.sub_category,
            phone:          params.provider.phone,
            website:        params.provider.website,
            notes:          params.provider.notes,
            sort_order:     params.provider.sort_order ?? 0,
            created_at:     now,
            updated_at:     now,
            created_by:     user?.id ?? null,
            updated_by:     user?.id ?? null,
          });
        if (error) throw error;
      }
    },
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: ["memory-book-vehicle-care", params.memoryBookId] });
    },
  });
}

export function useDeleteMemoryBookVehicleCare() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: string; memoryBookId: string; teamId: string }) => {
      const { error } = await supabase
        .from("memory_book_vehicle_care")
        .delete()
        .eq("id", params.id)
        .eq("team_id", params.teamId);
      if (error) throw error;
    },
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: ["memory-book-vehicle-care", params.memoryBookId] });
    },
  });
}

export function useMemoryBookHomeAddress(memoryBookId: string | null) {
  return useQuery({
    queryKey: ["memory-book-home-address", memoryBookId],
    queryFn: async () => {
      if (!memoryBookId) return null;
      const { data, error } = await supabase
        .from("memory_book_home_address")
        .select("*")
        .eq("memory_book_id", memoryBookId)
        .maybeSingle();
      if (error) throw error;
      return data as MemoryBookHomeAddress | null;
    },
    enabled: !!memoryBookId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpsertMemoryBookHomeAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      memoryBookId: string;
      teamId: string;
      values: Partial<Omit<MemoryBookHomeAddress, "id" | "memory_book_id" | "team_id" | "created_at" | "updated_at">>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: existing } = await supabase
        .from("memory_book_home_address")
        .select("id")
        .eq("memory_book_id", params.memoryBookId)
        .eq("team_id", params.teamId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("memory_book_home_address")
          .update({ ...params.values, updated_at: new Date().toISOString(), updated_by: user.id })
          .eq("id", existing.id)
          .eq("team_id", params.teamId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("memory_book_home_address")
          .insert({
            memory_book_id: params.memoryBookId,
            team_id: params.teamId,
            ...params.values,
            created_by: user.id,
            updated_by: user.id,
          });
        if (error) throw error;
      }
    },
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: ["memory-book-home-address", params.memoryBookId] });
    },
  });
}
