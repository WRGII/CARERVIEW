import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AuthForm from '../components/common/AuthForm'
import PageSEO from '../components/seo/PageSEO'
import { useAuth } from '../hooks/useAuth'
import { useLocale } from '../i18n/LocaleContext'
import { SITE_URL } from '../lib/siteConfig'

export default function SignInPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const { t } = useLocale()

  useEffect(() => {
    if (!loading && user) {
      navigate('/caregiver', { replace: true })
    }
  }, [user, loading, navigate])

  if (loading || user) return null

  return (
    <>
      <PageSEO
        title={`${t('nav.sign_in')} | CarerView`}
        description={t('auth.signin_description')}
        canonical={`${SITE_URL}/sign-in`}
      />
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              {t('auth.signin_heading')}
            </h1>
            <p className="text-slate-500 text-sm">
              {t('auth.signin_sub')}{' '}
              <Link to="/create-account" className="text-cyan-primary hover:underline font-medium">
                {t('auth.create_account_link')}
              </Link>
            </p>
          </div>
          <AuthForm initialMode="signin" showToggle={true} />
        </div>
      </div>
    </>
  )
}
