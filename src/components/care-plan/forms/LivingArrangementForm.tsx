import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
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

export default function LivingArrangementForm({ data, onChange, readOnly }: SectionFormProps) {
  const { t } = useLocale()

  const LIVING_OPTIONS = [
    { value: 'resident_home',  label: t('care_plan.living_opt_resident_home_label'),  description: t('care_plan.living_opt_resident_home_desc') },
    { value: 'family_home',    label: t('care_plan.living_opt_family_home_label'),    description: t('care_plan.living_opt_family_home_desc') },
    { value: 'paid_in_home',   label: t('care_plan.living_opt_paid_in_home_label'),   description: t('care_plan.living_opt_paid_in_home_desc') },
    { value: 'assisted_living',label: t('care_plan.living_opt_assisted_label'),       description: t('care_plan.living_opt_assisted_desc') },
    { value: 'undecided',      label: t('care_plan.living_opt_undecided_label'),      description: '' },
  ]

  const CHANGE_TRIGGERS = [
    t('care_plan.living_trigger_safety'),
    t('care_plan.living_trigger_health'),
    t('care_plan.living_trigger_burnout'),
    t('care_plan.living_trigger_capacity'),
    t('care_plan.living_trigger_financial'),
    t('care_plan.living_trigger_family'),
    t('care_plan.living_trigger_provider'),
  ]

  const WORKING_OPTIONS = [
    t('care_plan.living_working_yes'),
    t('care_plan.living_working_mostly'),
    t('care_plan.living_working_struggling'),
    t('care_plan.living_working_no'),
  ]

  function set(key: string, value: unknown) {
    onChange({ ...data, [key]: value })
  }

  function toggleTrigger(label: string) {
    if (readOnly) return
    const current = (data.change_triggers as string[]) ?? []
    const next = current.includes(label)
      ? current.filter((c) => c !== label)
      : [...current, label]
    set('change_triggers', next)
  }

  const selected = (data.current_arrangement as string) ?? ''
  const working = (data.currently_working as string) ?? ''
  const triggers = (data.change_triggers as string[]) ?? []

  return (
    <div className="space-y-7">
      <div className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-4 border border-slate-100">
        {t('care_plan.living_preamble')}
      </div>

      <Field label={t('care_plan.living_field_arrangement_label')}>
        <div className="space-y-2 mt-1">
          {LIVING_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              disabled={readOnly}
              onClick={() => set('current_arrangement', opt.value)}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors disabled:cursor-default ${
                selected === opt.value
                  ? 'border-blue-400 bg-blue-50 text-blue-900'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50/40'
              }`}
            >
              <span className="font-semibold block mb-0.5">{opt.label}</span>
              {opt.description && (
                <span className="text-xs text-slate-500">{opt.description}</span>
              )}
            </button>
          ))}
        </div>
      </Field>

      <Field
        label={t('care_plan.living_field_working_label')}
        hint={t('care_plan.living_field_working_hint')}
      >
        <div className="flex gap-2 mt-1">
          {WORKING_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              disabled={readOnly}
              onClick={() => set('currently_working', opt)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors disabled:cursor-default ${
                working === opt
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
        label={t('care_plan.living_field_safety_label')}
        hint={t('care_plan.living_field_safety_hint')}
      >
        <textarea
          rows={3}
          readOnly={readOnly}
          value={(data.safety_concerns as string) ?? ''}
          onChange={(e) => set('safety_concerns', e.target.value)}
          placeholder={t('care_plan.living_field_safety_placeholder')}
          className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none read-only:bg-slate-50 read-only:cursor-default leading-relaxed"
        />
      </Field>

      <Field
        label={t('care_plan.living_field_alternatives_label')}
        hint={t('care_plan.living_field_alternatives_hint')}
      >
        <textarea
          rows={3}
          readOnly={readOnly}
          value={(data.alternatives_considered as string) ?? ''}
          onChange={(e) => set('alternatives_considered', e.target.value)}
          placeholder={t('care_plan.living_field_alternatives_placeholder')}
          className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none read-only:bg-slate-50 read-only:cursor-default leading-relaxed"
        />
      </Field>

      <Field
        label={t('care_plan.living_field_triggers_label')}
        hint={t('care_plan.living_field_triggers_hint')}
      >
        <div className="flex flex-wrap gap-2 mt-1">
          {CHANGE_TRIGGERS.map((trigger) => (
            <button
              key={trigger}
              type="button"
              disabled={readOnly}
              onClick={() => toggleTrigger(trigger)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors disabled:cursor-default ${
                triggers.includes(trigger)
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
        label={t('care_plan.living_field_constraints_label')}
        hint={t('care_plan.living_field_constraints_hint')}
      >
        <textarea
          rows={3}
          readOnly={readOnly}
          value={(data.constraints as string) ?? ''}
          onChange={(e) => set('constraints', e.target.value)}
          placeholder={t('care_plan.living_field_constraints_placeholder')}
          className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none read-only:bg-slate-50 read-only:cursor-default leading-relaxed"
        />
      </Field>

      <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 flex items-start gap-3 text-sm">
        <ExternalLink className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-teal-900 mb-1">{t('care_plan.living_worksheet_title')}</p>
          <Link
            to="/new-carer/living-arrangements"
            className="text-xs font-semibold text-teal-700 hover:text-teal-900 underline underline-offset-2 transition-colors"
          >
            {t('care_plan.living_worksheet_link')}
          </Link>
        </div>
      </div>
    </div>
  )
}
