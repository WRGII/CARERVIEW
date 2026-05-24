import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, ArrowRight, MessageCircle, Users, BookOpen, GraduationCap } from 'lucide-react'
import { useLocale } from '../i18n/LocaleContext'
import PageSEO from '../components/seo/PageSEO'
import { SITE_URL } from '../lib/siteConfig'

const FORUM_URL = '/caregiver-forum'
const SIGNUP_URL = '/create-account'

function trackEvent(name: string) {
  if (typeof (window as Window & { plausible?: (e: string) => void }).plausible === 'function') {
    (window as Window & { plausible?: (e: string) => void }).plausible!(name)
  }
}

const RESOURCES = [
  {
    titleKey: 'public.caregiver_resources.res1_title',
    domainKey: 'public.caregiver_resources.res1_domain',
    descKey: 'public.caregiver_resources.res1_desc',
    url: 'https://www.alzheimers.gov',
  },
  {
    titleKey: 'public.caregiver_resources.res2_title',
    domainKey: 'public.caregiver_resources.res2_domain',
    descKey: 'public.caregiver_resources.res2_desc',
    url: 'https://www.nia.nih.gov/health/alzheimers-and-dementia',
  },
  {
    titleKey: 'public.caregiver_resources.res3_title',
    domainKey: 'public.caregiver_resources.res3_domain',
    descKey: 'public.caregiver_resources.res3_desc',
    url: 'https://www.alz.org',
  },
  {
    titleKey: 'public.caregiver_resources.res4_title',
    domainKey: 'public.caregiver_resources.res4_domain',
    descKey: 'public.caregiver_resources.res4_desc',
    url: 'https://www.alzfdn.org',
  },
  {
    titleKey: 'public.caregiver_resources.res5_title',
    domainKey: 'public.caregiver_resources.res5_domain',
    descKey: 'public.caregiver_resources.res5_desc',
    url: 'https://www.caregiver.org',
  },
]

const breadcrumbStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Caregiver Resources',
      item: `${SITE_URL}/caregiver-resources`,
    },
  ],
}

export default function CaregiverResourcesPage() {
  const { t } = useLocale()

  useEffect(() => {
    trackEvent('resources_page_view')
  }, [])

  const handleCommunityClick = () => trackEvent('resources_to_community_click')
  const handleSignupClick = () => trackEvent('resources_to_signup_click')

  return (
    <div className="min-h-screen bg-gray-50">
      <PageSEO
        title={t('public.caregiver_resources.page_title')}
        description={t('public.caregiver_resources.meta_desc')}
        canonical={`${SITE_URL}/caregiver-resources`}
        structuredData={[breadcrumbStructuredData]}
      />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <ol className="flex items-center gap-1.5 text-xs text-slate-400">
            <li><Link to="/" className="hover:text-slate-600 transition-colors">Home</Link></li>
            <li aria-hidden="true" className="text-slate-300">/</li>
            <li className="text-slate-600 font-medium">Caregiver Resources</li>
          </ol>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">

        {/* SECTION A — Hero */}
        <section>
          <div className="bg-gradient-to-br from-slate-700 to-slate-600 rounded-3xl px-6 sm:px-12 py-10 sm:py-14 text-center mb-6">
            <p className="text-xs font-semibold text-cyan-primary uppercase tracking-widest mb-4">
              Dementia Care &middot; Memory Loss &middot; New Caregiver &middot; Alzheimer's Support
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-warm-white mb-5 leading-tight max-w-3xl mx-auto">
              {t('public.caregiver_resources.hero_heading')}
            </h1>
            <div className="max-w-2xl mx-auto space-y-3">
              <p className="text-lg text-slate-100 leading-relaxed">
                {t('public.caregiver_resources.hero_intro_1')}
              </p>
              <p className="text-lg text-slate-100 leading-relaxed">
                {t('public.caregiver_resources.hero_intro_2')}
              </p>
            </div>
          </div>
        </section>

        {/* SECTION B — Resource Cards */}
        <section aria-labelledby="resources-heading">
          <div className="mb-5">
            <h2 id="resources-heading" className="text-lg font-bold text-slate-800">Trusted Organizations</h2>
            <p className="text-sm text-slate-500 mt-0.5">Government and nonprofit resources for dementia caregivers</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {RESOURCES.map((res, i) => (
              <a
                key={i}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-3 hover:border-cyan-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-800 leading-snug group-hover:text-cyan-700 transition-colors">
                      {t(res.titleKey)}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">{t(res.domainKey)}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-cyan-500 flex-shrink-0 mt-0.5 transition-colors" />
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {t(res.descKey)}
                </p>
              </a>
            ))}
          </div>
        </section>

        {/* SECTION C — Community Bridge */}
        <section aria-labelledby="community-bridge-heading">
          <div className="mb-5">
            <h2 id="community-bridge-heading" className="text-lg font-bold text-slate-800">
              {t('public.caregiver_resources.bridge_heading')}
            </h2>
            <div className="space-y-1 mt-2">
              <p className="text-sm text-slate-600">{t('public.caregiver_resources.bridge_intro_1')}</p>
              <p className="text-sm text-slate-600">{t('public.caregiver_resources.bridge_intro_2')}</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              {
                titleKey: 'public.community.topic1_title',
                excerptKey: 'public.community.topic1_excerpt',
              },
              {
                titleKey: 'public.community.topic2_title',
                excerptKey: 'public.community.topic2_excerpt',
              },
              {
                titleKey: 'public.community.topic3_title',
                excerptKey: 'public.community.topic3_excerpt',
              },
            ].map((topic, i) => (
              <Link
                key={i}
                to={FORUM_URL}
                onClick={handleCommunityClick}
                className="group block bg-white rounded-2xl border border-slate-200 px-5 py-4 hover:border-cyan-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageCircle className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0" />
                      <h3 className="text-sm font-semibold text-slate-800 leading-snug group-hover:text-cyan-700 transition-colors">
                        {t(topic.titleKey)}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed pl-5">
                      {t(topic.excerptKey)}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-cyan-500 group-hover:translate-x-0.5 flex-shrink-0 mt-0.5 transition-all" />
                </div>
                <p className="text-xs font-medium text-cyan-600 mt-2 pl-5 group-hover:text-cyan-700 transition-colors">
                  {t('public.caregiver_resources.bridge_view_discussion')} →
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* SECTION D — How to Use */}
        <section aria-labelledby="how-to-heading">
          <div className="bg-white rounded-2xl border border-slate-200 px-6 py-6">
            <h2 id="how-to-heading" className="text-lg font-bold text-slate-800 mb-3">
              {t('public.caregiver_resources.how_to_heading')}
            </h2>
            <p className="text-sm text-slate-600 mb-3">{t('public.caregiver_resources.how_to_intro')}</p>
            <ul className="space-y-2 mb-4">
              {[
                'public.caregiver_resources.how_to_bullet_1',
                'public.caregiver_resources.how_to_bullet_2',
                'public.caregiver_resources.how_to_bullet_3',
              ].map(key => (
                <li key={key} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-500 flex-shrink-0" />
                  {t(key)}
                </li>
              ))}
            </ul>
            <p className="text-sm text-slate-500 italic">{t('public.caregiver_resources.how_to_closing')}</p>
          </div>
        </section>

        {/* SECTION E — Mid-funnel CTA */}
        <section>
          <div className="bg-teal-50 border border-teal-100 rounded-2xl px-6 py-6 sm:px-8 sm:py-7">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-teal-600 flex-shrink-0" />
              <h2 className="text-lg font-bold text-slate-800">
                {t('public.caregiver_resources.mid_cta_heading')}
              </h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-5">
              {t('public.caregiver_resources.mid_cta_body')}
            </p>
            <Link
              to={FORUM_URL}
              onClick={handleCommunityClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              {t('public.caregiver_resources.mid_cta_btn')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* SECTION F — Final CTA */}
        <section>
          <div className="bg-slate-800 rounded-2xl px-6 py-8 sm:px-8 text-center">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              {t('public.caregiver_resources.final_cta_heading')}
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed max-w-sm mx-auto mb-6">
              {t('public.caregiver_resources.final_cta_body')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to={SIGNUP_URL}
                onClick={handleSignupClick}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-xl transition-colors text-sm"
              >
                {t('public.caregiver_resources.final_cta_primary_btn')}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to={FORUM_URL}
                onClick={handleCommunityClick}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors text-sm border border-white/20"
              >
                {t('public.caregiver_resources.final_cta_secondary_btn')}
              </Link>
            </div>
          </div>
        </section>

        {/* Tutorial Callout */}
        <section className="py-10 px-4 max-w-3xl mx-auto">
          <div className="rounded-2xl bg-gradient-to-br from-cyan-50 to-teal-50 border border-cyan-200 p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-cyan-primary flex items-center justify-center shadow-md">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
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
        </section>

      </div>
    </div>
  )
}
