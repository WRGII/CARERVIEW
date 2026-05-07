import { Link } from 'react-router-dom'
import { CircleUser as UserCircle, ChevronRight, Calendar, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from 'lucide-react'
import { useActiveTeam } from '../../context/ActiveTeam'
import { useAuth } from '../../hooks/useAuth'
import { useTeamResident, useTeamRole } from '../../hooks/useMemoryBook'

function profileScore(resident: any): { filled: number; total: number } {
  const fields = [
    resident?.full_name,
    resident?.preferred_name,
    resident?.date_of_birth,
    resident?.gender && resident.gender !== 'unknown',
    resident?.birthplace,
    resident?.cultural_preferences,
    resident?.language_preferences,
    resident?.about_me,
  ]
  return { filled: fields.filter(Boolean).length, total: fields.length }
}

export default function DashboardResidentPanel() {
  const { teamId } = useActiveTeam()
  const { user } = useAuth()
  const { data: resident, isLoading: residentLoading } = useTeamResident(teamId)
  const { data: role, isLoading: roleLoading } = useTeamRole(teamId, user?.id)

  if (!teamId) return null
  if (residentLoading || roleLoading) return null
  if (!resident) return null

  const isOwner = role === 'owner'
  const { filled, total } = profileScore(resident)
  const isComplete = filled === total
  const pct = Math.round((filled / total) * 100)

  const residentAge = (() => {
    if (!resident.date_of_birth) return null
    const dob = new Date(resident.date_of_birth)
    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const m = today.getMonth() - dob.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
    return age
  })()

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
            <UserCircle className="w-4 h-4 text-slate-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Resident</p>
            <p className="text-xs font-semibold text-slate-500">Person at the centre of care</p>
          </div>
        </div>
        <Link
          to="/caregiver/resident"
          className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          View
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="px-5 py-4 space-y-3">
        {/* Resident name & age */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-base font-bold text-slate-900">{resident.full_name}</p>
            {resident.preferred_name && (
              <p className="text-xs text-slate-500 mt-0.5">Known as "{resident.preferred_name}"</p>
            )}
            {residentAge !== null && (
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3" />
                Age {residentAge}
              </p>
            )}
          </div>
          {isComplete ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-1 rounded-full shrink-0">
              <CheckCircle className="w-3 h-3" />
              Complete
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded-full shrink-0">
              <AlertCircle className="w-3 h-3" />
              Incomplete
            </span>
          )}
        </div>

        {/* Profile completion bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-slate-400">
              Profile <span className="font-semibold text-slate-600">{pct}%</span> complete
            </p>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* CTA for incomplete profiles (owner only) */}
        {!isComplete && isOwner && (
          <Link
            to="/caregiver/resident"
            className="block w-full text-center text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg px-3 py-2 transition-colors"
          >
            Complete the resident profile →
          </Link>
        )}
      </div>
    </div>
  )
}
