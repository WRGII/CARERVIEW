import type { SectionFormProps } from '../SectionFormModal'
import { TriangleAlert as AlertTriangle } from 'lucide-react'
import { getSustainabilityFlags } from '../../../lib/carePlanGaps'
import { useLocale } from '../../../i18n/LocaleContext'

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-slate-800">{label}</label>
      {hint && <p className="text-xs text-slate-500 leading-relaxed">{hint}</p>}
      {children}
    </div>
  )
}

// Stress level data values are English keys — persisted as-is, compared on save/gap detection.
// Only the display labels are translated.
const STRESS_LEVEL_VALUES = ['Low', 'Moderate', 'High', 'Very high'] as const
type StressLevelValue = typeof STRESS_LEVEL_VALUES[number]

function stressLevelStyle(value: StressLevelValue): string {
  if (value === 'High' || value === 'Very high') return 'bg-red-500 text-white border-red-500'
  if (value === 'Moderate') return 'bg-amber-500 text-white border-amber-500'
  return 'bg-emerald-600 text-white border-emerald-600'
}

export default function SustainabilityForm({ data, onChange, readOnly }: SectionFormProps) {
  const { t } = useLocale()

  const HOURS_OPTIONS = [
    { value: t('care_plan.sustain_hours_under10'), label: t('care_plan.sustain_hours_under10') },
    { value: t('care_plan.sustain_hours_10_20'),   label: t('care_plan.sustain_hours_10_20') },
    { value: t('care_plan.sustain_hours_20_40'),   label: t('care_plan.sustain_hours_20_40') },
    { value: t('care_plan.sustain_hours_40plus'),  label: t('care_plan.sustain_hours_40plus') },
    { value: t('care_plan.sustain_hours_fulltime'),label: t('care_plan.sustain_hours_fulltime') },
  ]

  const STRESS_LEVEL_LABELS: Record<StressLevelValue, string> = {
    Low: t('care_plan.sustain_stress_low'),
    Moderate: t('care_plan.sustain_stress_moderate'),
    High: t('care_plan.sustain_stress_high'),
    'Very high': t('care_plan.sustain_stress_very_high'),
  }

  const STRESS_FACTORS = [
    t('care_plan.sustain_factor_time'),
    t('care_plan.sustain_factor_emotional'),
    t('care_plan.sustain_factor_physical'),
    t('care_plan.sustain_factor_work'),
    t('care_plan.sustain_factor_isolation'),
    t('care_plan.sustain_factor_no_backup'),
  ]

  function set(key: string, value: unknown) {
    const normalised = typeof value === 'string' ? value : value
    onChange({ ...data, [key]: normalised })
  }

  function toggleFactor(label: string) {
    if (readOnly) return
    const current = Array.isArray(data.stress_factors) ? (data.stress_factors as string[]) : []
    const next = current.includes(label)
      ? current.filter((f) => f !== label)
      : [...current, label]
    set('stress_factors', next)
  }

  const stressFactors = Array.isArray(data.stress_factors) ? (data.stress_factors as string[]) : []
  const availableHours = (data.available_hours as string) ?? ''
  const stressLevel = (data.stress_level as string) ?? ''

  const flags = getSustainabilityFlags(data, t)

  return (
    <div className="space-y-7">
      <div className="bg-slate-800 border border-slate-700 text-white rounded-xl p-4 text-sm leading-relaxed">
        {t('care_plan.sustain_preamble')}
      </div>

      <Field label={t('care_plan.sustain_field_primary_label')}>
        <input
          type="text"
          readOnly={readOnly}
          value={(data.primary_caregiver as string) ?? ''}
          onChange={(e) => set('primary_caregiver', e.target.value)}
          placeholder={t('care_plan.sustain_field_primary_placeholder')}
          className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 read-only:bg-slate-50 read-only:cursor-default"
        />
      </Field>

      <Field label={t('care_plan.sustain_field_hours_label')}>
        <div className="flex flex-wrap gap-2 mt-1">
          {HOURS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              disabled={readOnly}
              onClick={() => set('available_hours', opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors disabled:cursor-default ${
                availableHours === opt.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Field>

      <Field label={t('care_plan.sustain_field_stress_label')}>
        <div className="flex flex-wrap gap-2 mt-1">
          {STRESS_LEVEL_VALUES.map((val) => (
            <button
              key={val}
              type="button"
              disabled={readOnly}
              onClick={() => set('stress_level', val)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors disabled:cursor-default ${
                stressLevel === val
                  ? stressLevelStyle(val)
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
              }`}
            >
              {STRESS_LEVEL_LABELS[val]}
            </button>
          ))}
        </div>
      </Field>

      <Field
        label={t('care_plan.sustain_field_factors_label')}
        hint={t('care_plan.sustain_field_factors_hint')}
      >
        <div className="flex flex-wrap gap-2 mt-1">
          {STRESS_FACTORS.map((f) => (
            <button
              key={f}
              type="button"
              disabled={readOnly}
              onClick={() => toggleFactor(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors disabled:cursor-default text-left ${
                stressFactors.includes(f)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </Field>

      <Field label={t('care_plan.sustain_field_backup_label')}>
        <input
          type="text"
          readOnly={readOnly}
          value={(data.backup_person as string) ?? ''}
          onChange={(e) => set('backup_person', e.target.value)}
          placeholder={t('care_plan.sustain_field_backup_placeholder')}
          className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 read-only:bg-slate-50 read-only:cursor-default"
        />
      </Field>

      <Field
        label={t('care_plan.sustain_field_respite_label')}
        hint={t('care_plan.sustain_field_respite_hint')}
      >
        <textarea
          rows={3}
          readOnly={readOnly}
          value={(data.respite_plan as string) ?? ''}
          onChange={(e) => set('respite_plan', e.target.value)}
          placeholder={t('care_plan.sustain_field_respite_placeholder')}
          className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none read-only:bg-slate-50 read-only:cursor-default leading-relaxed"
        />
      </Field>

      <Field
        label={t('care_plan.sustain_field_threshold_label')}
        hint={t('care_plan.sustain_field_threshold_hint')}
      >
        <textarea
          rows={3}
          readOnly={readOnly}
          value={(data.sustainability_threshold as string) ?? ''}
          onChange={(e) => set('sustainability_threshold', e.target.value)}
          placeholder={t('care_plan.sustain_field_threshold_placeholder')}
          className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none read-only:bg-slate-50 read-only:cursor-default leading-relaxed"
        />
      </Field>

      {flags.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-900">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {t('care_plan.sustain_risks_title')}
          </div>
          <ul className="space-y-1">
            {flags.map((f) => (
              <li key={f} className="text-xs text-amber-800 flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <p className="text-xs text-amber-700 pt-1">
            {t('care_plan.sustain_risks_body')}
          </p>
        </div>
      )}
    </div>
  )
}
