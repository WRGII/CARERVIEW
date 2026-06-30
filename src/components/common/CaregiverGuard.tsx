import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useUserPlan, hasActivePlan } from "../../hooks/useUserPlan";
import { useOnboarding } from "../../hooks/useOnboarding";
import { useActiveTeam } from "../../context/ActiveTeam";
import { useTeamRole } from "../../hooks/useMemoryBook";
import { useLocale } from "../../i18n/LocaleContext";

type Props = { children: React.ReactNode };

export default function CaregiverGuard({ children }: Props) {
  const { user, profile, loading } = useAuth();
  const { data: userPlan, isLoading: planLoading } = useUserPlan();
  const { careHubVisited, isLoading: onboardingLoading, markCareHubVisited } = useOnboarding();
  const { teamId } = useActiveTeam();
  const { data: teamRole, isLoading: teamRoleLoading } = useTeamRole(teamId, user?.id);
  const { t } = useLocale();
  const location = useLocation();
  const [expired, setExpired] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setExpired(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  if (profile?.disabled) {
    return <Navigate to={{ pathname: "/", hash: "#get-started" }} replace />;
  }

  if ((loading || planLoading || (!!teamId && teamRoleLoading)) && !expired) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <p className="text-slate-gray mb-2">{t('guard.preparing_workspace')}</p>
        <p className="text-slate-gray/70 text-sm">
          {t('guard.loading_slow')}{" "}
          <a href="/#get-started" className="text-cyan-primary underline">
            {t('guard.sign_in_again')}
          </a>.
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to={{ pathname: "/", hash: "#get-started" }}
        replace
        state={{ from: location }}
      />
    );
  }

  if (!loading && !planLoading && user && !hasActivePlan(userPlan)) {
    return <Navigate to="/create-account?incomplete=1" replace state={{ from: location }} />;
  }

  // First-visit redirect for paid caregiver users
  // Only fires once (care_hub_visited flag), only from the dashboard root,
  // and only when onboarding data is ready.
  const isPaidCarer =
    profile?.role === 'caregiver' &&
    userPlan?.plan_id !== 'free' &&
    hasActivePlan(userPlan) &&
    (teamRole === 'owner' || !teamId)

  const isOnDashboard = location.pathname === '/caregiver'
  const alreadyOnCareHub = location.pathname.startsWith('/care-hub')

  const shouldRedirectToCareHub =
    !loading &&
    !planLoading &&
    !onboardingLoading &&
    !(!!teamId && teamRoleLoading) &&
    isPaidCarer &&
    !careHubVisited &&
    isOnDashboard &&
    !alreadyOnCareHub

  React.useEffect(() => {
    if (shouldRedirectToCareHub) {
      markCareHubVisited();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldRedirectToCareHub]);

  if (shouldRedirectToCareHub) {
    return <Navigate to="/care-hub/care-plan" replace />;
  }

  return <>{children}</>;
}
