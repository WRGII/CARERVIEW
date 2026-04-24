// src/pages/LandingPage.tsx
import React, { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Shield, ArrowRight, CircleCheck as CheckCircle, Clock, Lock, Stethoscope, TrendingUp, MessageCircle, HeartHandshake, ScanSearch, User, Users, Heart, BookOpen, FileText, TriangleAlert as AlertTriangle, CircleAlert as AlertCircle, Eye, RefreshCw, MapPin, ClipboardList, UserCheck, Chrome as Home, Leaf, RotateCcw, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card'
import AuthForm from '../components/common/AuthForm'
import { useLocale } from '../i18n/LocaleContext'
import PageSEO from '../components/seo/PageSEO'
import { SITE_URL } from '../lib/siteConfig'

export default function LandingPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useLocale()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const errorCode = params.get('error_code')
    const errorDesc = params.get('error_description') ?? ''
    if (errorCode) {
      const type = errorDesc.toLowerCase().includes('recovery') ? 'recovery' : 'confirmation'
      navigate(`/auth/error?reason=${errorCode}&type=${type}`, { replace: true })
      return
    }
    if (location.hash === '#get-started') {
      setTimeout(() => {
        document.getElementById('get-started')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    }
  }, [location.search, location.hash, navigate])

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'CarerView',
    url: SITE_URL,
    logo: `${SITE_URL}/CareView_logo_1_colored_highres.png`,
    description: 'CarerView helps family caregivers build a structured care plan, coordinate their team, and track daily observations to keep the plan current.',
    sameAs: [],
  }

  const webSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'CarerView',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }

  const carePlanSections = [
    { key: 's1', icon: MapPin, color: 'bg-cyan-primary/15', iconColor: 'text-cyan-primary' },
    { key: 's2', icon: Shield, color: 'bg-peach-blush/60', iconColor: 'text-slate-600' },
    { key: 's3', icon: UserCheck, color: 'bg-mint-green/40', iconColor: 'text-slate-600' },
    { key: 's4', icon: Home, color: 'bg-cyan-primary/10', iconColor: 'text-cyan-primary' },
    { key: 's5', icon: Leaf, color: 'bg-mint-green/50', iconColor: 'text-slate-600' },
    { key: 's6', icon: RotateCcw, color: 'bg-peach-blush/40', iconColor: 'text-slate-600' },
  ]

  const gaps = [
    { key: 'gap1', severity: 'crit', severityLabel: t('landing.careplan_gap_crit_label'), color: 'bg-red-50 border-red-200', dotColor: 'bg-red-400', textColor: 'text-red-700' },
    { key: 'gap2', severity: 'crit', severityLabel: t('landing.careplan_gap_crit_label'), color: 'bg-red-50 border-red-200', dotColor: 'bg-red-400', textColor: 'text-red-700' },
    { key: 'gap3', severity: 'imp', severityLabel: t('landing.careplan_gap_imp_label'), color: 'bg-amber-50 border-amber-200', dotColor: 'bg-amber-400', textColor: 'text-amber-700' },
    { key: 'gap4', severity: 'imp', severityLabel: t('landing.careplan_gap_imp_label'), color: 'bg-amber-50 border-amber-200', dotColor: 'bg-amber-400', textColor: 'text-amber-700' },
  ]

  const pillars = [
    {
      num: '01',
      titleKey: 'landing.pillar_plan_title',
      subtitleKey: 'landing.pillar_plan_subtitle',
      bullets: ['landing.pillar_plan_b1', 'landing.pillar_plan_b2', 'landing.pillar_plan_b3'],
      icon: ClipboardList,
      accent: 'from-cyan-primary/10 to-cyan-primary/4',
      border: 'border-cyan-primary/20',
      iconBg: 'bg-cyan-primary/15',
      iconColor: 'text-cyan-primary',
      numColor: 'text-cyan-primary',
    },
    {
      num: '02',
      titleKey: 'landing.pillar_coord_title',
      subtitleKey: 'landing.pillar_coord_subtitle',
      bullets: ['landing.pillar_coord_b1', 'landing.pillar_coord_b2', 'landing.pillar_coord_b3'],
      icon: Users,
      accent: 'from-mint-green/15 to-mint-green/5',
      border: 'border-mint-green/30',
      iconBg: 'bg-mint-green/40',
      iconColor: 'text-slate-600',
      numColor: 'text-slate-500',
    },
    {
      num: '03',
      titleKey: 'landing.pillar_obs_title',
      subtitleKey: 'landing.pillar_obs_subtitle',
      bullets: ['landing.pillar_obs_b1', 'landing.pillar_obs_b2', 'landing.pillar_obs_b3'],
      icon: TrendingUp,
      accent: 'from-peach-blush/30 to-peach-blush/10',
      border: 'border-peach-blush/40',
      iconBg: 'bg-peach-blush/60',
      iconColor: 'text-slate-600',
      numColor: 'text-slate-500',
    },
    {
      num: '04',
      titleKey: 'landing.pillar_review_title',
      subtitleKey: 'landing.pillar_review_subtitle',
      bullets: ['landing.pillar_review_b1', 'landing.pillar_review_b2', 'landing.pillar_review_b3'],
      icon: RefreshCw,
      accent: 'from-cyan-primary/8 to-mint-green/8',
      border: 'border-slate-200',
      iconBg: 'bg-cyan-primary/10',
      iconColor: 'text-cyan-primary',
      numColor: 'text-slate-400',
    },
  ]

  const newCarerModules = [
    'landing.newcarer_module1',
    'landing.newcarer_module2',
    'landing.newcarer_module3',
    'landing.newcarer_module4',
    'landing.newcarer_module5',
    'landing.newcarer_module6',
    'landing.newcarer_module7',
    'landing.newcarer_module8',
  ]

  const scenarios = [
    { titleKey: 'landing.scenario1_title', bodyKey: 'landing.scenario1_body', icon: Users, color: 'bg-cyan-primary/15', iconColor: 'text-cyan-primary' },
    { titleKey: 'landing.scenario2_title', bodyKey: 'landing.scenario2_body', icon: Heart, color: 'bg-peach-blush/60', iconColor: 'text-slate-600' },
    { titleKey: 'landing.scenario3_title', bodyKey: 'landing.scenario3_body', icon: RotateCcw, color: 'bg-mint-green/40', iconColor: 'text-slate-600' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-white via-white to-peach-blush/20">
      <PageSEO
        title="CarerView - Family Caregiver Care Plan, Coordination & Observation Tracking"
        description="CarerView helps family caregivers build a structured care plan, coordinate their team, and track daily observations — keeping the plan accurate as needs evolve."
        canonical={SITE_URL}
        structuredData={[orgSchema, webSiteSchema]}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Hero */}
        <div className="pt-8 pb-10 text-center">
          <div className="flex flex-col items-center justify-center mb-6">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-gray mb-4">
              {t('common.app_name')}
            </h1>
            <p className="text-base font-semibold tracking-widest text-cyan-primary uppercase">
              {t('landing.hero_pillar_tagline')}
            </p>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-gray/90 mb-8 leading-tight max-w-4xl mx-auto">
            {t('landing.hero_title')}
          </h2>

          <p className="mt-4 text-xl md:text-2xl text-slate-gray/80 max-w-4xl mx-auto leading-relaxed">
            {t('landing.hero_body')}
          </p>
        </div>

        {/* Four-Pillar System */}
        <div className="py-16 sm:py-24">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-2">
              {t('landing.pillars_eyebrow')}
            </p>
            <h2 className="text-4xl font-bold text-slate-gray mb-5">{t('landing.pillars_title')}</h2>
            <p className="text-xl text-slate-gray/70 max-w-3xl mx-auto leading-relaxed">
              {t('landing.pillars_body')}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((p) => {
              const Icon = p.icon
              return (
                <div
                  key={p.num}
                  className={`bg-gradient-to-br ${p.accent} rounded-2xl p-7 border ${p.border} flex flex-col hover:shadow-md transition-shadow duration-300`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-11 h-11 ${p.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${p.iconColor}`} />
                    </div>
                    <span className={`text-2xl font-black ${p.numColor}`}>{p.num}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-gray mb-1">{t(p.titleKey)}</h3>
                  <p className="text-sm text-slate-gray/60 mb-5">{t(p.subtitleKey)}</p>
                  <ul className="space-y-2 flex-1">
                    {p.bullets.map((bk) => (
                      <li key={bk} className="flex items-start gap-2 text-sm text-slate-gray/80 leading-snug">
                        <CheckCircle className="w-4 h-4 text-cyan-primary flex-shrink-0 mt-0.5" />
                        <span>{t(bk)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>

        {/* Care Plan — dedicated section */}
        <div className="py-16 sm:py-24 bg-gradient-to-br from-slate-50 to-cyan-primary/5 rounded-3xl px-6 sm:px-12">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-cyan-primary uppercase tracking-widest mb-2">
              {t('landing.careplan_eyebrow')}
            </p>
            <h2 className="text-4xl font-bold text-slate-gray mb-5">{t('landing.careplan_title')}</h2>
            <p className="text-xl text-slate-gray/70 max-w-3xl mx-auto leading-relaxed">
              {t('landing.careplan_body')}
            </p>
          </div>

          {/* Six sections */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-16">
            {carePlanSections.map((s) => {
              const Icon = s.icon
              return (
                <div key={s.key} className="bg-warm-white rounded-2xl p-6 border border-slate-gray/10 shadow-sm hover:shadow-md transition-shadow duration-300 flex items-start gap-4">
                  <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${s.iconColor}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-gray mb-1">{t(`landing.careplan_${s.key}_label`)}</h4>
                    <p className="text-sm text-slate-gray/70 leading-relaxed">{t(`landing.careplan_${s.key}_desc`)}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Decision Engine callout */}
          <div className="bg-slate-800 rounded-3xl p-8 sm:p-10 mb-16">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-cyan-primary rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-warm-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-warm-white mb-2">{t('landing.careplan_engine_title')}</h3>
                <p className="text-slate-300 leading-relaxed">{t('landing.careplan_engine_body')}</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {gaps.map((g) => (
                <div key={g.key} className={`${g.color} border rounded-xl px-4 py-3 flex items-center gap-3`}>
                  <div className={`w-2.5 h-2.5 rounded-full ${g.dotColor} flex-shrink-0`} />
                  <span className="text-sm text-slate-700 flex-1">{t(`landing.careplan_${g.key}`)}</span>
                  <span className={`text-xs font-semibold ${g.textColor} flex-shrink-0`}>{g.severityLabel}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-8 border-t border-slate-700 flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Link
                to="/create-account"
                className="inline-flex items-center gap-3 rounded-xl bg-cyan-primary px-8 py-4 text-lg font-semibold text-warm-white shadow-lg hover:bg-cyan-hover transition-all duration-200 hover:shadow-xl"
              >
                {t('landing.hero_cta_primary')} <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/why"
                className="inline-flex items-center gap-3 rounded-xl border border-slate-500 px-8 py-4 text-lg font-semibold text-slate-200 hover:bg-slate-700 transition-all duration-200"
              >
                {t('landing.hero_cta_secondary')}
              </Link>
            </div>
          </div>

          {/* Before / After */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="bg-red-50 border border-red-100 rounded-2xl p-7">
              <div className="flex items-center gap-3 mb-5">
                <AlertCircle className="w-6 h-6 text-red-400" />
                <h4 className="text-lg font-bold text-red-800">{t('landing.careplan_before_label')}</h4>
              </div>
              <ul className="space-y-3">
                {['b1', 'b2', 'b3'].map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm text-red-800/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-300 flex-shrink-0 mt-2" />
                    {t(`landing.careplan_before_${b}`)}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-mint-green/10 border border-mint-green/30 rounded-2xl p-7">
              <div className="flex items-center gap-3 mb-5">
                <CheckCircle className="w-6 h-6 text-slate-600" />
                <h4 className="text-lg font-bold text-slate-700">{t('landing.careplan_after_label')}</h4>
              </div>
              <ul className="space-y-3">
                {['b1', 'b2', 'b3'].map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm text-slate-700/80">
                    <CheckCircle className="w-4 h-4 text-cyan-primary flex-shrink-0 mt-0.5" />
                    {t(`landing.careplan_after_${b}`)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Sustainability callout */}
        <div className="py-16 sm:py-24">
          <div className="bg-gradient-to-br from-peach-blush/30 via-peach-blush/10 to-mint-green/10 rounded-3xl px-8 sm:px-14 py-14">
            <div className="max-w-4xl mx-auto">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-3">
                {t('landing.sustainability_eyebrow')}
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-gray mb-6 leading-tight">
                {t('landing.sustainability_title')}
              </h2>
              <p className="text-xl text-slate-gray/75 mb-8 leading-relaxed max-w-3xl">
                {t('landing.sustainability_body')}
              </p>
              <ul className="space-y-3 sm:space-y-0 sm:flex sm:gap-8 flex-wrap">
                {['b1', 'b2', 'b3'].map((b) => (
                  <li key={b} className="flex items-center gap-3 text-slate-gray/80">
                    <CheckCircle className="w-5 h-5 text-cyan-primary flex-shrink-0" />
                    <span>{t(`landing.sustainability_${b}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Coordinate — Memory Book */}
        <div className="py-4 pb-16 sm:pb-24">
          <div className="bg-gradient-to-br from-cyan-primary/6 via-mint-green/10 to-peach-blush/20 rounded-3xl px-6 sm:px-12 py-16">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 bg-cyan-primary border border-cyan-primary rounded-full px-5 py-2 mb-5 shadow-md">
                <BookOpen className="w-4 h-4 text-warm-white" />
                <p className="text-sm font-bold text-warm-white uppercase tracking-widest">
                  {t('landing.mb_eyebrow')}
                </p>
              </div>
              <h2 className="text-4xl font-bold text-slate-gray mb-5 leading-tight max-w-3xl mx-auto">
                {t('landing.mb_title')}
              </h2>
              <p className="text-xl text-slate-gray/70 max-w-2xl mx-auto leading-relaxed">
                {t('landing.mb_body')}
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 mb-8">
              {[
                { key: 'identity', Icon: User, bg: 'bg-cyan-primary/15', hbg: 'bg-cyan-primary/25', ic: 'text-cyan-primary' },
                { key: 'contacts', Icon: Users, bg: 'bg-mint-green/50', hbg: 'bg-mint-green/70', ic: 'text-slate-600' },
                { key: 'medical', Icon: Stethoscope, bg: 'bg-peach-blush/60', hbg: 'bg-peach-blush/80', ic: 'text-slate-600' },
                { key: 'prefs', Icon: Heart, bg: 'bg-gradient-to-br from-cyan-primary/15 to-mint-green/30', hbg: 'from-cyan-primary/25 to-mint-green/45', ic: 'text-cyan-primary' },
              ].map(({ key, Icon, bg, hbg, ic }) => (
                <div key={key} className="bg-warm-white rounded-2xl p-7 border border-slate-gray/10 shadow-sm hover:shadow-md transition-shadow duration-300 group">
                  <div className="flex items-start gap-5">
                    <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:${hbg} transition-colors duration-300`}>
                      <Icon className={`w-6 h-6 ${ic}`} />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-slate-gray mb-2">{t(`landing.mb_${key}_title`)}</h4>
                      <p className="text-slate-gray/70 leading-relaxed">{t(`landing.mb_${key}_body`)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-warm-white/60 rounded-xl px-6 py-4 border border-slate-gray/10 text-center mb-8">
              <p className="text-sm text-slate-gray/60 leading-relaxed">{t('landing.mb_team_note')}</p>
            </div>

            <div className="flex flex-col items-center gap-5">
              <p className="text-sm text-slate-gray/60 text-center max-w-lg leading-relaxed">
                {t('landing.mb_access_note')}
              </p>
              <Link
                to="/create-account"
                className="inline-flex items-center gap-3 rounded-xl bg-cyan-primary px-8 py-4 text-lg font-semibold text-warm-white shadow-lg hover:bg-cyan-hover transition-all duration-200 hover:shadow-xl"
              >
                {t('landing.mb_cta')} <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Observe — ADL Scale + features */}
        <div className="py-16 sm:py-24 bg-gradient-to-r from-blue-50 to-slate-50 rounded-3xl px-6 sm:px-12">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-2">
              {t('landing.scale_eyebrow')}
            </p>
            <h2 className="text-4xl font-bold text-slate-800 mb-5">{t('landing.vital_note')}</h2>
            <p className="text-xl text-slate-gray/80 max-w-3xl mx-auto">{t('landing.scale_body')}</p>
          </div>

          <div className="mb-8">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-0 rounded-xl overflow-hidden shadow-sm">
              {[
                { num: 1, bg: 'bg-mint-green', rounding: 'sm:rounded-l-xl' },
                { num: 2, bg: 'bg-mint-green/70', rounding: '' },
                { num: 3, bg: 'bg-cyan-primary/40', rounding: 'col-span-2 sm:col-span-1' },
                { num: 4, bg: 'bg-peach-blush/70', rounding: '' },
                { num: 5, bg: 'bg-peach-blush', rounding: 'sm:rounded-r-xl' },
              ].map(({ num, bg, rounding }) => (
                <div key={num} className={`${bg} ${rounding} py-6 px-3 flex flex-col items-center justify-center text-slate-700`}>
                  <span className="text-3xl font-bold mb-1">{num}</span>
                  <span className="text-xs font-semibold text-center leading-snug">{t(`scale.${num}`)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 px-1">
              <span className="text-xs text-slate-400 font-medium">{t('landing.scale_more_help')}</span>
              <span className="text-xs text-slate-400 font-medium">{t('landing.scale_more_indep')}</span>
            </div>
          </div>

          <div className="text-center mb-12">
            <p className="text-slate-gray/70 text-lg">{t('landing.scale_summary')}</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-10">
            {[
              { icon: Clock, bg: 'bg-cyan-primary/15', ic: 'text-cyan-primary', k: '1' },
              { icon: TrendingUp, bg: 'bg-peach-blush/60', ic: 'text-slate-gray', k: '2' },
              { icon: Stethoscope, bg: 'bg-cyan-primary/20', ic: 'text-cyan-primary', k: '3' },
              { icon: FileText, bg: 'bg-mint-green/40', ic: 'text-slate-600', k: '4' },
            ].map(({ icon: Icon, bg, ic, k }) => (
              <div key={k} className="bg-warm-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 group">
                <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${ic}`} />
                </div>
                <h4 className="text-lg font-semibold text-slate-gray mb-2">{t(`landing.feat${k}_title`)}</h4>
                <p className="text-slate-gray/75 leading-relaxed text-sm">{t(`landing.feat${k}_body`)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Micro-scenarios */}
        <div className="py-16 sm:py-24">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-2">
              {t('landing.scenarios_eyebrow')}
            </p>
            <h2 className="text-4xl font-bold text-slate-gray mb-4">{t('landing.scenarios_title')}</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {scenarios.map(({ titleKey, bodyKey, icon: Icon, color, iconColor }) => (
              <div key={titleKey} className="bg-warm-white rounded-2xl p-8 border border-slate-gray/10 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-5`}>
                  <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
                <h4 className="text-lg font-bold text-slate-gray mb-3">{t(titleKey)}</h4>
                <p className="text-slate-gray/70 leading-relaxed text-sm">{t(bodyKey)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* New Carer Guide callout */}
        <div className="py-4 pb-16 sm:pb-24">
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-3xl px-8 sm:px-14 py-14">
            <div className="flex flex-col lg:flex-row gap-10 items-start">
              <div className="flex-1">
                <p className="text-sm font-semibold text-cyan-primary uppercase tracking-widest mb-3">
                  {t('landing.newcarer_eyebrow')}
                </p>
                <h2 className="text-3xl font-bold text-warm-white mb-5">{t('landing.newcarer_title')}</h2>
                <p className="text-slate-300 leading-relaxed mb-8 max-w-xl">{t('landing.newcarer_body')}</p>
                <Link
                  to="/new-carer"
                  className="inline-flex items-center gap-3 rounded-xl bg-cyan-primary px-7 py-3.5 text-base font-semibold text-warm-white shadow-lg hover:bg-cyan-hover transition-all duration-200"
                >
                  {t('landing.newcarer_cta')} <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-2">
                  {newCarerModules.map((mk, i) => (
                    <div key={mk} className="flex items-center gap-2 bg-slate-700/50 rounded-lg px-3 py-2.5">
                      <span className="text-xs font-bold text-cyan-primary/70 w-5 flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                      <span className="text-sm text-slate-300">{t(mk)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust & Privacy */}
        <div className="py-16 sm:py-20 bg-gradient-to-r from-mint-green/20 to-cyan-primary/10 rounded-3xl">
          <div className="max-w-4xl mx-auto px-8 text-center">
            <h2 className="text-4xl font-bold text-slate-gray mb-12">{t('landing.trust_title')}</h2>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                { icon: Shield, bg: 'bg-cyan-primary/20', ic: 'text-cyan-primary', k: '1' },
                { icon: Lock, bg: 'bg-mint-green/60', ic: 'text-slate-gray', k: '2' },
                { icon: CheckCircle, bg: 'bg-peach-blush/60', ic: 'text-slate-gray', k: '3' },
              ].map(({ icon: Icon, bg, ic, k }) => (
                <div key={k}>
                  <div className={`w-16 h-16 ${bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`w-8 h-8 ${ic}`} />
                  </div>
                  <h4 className="text-lg font-semibold text-slate-gray mb-2">{t(`landing.trust${k}_title`)}</h4>
                  <p className="text-slate-gray/80">{t(`landing.trust${k}_body`)}</p>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link to="/privacy" className="text-cyan-primary hover:text-cyan-hover font-medium underline">
                {t('landing.privacy_promise')}
              </Link>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="py-16 sm:py-24 text-center bg-gradient-to-r from-peach-blush/30 to-mint-green/20 rounded-3xl my-16">
          <h2 className="text-3xl font-bold text-slate-gray mb-6">{t('landing.alone_title')}</h2>
          <p className="text-xl text-slate-gray/80 max-w-3xl mx-auto leading-relaxed mb-12">
            {t('landing.alone_body')}
          </p>

          <div className="grid gap-6 sm:grid-cols-2 max-w-5xl mx-auto px-4">
            {[
              { quoteKey: 'landing.testimonial_quote', nameKey: 'landing.testimonial_name', locKey: 'landing.testimonial_loc', initials: 'BG' },
              { quoteKey: 'landing.testimonial2_quote', nameKey: 'landing.testimonial2_name', locKey: 'landing.testimonial2_loc', initials: 'SM' },
            ].map(({ quoteKey, nameKey, locKey, initials }) => (
              <div key={quoteKey} className="bg-warm-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-gray/10 text-left">
                <div className="text-2xl text-cyan-primary mb-2">"</div>
                <blockquote className="text-base text-slate-gray/90 italic leading-relaxed mb-6">
                  {t(quoteKey)}
                </blockquote>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-primary/20 to-mint-green/30 rounded-full flex items-center justify-center mr-3">
                    <span className="text-cyan-primary font-bold text-sm">{initials}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-gray text-sm">{t(nameKey)}</div>
                    <div className="text-slate-gray/70 text-xs">{t(locKey)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Auth form */}
        <div id="get-started" className="py-20">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold text-slate-gray mb-4">
                {t('landing.getstarted_title')}
              </h2>
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
