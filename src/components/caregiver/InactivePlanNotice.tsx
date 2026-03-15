import React from "react";
import { Link } from "react-router-dom";
import { useUserPlan, hasActivePlan } from "../../hooks/useUserPlan";
import { useLocale } from '../../i18n/LocaleContext';

type Props = { className?: string };

export default function InactivePlanNotice({ className = "" }: Props) {
  const { t } = useLocale();
  const requireSub = import.meta.env.VITE_REQUIRE_SUBSCRIPTION === "true";
  const { data: plan, isLoading, error } = useUserPlan();

  // If subs aren’t required for this env, don’t show anything
  if (!requireSub) return null;
  // Don’t flash during loading
  if (isLoading) return null;
  // If they’re active, no banner
  if (hasActivePlan(plan)) return null;

  const isPastDue = plan?.status === 'past_due';

  const title = isPastDue ? t('inactive.past_due_title') : t('inactive.title');
  const detail = isPastDue
    ? t('inactive.past_due_detail')
    : error
    ? t('inactive.status_error')
    : t('inactive.no_sub');

  const bannerClass = isPastDue
    ? "rounded-xl border border-amber-300/70 bg-amber-50 p-4 "
    : "rounded-xl border border-peach-blush/60 bg-peach-blush/15 p-4 ";

  return (
    <div
      className={bannerClass + className}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="font-semibold text-slate-800">{title}</div>
          <div className="text-slate-700 text-sm">{detail}</div>
        </div>
        <div className="flex items-center gap-2">
          {isPastDue ? (
            <Link
              to="/caregiver/billing"
              className="inline-flex items-center rounded-lg border bg-amber-600 px-4 py-2 text-white hover:bg-amber-700"
            >
              {t('inactive.update_payment')}
            </Link>
          ) : (
            <Link
              to="/choose-plan"
              className="inline-flex items-center rounded-lg border bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
            >
              {t('inactive.choose_plan')}
            </Link>
          )}
          <Link
            to="/checkout/success"
            className="inline-flex items-center rounded-lg border px-4 py-2 text-slate-800 hover:bg-white"
            title="If you just paid, this page will finalize once webhooks arrive."
          >
            {t('inactive.just_paid')}
          </Link>
        </div>
      </div>
    </div>
  );
}
