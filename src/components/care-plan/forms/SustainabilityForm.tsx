import type { SectionFormProps } from '../SectionFormModal'
import { TriangleAlert as AlertTriangle } from 'lucide-react'
import { getSustainabilityFlags } from '../../../lib/carePlanGaps'
import { useLocale } from '../../../i18n/LocaleContext'

const STRESS_FACTORS = [
  'Time — caring expands to fill all available hours',
  'Emotional strain — grief, guilt, frustration',
  'Physical demands — personal care or mobility support',
  'Work or financial pressure — reduced hours, lost income',
  'Isolation — stepping back from social life',
  'No backup — carrying full responsibility alone',
]

const HOURS_OPTIONS = [
  'Under 10 hrs/week',
  '10–20 hrs/week',
  '20–40 hrs/week',
  '40+ hrs/week',
  'Full-time / live-in',
]

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

export default function SustainabilityForm({ data, onChange, readOnly }: SectionFormProps) {
  const { t } = useLocale()

  function set(key: string, value: unknown) {
    // Normalise empty strings to empty string (never undefined/null) for consistency
    const normalised = typeof value === 'string' ? value : value
    onChange({ ...data, [key]: normalised })
  }

  function toggleFactor(label: string) {
    if (readOnly) return
    // Always guarantee stress_factors is a proper array from persisted data
    const current = Array.isArray(data.stress_factors) ? (data.stress_factors as string[]) : []
    const next = current.includes(label)
      ? current.filter((f) => f !== label)
      : [...current, label]
    set('stress_factors', next)
  }

  // Guarantee arrays are always arrays even after a JSON round-trip
  const stressFactors = Array.isArray(data.stress_factors) ? (data.stress_factors as string[]) : []
  const availableHours = (data.available_hours as string) ?? ''
  const stressLevel = (data.stress_level as string) ?? ''

  const flags = getSustainabilityFlags(data, t)

  return (
    <div className="space-y-7">
      <div className="bg-slate-800 border border-slate-700 text-white rounded-xl p-4 text-sm leading-relaxed">
        The caregiver is not an unlimited resource. A care plan that does not account for the
        carer&apos;s own limits, needs, and sustainability is not a complete plan.
      </div>

      <Field label="Who is the primary caregiver?">
        <input
          type="text"
          readOnly={readOnly}
          value={(data.primary_caregiver as string) ?? ''}
          onChange={(e) => set('primary_caregiver', e.target.value)}
          placeholder="Name and relationship to the resident"
          className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 read-only:bg-slate-50 read-only:cursor-default"
        />
      </Field>

      <Field
        label="How many hours per week is the primary caregiver realistically available?"
      >
        <div className="flex flex-wrap gap-2 mt-1">
          {HOURS_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              disabled={readOnly}
              onClick={() => set('available_hours', opt)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors disabled:cursor-default ${
                availableHours === opt
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
        label="What is the current stress or overload level for the primary caregiver?"
      >
        <div className="flex flex-wrap gap-2 mt-1">
          {['Low', 'Moderate', 'High', 'Very high'].map((opt) => (
            <button
              key={opt}
              type="button"
              disabled={readOnly}
              onClick={() => set('stress_level', opt)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors disabled:cursor-default ${
                stressLevel === opt
                  ? opt === 'High' || opt === 'Very high'
                    ? 'bg-red-500 text-white border-red-500'
                    : opt === 'Moderate'
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </Field>

      <Field
        label="What stress or overload factors are currently present?"
        hint="Select all that apply."
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

      <Field
        label="Who provides backup when the primary caregiver is unavailable?"
      >
        <input
          type="text"
          readOnly={readOnly}
          value={(data.backup_person as string) ?? ''}
          onChange={(e) => set('backup_person', e.target.value)}
          placeholder="Name and relationship, or 'not yet identified'"
          className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 read-only:bg-slate-50 read-only:cursor-default"
        />
      </Field>

      <Field
        label="What respite or relief is currently in place?"
        hint="Respite is not a luxury. It is a maintenance requirement. Be specific."
      >
        <textarea
          rows={3}
          readOnly={readOnly}
          value={(data.respite_plan as string) ?? ''}
          onChange={(e) => set('respite_plan', e.target.value)}
          placeholder="e.g. Sibling covers every second weekend. Home care visits Tuesday and Thursday mornings…"
          className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none read-only:bg-slate-50 read-only:cursor-default leading-relaxed"
        />
      </Field>

      <Field
        label="What would indicate the current plan is no longer sustainable?"
        hint="What signs would trigger a conversation about reducing or redistributing the care load?"
      >
        <textarea
          rows={3}
          readOnly={readOnly}
          value={(data.sustainability_threshold as string) ?? ''}
          onChange={(e) => set('sustainability_threshold', e.target.value)}
          placeholder="e.g. If I am no longer sleeping, if I need to reduce my working hours, if I miss two weeks of my own medical appointments…"
          className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none read-only:bg-slate-50 read-only:cursor-default leading-relaxed"
        />
      </Field>

      {/* Risk flags */}
      {flags.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-900">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            Sustainability risks identified
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
            These gaps are worth addressing before the current arrangement breaks down.
          </p>
        </div>
      )}
    </div>
  )
}
