// src/pages/LandingPage.tsx
import React, { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Shield, ArrowRight, CircleCheck as CheckCircle, Clock, Lock, Stethoscope, TrendingUp, MessageCircle, HeartHandshake, ScanSearch } from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card'
import AuthForm from '../components/common/AuthForm'
import { useLocale } from '../i18n/LocaleContext'
import PageSEO from '../components/seo/PageSEO'

export default function LandingPage() {
  const location = useLocation()
  const { t } = useLocale()

  useEffect(() => {
    if (location.hash === '#get-started') {
      setTimeout(() => {
        document.getElementById('get-started')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    }
  }, [location.hash])

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'CarerView',
    url: 'https://carerview.com',
    logo: 'https://carerview.com/CareView_logo_1_colored_highres.png',
    description: 'CarerView helps family caregivers track daily care observations, monitor changes over time, and coordinate with their care team.',
    sameAs: [],
  }

  const webSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'CarerView',
    url: 'https://carerview.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://carerview.com/?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-white via-white to-peach-blush/20">
      <PageSEO
        title="CarerView - Family Caregiver Support & Care Observation Tracking"
        description="CarerView helps family caregivers track daily observations, monitor changes in ageing parents and loved ones, and share structured care notes with their family team and healthcare providers."
        canonical="https://carerview.com"
        structuredData={[orgSchema, webSiteSchema]}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="pt-8 pb-10 text-center">
          <div className="flex flex-col items-center justify-center mb-6">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-gray mb-4">
              {t('common.app_name')}
            </h1>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-gray/90 mb-8 leading-tight">
            {t('landing.hero_title')}
          </h2>

          <p className="mt-4 text-xl md:text-2xl text-slate-gray/80 max-w-4xl mx-auto leading-relaxed">
            {t('landing.hero_body')}
          </p>
        </div>

        {/* CARERVIEW 1-5 ADL SCALE */}
        <div className="py-12 sm:py-20 bg-gradient-to-r from-blue-50 to-slate-50 rounded-3xl">
          <div className="max-w-6xl mx-auto px-4 sm:px-8">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-1">
                {t('landing.scale_eyebrow')}
              </p>
              <h2 className="text-4xl font-bold text-slate-800 tracking-wide mb-6">
                {t('landing.scale_title')}
              </h2>
              <p className="text-xl text-slate-gray/80 max-w-3xl mx-auto">
                {t('landing.scale_body')}
              </p>
            </div>

            <div className="mb-8">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-0 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-mint-green py-6 px-3 flex flex-col items-center justify-center text-slate-700 col-span-1 sm:rounded-l-xl">
                  <span className="text-3xl font-bold mb-1">1</span>
                  <span className="text-xs font-semibold text-center leading-snug">{t('scale.1')}</span>
                </div>
                <div className="bg-mint-green/70 py-6 px-3 flex flex-col items-center justify-center text-slate-700">
                  <span className="text-3xl font-bold mb-1">2</span>
                  <span className="text-xs font-semibold text-center leading-snug">{t('scale.2')}</span>
                </div>
                <div className="bg-cyan-primary/40 py-6 px-3 flex flex-col items-center justify-center text-slate-700 col-span-2 sm:col-span-1">
                  <span className="text-3xl font-bold mb-1">3</span>
                  <span className="text-xs font-semibold text-center leading-snug">{t('scale.3')}</span>
                </div>
                <div className="bg-peach-blush/70 py-6 px-3 flex flex-col items-center justify-center text-slate-700">
                  <span className="text-3xl font-bold mb-1">4</span>
                  <span className="text-xs font-semibold text-center leading-snug">{t('scale.4')}</span>
                </div>
                <div className="bg-peach-blush py-6 px-3 flex flex-col items-center justify-center text-slate-700 sm:rounded-r-xl">
                  <span className="text-3xl font-bold mb-1">5</span>
                  <span className="text-xs font-semibold text-center leading-snug">{t('scale.5')}</span>
                </div>
              </div>
              <div className="flex justify-between mt-2 px-1">
                <span className="text-xs text-slate-400 font-medium">{t('landing.scale_more_help')}</span>
                <span className="text-xs text-slate-400 font-medium">{t('landing.scale_more_indep')}</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-slate-gray/70 text-lg">
                {t('landing.scale_summary')}
              </p>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/create-account"
                className="inline-flex items-center gap-3 rounded-xl bg-cyan-primary px-8 py-4 text-lg font-semibold text-warm-white shadow-lg hover:bg-cyan-hover transition-all duration-200 hover:shadow-xl"
              >
                {t('landing.cta_begin')} <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                to="/why"
                className="inline-flex items-center gap-3 rounded-xl border-2 border-slate-gray/30 px-8 py-4 text-lg font-semibold text-slate-gray hover:bg-peach-blush/20 transition-all duration-200"
                aria-label={t('landing.cta_why')}
              >
                {t('landing.cta_why')}
              </Link>
            </div>

            <p className="mt-4 text-center text-sm text-slate-gray/60">{t('landing.vital_note')}</p>
          </div>
        </div>

        {/* Less confusion – Shared Language of Care */}
        <div className="py-20">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-2">{t('landing.why_eyebrow')}</p>
            <h3 className="text-4xl font-bold text-slate-gray mb-5">{t('landing.why_title')}</h3>
            <p className="text-xl text-slate-gray/70 max-w-2xl mx-auto leading-relaxed">
              {t('landing.why_body')}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 mb-6">
            <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-warm-white group">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-cyan-primary/15 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-cyan-primary/25 transition-colors duration-300">
                  <Clock className="w-7 h-7 text-cyan-primary" />
                </div>
                <h4 className="text-lg font-semibold text-slate-gray mb-3">{t('landing.feat1_title')}</h4>
                <p className="text-slate-gray/75 leading-relaxed">
                  {t('landing.feat1_body')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-warm-white group">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-peach-blush/60 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-peach-blush/80 transition-colors duration-300">
                  <TrendingUp className="w-7 h-7 text-slate-gray" />
                </div>
                <h4 className="text-lg font-semibold text-slate-gray mb-3">{t('landing.feat2_title')}</h4>
                <p className="text-slate-gray/75 leading-relaxed">
                  {t('landing.feat2_body')}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-gradient-to-br from-cyan-primary/8 to-cyan-primary/3 rounded-2xl p-6 border border-cyan-primary/15 hover:border-cyan-primary/30 transition-colors duration-300">
              <div className="w-11 h-11 bg-cyan-primary/20 rounded-xl flex items-center justify-center mb-4">
                <Stethoscope className="w-5 h-5 text-cyan-primary" />
              </div>
              <h4 className="text-lg font-semibold text-slate-gray mb-2">{t('landing.feat3_title')}</h4>
              <p className="text-slate-gray/75 leading-relaxed">{t('landing.feat3_body')}</p>
            </div>

            <div className="bg-gradient-to-br from-mint-green/20 to-mint-green/8 rounded-2xl p-6 border border-mint-green/30 hover:border-mint-green/50 transition-colors duration-300">
              <div className="w-11 h-11 bg-mint-green/40 rounded-xl flex items-center justify-center mb-4">
                <MessageCircle className="w-5 h-5 text-slate-600" />
              </div>
              <h4 className="text-lg font-semibold text-slate-gray mb-2">{t('landing.feat4_title')}</h4>
              <p className="text-slate-gray/75 leading-relaxed">{t('landing.feat4_body')}</p>
            </div>

            <div className="bg-gradient-to-br from-peach-blush/40 to-peach-blush/15 rounded-2xl p-6 border border-peach-blush/40 hover:border-peach-blush/60 transition-colors duration-300">
              <div className="w-11 h-11 bg-peach-blush/60 rounded-xl flex items-center justify-center mb-4">
                <ScanSearch className="w-5 h-5 text-slate-600" />
              </div>
              <h4 className="text-lg font-semibold text-slate-gray mb-2">{t('landing.feat5_title')}</h4>
              <p className="text-slate-gray/75 leading-relaxed">{t('landing.feat5_body')}</p>
            </div>

            <div className="bg-gradient-to-br from-cyan-primary/8 to-mint-green/10 rounded-2xl p-6 border border-slate-200 hover:border-cyan-primary/25 transition-colors duration-300">
              <div className="w-11 h-11 bg-cyan-primary/15 rounded-xl flex items-center justify-center mb-4">
                <HeartHandshake className="w-5 h-5 text-cyan-primary" />
              </div>
              <h4 className="text-lg font-semibold text-slate-gray mb-2">{t('landing.feat6_title')}</h4>
              <p className="text-slate-gray/75 leading-relaxed">{t('landing.feat6_body')}</p>
            </div>
          </div>
        </div>

        {/* Sample Report Section */}
        <div id="sample-report" className="py-20">
          <div className="text-center">
            <h3 className="text-4xl font-bold text-slate-gray mb-6">{t('landing.sample_title')}</h3>
            <p className="text-2xl text-slate-gray/80 mb-8">{t('landing.sample_subtitle')}</p>

            <div className="mt-8">
              <Link
                to="/why"
                className="inline-flex items-center gap-3 rounded-xl border-2 border-cyan-primary px-8 py-4 text-lg font-semibold text-cyan-primary hover:bg-cyan-primary/10 transition-all duration-200"
                aria-label={t('landing.cta_why')}
              >
                {t('landing.cta_why')}
              </Link>
            </div>
          </div>
        </div>

        {/* Trust & Privacy */}
        <div className="py-20 bg-gradient-to-r from-mint-green/20 to-cyan-primary/10 rounded-3xl">
          <div className="max-w-4xl mx-auto px-8 text-center">
            <h3 className="text-4xl font-bold text-slate-gray mb-6">{t('landing.trust_title')}</h3>

            <div className="grid gap-8 md:grid-cols-3 mt-12">
              <div>
                <div className="w-16 h-16 bg-cyan-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-cyan-primary" />
                </div>
                <h4 className="text-lg font-semibold text-slate-gray mb-2">{t('landing.trust1_title')}</h4>
                <p className="text-slate-gray/80">{t('landing.trust1_body')}</p>
              </div>

              <div>
                <div className="w-16 h-16 bg-mint-green/60 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-slate-gray" />
                </div>
                <h4 className="text-lg font-semibold text-slate-gray mb-2">{t('landing.trust2_title')}</h4>
                <p className="text-slate-gray/80">{t('landing.trust2_body')}</p>
              </div>

              <div>
                <div className="w-16 h-16 bg-peach-blush/60 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-slate-gray" />
                </div>
                <h4 className="text-lg font-semibold text-slate-gray mb-2">{t('landing.trust3_title')}</h4>
                <p className="text-slate-gray/80">{t('landing.trust3_body')}</p>
              </div>
            </div>

            <div className="mt-8">
              <a href="#privacy" className="text-cyan-primary hover:text-cyan-hover font-medium underline">
                {t('landing.privacy_promise')}
              </a>
            </div>
          </div>
        </div>

        {/* You're Not Alone */}
        <div className="py-16 text-center bg-gradient-to-r from-peach-blush/30 to-mint-green/20 rounded-3xl mb-20">
          <h3 className="text-3xl font-bold text-slate-gray mb-6">{t('landing.alone_title')}</h3>
          <p className="text-xl text-slate-gray/80 max-w-3xl mx-auto leading-relaxed">
            {t('landing.alone_body')}
          </p>

          <div className="mt-12 max-w-4xl mx-auto">
            <div className="bg-warm-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-gray/10">
              <div className="text-2xl text-cyan-primary mb-2">"</div>
              <blockquote className="text-lg text-slate-gray/90 italic leading-relaxed mb-6">
                {t('landing.testimonial_quote')}
              </blockquote>
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-primary/20 to-mint-green/30 rounded-full flex items-center justify-center mr-4">
                  <span className="text-cyan-primary font-bold text-lg">BG</span>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-slate-gray">{t('landing.testimonial_name')}</div>
                  <div className="text-slate-gray/70 text-sm">{t('landing.testimonial_loc')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Auth form */}
        <div id="get-started" className="py-20">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-10">
              <h3 className="text-4xl font-bold text-slate-gray mb-4">
                {t('landing.getstarted_title')}
              </h3>
              <p className="text-lg text-slate-gray/75 leading-relaxed">
                {t('landing.getstarted_body')}
              </p>
            </div>
            <AuthForm initialMode="signin" showToggle={true} />
          </div>
        </div>

      </div>
    </div>
  )
}
