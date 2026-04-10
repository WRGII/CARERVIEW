import React from "react";
import { Link } from "react-router-dom";
import { useUserPlan, hasActivePlan } from "../../hooks/useUserPlan";
import { useLocale } from "../../i18n/LocaleContext";

export default function PaidPlanGuard({ children }: { children: React.ReactNode }) {
  const { data: plan, isLoading } = useUserPlan();
  const { t } = useLocale();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 rounded-full border-2 border-cyan-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const isPaid = plan?.plan_id !== "free" && hasActivePlan(plan);

  if (!isPaid) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl shadow-sm p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            {t('team_guard.upgrade_title')}
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            {t('team_guard.upgrade_body_default')}
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
