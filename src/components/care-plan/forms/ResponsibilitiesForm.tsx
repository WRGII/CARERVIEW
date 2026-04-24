import type { SectionFormProps } from '../SectionFormModal'

type RespStatus = 'assigned' | 'unclear' | 'gap'

const RESPONSIBILITY_AREAS: { key: string; label: string; description: string }[] = [
  {
    key: 'household',
    label: 'Household support',
    description: 'Meals, cleaning, shopping, home maintenance, and daily domestic tasks.',
  },
  {
    key: 'personal_care',
    label: 'Personal care and mobility',
    description: 'Bathing, dressing, continence care, mobility assistance, and physical safety.',
  },
  {
    key: 'emotional',
    label: 'Emotional support',
    description: 'Companionship, conversation, checking in, and reducing isolation.',
  },
  {
    key: 'health',
    label: 'Health and medical coordination',
    description: 'Appointments, medications, test results, provider communication, and care notes.',
  },
  {
    key: 'scheduling',
    label: 'Appointments and transport',
    description: 'Coordinating between family members, managing appointments and transport.',
  },
  {
    key: 'admin',
    label: 'Financial and administrative tasks',
    description: 'Bills, accounts, benefits, documents, and any legal authority arrangements.',
  },
  {
    key: 'respite',
    label: 'Backup and respite coverage',
    description: 'Covering for the primary carer, providing breaks, and being available in an emergency.',
  },
]

const STATUS_OPTS: { value: RespStatus; label: string; active: string }[] = [
  { value: 'assigned', label: 'Assigned', active: 'bg-emerald-600 text-white border-emerald-600' },
  { value: 'unclear', label: 'Unclear', active: 'bg-amber-500 text-white border-amber-500' },
  { value: 'gap', label: 'Gap', active: 'bg-red-500 text-white border-red-500' },
]

export default function ResponsibilitiesForm({ data, onChange, readOnly }: SectionFormProps) {
  function setAreaField(areaKey: string, field: string, value: string) {
    const existing = (data[areaKey] as Record<string, string>) ?? {}
    onChange({ ...data, [areaKey]: { ...existing, [field]: value } })
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-4 border border-slate-100">
        Map who owns each responsibility area. The key question is not &ldquo;who cares most&rdquo; —
        it is &ldquo;who owns which responsibility.&rdquo; For each area, note a responsible person,
        a backup, and any gaps.
      </div>

      {RESPONSIBILITY_AREAS.map((area) => {
        const areaData = (data[area.key] as Record<string, string>) ?? {}
        const status = (areaData.status as RespStatus) | undefined

        return (
          <div key={area.key} className="border border-slate-200 rounded-xl p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-0.5">{area.label}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{area.description}</p>
            </div>

            {/* Status */}
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

            {/* Person and backup */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                readOnly={readOnly}
                value={areaData.person ?? ''}
                onChange={(e) => setAreaField(area.key, 'person', e.target.value)}
                placeholder="Responsible person"
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 read-only:bg-slate-50 read-only:cursor-default"
              />
              <input
                type="text"
                readOnly={readOnly}
                value={areaData.backup ?? ''}
                onChange={(e) => setAreaField(area.key, 'backup', e.target.value)}
                placeholder="Backup person"
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 read-only:bg-slate-50 read-only:cursor-default"
              />
            </div>

            <input
              type="text"
              readOnly={readOnly}
              value={areaData.notes ?? ''}
              onChange={(e) => setAreaField(area.key, 'notes', e.target.value)}
              placeholder="Notes or gaps to resolve"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 read-only:bg-slate-50 read-only:cursor-default"
            />
          </div>
        )
      })}
    </div>
  )
}
