import { Link } from 'react-router-dom'
import { CircleUser as UserCircle, ChevronRight } from 'lucide-react'
import { useActiveTeam } from '../../context/ActiveTeam'
import { useTeamResident } from '../../hooks/useMemoryBook'
import { useLocale } from '../../i18n/LocaleContext'

export default function DashboardResidentPanel() {
  const { t } = useLocale()
  const { teamId } = useActiveTeam()
  const { data: resident, isLoading } = useTeamResident(teamId)

  if (!teamId || isLoading || !resident) return null

  return (
    <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
          <UserCircle className="w-3.5 h-3.5 text-slate-500" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide leading-none mb-0.5">
            {t('dashboard.resident_title')}
          </p>
          <p className="text-sm font-bold text-slate-900 truncate">{resident.full_name}</p>
        </div>
      </div>
      <Link
        to="/caregiver/resident"
        className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors shrink-0"
      >
        {t('common.view')}
        <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  )
}
