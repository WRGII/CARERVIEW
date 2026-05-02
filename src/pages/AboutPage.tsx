// src/pages/AboutPage.tsx
import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Heart, Activity } from 'lucide-react'
import { useLocale } from '../i18n/LocaleContext'
import PageSEO from '../components/seo/PageSEO'
import { SITE_URL } from '../lib/siteConfig'

const FEATURES = [
  {
    icon: BookOpen,
    color: 'bg-cyan-primary/15',
    iconColor: 'text-cyan-primary',
    titleKey: 'about.feature1_title',
    bodyKey: 'about.feature1_body',
  },
  {
    icon: Heart,
    color: 'bg-peach-blush/60',
    iconColor: 'text-slate-600',
    titleKey: 'about.feature2_title',
    bodyKey: 'about.feature2_body',
  },
  {
    icon: Activity,
    color: 'bg-mint-green/40',
    iconColor: 'text-slate-600',
    titleKey: 'about.feature3_title',
    bodyKey: 'about.feature3_body',
  },
] as const

export default function AboutPage() {
  const { t } = useLocale()

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-white via-white to-peach-blush/20">
      <PageSEO
        title="About CarerView - Built by Caregivers, for Caregivers"
        description="CarerView was built by people who've been there — caring for ageing parents without the right tools. Learn about our mission to support family caregivers with structured care tools built from real experience."
        canonical={`${SITE_URL}/about`}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Page title */}
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-gray mb-4">
            {t('about.page_title')}
          </h1>
          <p className="text-lg text-slate-gray/60 font-medium uppercase tracking-widest">
            {t('about.origin_heading')}
          </p>
        </div>

        {/* Origin story */}
        <div className="bg-warm-white rounded-2xl shadow-sm border border-slate-gray/10 p-8 md:p-12 mb-12">
          <div className="border-l-4 border-cyan-primary/40 pl-6 mb-8">
            <p className="text-slate-gray leading-relaxed text-lg">
              {t('about.body_p1')}
            </p>
          </div>
          <p className="text-slate-gray leading-relaxed text-lg">
            {t('about.body_p2')}
          </p>
        </div>

        {/* Three features */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-gray">
              {t('about.features_heading')}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {FEATURES.map(({ icon: Icon, color, iconColor, titleKey, bodyKey }) => (
              <div
                key={titleKey}
                className="bg-warm-white rounded-2xl border border-slate-gray/10 shadow-sm hover:shadow-md transition-shadow duration-300 p-6 flex flex-col gap-4"
              >
                <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-gray text-lg mb-2">
                    {t(titleKey)}
                  </h3>
                  <p className="text-slate-gray/70 leading-relaxed text-sm">
                    {t(bodyKey)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mission paragraphs */}
        <div className="bg-warm-white rounded-2xl shadow-sm border border-slate-gray/10 p-8 md:p-12 mb-12">
          <div className="text-slate-gray leading-relaxed space-y-6 text-lg">
            <p>{t('about.body_p3')}</p>
            <p>{t('about.body_p4')}</p>
          </div>
        </div>

        {/* Memorial closing */}
        <div className="text-center mb-14 px-4">
          <p className="text-xl font-medium text-slate-800 leading-relaxed max-w-2xl mx-auto italic">
            {t('about.body_p5')}
          </p>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-mint-green/20 to-peach-blush/20 rounded-2xl p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-shrink-0">
              <Link
                to="/create-account"
                className="inline-flex items-center gap-3 rounded-xl bg-cyan-primary px-8 py-4 text-lg font-semibold text-warm-white shadow-lg hover:bg-cyan-hover transition-all duration-200 hover:shadow-xl"
              >
                {t('about.cta_button')} <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="flex-1">
              <p className="text-slate-gray text-lg leading-relaxed">
                {t('about.cta_body')}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
