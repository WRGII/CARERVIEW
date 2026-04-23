import { Helmet } from 'react-helmet-async'
import { SITE_URL } from '../../lib/siteConfig'

const SUPPORTED_LOCALES = ['en', 'sv', 'fi', 'de', 'fr', 'es', 'nl']

interface PageSEOProps {
  title: string
  description: string
  canonical?: string
  ogImage?: string
  ogType?: 'website' | 'article'
  noIndex?: boolean
  structuredData?: object | object[]
  keywords?: string
}

const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.svg`

export default function PageSEO({
  title,
  description,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  noIndex = false,
  structuredData,
  keywords,
}: PageSEOProps) {
  const fullTitle = title.includes('CarerView') ? title : `${title} | CarerView`

  // Always resolve to absolute URL — relative paths like "/new-carer" produce invalid
  // canonical and hrefLang tags that Google ignores or misinterprets.
  const canonicalUrl = canonical
    ? canonical.startsWith('http')
      ? canonical
      : `${SITE_URL}${canonical}`
    : ''

  const schemas = structuredData
    ? Array.isArray(structuredData)
      ? structuredData
      : [structuredData]
    : []

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {canonicalUrl &&
        SUPPORTED_LOCALES.map(locale => (
          <link
            key={locale}
            rel="alternate"
            hrefLang={locale}
            href={`${canonicalUrl}?lang=${locale}`}
          />
        ))}
      {canonicalUrl && (
        <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
      )}

      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  )
}
