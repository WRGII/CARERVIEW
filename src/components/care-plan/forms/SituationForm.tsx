import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import type { SectionFormProps } from '../SectionFormModal'

const CONCERN_CATEGORIES = [
  'Health and medical management',
  'Safety at home',
  'Medication management',
  'Family communication and disagreements',
  'Financial and legal matters',
  'Transport and appointments',
  'Personal care and daily living',
  'Emotional and mental wellbeing',
  'Housing and living arrangements',
  'Caregiver capacity and burnout',
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

export default function SituationForm({ data, onChange, readOnly }: SectionFormProps) {
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
        Describe the current care situation at a high level. This section should capture the
        big picture — not clinical detail (that belongs in the Memory Book).
      </div>

      <Field
        label="What is the current care situation?"
        hint="A brief summary of what has led to the caring role and what care is currently needed."
      >
        <textarea
          rows={4}
          readOnly={readOnly}
          value={(data.current_situation as string) ?? ''}
          onChange={(e) => set('current_situation', e.target.value)}
          placeholder="e.g. Mum was diagnosed with early-stage dementia in January. She lives alone and has been managing well but is starting to need daily support with medications and appointments…"
          className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 resize-none disabled:bg-slate-50 read-only:bg-slate-50 read-only:cursor-default leading-relaxed"
        />
      </Field>

      <Field
        label="What changed recently that triggered the need for more care?"
        hint="A specific event, decline, or decision that brought things to a head."
      >
        <textarea
          rows={3}
          readOnly={readOnly}
          value={(data.trigger as string) ?? ''}
          onChange={(e) => set('trigger', e.target.value)}
          placeholder="e.g. A fall at home in March, a hospital stay, a GP referral, or a noticeable change in capacity…"
          className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 resize-none read-only:bg-slate-50 read-only:cursor-default leading-relaxed"
        />
      </Field>

      <Field
        label="What are the biggest concerns right now?"
        hint="Select all that apply."
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
        label="What may change over the next 6–12 months?"
        hint="Think about health trajectory, family availability, finances, and living arrangements."
      >
        <textarea
          rows={3}
          readOnly={readOnly}
          value={(data.anticipated_changes as string) ?? ''}
          onChange={(e) => set('anticipated_changes', e.target.value)}
          placeholder="e.g. Needs are likely to increase as dementia progresses. One sibling may be relocating and will be less available…"
          className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 resize-none read-only:bg-slate-50 read-only:cursor-default leading-relaxed"
        />
      </Field>

      <Field
        label="What decisions feel most urgent right now?"
        hint="What needs to be resolved in the next few weeks, before it becomes a crisis?"
      >
        <textarea
          rows={3}
          readOnly={readOnly}
          value={(data.urgent_decisions as string) ?? ''}
          onChange={(e) => set('urgent_decisions', e.target.value)}
          placeholder="e.g. Whether to arrange daily check-ins, whether to apply for a formal assessment, who will manage medications…"
          className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 resize-none read-only:bg-slate-50 read-only:cursor-default leading-relaxed"
        />
      </Field>

      <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 flex items-start gap-3 text-sm">
        <ExternalLink className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-teal-900 mb-0.5">Health details belong in the Memory Book</p>
          <p className="text-teal-700 text-xs leading-relaxed mb-2">
            Diagnoses, medications, providers, and medical history are captured in the Memory Book
            health section — not here.
          </p>
          <Link
            to="/caregiver/memory-schedule"
            className="text-xs font-semibold text-teal-700 hover:text-teal-900 underline underline-offset-2 transition-colors"
          >
            Update resident health details in Memory Book
          </Link>
        </div>
      </div>
    </div>
  )
}
