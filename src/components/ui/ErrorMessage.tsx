import React from 'react'
import { CircleAlert as AlertCircle } from 'lucide-react'
import { useLocale } from '../../i18n/LocaleContext'
import { getErrorMessageKey } from '../../lib/errorMessages'
import type { ErrorClass } from '../../lib/errors'

interface ErrorMessageProps {
  errorClass?: ErrorClass
  message?: string
  retry?: () => void
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ errorClass = 'unknown', message, retry }) => {
  const { t } = useLocale()
  const displayMessage = message ?? t(getErrorMessageKey(errorClass))

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-warm-white">
      <div className="bg-warm-white p-8 rounded-lg shadow-sm border border-peach-blush max-w-md text-center">
        <AlertCircle className="w-12 h-12 text-slate-gray mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-gray mb-2">{t('errors.unknown')}</h2>
        <p className="text-slate-gray/80 mb-4">{displayMessage}</p>
        {retry && (
          <button
            onClick={retry}
            className="bg-cyan-primary text-warm-white px-4 py-2 rounded-lg hover:bg-cyan-hover transition-colors"
          >
            {t('errors.boundary_retry')}
          </button>
        )}
      </div>
    </div>
  )
}
