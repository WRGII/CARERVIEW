import type { SectionFormProps } from '../SectionFormModal'
import { CircleAlert as AlertCircle } from 'lucide-react'

type AuthStatus = 'confirmed' | 'unclear' | 'missing' | 'not_applicable'

const STATUS_OPTIONS: { value: AuthStatus; label: string; style: string }[] = [
  {
    value: 'confirmed',
    label: 'Confirmed',
    style: 'bg-emerald-600 text-white border-emerald-600',
  },
  {
    value: 'unclear',
    label: 'Unclear',
    style: 'bg-amber-500 text-white border-amber-500',
  },
  {
    value: 'missing',
    label: 'Missing',
    style: 'bg-red-500 text-white border-red-500',
  },
  {
    value: 'not_applicable',
    label: 'Not applicable',
    style: 'bg-slate-200 text-slate-600 border-slate-200',
  },
]

const AUTHORITY_FIELDS: {
  key: string
  label: string
  hint: string
  nameKey: string
  notesKey: string
}[] = [
  {
    key: 'health_decisions',
    label: 'Health decision authority',
    hint: 'Who is authorised to speak to medical teams, access records, and make treatment decisions if the person cannot?',
    nameKey: 'health_decision_person',
    notesKey: 'health_decision_notes',
  },
  {
    key: 'financial_authority',
    label: 'Financial authority',
    hint: 'Who can manage bank accounts, pay bills, access pensions, and make financial decisions?',
    nameKey: 'financial_authority_person',
    notesKey: 'financial_authority_notes',
  },
  {
    key: 'legal_documents',
    label: 'Legal documents',
    hint: 'Are the relevant legal arrangements in place (e.g. power of attorney, advance directive, guardianship)?',
    nameKey: 'legal_documents_person',
    notesKey: 'legal_documents_notes',
  },
  {
    key: 'care_preferences_documented',
    label: 'Care preferences documented',
    hint: "Has the person expressed their wishes about care, living arrangements, and medical treatment? Are those wishes documented?",
    nameKey: 'care_preferences_person',
    notesKey: 'care_preferences_notes',
  },
  {
    key: 'document_location',
    label: 'Organised records and document location',
    hint: 'Is there one place where critical documents, account details, and contacts are stored and accessible to the right people?',
    nameKey: 'document_location_person',
    notesKey: 'document_location_notes',
  },
  {
    key: 'emergency_access',
    label: 'Emergency readiness',
    hint: 'In an emergency, can the right information be found quickly? Does the right person have access?',
    nameKey: 'emergency_access_person',
    notesKey: 'emergency_access_notes',
  },
]

function StatusToggle({
  value,
  onChange,
  readOnly,
}: {
  value: AuthStatus | undefined
  onChange: (v: AuthStatus) => void
  readOnly: boolean
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {STATUS_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          disabled={readOnly}
          onClick={() => onChange(opt.value)}
          className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors disabled:cursor-default ${
            value === opt.value
              ? opt.style
              : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export default function AuthorityForm({ data, onChange, readOnly }: SectionFormProps) {
  function set(key: string, value: unknown) {
    onChange({ ...data, [key]: value })
  }

  return (
    <div className="space-y-7">
      <div className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-4 border border-slate-100">
        Authority must be established, not assumed. Being the nearest relative does not
        automatically mean having legal authority over health decisions, finances, or records.
        Use this section to map what is in place and what still needs to be resolved.
      </div>

      <div className="space-y-6">
        {AUTHORITY_FIELDS.map((field) => {
          const status = data[field.key] as AuthStatus | undefined
          const person = (data[field.nameKey] as string) ?? ''
          const notes = (data[field.notesKey] as string) ?? ''

          return (
            <div
              key={field.key}
              className="border border-slate-200 rounded-xl p-5 space-y-3"
            >
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">{field.label}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{field.hint}</p>
              </div>

              <StatusToggle
                value={status}
                onChange={(v) => set(field.key, v)}
                readOnly={readOnly}
              />

              {status && status !== 'not_applicable' && (
                <div className="space-y-2 pt-1">
                  <input
                    type="text"
                    readOnly={readOnly}
                    value={person}
                    onChange={(e) => set(field.nameKey, e.target.value)}
                    placeholder="Person responsible / document holder"
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 read-only:bg-slate-50 read-only:cursor-default"
                  />
                  <input
                    type="text"
                    readOnly={readOnly}
                    value={notes}
                    onChange={(e) => set(field.notesKey, e.target.value)}
                    placeholder="Notes, document location, or gaps to resolve"
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 read-only:bg-slate-50 read-only:cursor-default"
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-sm">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-amber-800 text-xs leading-relaxed">
          This section helps organise information and identify gaps. It is not legal advice.
          If authority is unclear or contested, consult a qualified professional in your
          jurisdiction.
        </p>
      </div>
    </div>
  )
}
