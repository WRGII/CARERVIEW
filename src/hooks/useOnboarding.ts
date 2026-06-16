import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';

type OnboardingRow = {
  user_id: string;
  tutorial_completed: boolean;
  tutorial_step: number;
  tutorial_dismissed: boolean;
  welcome_dismissed: boolean;
  care_hub_visited: boolean;
};

export function useOnboarding() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['onboarding', user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<OnboardingRow | null> => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('user_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const upsert = useMutation({
    mutationFn: async (updates: Partial<Omit<OnboardingRow, 'user_id'>>) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('user_onboarding')
        .upsert(
          { user_id: user.id, ...updates, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        );
      if (error) throw error;
    },
    retry: 2,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding', user?.id] });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding', user?.id] });
    },
  });

  const showTutorial = !isLoading && !!user?.id && !data?.tutorial_completed && !data?.tutorial_dismissed;
  const showWelcome = !isLoading && !!user?.id && !data?.welcome_dismissed;
  const currentStep = data?.tutorial_step ?? 0;
  const careHubVisited = !isLoading && (data?.care_hub_visited ?? false);

  const setStep = (step: number) => upsert.mutate({ tutorial_step: step });
  const completeTutorial = () => upsert.mutate({ tutorial_completed: true, tutorial_step: 0 });
  const dismissTutorial = () => upsert.mutate({ tutorial_dismissed: true });
  const dismissWelcome = () => upsert.mutate({ welcome_dismissed: true });
  const restartTutorial = () => upsert.mutate({ tutorial_completed: false, tutorial_dismissed: false, tutorial_step: 0 });
  const markCareHubVisited = () => upsert.mutate({ care_hub_visited: true });

  return {
    data,
    isLoading,
    showTutorial,
    showWelcome,
    currentStep,
    careHubVisited,
    setStep,
    completeTutorial,
    dismissTutorial,
    dismissWelcome,
    restartTutorial,
    markCareHubVisited,
  };
}
