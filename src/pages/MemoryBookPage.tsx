import { Link } from "react-router-dom";
import { ChevronDown, CircleCheck as CheckCircleIcon, ArrowRight, GraduationCap } from "lucide-react";
import { Card, CardContent } from "../components/ui/Card";
import AuthForm from "../components/common/AuthForm";
import { useLocale } from "../i18n/LocaleContext";
import PageSEO from "../components/seo/PageSEO";
import { SITE_URL } from "../lib/siteConfig";

export default function MemoryBookPage() {
  const { t } = useLocale();

  const features = [
    {
      bg: "bg-cyan-50",
      title: t("mb_page.feat_identity_title"),
      body: t("mb_page.feat_identity_body"),
      fields: [
        t("mb_page.feat_identity_f1"),
        t("mb_page.feat_identity_f2"),
        t("mb_page.feat_identity_f3"),
        t("mb_page.feat_identity_f4"),
        t("mb_page.feat_identity_f5"),
      ],
    },
    {
      bg: "bg-teal-50",
      title: t("mb_page.feat_contacts_title"),
      body: t("mb_page.feat_contacts_body"),
      fields: [
        t("mb_page.feat_contacts_f1"),
        t("mb_page.feat_contacts_f2"),
        t("mb_page.feat_contacts_f3"),
        t("mb_page.feat_contacts_f4"),
      ],
    },
    {
      bg: "bg-slate-100",
      title: t("mb_page.feat_medical_title"),
      body: t("mb_page.feat_medical_body"),
      fields: [
        t("mb_page.feat_medical_f1"),
        t("mb_page.feat_medical_f2"),
        t("mb_page.feat_medical_f3"),
        t("mb_page.feat_medical_f4"),
        t("mb_page.feat_medical_f5"),
      ],
    },
    {
      bg: "bg-rose-50",
      title: t("mb_page.feat_prefs_title"),
      body: t("mb_page.feat_prefs_body"),
      fields: [
        t("mb_page.feat_prefs_f1"),
        t("mb_page.feat_prefs_f2"),
        t("mb_page.feat_prefs_f3"),
        t("mb_page.feat_prefs_f4"),
        t("mb_page.feat_prefs_f5"),
      ],
    },
  ];

  const benefits = [
    {
      title: t("mb_page.benefit1_title"),
      body: t("mb_page.benefit1_body"),
    },
    {
      title: t("mb_page.benefit2_title"),
      body: t("mb_page.benefit2_body"),
    },
    {
      title: t("mb_page.benefit3_title"),
      body: t("mb_page.benefit3_body"),
    },
    {
      title: t("mb_page.benefit4_title"),
      body: t("mb_page.benefit4_body"),
    },
  ];

  const personas = [
    {
      title: t("mb_page.persona1_title"),
      quote: t("mb_page.persona1_quote"),
      bullets: [t("mb_page.persona1_b1"), t("mb_page.persona1_b2"), t("mb_page.persona1_b3")],
    },
    {
      title: t("mb_page.persona2_title"),
      quote: t("mb_page.persona2_quote"),
      bullets: [t("mb_page.persona2_b1"), t("mb_page.persona2_b2"), t("mb_page.persona2_b3")],
    },
    {
      title: t("mb_page.persona3_title"),
      quote: t("mb_page.persona3_quote"),
      bullets: [t("mb_page.persona3_b1"), t("mb_page.persona3_b2"), t("mb_page.persona3_b3")],
    },
    {
      title: t("mb_page.persona4_title"),
      quote: t("mb_page.persona4_quote"),
      bullets: [t("mb_page.persona4_b1"), t("mb_page.persona4_b2"), t("mb_page.persona4_b3")],
    },
  ];

  const faqs = [
    { q: t("mb_page.faq1_q"), a: t("mb_page.faq1_a") },
    { q: t("mb_page.faq2_q"), a: t("mb_page.faq2_a") },
    { q: t("mb_page.faq3_q"), a: t("mb_page.faq3_a") },
    { q: t("mb_page.faq4_q"), a: t("mb_page.faq4_a") },
    { q: t("mb_page.faq5_q"), a: t("mb_page.faq5_a") },
    { q: t("mb_page.faq6_q"), a: t("mb_page.faq6_a") },
    { q: t("mb_page.faq7_q"), a: t("mb_page.faq7_a") },
  ];

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Why Your Family Needs a Memory Book",
        item: `${SITE_URL}/memory-book`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-white via-white to-peach-blush/20">
      <PageSEO
        title="Why Your Family Needs a Memory Book — CarerView"
        description="The CarerView Memory Book captures everything a caregiver needs to know about your loved one — identity, contacts, medical context, and personal preferences — shared instantly with your care team."
        canonical={`${SITE_URL}/memory-book`}
        keywords="memory book for elderly care, caregiver information profile, care handoff tool, family caregiver guide, loved one care profile, dementia care notes, caregiver handover"
        structuredData={[faqStructuredData, breadcrumbStructuredData]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HERO */}
        <div className="pt-8 pb-6 text-center">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 text-sm font-medium mb-5">
            {t("mb_page.eyebrow")}
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-gray mb-5">
            {t("mb_page.hero_title")}
          </h1>
          <p className="text-xl md:text-2xl text-slate-gray/80 max-w-4xl mx-auto leading-relaxed">
            {t("mb_page.hero_body")}
          </p>
        </div>

        {/* VISUAL MOCK-UP */}
        <div className="py-14">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">{t("mb_page.mock_title")}</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">{t("mb_page.mock_subtitle")}</p>
          </div>
          <MemoryBookMockup t={t} />
        </div>

        {/* BENEFITS */}
        <div className="py-14">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">{t("mb_page.benefits_title")}</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">{t("mb_page.benefits_subtitle")}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b) => (
              <Card key={b.title} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-warm-white">
                <CardContent className="p-8 text-center">
                  <h3 className="text-xl font-semibold text-slate-800 mb-3">{b.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{b.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FEATURE SECTIONS */}
        <div className="py-14">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">{t("mb_page.features_title")}</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">{t("mb_page.features_subtitle")}</p>
          </div>
          <div className="space-y-12">
            {features.map((feat, idx) => (
              <div
                key={feat.title}
                className={`flex flex-col ${idx % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"} gap-8 md:gap-14 items-center`}
              >
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-slate-800 mb-4">{feat.title}</h3>
                  <p className="text-lg text-slate-600 leading-relaxed mb-6">{feat.body}</p>
                  <ul className="space-y-3">
                    {feat.fields.map((field) => (
                      <li key={field} className="flex items-start gap-3">
                        <CheckCircleIcon className="w-5 h-5 text-cyan-600 mt-0.5 shrink-0" />
                        <span className="text-slate-700">{field}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1 max-w-md w-full">
                  <FeatureMockCard feat={feat} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* HOW IT WORKS — TEAM ACCESS */}
        <div className="py-14">
          <div className="rounded-3xl bg-slate-800 text-white px-8 md:px-14 py-14 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("mb_page.access_title")}</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8">
              {t("mb_page.access_body")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/create-account"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 font-semibold text-white transition-colors"
              >
                {t("mb_page.access_cta")} <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-slate-500 hover:border-slate-300 font-semibold text-slate-200 transition-colors"
              >
                {t("mb_page.access_plans")}
              </Link>
            </div>
          </div>
        </div>

        {/* WHO IT HELPS */}
        <section className="pb-14">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">{t("mb_page.personas_title")}</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">{t("mb_page.personas_subtitle")}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 items-stretch">
            {personas.map((p) => (
              <article
                key={p.title}
                className="h-full rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                aria-label={p.title}
              >
                <div className="p-6 h-full flex flex-col">
                  <h4 className="text-lg font-semibold text-slate-800">{p.title}</h4>
                  <p className="mt-3 text-slate-600 italic">{p.quote}</p>
                  <ul className="mt-4 space-y-2 text-slate-600 flex-1">
                    {p.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-cyan-400 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="pb-16">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-800 mb-4">{t("mb_page.faq_title")}</h2>
              <p className="text-lg text-slate-600">{t("mb_page.faq_subtitle")}</p>
            </div>
            <div className="space-y-3">
              {faqs.map((f, i) => (
                <details
                  key={i}
                  className="group rounded-2xl border border-slate-200 bg-white shadow-sm open:shadow-md transition-shadow"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left font-semibold text-slate-800 hover:text-cyan-600 transition-colors list-none">
                    <span>{f.q}</span>
                    <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180" />
                  </summary>
                  <div className="px-6 pb-6 pt-1 text-slate-600 leading-relaxed">{f.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Tutorial Callout */}
        <section className="pb-12">
          <div className="max-w-3xl mx-auto px-4">
            <div className="rounded-2xl bg-gradient-to-br from-cyan-50 to-teal-50 border border-cyan-200 p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-slate-800 mb-2">{t('tutorial.callout_heading')}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">{t('tutorial.callout_body')}</p>
              </div>
              <div className="flex-shrink-0">
                <Link
                  to="/tutorial"
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-hover transition-all duration-200 whitespace-nowrap shadow-sm"
                >
                  {t('nav.tutorial')} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA / SIGN UP */}
        <section className="pb-24">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold text-slate-800 mb-4">{t("mb_page.cta_title")}</h2>
              <p className="text-lg text-slate-600 leading-relaxed">{t("mb_page.cta_body")}</p>
            </div>
            <AuthForm initialMode="signup" showToggle={true} />
          </div>
        </section>
      </div>
    </div>
  );
}

function MemoryBookMockup({ t }: { t: (key: string) => string }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="rounded-2xl shadow-2xl overflow-hidden border border-slate-200 bg-white">
        {/* Browser chrome bar */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 mx-4">
            <div className="bg-white rounded-md px-3 py-1 text-xs text-slate-400 border border-slate-200 max-w-xs mx-auto text-center">
              carerview.app/caregiver/memory-schedule
            </div>
          </div>
        </div>

        {/* App header strip */}
        <div className="bg-white border-b border-slate-100 px-6 py-3 flex items-center gap-3">
          <span className="font-semibold text-slate-800 text-sm">{t("mb_page.mock_book_title")}</span>
          <span className="ml-2 px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 text-xs font-medium">Margaret H.</span>
        </div>

        {/* Tab bar */}
        <div className="border-b border-slate-200 bg-white">
          <div className="flex overflow-x-auto">
            {[
              { label: t("mb_page.mock_tab_overview"), active: false },
              { label: t("mb_page.mock_tab_identity"), active: true },
              { label: t("mb_page.mock_tab_contacts"), active: false },
              { label: t("mb_page.mock_tab_medical"), active: false },
              { label: t("mb_page.mock_tab_prefs"), active: false },
            ].map((tab) => (
              <div
                key={tab.label}
                className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  tab.active
                    ? "border-cyan-600 text-cyan-700 bg-cyan-50/40"
                    : "border-transparent text-slate-500"
                }`}
              >
                {tab.label}
              </div>
            ))}
          </div>
        </div>

        {/* Identity content */}
        <div className="p-6 md:p-8 bg-slate-50/40">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-base font-semibold text-slate-800">{t("mb_page.mock_identity_heading")}</h3>
                <p className="text-sm text-slate-500 mt-0.5">{t("mb_page.mock_identity_sub")}</p>
              </div>
              <div className="px-3 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 bg-white">
                {t("mb_page.mock_edit_btn")}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-5">
              {[
                { label: t("mb_page.mock_field_preferred_name"), value: "Maggie" },
                { label: t("mb_page.mock_field_address"), value: "Mrs. Henderson, or 'Gran'" },
                { label: t("mb_page.mock_field_birthplace"), value: "Edinburgh, Scotland" },
                { label: t("mb_page.mock_field_rel_status"), value: "Widowed" },
                { label: t("mb_page.mock_field_cultural"), value: "Scottish / British" },
                { label: t("mb_page.mock_field_language"), value: "English — soft Scottish accent" },
              ].map((f) => (
                <div key={f.label}>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{f.label}</p>
                  <p className="text-sm text-slate-800">{f.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-5 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t("mb_page.mock_field_about")}</p>
              <p className="text-sm text-slate-700 leading-relaxed">
                {t("mb_page.mock_about_text")}
              </p>
            </div>
          </div>

          {/* Progress strip */}
          <div className="mt-4 bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4">
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-500 mb-1.5">{t("mb_page.mock_progress_label")}</p>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-cyan-500 h-2 rounded-full" style={{ width: "75%" }} />
              </div>
            </div>
            <span className="text-sm font-semibold text-slate-700 whitespace-nowrap">3/4 {t("mb_page.mock_sections")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

type FeatureMockCardProps = {
  feat: {
    bg: string;
    title: string;
    body: string;
    fields: string[];
  };
};

function FeatureMockCard({ feat }: FeatureMockCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
      <div className={`${feat.bg} px-6 py-4 border-b border-slate-100`}>
        <span className="font-semibold text-slate-800 text-sm">{feat.title}</span>
      </div>
      <div className="px-6 py-5 space-y-3">
        {feat.fields.map((field, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-2 bg-slate-200 rounded-full"
                style={{ width: `${65 + (idx * 7) % 30}%` }}
              />
            </div>
            <span className="text-xs text-slate-400 w-28 shrink-0 truncate">{field}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
