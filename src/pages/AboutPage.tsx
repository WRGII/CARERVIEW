// src/pages/AboutPage.tsx
import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useLocale } from '../i18n/LocaleContext'
import PageSEO from '../components/seo/PageSEO'
import { SITE_URL } from '../lib/siteConfig'

export default function AboutPage() {
  const { t } = useLocale()

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-white via-white to-peach-blush/20">
      <PageSEO
        title="About CarerView - Built by Caregivers, for Caregivers"
        description="CarerView was built by people who've been there - caring for ageing parents without the right tools. Learn about our mission to support family caregivers with simple, structured care tracking."
        canonical={`${SITE_URL}/about`}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-gray mb-6">
            {t('about.page_title')}
          </h1>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="bg-warm-white rounded-2xl shadow-sm border border-slate-gray/10 p-8 md:p-12 mb-12">
            <div className="text-slate-gray leading-relaxed space-y-6 text-lg">
              <p>{t('about.body_p1')}</p>
              <p>{t('about.body_p2')}</p>
              <p>{t('about.body_p3')}</p>
              <p>{t('about.body_p4')}</p>
              <p className="font-medium text-slate-800">{t('about.body_p5')}</p>
            </div>
          </div>
        </div>

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
