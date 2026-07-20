import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { User, Save, CreditCard as Edit2, ChevronRight, Calendar, Globe, Languages, Heart, MapPin, Info, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from 'lucide-react'
import { PageLayout } from '../components/layout/PageLayout'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useToast } from '../components/ui/ToastProvider'
import { useActiveTeam } from '../context/ActiveTeam'
import { useAuth } from '../hooks/useAuth'
import { useTeamResident, useTeamRole, useUpsertResident } from '../hooks/useMemoryBook'
import { useLocale } from '../i18n/LocaleContext'
import Breadcrumbs from '../components/common/Breadcrumbs'

const EMPTY_FORM = {
  full_name: '',
  preferred_name: '',
  date_of_birth: '',
  gender: 'unknown',
  birthplace: '',
  address_preference: '',
  relationship_status: '',
  cultural_preferences: '',
  language_preferences: '',
  about_me: '',
}

function FieldDisplay({ label, value, icon: Icon }: { label: string; value?: string | null; icon?: React.ElementType }) {
  if (!value) return null
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
      </p>
      <p className="text-sm text-slate-800 leading-relaxed">{value}</p>
    </div>
  )
}

function ProfileCompletionBadge({ resident, t }: { resident: any; t: (k: string) => string }) {
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
  const filled = fields.filter(Boolean).length
  const total = fields.length
  const pct = Math.round((filled / total) * 100)
  const isComplete = filled === total

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{filled}</span> {t('resident_profile.fields_complete').replace('{total}', String(total))}
          </span>
          {isComplete && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700">
              <CheckCircle className="w-3.5 h-3.5" />
              {t('care_plan.status_complete')}
            </span>
          )}
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default function ResidentProfilePage() {
  const { t } = useLocale()
  const { teamId } = useActiveTeam()
  const { user } = useAuth()
  const { data: resident, isLoading: residentLoading } = useTeamResident(teamId)
  const { data: role, isLoading: roleLoading } = useTeamRole(teamId, user?.id)
  const upsert = useUpsertResident()
  const { showToast } = useToast()

  const GENDER_OPTIONS = [
    { value: 'male', label: t('resident_profile.gender_male') },
    { value: 'female', label: t('resident_profile.gender_female') },
    { value: 'non_binary', label: t('resident_profile.gender_non_binary') },
    { value: 'unknown', label: t('resident_profile.gender_prefer_not') },
  ]

  const isOwner = role === 'owner'
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    if (resident) {
      setForm({
        full_name: resident.full_name ?? '',
        preferred_name: resident.preferred_name ?? '',
        date_of_birth: resident.date_of_birth ?? '',
        gender: resident.gender ?? 'unknown',
        birthplace: resident.birthplace ?? '',
        address_preference: resident.address_preference ?? '',
        relationship_status: resident.relationship_status ?? '',
        cultural_preferences: resident.cultural_preferences ?? '',
        language_preferences: resident.language_preferences ?? '',
        about_me: resident.about_me ?? '',
      })
    }
  }, [resident])

  async function handleSave() {
    if (!teamId) return
    if (!form.full_name.trim()) {
      showToast(t('resident_profile.full_name_required'), 'error')
      return
    }
    try {
      await upsert.mutateAsync({
        teamId,
        full_name: form.full_name.trim(),
        preferred_name: form.preferred_name.trim(),
        date_of_birth: form.date_of_birth || null,
        gender: form.gender,
        birthplace: form.birthplace.trim(),
        address_preference: form.address_preference.trim(),
        relationship_status: form.relationship_status.trim(),
        cultural_preferences: form.cultural_preferences.trim(),
        language_preferences: form.language_preferences.trim(),
        about_me: form.about_me.trim(),
      })
      showToast(t('resident_profile.save_success'), 'success')
      setEditing(false)
    } catch (e: any) {
      showToast(e.message ?? t('resident_profile.save_error'), 'error')
    }
  }

  function handleCancel() {
    if (resident) {
      setForm({
        full_name: resident.full_name ?? '',
        preferred_name: resident.preferred_name ?? '',
        date_of_birth: resident.date_of_birth ?? '',
        gender: resident.gender ?? 'unknown',
        birthplace: resident.birthplace ?? '',
        address_preference: resident.address_preference ?? '',
        relationship_status: resident.relationship_status ?? '',
        cultural_preferences: resident.cultural_preferences ?? '',
        language_preferences: resident.language_preferences ?? '',
        about_me: resident.about_me ?? '',
      })
    }
    setEditing(false)
  }

  const isLoading = residentLoading || roleLoading

  const residentAge = (() => {
    if (!resident?.date_of_birth) return null
    const dob = new Date(resident.date_of_birth)
    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const m = today.getMonth() - dob.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
    return age
  })()

  return (
    <PageLayout
      title={t('resident_profile.title')}
      subtitle={t('resident_profile.subtitle')}
      hideSignOut
    >
      <Breadcrumbs homeTo="/caregiver" homeLabel={t('caregiver.dashboard_title')} items={[{ label: t('resident_profile.title') }]} />
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : !resident ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
          <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-amber-900 mb-1">{t('resident_profile.no_resident_title')}</h3>
          <p className="text-sm text-amber-700">{t('resident_profile.no_resident_body')}</p>
        </div>
      ) : (
        <div className="space-y-5">

          {/* Hero identity card */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                  <User className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{resident.full_name}</h2>
                  {resident.preferred_name && (
                    <p className="text-sm text-slate-300 mt-0.5">Known as "{resident.preferred_name}"</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    {residentAge !== null && (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-300">
                        <Calendar className="w-3 h-3" />
                        {t('resident_profile.age_label').replace('{age}', String(residentAge))}
                      </span>
                    )}
                    {resident.gender && resident.gender !== 'unknown' && (
                      <span className="text-xs text-slate-300 capitalize">{resident.gender.replace('_', '-')}</span>
                    )}
                    {resident.address_preference && (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-300">
                        <MapPin className="w-3 h-3" />
                        {resident.address_preference}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {isOwner && !editing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(true)}
                  className="border-white/30 text-white hover:bg-white/10 shrink-0"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                  {t('resident_profile.edit_profile')}
                </Button>
              )}
            </div>

            {/* Profile completion */}
            <div className="mt-5 pt-5 border-t border-white/10">
              <ProfileCompletionBadge resident={resident} t={t} />
            </div>
          </div>

          {/* Context notice */}
          <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 flex items-start gap-3">
            <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <p className="text-sm text-teal-800 leading-relaxed">
              {t('resident_profile.shared_notice_prefix')}{' '}
              <Link to="/caregiver/memory-schedule" className="font-semibold underline hover:text-teal-900">{t('resident_profile.memory_book_link')}</Link>,{' '}
              <Link to="/care-hub/care-plan" className="font-semibold underline hover:text-teal-900">{t('resident_profile.care_plan_link')}</Link>,{' '}
              {t('resident_profile.shared_notice_suffix')}
            </p>
          </div>

          {editing && isOwner ? (
            /* ── Edit form ── */
            <Card>
              <CardHeader>
                <h3 className="text-base font-semibold text-slate-800">{t('resident_profile.edit_form_title')}</h3>
                <p className="text-sm text-slate-500 mt-0.5">{t('resident_profile.edit_form_subtitle')}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Core identity */}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{t('resident_profile.section_core_identity')}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label={t('resident_profile.full_name_label')}
                        value={form.full_name}
                        onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                        placeholder={t('resident_profile.full_name_placeholder')}
                      />
                      <Input
                        label={t('resident_profile.preferred_name_label')}
                        value={form.preferred_name}
                        onChange={e => setForm(f => ({ ...f, preferred_name: e.target.value }))}
                        placeholder={t('resident_profile.preferred_name_placeholder')}
                      />
                      <Input
                        label={t('resident_profile.dob_label')}
                        type="date"
                        value={form.date_of_birth}
                        onChange={e => setForm(f => ({ ...f, date_of_birth: e.target.value }))}
                      />
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('resident_profile.gender_label')}</label>
                        <select
                          value={form.gender}
                          onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                          className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 bg-white focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        >
                          {GENDER_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Background */}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{t('resident_profile.section_background')}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label={t('resident_profile.birthplace_label')}
                        value={form.birthplace}
                        onChange={e => setForm(f => ({ ...f, birthplace: e.target.value }))}
                        placeholder={t('resident_profile.birthplace_placeholder')}
                      />
                      <Input
                        label={t('resident_profile.address_label')}
                        value={form.address_preference}
                        onChange={e => setForm(f => ({ ...f, address_preference: e.target.value }))}
                        placeholder={t('resident_profile.address_placeholder')}
                      />
                      <Input
                        label={t('resident_profile.relationship_label')}
                        value={form.relationship_status}
                        onChange={e => setForm(f => ({ ...f, relationship_status: e.target.value }))}
                        placeholder={t('resident_profile.relationship_placeholder')}
                      />
                      <Input
                        label={t('resident_profile.cultural_label')}
                        value={form.cultural_preferences}
                        onChange={e => setForm(f => ({ ...f, cultural_preferences: e.target.value }))}
                        placeholder={t('resident_profile.cultural_placeholder')}
                      />
                      <Input
                        label={t('resident_profile.language_label')}
                        value={form.language_preferences}
                        onChange={e => setForm(f => ({ ...f, language_preferences: e.target.value }))}
                        placeholder={t('resident_profile.language_placeholder')}
                      />
                    </div>
                  </div>

                  {/* About */}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{t('resident_profile.section_about')}</p>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('resident_profile.about_label')}</label>
                      <textarea
                        value={form.about_me}
                        onChange={e => setForm(f => ({ ...f, about_me: e.target.value }))}
                        placeholder={t('resident_profile.about_placeholder')}
                        className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 bg-white focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 min-h-[120px] leading-relaxed"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                    <Button variant="primary" size="md" onClick={handleSave} disabled={upsert.isPending}>
                      <Save className="w-4 h-4 mr-1.5" />
                      {upsert.isPending ? t('common.saving') : t('resident_profile.save_button')}
                    </Button>
                    <Button variant="ghost" size="md" onClick={handleCancel}>
                      {t('common.cancel')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* ── View mode ── */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Core identity */}
              <Card>
                <CardHeader>
                  <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    {t('resident_profile.section_core_identity')}
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <FieldDisplay label={t('resident_profile.full_name_label')} value={resident.full_name} />
                    <FieldDisplay label={t('resident_profile.preferred_name_label')} value={resident.preferred_name} />
                    <FieldDisplay
                      label={t('resident_profile.dob_label')}
                      value={resident.date_of_birth
                        ? new Date(resident.date_of_birth).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                        : null}
                      icon={Calendar}
                    />
                    <FieldDisplay
                      label={t('resident_profile.gender_label')}
                      value={resident.gender && resident.gender !== 'unknown'
                        ? GENDER_OPTIONS.find(o => o.value === resident.gender)?.label
                        : null}
                    />
                    {!resident.preferred_name && !resident.date_of_birth && isOwner && (
                      <button
                        onClick={() => setEditing(true)}
                        className="text-xs font-semibold text-teal-600 hover:text-teal-800 flex items-center gap-1"
                      >
                        {t('resident_profile.add_more_details')} <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Background */}
              <Card>
                <CardHeader>
                  <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-slate-400" />
                    {t('resident_profile.section_background')}
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <FieldDisplay label={t('resident_profile.lives_at_label')} value={resident.address_preference} icon={MapPin} />
                    <FieldDisplay label={t('resident_profile.birthplace_label')} value={resident.birthplace} />
                    <FieldDisplay label={t('resident_profile.relationship_label')} value={resident.relationship_status} icon={Heart} />
                    <FieldDisplay label={t('resident_profile.cultural_label')} value={resident.cultural_preferences} icon={Globe} />
                    <FieldDisplay label={t('resident_profile.language_label')} value={resident.language_preferences} icon={Languages} />
                    {!resident.birthplace && !resident.cultural_preferences && isOwner && (
                      <button
                        onClick={() => setEditing(true)}
                        className="text-xs font-semibold text-teal-600 hover:text-teal-800 flex items-center gap-1"
                      >
                        {t('resident_profile.add_background_details')} <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* About me — full width */}
              {resident.about_me ? (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <h3 className="text-sm font-semibold text-slate-700">{t('resident_profile.about_label')}</h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{resident.about_me}</p>
                  </CardContent>
                </Card>
              ) : isOwner ? (
                <div className="lg:col-span-2 bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center">
                  <p className="text-sm text-slate-500 mb-2">{t('resident_profile.no_about_narrative')}</p>
                  <button
                    onClick={() => setEditing(true)}
                    className="text-xs font-semibold text-teal-600 hover:text-teal-800 flex items-center gap-1 mx-auto"
                  >
                    {t('resident_profile.add_their_story')} <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              ) : null}
            </div>
          )}

          {/* Footer links */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/caregiver/memory-schedule"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-800 transition-colors"
            >
              {t('resident_profile.view_memory_book')}
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/care-hub/care-plan"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
            >
              {t('resident_profile.view_care_plan')}
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      )}
    </PageLayout>
  )
}
