// src/pages/WhyCarerView.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Users, FileText, ArrowRight, CircleCheck as CheckCircle, Clock, ChevronDown, ClipboardList, MapPin, Shield, UserCheck, Chrome as Home, Leaf, RotateCcw, TriangleAlert as AlertTriangle, CircleAlert as AlertCircle, Heart, BookOpen, ChevronRight } from "lucide-react";
import ObservationPreview from "../components/ObservationPreview";
import { Card, CardContent } from "../components/ui/Card";
import AuthForm from "../components/common/AuthForm";
import { useLocale } from "../i18n/LocaleContext";
import PageSEO from "../components/seo/PageSEO";
import { SITE_URL } from "../lib/siteConfig";

export default function WhyCarerView() {
  const { t } = useLocale();

  const personas = [
    {
      title: t('why.persona1_title'),
      quote: t('why.persona1_quote'),
      bullets: [t('why.persona1_b1'), t('why.persona1_b2'), t('why.persona1_b3')],
    },
    {
      title: t('why.persona2_title'),
      quote: t('why.persona2_quote'),
      bullets: [t('why.persona2_b1'), t('why.persona2_b2'), t('why.persona2_b3')],
    },
    {
      title: t('why.persona3_title'),
      quote: t('why.persona3_quote'),
      bullets: [t('why.persona3_b1'), t('why.persona3_b2'), t('why.persona3_b3')],
    },
    {
      title: t('why.persona4_title'),
      quote: t('why.persona4_quote'),
      bullets: [t('why.persona4_b1'), t('why.persona4_b2'), t('why.persona4_b3')],
    },
  ];

  const faqs = [
    {
      q: 'What is an Activities of Daily Living (ADL) assessment?',
      a: 'An Activities of Daily Living (ADL) assessment measures how well a person can perform basic self-care tasks such as bathing, dressing, eating, and moving around. CarerView uses a simple 1-5 scale so family caregivers can track these changes consistently over time and share meaningful reports with healthcare providers.',
    },
    {
      q: 'How does CarerView help family caregivers track changes in a loved one?',
      a: "CarerView provides structured observation forms covering ADL and IADL activities. You record a quick 1-5 score and optional notes for each check-in. Over time, these build into a clear picture of what's changing — so you can spot trends, adjust care plans, and arrive at doctor appointments with specific, documented observations rather than vague impressions.",
    },
    {
      q: 'Can multiple family members use CarerView together?',
      a: 'Yes. The Family Circle plan allows you to invite siblings, spouses, or professional in-home carers to a shared care view. Everyone sees the same observations and can add their own. This eliminates the friction that commonly causes stress in families sharing caregiving responsibilities.',
    },
    {
      q: 'Can I share CarerView observation reports with doctors or care professionals?',
      a: "Yes. CarerView can export your observation history as a DOCX or CSV file that you can bring to GP appointments, specialist consultations, or care reviews. Having a written record of changes over weeks and months is far more useful to healthcare providers than trying to recall how things were three months ago.",
    },
    {
      q: 'How is CarerView different from a general care notes app?',
      a: "CarerView is a full care coordination system — not just a notes app. It includes a structured Care Plan with six sections, a Decision Engine that flags missing pieces by severity, a Memory Book that gives every team member instant context, and an observation framework based on the ADL and IADL scales used by healthcare professionals.",
    },
    {
      q: t('why.faq6_q'),
      a: t('why.faq6_a'),
    },
    {
      q: t('why.faq7_q'),
      a: t('why.faq7_a'),
    },
  ];

  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Why CarerView', item: `${SITE_URL}/why` },
    ],
  };

  const carePlanSections = [
    { key: 's1', icon: MapPin, color: 'bg-cyan-primary/15', iconColor: 'text-cyan-primary', labelKey: 'landing.careplan_s1_label', descKey: 'landing.careplan_s1_desc' },
    { key: 's2', icon: Shield, color: 'bg-peach-blush/60', iconColor: 'text-slate-600', labelKey: 'landing.careplan_s2_label', descKey: 'landing.careplan_s2_desc' },
    { key: 's3', icon: UserCheck, color: 'bg-mint-green/40', iconColor: 'text-slate-600', labelKey: 'landing.careplan_s3_label', descKey: 'landing.careplan_s3_desc' },
    { key: 's4', icon: Home, color: 'bg-cyan-primary/10', iconColor: 'text-cyan-primary', labelKey: 'landing.careplan_s4_label', descKey: 'landing.careplan_s4_desc' },
    { key: 's5', icon: Leaf, color: 'bg-mint-green/50', iconColor: 'text-slate-600', labelKey: 'landing.careplan_s5_label', descKey: 'landing.careplan_s5_desc' },
    { key: 's6', icon: RotateCcw, color: 'bg-peach-blush/40', iconColor: 'text-slate-600', labelKey: 'landing.careplan_s6_label', descKey: 'landing.careplan_s6_desc' },
  ];

  const gaps = [
    { key: 'gap1', label: t('landing.careplan_gap1'), severity: t('landing.careplan_gap_crit_label'), color: 'bg-red-50 border-red-200', dot: 'bg-red-400', text: 'text-red-700' },
    { key: 'gap2', label: t('landing.careplan_gap2'), severity: t('landing.careplan_gap_crit_label'), color: 'bg-red-50 border-red-200', dot: 'bg-red-400', text: 'text-red-700' },
    { key: 'gap3', label: t('landing.careplan_gap3'), severity: t('landing.careplan_gap_imp_label'), color: 'bg-amber-50 border-amber-200', dot: 'bg-amber-400', text: 'text-amber-700' },
    { key: 'gap4', label: t('landing.careplan_gap4'), severity: t('landing.careplan_gap_imp_label'), color: 'bg-amber-50 border-amber-200', dot: 'bg-amber-400', text: 'text-amber-700' },
  ];

  const howCards = [
    { icon: ClipboardList, bg: 'bg-cyan-primary/20', ic: 'text-cyan-primary', titleKey: 'why.how1_title', bodyKey: 'why.how1_body' },
    { icon: CheckCircle, bg: 'bg-mint-green/60', ic: 'text-slate-gray', titleKey: 'why.how2_title', bodyKey: 'why.how2_body' },
    { icon: FileText, bg: 'bg-peach-blush/60', ic: 'text-slate-gray', titleKey: 'why.how3_title', bodyKey: 'why.how3_body' },
    { icon: Users, bg: 'bg-cyan-primary/20', ic: 'text-cyan-primary', titleKey: 'why.how4_title', bodyKey: 'why.how4_body' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-white via-white to-peach-blush/20">
      <PageSEO
        title="Why CarerView — Care Planning, Coordination & Observation Tracking for Families"
        description="CarerView gives family caregivers a structured care plan, a coordination hub, and ongoing observations — closing the gaps that cause family stress and crisis moments."
        canonical={`${SITE_URL}/why`}
        keywords="family caregiver care plan, care coordination system, observation tracking for carers, decision engine care gaps, caregiver burnout prevention, family care team coordination"
        structuredData={[faqStructuredData, breadcrumbStructuredData]}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HERO */}
        <div className="pt-6 pb-8 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-gray mb-6 leading-tight max-w-4xl mx-auto">
            {t('why.hero_title')}
          </h1>
          <p className="text-xl md:text-2xl text-slate-gray/80 max-w-4xl mx-auto leading-relaxed">
            {t('why.hero_body')}
          </p>
        </div>

        {/* CARE PLAN SECTION */}
        <div className="py-16 sm:py-24 bg-gradient-to-br from-slate-50 to-cyan-primary/5 rounded-3xl px-6 sm:px-12 mb-16">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-cyan-primary uppercase tracking-widest mb-2">
              {t('why.careplan_eyebrow')}
            </p>
            <h2 className="text-4xl font-bold text-slate-gray mb-5">{t('why.careplan_title')}</h2>
            <p className="text-xl text-slate-gray/70 max-w-3xl mx-auto leading-relaxed">
              {t('why.careplan_body')}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-14">
            {carePlanSections.map(({ key, icon: Icon, color, iconColor, labelKey, descKey }) => (
              <div key={key} className="bg-warm-white rounded-2xl p-6 border border-slate-gray/10 shadow-sm hover:shadow-md transition-shadow duration-300 flex items-start gap-4">
                <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-gray mb-1">{t(labelKey)}</h4>
                  <p className="text-sm text-slate-gray/70 leading-relaxed">{t(descKey)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Decision Engine */}
          <div className="bg-slate-800 rounded-3xl p-8 sm:p-10">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-cyan-primary rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-warm-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-warm-white mb-2">{t('why.engine_title')}</h3>
                <p className="text-slate-300 leading-relaxed">{t('why.engine_body')}</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {gaps.map((g) => (
                <div key={g.key} className={`${g.color} border rounded-xl px-4 py-3 flex items-center gap-3`}>
                  <div className={`w-2.5 h-2.5 rounded-full ${g.dot} flex-shrink-0`} />
                  <span className="text-sm text-slate-700 flex-1">{g.label}</span>
                  <span className={`text-xs font-semibold ${g.text} flex-shrink-0`}>{g.severity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SUSTAINABILITY */}
        <div className="mb-16">
          <div className="bg-gradient-to-br from-peach-blush/30 via-peach-blush/10 to-mint-green/10 rounded-3xl px-8 sm:px-14 py-14">
            <div className="max-w-4xl">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-3">
                {t('why.sustainability_eyebrow')}
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-gray mb-6 leading-tight">
                {t('why.sustainability_title')}
              </h2>
              <p className="text-xl text-slate-gray/75 leading-relaxed max-w-3xl">
                {t('why.sustainability_body')}
              </p>
            </div>
          </div>
        </div>

        {/* PERSONAS */}
        <div className="py-16 sm:py-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-gray">{t('why.personas_title')}</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 items-stretch">
            {personas.map((p) => (
              <article
                key={p.title}
                className="h-full rounded-2xl border border-slate-gray/20 bg-white shadow-sm hover:shadow-md transition-shadow"
                aria-label={p.title}
              >
                <div className="p-6 h-full flex flex-col">
                  <h3 className="text-lg font-semibold text-slate-gray">{p.title}</h3>
                  <p className="mt-3 text-slate-gray/80 italic">{p.quote}</p>
                  <ul className="mt-4 space-y-2 text-slate-gray/80 flex-1">
                    {p.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-cyan-primary flex-shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/create-account"
              className="inline-flex items-center gap-3 rounded-xl bg-cyan-primary px-8 py-4 text-lg font-semibold text-warm-white shadow-lg hover:bg-cyan-hover transition-all duration-200 hover:shadow-xl"
            >
              {t('why.cta_begin')} <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 text-base font-medium text-slate-gray/70 hover:text-slate-gray transition-colors"
            >
              {t('why.cta_pricing')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* FOUR PILLARS — HOW IT WORKS */}
        <div className="py-16 sm:py-20">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-slate-gray mb-6">{t('why.shared_lang_title')}</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {howCards.map(({ icon: Icon, bg, ic, titleKey, bodyKey }) => (
              <Card key={titleKey} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-warm-white">
                <CardContent className="p-8 text-center">
                  <div className={`w-16 h-16 ${bg} rounded-full flex items-center justify-center mx-auto mb-6`}>
                    <Icon className={`w-8 h-8 ${ic}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-gray mb-4">{t(titleKey)}</h3>
                  <p className="text-slate-gray/80 leading-relaxed">{t(bodyKey)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* WHAT YOU'LL OBSERVE */}
        <div className="py-16 sm:py-20">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-slate-gray mb-6">{t('why.track_title')}</h2>
            <p className="text-xl text-slate-gray/80 max-w-3xl mx-auto">{t('why.track_body')}</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <Card className="border-0 shadow-lg bg-warm-white">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold text-slate-gray mb-6 text-center">{t('why.adl_title')}</h3>
                <BulletList
                  bullets={[t('why.adl_1'), t('why.adl_2'), t('why.adl_3'), t('why.adl_4'), t('why.adl_5'), t('why.adl_6')]}
                  dot="cyan"
                />
                <ObservationPreview questionText={t('why.adl_1')} selectedScore={4} accentColor="cyan" />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-warm-white">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold text-slate-gray mb-6 text-center">{t('why.iadl_title')}</h3>
                <BulletList
                  bullets={[t('why.iadl_1'), t('why.iadl_2'), t('why.iadl_3'), t('why.iadl_4'), t('why.iadl_5'), t('why.iadl_6')]}
                  dot="mint"
                />
                <ObservationPreview questionText={t('why.iadl_1')} selectedScore={4} accentColor="mint" />
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-slate-gray/60 mt-8 italic">{t('why.custom_note')}</p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/create-account"
              className="inline-flex items-center gap-3 rounded-xl bg-cyan-primary px-8 py-4 text-lg font-semibold text-warm-white shadow-lg hover:bg-cyan-hover transition-all duration-200 hover:shadow-xl"
            >
              {t('why.cta_begin')} <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to={{ pathname: "/", hash: "#get-started" }}
              className="inline-flex items-center gap-3 rounded-xl border-2 border-slate-gray/30 px-8 py-4 text-lg font-semibold text-slate-gray hover:bg-peach-blush/20 transition-all duration-200"
            >
              {t('why.cta_signin')}
            </Link>
          </div>
        </div>

        {/* NEW CARER GUIDE CALLOUT */}
        <div className="mb-16">
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-3xl px-8 sm:px-14 py-14">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="w-14 h-14 bg-cyan-primary rounded-2xl flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-7 h-7 text-warm-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-warm-white mb-3">{t('why.newcarer_title')}</h2>
                <p className="text-slate-300 leading-relaxed mb-6 max-w-2xl">{t('why.newcarer_body')}</p>
                <Link
                  to="/new-carer"
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-primary px-6 py-3 text-base font-semibold text-warm-white hover:bg-cyan-hover transition-all duration-200"
                >
                  {t('why.newcarer_cta')} <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <section className="pb-20">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-gray mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-slate-gray/70">Common questions about CarerView, care planning, and coordination.</p>
            </div>
            <div className="space-y-3">
              {faqs.map((f, i) => (
                <details key={i} className="group rounded-2xl border border-slate-gray/15 bg-white shadow-sm open:shadow-md transition-shadow">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left font-semibold text-slate-gray hover:text-cyan-primary transition-colors list-none">
                    <span>{f.q}</span>
                    <ChevronDown className="h-5 w-5 shrink-0 text-slate-gray/50 transition-transform duration-200 group-open:rotate-180" />
                  </summary>
                  <div className="px-6 pb-6 pt-1 text-slate-gray/80 leading-relaxed">{f.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* GET STARTED FORM */}
        <section className="pb-24">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold text-slate-gray mb-4">{t('why.cta_trend_title')}</h2>
              <p className="text-lg text-slate-gray/75 leading-relaxed">{t('why.cta_trend_body')}</p>
            </div>
            <div className="mt-8 text-center">
              <Link
                to="/tutorial"
                className="inline-flex items-center gap-2 text-sm text-cyan-primary hover:text-cyan-hover font-medium transition-colors"
              >
                {t('tutorial.cta_start')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <AuthForm initialMode="signup" showToggle={true} />
          </div>
        </section>
      </div>
    </div>
  );
}

function BulletList({ bullets, dot }: { bullets: string[]; dot: "cyan" | "mint" }) {
  const dotClass = dot === "mint" ? "bg-mint-green" : "bg-cyan-primary";
  return (
    <div className="space-y-3 mb-6">
      {bullets.map((item, idx) => (
        <div key={idx} className="flex items-center space-x-3">
          <div className={`w-2 h-2 ${dotClass} rounded-full flex-shrink-0`} />
          <span className="text-slate-gray">{item}</span>
        </div>
      ))}
    </div>
  );
}
