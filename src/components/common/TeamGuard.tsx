import React from "react";
import { Link } from "react-router-dom";
import { useUserPlan, hasActivePlan } from "../../hooks/useUserPlan";
import { useLocale } from "../../i18n/LocaleContext";

export default function TeamGuard({ children }: { children: React.ReactNode }) {
  const { data: plan, isLoading } = useUserPlan();
  const { t } = useLocale();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 rounded-full border-2 border-cyan-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (plan?.plan_id !== "family_qtr") {
    const isPrimary = plan?.plan_id === "primary_qtr" && hasActivePlan(plan);
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl shadow-sm p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            {t('team_guard.upgrade_title')}
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            {isPrimary
              ? t('team_guard.upgrade_body_primary')
              : t('team_guard.upgrade_body_default')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/choose-plan"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors"
            >
              {t('team_guard.upgrade_cta')}
            </Link>
            <Link
              to="/caregiver"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              {t('common.back_dashboard')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
