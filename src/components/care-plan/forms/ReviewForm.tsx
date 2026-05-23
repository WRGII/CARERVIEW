import type { SectionFormProps } from '../SectionFormModal'
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

export default function ReviewForm({ data, onChange, readOnly }: SectionFormProps) {
  const { t } = useLocale()

  const REVIEW_FREQUENCIES = [
    t('care_plan.review_freq_monthly'),
    t('care_plan.review_freq_3months'),
    t('care_plan.review_freq_6months'),
    t('care_plan.review_freq_annually'),
    t('care_plan.review_freq_triggered'),
  ]

  const REVIEW_TRIGGERS = [
    t('care_plan.review_trigger_health'),
    t('care_plan.review_trigger_hospital'),
    t('care_plan.review_trigger_fall'),
    t('care_plan.review_trigger_living'),
    t('care_plan.review_trigger_provider'),
    t('care_plan.review_trigger_family_capacity'),
    t('care_plan.review_trigger_carer_overload'),
    t('care_plan.review_trigger_conflict'),
    t('care_plan.review_trigger_financial'),
  ]

  const FAMILY_INCLUDED_OPTIONS = [
    t('care_plan.review_family_yes'),
    t('care_plan.review_family_planned'),
    t('care_plan.review_family_not_yet'),
    t('care_plan.review_family_not_applicable'),
  ]

  function set(key: string, value: unknown) {
    onChange({ ...data, [key]: value })
  }

  function toggleTrigger(label: string) {
    if (readOnly) return
    const current = (data.review_triggers as string[]) ?? []
    const next = current.includes(label)
      ? current.filter((trig) => trig !== label)
      : [...current, label]
    set('review_triggers', next)
  }

  const frequency = (data.review_frequency as string) ?? ''
  const selectedTriggers = (data.review_triggers as string[]) ?? []

  return (
    <div className="space-y-7">
      <div className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-4 border border-slate-100">
        {t('care_plan.review_preamble')}
      </div>

      <Field label={t('care_plan.review_field_frequency_label')}>
        <div className="flex flex-wrap gap-2 mt-1">
          {REVIEW_FREQUENCIES.map((opt) => (
            <button
              key={opt}
              type="button"
              disabled={readOnly}
              onClick={() => set('review_frequency', opt)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors disabled:cursor-default ${
                frequency === opt
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </Field>

      <Field
        label={t('care_plan.review_field_owner_label')}
        hint={t('care_plan.review_field_owner_hint')}
      >
        <input
          type="text"
          readOnly={readOnly}
          value={(data.review_owner as string) ?? ''}
          onChange={(e) => set('review_owner', e.target.value)}
          placeholder={t('care_plan.review_field_owner_placeholder')}
          className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 read-only:bg-slate-50 read-only:cursor-default"
        />
      </Field>

      <Field
        label={t('care_plan.review_field_date_label')}
        hint={t('care_plan.review_field_date_hint')}
      >
        <input
          type="date"
          readOnly={readOnly}
          value={(data.next_review_date as string) ?? ''}
          onChange={(e) => set('next_review_date', e.target.value)}
          className="text-sm border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 read-only:bg-slate-50 read-only:cursor-default"
        />
      </Field>

      <Field
        label={t('care_plan.review_field_triggers_label')}
        hint={t('care_plan.review_field_triggers_hint')}
      >
        <div className="flex flex-wrap gap-2 mt-1">
          {REVIEW_TRIGGERS.map((trigger) => (
            <button
              key={trigger}
              type="button"
              disabled={readOnly}
              onClick={() => toggleTrigger(trigger)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors disabled:cursor-default text-left ${
                selectedTriggers.includes(trigger)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
              }`}
            >
              {trigger}
            </button>
          ))}
        </div>
      </Field>

      <Field
        label={t('care_plan.review_field_decisions_label')}
        hint={t('care_plan.review_field_decisions_hint')}
      >
        <textarea
          rows={3}
          readOnly={readOnly}
          value={(data.decisions_to_revisit as string) ?? ''}
          onChange={(e) => set('decisions_to_revisit', e.target.value)}
          placeholder={t('care_plan.review_field_decisions_placeholder')}
          className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none read-only:bg-slate-50 read-only:cursor-default leading-relaxed"
        />
      </Field>

      <Field label={t('care_plan.review_field_family_label')}>
        <div className="flex gap-2 mt-1">
          {FAMILY_INCLUDED_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              disabled={readOnly}
              onClick={() => set('family_included', opt)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors disabled:cursor-default ${
                (data.family_included as string) === opt
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </Field>
    </div>
  )
}
