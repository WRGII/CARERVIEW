import * as React from 'react'
import { supabase } from '../../lib/supabaseClient'
import { safeExternalRedirect } from '../../lib/utils'
import { useLocale } from '../../i18n/LocaleContext'

type Props = { className?: string }

export default function ManageBillingButton({ className }: Props) {
  const { t } = useLocale()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const onClick = async () => {
    if (loading) return
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase.functions.invoke('stripe-portal', { body: {} })
      if (error) throw error
      const url = data && typeof data === 'object' && 'url' in data ? (data as { url: string }).url : null
      if (!url) throw new Error(t('billing.portal_no_url'))
      safeExternalRedirect(url)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('billing.portal_error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={className}>
      <button
        onClick={onClick}
        disabled={loading}
        aria-busy={loading}
        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2 font-semibold disabled:opacity-60"
      >
        {loading ? t('billing.portal_opening') : t('billing.manage_billing')}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
