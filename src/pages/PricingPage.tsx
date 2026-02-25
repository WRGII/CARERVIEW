import React from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Check } from "lucide-react";
import { useLocale } from "../i18n/LocaleContext";

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Check className="h-5 w-5 flex-none text-cyan-600" aria-hidden />
      <span className="text-sm leading-6 text-slate-700">{children}</span>
    </li>
  );
}

export default function PricingPage() {
  const { t } = useLocale();

  const faqs = [
    { q: t('pricing.faq1_q'), a: t('pricing.faq1_a') },
    { q: t('pricing.faq2_q'), a: t('pricing.faq2_a') },
    { q: t('pricing.faq3_q'), a: t('pricing.faq3_a') },
    { q: t('pricing.faq4_q'), a: t('pricing.faq4_a') },
    { q: t('pricing.faq5_q'), a: t('pricing.faq5_a') },
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-700">
            {t('pricing.hero_title')}
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            {t('pricing.hero_body')}
          </p>
          <p className="mt-2 text-sm italic text-slate-500">
            {t('pricing.hero_tagline')}
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Free Observer */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-700">{t('pricing.plan_free_name')}</h2>
            <p className="mt-1 text-sm text-slate-500">{t('pricing.plan_free_price')}</p>
            <p className="mt-4 text-sm text-slate-600">
              {t('pricing.plan_free_desc')}
            </p>
            <ul className="mt-6 space-y-2">
              <Feature>{t('pricing.plan_free_f1')}</Feature>
              <Feature>{t('pricing.plan_free_f2')}</Feature>
              <Feature>{t('pricing.plan_free_f3')}</Feature>
            </ul>
            <div className="mt-6">
              <Link
                to="/create-account"
                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {t('pricing.plan_free_cta')}
              </Link>
            </div>
          </div>

          {/* Primary Caregiver (Recommended) */}
          <div className="relative rounded-2xl border border-cyan-300 bg-cyan-50 p-6 shadow-md ring-1 ring-inset ring-cyan-200">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-cyan-600 px-3 py-1 text-xs font-semibold text-white">
              {t('pricing.recommended')}
            </div>
            <h2 className="text-lg font-semibold text-slate-700">{t('pricing.plan_primary_name')}</h2>
            <p className="mt-1 text-sm text-slate-700">
              {t('pricing.plan_primary_price')}
            </p>
            <p className="mt-4 text-sm text-slate-700">
              {t('pricing.plan_primary_desc')}
            </p>
            <ul className="mt-6 space-y-2">
              <Feature>{t('pricing.plan_primary_f1')}</Feature>
              <Feature>{t('pricing.plan_primary_f2')}</Feature>
              <Feature>{t('pricing.plan_primary_f3')}</Feature>
              <Feature>{t('pricing.plan_primary_f4')}</Feature>
            </ul>
            <div className="mt-6">
              <Link
                to="/create-account?plan=primary"
                className="inline-flex w-full items-center justify-center rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
              >
                {t('pricing.plan_primary_cta')}
              </Link>
              <p className="mt-2 text-center text-xs text-slate-500">
                {t('pricing.plan_primary_bill')}
              </p>
            </div>
          </div>

          {/* Family Circle */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-700">{t('pricing.plan_family_name')}</h2>
            <p className="mt-1 text-sm text-slate-700">
              {t('pricing.plan_family_price')}
            </p>
            <p className="mt-4 text-sm text-slate-600">
              {t('pricing.plan_family_desc')}
            </p>
            <ul className="mt-6 space-y-2">
              <Feature>{t('pricing.plan_family_f1')}</Feature>
              <Feature>{t('pricing.plan_family_f2')}</Feature>
              <Feature>{t('pricing.plan_family_f3')}</Feature>
              <Feature>{t('pricing.plan_family_f4')}</Feature>
            </ul>
            <div className="mt-6">
              <Link
                to="/create-account?plan=family"
                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {t('pricing.plan_family_cta')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="mx-auto max-w-3xl px-4 pb-24">
        <h3 className="text-xl font-semibold text-slate-700">{t('pricing.faq_title')}</h3>
        <div className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {faqs.map((f, i) => (
            <details key={i} className="group p-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between">
                <span className="text-sm font-medium text-slate-700">{f.q}</span>
                <ChevronDown className="h-5 w-5 text-slate-500 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-sm leading-6 text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            to="/create-account"
            className="inline-flex items-center rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
          >
            {t('pricing.cta_begin')}
          </Link>
        </div>
      </section>
    </main>
  );
}
