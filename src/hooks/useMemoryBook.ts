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

export function useTeamPatient(teamId: string | null) {
  return useQuery({
    queryKey: ["team-patient", teamId],
    queryFn: async () => {
      if (!teamId) return null;
      const { data, error } = await supabase
        .from("cv_team_patient")
        .select("*")
        .eq("team_id", teamId)
        .maybeSingle();
      if (error) throw error;
      return data as {
        team_id: string;
        full_name: string;
        date_of_birth: string | null;
        gender: string;
        notes: string | null;
        created_at: string;
      } | null;
    },
    enabled: !!teamId,
    staleTime: 5 * 60 * 1000,
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
