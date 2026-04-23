// src/components/new-carer/NewCarerBreadcrumb.tsx
import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useLocale } from '../../i18n/LocaleContext'

export default function NewCarerBreadcrumb() {
  const { t } = useLocale()
  return (
    <Link
      to="/new-carer"
      className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-teal-700 transition-colors group"
    >
      <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
      {t('new_carer.back_to_new_carer')}
    </Link>
  )
}
