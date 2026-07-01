import { Link } from 'react-router-dom'
import { BookOpen, ChevronRight, CircleCheck as CheckCircle2, Circle } from 'lucide-react'
import { useActiveTeam } from '../../context/ActiveTeam'
import { useAuth } from '../../hooks/useAuth'
import {
  useMemoryBook,
  useTeamRole,
  useMemoryBookIdentity,
  useMemoryBookContacts,
  useMemoryBookMedical,
  useMemoryBookMedicalEntries,
  useMemoryBookDailyLivingEntries,
  useMemoryBookPreferences,
  useMemoryBookPreferenceEntries,
} from '../../hooks/useMemoryBook'
import { useLocale } from '../../i18n/LocaleContext'

type SectionKey = 'identity' | 'contacts' | 'medical' | 'daily_living'

function SectionRow({ label, filled }: { label: string; filled: boolean }) {
  return (
    <div className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg bg-slate-50">
      {filled
        ? <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0" />
        : <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
      }
      <span className="text-xs font-medium text-slate-700 truncate">{label}</span>
    </div>
  )
}

export default function DashboardMemoryBookPanel() {
  const { t } = useLocale()
  const { teamId } = useActiveTeam()
  const { user } = useAuth()
  const { data: role, isLoading: roleLoading } = useTeamRole(teamId, user?.id)
  const roleResolved = !roleLoading && !!teamId && !!user?.id
  const isOwner = role === 'owner'

  const { data: book, isLoading: bookLoading } = useMemoryBook(teamId, isOwner, roleResolved)
  const bookId = book?.id ?? null

  const { data: identity, isLoading: identityLoading } = useMemoryBookIdentity(bookId)
  const { data: contacts = [], isLoading: contactsLoading } = useMemoryBookContacts(bookId)
  const { data: medical, isLoading: medicalLoading } = useMemoryBookMedical(bookId)
  const { data: medicalEntries = [], isLoading: medicalEntriesLoading } = useMemoryBookMedicalEntries(bookId)
  const { data: dailyLiving = [], isLoading: dailyLoading } = useMemoryBookDailyLivingEntries(bookId)
  const { data: legacyPreferences, isLoading: legacyPrefLoading } = useMemoryBookPreferences(bookId)
  const { data: preferences = [], isLoading: prefLoading } = useMemoryBookPreferenceEntries(bookId)

  if (!teamId) return null

  const isLoading = roleLoading || bookLoading || identityLoading || contactsLoading || medicalLoading || medicalEntriesLoading || dailyLoading || legacyPrefLoading || prefLoading

  if (isLoading) return null

  if (!book) return null

  const SECTIONS: { key: SectionKey; label: string }[] = [
    { key: 'identity', label: t('dashboard.mb_section_identity') },
    { key: 'contacts', label: t('dashboard.mb_section_contacts') },
    { key: 'medical', label: t('dashboard.mb_section_medical') },
    { key: 'daily_living', label: t('dashboard.mb_section_daily_living') },
  ]

  const filledMap: Record<SectionKey, boolean> = {
    identity: !!identity,
    contacts: contacts.length > 0,
    medical: !!medical || medicalEntries.length > 0,
    daily_living: dailyLiving.length > 0 || !!legacyPreferences || preferences.length > 0,
  }

  const filledCount = Object.values(filledMap).filter(Boolean).length
  const total = SECTIONS.length

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4 text-teal-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">{t('dashboard.mb_title')}</p>
            <p className="text-xs font-semibold text-teal-700">{t('dashboard.mb_subtitle')}</p>
          </div>
        </div>
        <Link
          to="/caregiver/memory-schedule"
          className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-800 transition-colors"
        >
          {t('common.open')}
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{filledCount}</span> {t('dashboard.mb_sections_have_content', { total })}
            </p>
            {filledCount === total && (
              <span className="text-xs font-semibold text-teal-700">{t('common.complete')}</span>
            )}
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.round((filledCount / total) * 100)}%` }}
            />
          </div>
        </div>

        {/* Section rows */}
        <div className="grid grid-cols-2 gap-1.5">
          {SECTIONS.map(({ key, label }) => (
            <SectionRow key={key} label={label} filled={filledMap[key]} />
          ))}
        </div>
      </div>
    </div>
  )
}
