import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import type { SectionFormProps } from '../SectionFormModal'

const LIVING_OPTIONS = [
  {
    value: 'resident_home',
    label: "Resident stays in their own home",
    description: 'Often preferred for independence and familiarity. Requires honest safety assessment.',
  },
  {
    value: 'family_home',
    label: 'Resident moves into a family home',
    description: 'Requires clear thinking about space, supervision, impact on household, and long-term viability.',
  },
  {
    value: 'paid_in_home',
    label: 'Paid in-home support',
    description: 'Professional carers visiting. Costs and availability vary significantly by area.',
  },
  {
    value: 'assisted_living',
    label: 'Assisted living or residential care',
    description: 'Appropriate when care needs exceed what can be safely managed at home.',
  },
  {
    value: 'undecided',
    label: 'Undecided / still assessing',
    description: '',
  },
]

const CHANGE_TRIGGERS = [
  'Safety incident or fall',
  'Significant health decline',
  'Caregiver burnout or unavailability',
  'Care needs exceed current capacity',
  'Financial constraints',
  'Family agreement breaks down',
  'Provider or service change',
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

export default function LivingArrangementForm({ data, onChange, readOnly }: SectionFormProps) {
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
        Where care happens is one of the most consequential decisions in the caring role. Think
        strategically, not just about what feels right in the moment.
      </div>

      <Field label="What is the current living arrangement?">
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
        label="Is this arrangement currently working?"
        hint="Be honest — what is actually happening vs. what the plan assumes."
      >
        <div className="flex gap-2 mt-1">
          {['Yes', 'Mostly', 'Struggling', 'No'].map((opt) => (
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
        label="What are the main safety or supervision concerns?"
        hint="Fall risks, medication risks, unsupervised overnight, mobility issues, etc."
      >
        <textarea
          rows={3}
          readOnly={readOnly}
          value={(data.safety_concerns as string) ?? ''}
          onChange={(e) => set('safety_concerns', e.target.value)}
          placeholder="e.g. Unsteady on stairs, cannot manage medications independently, needs overnight check…"
          className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none read-only:bg-slate-50 read-only:cursor-default leading-relaxed"
        />
      </Field>

      <Field
        label="What alternatives are being considered?"
        hint="Other options that have been discussed or may need to be evaluated."
      >
        <textarea
          rows={3}
          readOnly={readOnly}
          value={(data.alternatives_considered as string) ?? ''}
          onChange={(e) => set('alternatives_considered', e.target.value)}
          placeholder="e.g. Assessing a nearby residential facility, exploring daily home care visits…"
          className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none read-only:bg-slate-50 read-only:cursor-default leading-relaxed"
        />
      </Field>

      <Field
        label="What would trigger a change in living arrangement?"
        hint="Select any that apply."
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
        label="Financial or family constraints affecting this decision"
        hint="Cost limits, family capacity, willingness, or practical constraints."
      >
        <textarea
          rows={3}
          readOnly={readOnly}
          value={(data.constraints as string) ?? ''}
          onChange={(e) => set('constraints', e.target.value)}
          placeholder="e.g. Residential care is financially out of reach without selling the family home. One sibling disagrees with moving Mum…"
          className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none read-only:bg-slate-50 read-only:cursor-default leading-relaxed"
        />
      </Field>

      <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 flex items-start gap-3 text-sm">
        <ExternalLink className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-teal-900 mb-1">Supporting worksheet</p>
          <Link
            to="/new-carer/living-arrangements"
            className="text-xs font-semibold text-teal-700 hover:text-teal-900 underline underline-offset-2 transition-colors"
          >
            Read the Home, Housing and Care Setting guide →
          </Link>
        </div>
      </div>
    </div>
  )
}
