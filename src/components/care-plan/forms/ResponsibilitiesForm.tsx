import type { SectionFormProps } from '../SectionFormModal'
import { useLocale } from '../../../i18n/LocaleContext'

type RespStatus = 'assigned' | 'unclear' | 'gap'

export default function ResponsibilitiesForm({ data, onChange, readOnly }: SectionFormProps) {
  const { t } = useLocale()

  const RESPONSIBILITY_AREAS: { key: string; label: string; description: string }[] = [
    { key: 'household',    label: t('care_plan.resp_area_household_label'),    description: t('care_plan.resp_area_household_desc') },
    { key: 'personal_care',label: t('care_plan.resp_area_personal_care_label'),description: t('care_plan.resp_area_personal_care_desc') },
    { key: 'emotional',    label: t('care_plan.resp_area_emotional_label'),    description: t('care_plan.resp_area_emotional_desc') },
    { key: 'health',       label: t('care_plan.resp_area_health_label'),       description: t('care_plan.resp_area_health_desc') },
    { key: 'scheduling',   label: t('care_plan.resp_area_scheduling_label'),   description: t('care_plan.resp_area_scheduling_desc') },
    { key: 'admin',        label: t('care_plan.resp_area_admin_label'),        description: t('care_plan.resp_area_admin_desc') },
    { key: 'respite',      label: t('care_plan.resp_area_respite_label'),      description: t('care_plan.resp_area_respite_desc') },
  ]

  const STATUS_OPTS: { value: RespStatus; label: string; active: string }[] = [
    { value: 'assigned', label: t('care_plan.resp_status_assigned'), active: 'bg-emerald-600 text-white border-emerald-600' },
    { value: 'unclear',  label: t('care_plan.resp_status_unclear'),  active: 'bg-amber-500 text-white border-amber-500' },
    { value: 'gap',      label: t('care_plan.resp_status_gap'),      active: 'bg-red-500 text-white border-red-500' },
  ]

  function setAreaField(areaKey: string, field: string, value: string) {
    const existing = (data[areaKey] as Record<string, string>) ?? {}
    onChange({ ...data, [areaKey]: { ...existing, [field]: value } })
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-4 border border-slate-100">
        {t('care_plan.resp_preamble')}
      </div>

      {RESPONSIBILITY_AREAS.map((area) => {
        const areaData = (data[area.key] as Record<string, string>) ?? {}

        return (
          <div key={area.key} className="border border-slate-200 rounded-xl p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-0.5">{area.label}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{area.description}</p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  disabled={readOnly}
                  onClick={() => setAreaField(area.key, 'status', opt.value)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors disabled:cursor-default ${
                    areaData.status === opt.value
                      ? opt.active
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                readOnly={readOnly}
                value={areaData.person ?? ''}
                onChange={(e) => setAreaField(area.key, 'person', e.target.value)}
                placeholder={t('care_plan.resp_placeholder_person')}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 read-only:bg-slate-50 read-only:cursor-default"
              />
              <input
                type="text"
                readOnly={readOnly}
                value={areaData.backup ?? ''}
                onChange={(e) => setAreaField(area.key, 'backup', e.target.value)}
                placeholder={t('care_plan.resp_placeholder_backup')}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 read-only:bg-slate-50 read-only:cursor-default"
              />
            </div>

            <input
              type="text"
              readOnly={readOnly}
              value={areaData.notes ?? ''}
              onChange={(e) => setAreaField(area.key, 'notes', e.target.value)}
              placeholder={t('care_plan.resp_placeholder_notes')}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 read-only:bg-slate-50 read-only:cursor-default"
            />
          </div>
        )
      })}
    </div>
  )
}
