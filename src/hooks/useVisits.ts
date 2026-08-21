import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';
import { useActiveTeam } from '../context/ActiveTeam';
import type { CaregiverVisit, VisitFormData } from '../types/visits';

export function useVisits(month?: string) {
  const { user } = useAuth();
  const { teamId } = useActiveTeam();

  return useQuery({
    queryKey: ['caregiver-visits', teamId, month],
    enabled: !!user?.id,
    queryFn: async () => {
      let query = supabase
        .from('caregiver_visits')
        .select('*')
        .order('date', { ascending: false })
        .order('time_in', { ascending: true });

      if (teamId) {
        query = query.eq('team_id', teamId);
      } else {
        query = query.eq('created_by', user!.id);
      }

      if (month) {
        const start = `${month}-01`;
        const endDate = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0);
        const end = `${month}-${String(endDate.getDate()).padStart(2, '0')}`;
        query = query.gte('date', start).lte('date', end);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as CaregiverVisit[];
    },
    staleTime: 60_000,
  });
}

export function useCreateVisit() {
  const { user } = useAuth();
  const { teamId } = useActiveTeam();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (form: VisitFormData) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('caregiver_visits')
        .insert({
          team_id: teamId ?? null,
          resident_id: teamId ?? null,
          date: form.date,
          time_in: form.time_in,
          time_out: form.time_out,
          caregiver_name: form.caregiver_name,
          visit_type: form.visit_type,
          notes: form.notes || null,
          hourly_rate: form.hourly_rate,
        })
        .select('id')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['caregiver-visits'] });
    },
  });
}

export function useUpdateVisit() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, form }: { id: string; form: VisitFormData }) => {
      const { error } = await supabase
        .from('caregiver_visits')
        .update({
          date: form.date,
          time_in: form.time_in,
          time_out: form.time_out,
          caregiver_name: form.caregiver_name,
          visit_type: form.visit_type,
          notes: form.notes || null,
          hourly_rate: form.hourly_rate,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['caregiver-visits'] });
    },
  });
}

export function useDeleteVisit() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('caregiver_visits')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['caregiver-visits'] });
    },
  });
}

export function useBulkCreateVisits() {
  const { user } = useAuth();
  const { teamId } = useActiveTeam();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (rows: VisitFormData[]) => {
      if (!user?.id) throw new Error('Not authenticated');

      const inserts = rows.map((form) => ({
        team_id: teamId ?? null,
        resident_id: teamId ?? null,
        date: form.date,
        time_in: form.time_in,
        time_out: form.time_out,
        caregiver_name: form.caregiver_name,
        visit_type: form.visit_type,
        notes: form.notes || null,
        hourly_rate: form.hourly_rate,
      }));

      const { error } = await supabase
        .from('caregiver_visits')
        .insert(inserts);

      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['caregiver-visits'] });
    },
  });
}
