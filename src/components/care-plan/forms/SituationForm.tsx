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

export default function SituationForm({ data, onChange, readOnly }: SectionFormProps) {
  const { t } = useLocale()

  const CONCERN_CATEGORIES = [
    t('care_plan.situation_concern_health'),
    t('care_plan.situation_concern_safety'),
    t('care_plan.situation_concern_medication'),
    t('care_plan.situation_concern_family_comm'),
    t('care_plan.situation_concern_financial'),
    t('care_plan.situation_concern_transport'),
    t('care_plan.situation_concern_personal_care'),
    t('care_plan.situation_concern_emotional'),
    t('care_plan.situation_concern_housing'),
    t('care_plan.situation_concern_carer'),
  ]

  function set(key: string, value: unknown) {
    onChange({ ...data, [key]: value })
  }

  function toggleConcern(label: string) {
    if (readOnly) return
    const current = (data.concerns as string[]) ?? []
    const next = current.includes(label)
      ? current.filter((c) => c !== label)
      : [...current, label]
    set('concerns', next)
  }

  const concerns = (data.concerns as string[]) ?? []

  return (
    <div className="space-y-7">
      <div className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-4 border border-slate-100">
        {t('care_plan.situation_preamble')}
      </div>

      <Field
        label={t('care_plan.situation_field_current_label')}
        hint={t('care_plan.situation_field_current_hint')}
      >
        <textarea
          rows={4}
          readOnly={readOnly}
          value={(data.current_situation as string) ?? ''}
          onChange={(e) => set('current_situation', e.target.value)}
          placeholder={t('care_plan.situation_field_current_placeholder')}
          className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 resize-none disabled:bg-slate-50 read-only:bg-slate-50 read-only:cursor-default leading-relaxed"
        />
      </Field>

      <Field
        label={t('care_plan.situation_field_trigger_label')}
        hint={t('care_plan.situation_field_trigger_hint')}
      >
        <textarea
          rows={3}
          readOnly={readOnly}
          value={(data.trigger as string) ?? ''}
          onChange={(e) => set('trigger', e.target.value)}
          placeholder={t('care_plan.situation_field_trigger_placeholder')}
          className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 resize-none read-only:bg-slate-50 read-only:cursor-default leading-relaxed"
        />
      </Field>

      <Field
        label={t('care_plan.situation_field_concerns_label')}
        hint={t('care_plan.situation_field_concerns_hint')}
      >
        <div className="flex flex-wrap gap-2 mt-1">
          {CONCERN_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              disabled={readOnly}
              onClick={() => toggleConcern(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                concerns.includes(c)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-700'
              } disabled:cursor-default`}
            >
              {c}
            </button>
          ))}
        </div>
      </Field>

      <Field
        label={t('care_plan.situation_field_changes_label')}
        hint={t('care_plan.situation_field_changes_hint')}
      >
        <textarea
          rows={3}
          readOnly={readOnly}
          value={(data.anticipated_changes as string) ?? ''}
          onChange={(e) => set('anticipated_changes', e.target.value)}
          placeholder={t('care_plan.situation_field_changes_placeholder')}
          className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 resize-none read-only:bg-slate-50 read-only:cursor-default leading-relaxed"
        />
      </Field>

      <Field
        label={t('care_plan.situation_field_urgent_label')}
        hint={t('care_plan.situation_field_urgent_hint')}
      >
        <textarea
          rows={3}
          readOnly={readOnly}
          value={(data.urgent_decisions as string) ?? ''}
          onChange={(e) => set('urgent_decisions', e.target.value)}
          placeholder={t('care_plan.situation_field_urgent_placeholder')}
          className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 resize-none read-only:bg-slate-50 read-only:cursor-default leading-relaxed"
        />
      </Field>

      <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 flex items-start gap-3 text-sm">
        <ExternalLink className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-teal-900 mb-0.5">{t('care_plan.situation_mb_callout_title')}</p>
          <p className="text-teal-700 text-xs leading-relaxed mb-2">
            {t('care_plan.situation_mb_callout_body')}
          </p>
          <Link
            to="/caregiver/memory-schedule"
            className="text-xs font-semibold text-teal-700 hover:text-teal-900 underline underline-offset-2 transition-colors"
          >
            {t('care_plan.situation_mb_callout_link')}
          </Link>
        </div>
      </div>
    </div>
  )
}
