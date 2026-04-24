import type { SectionFormProps } from '../SectionFormModal'

const REVIEW_FREQUENCIES = [
  'Monthly',
  'Every 3 months',
  'Every 6 months',
  'Annually',
  'Only when triggered',
]

const REVIEW_TRIGGERS = [
  'Health decline or new diagnosis',
  'Hospitalisation or major medical event',
  'Fall or safety incident',
  'Change in living arrangement',
  'Change in care provider or service',
  'Family capacity changes significantly',
  'Primary caregiver shows signs of overload',
  'Family conflict about care decisions',
  'Significant financial change',
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

export default function ReviewForm({ data, onChange, readOnly }: SectionFormProps) {
  function set(key: string, value: unknown) {
    onChange({ ...data, [key]: value })
  }

  function toggleTrigger(label: string) {
    if (readOnly) return
    const current = (data.review_triggers as string[]) ?? []
    const next = current.includes(label)
      ? current.filter((t) => t !== label)
      : [...current, label]
    set('review_triggers', next)
  }

  const frequency = (data.review_frequency as string) ?? ''
  const selectedTriggers = (data.review_triggers as string[]) ?? []

  return (
    <div className="space-y-7">
      <div className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-4 border border-slate-100">
        A care plan is not a static document. Building a review process in from the beginning
        prevents small changes from becoming crises. The goal is not perfection — it is a
        workable plan that is honest, shared, and regularly reviewed.
      </div>

      <Field label="How often should this Care Plan be formally reviewed?">
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
        label="Who is responsible for leading the review?"
        hint="Name the person who is responsible for calling and running each review."
      >
        <input
          type="text"
          readOnly={readOnly}
          value={(data.review_owner as string) ?? ''}
          onChange={(e) => set('review_owner', e.target.value)}
          placeholder="Name and relationship"
          className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 read-only:bg-slate-50 read-only:cursor-default"
        />
      </Field>

      <Field
        label="Next scheduled review date"
        hint="Even a rough target is better than no date at all."
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
        label="What changes should trigger an unscheduled review?"
        hint="Select all that apply."
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
        label="What decisions or issues need to be revisited soon?"
        hint="Anything that is unresolved, has been deferred, or needs to be discussed at the next review."
      >
        <textarea
          rows={3}
          readOnly={readOnly}
          value={(data.decisions_to_revisit as string) ?? ''}
          onChange={(e) => set('decisions_to_revisit', e.target.value)}
          placeholder="e.g. Need to confirm financial authority before next specialist visit. Respite arrangement needs to be formalised…"
          className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none read-only:bg-slate-50 read-only:cursor-default leading-relaxed"
        />
      </Field>

      <Field
        label="Are family members who are not the primary caregiver included in reviews?"
      >
        <div className="flex gap-2 mt-1">
          {['Yes', 'Planned', 'Not yet', 'Not applicable'].map((opt) => (
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
