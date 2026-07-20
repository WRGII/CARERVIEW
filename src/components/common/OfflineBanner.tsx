import { WifiOff } from 'lucide-react'
import { useLocale } from '../../i18n/LocaleContext'
import { OFFLINE_BANNER_KEYS } from '../../lib/errorMessages'

export default function OfflineBanner() {
  const { t } = useLocale()

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center gap-2.5 text-sm"
    >
      <WifiOff className="w-4 h-4 text-amber-600 flex-shrink-0" aria-hidden="true" />
      <span className="text-amber-800 font-medium">
        {t(OFFLINE_BANNER_KEYS.title)}
      </span>
      <span className="text-amber-700 hidden sm:inline">
        {t(OFFLINE_BANNER_KEYS.body)}
      </span>
    </div>
  )
}
