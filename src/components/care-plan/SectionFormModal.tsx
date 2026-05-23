import { useEffect, useRef, useState } from 'react'
import { X, ChevronLeft, ChevronRight, Save, CircleCheck as CheckCircle2, Lock, CircleAlert as AlertCircle } from 'lucide-react'
import {
  useUpsertCarePlanSection,
  SECTION_KEYS,
  SECTION_LABELS,
  SECTION_SUBTITLES,
  type SectionKey,
  type CarePlan,
  type CarePlanSection,
  type CompletionStatus,
} from '../../hooks/useCarePlan'
import SituationForm from './forms/SituationForm'
import AuthorityForm from './forms/AuthorityForm'
import ResponsibilitiesForm from './forms/ResponsibilitiesForm'
import LivingArrangementForm from './forms/LivingArrangementForm'
import SustainabilityForm from './forms/SustainabilityForm'
import ReviewForm from './forms/ReviewForm'

interface Props {
  sectionKey: SectionKey
  carePlan: CarePlan
  section: CarePlanSection | undefined
  isOwner: boolean
  onClose: () => void
  onNavigate: (key: SectionKey) => void
}

const FORM_COMPONENTS: Record<SectionKey, React.ComponentType<SectionFormProps>> = {
  situation: SituationForm,
  authority: AuthorityForm,
  responsibilities: ResponsibilitiesForm,
  living_arrangement: LivingArrangementForm,
  sustainability: SustainabilityForm,
  review: ReviewForm,
}

export interface SectionFormProps {
  data: Record<string, unknown>
  onChange: (data: Record<string, unknown>) => void
  isOwner: boolean
  readOnly: boolean
}

export default function SectionFormModal({
  sectionKey,
  carePlan,
  section,
  isOwner,
  onClose,
  onNavigate,
}: Props) {
  const upsert = useUpsertCarePlanSection()
  const overlayRef = useRef<HTMLDivElement>(null)

  const initialData = (section?.content_json ?? {}) as Record<string, unknown>
  const [formData, setFormData] = useState<Record<string, unknown>>(initialData)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  // Reset form data when section changes
  useEffect(() => {
    setFormData((section?.content_json ?? {}) as Record<string, unknown>)
    setSaved(false)
    setSaveError(null)
    setIsDirty(false)
  }, [sectionKey, section?.content_json])

  function handleFormChange(data: Record<string, unknown>) {
    setFormData(data)
    setIsDirty(true)
    setSaveError(null)
  }

  function handleClose() {
    if (isDirty && isOwner) {
      if (!window.confirm('You have unsaved changes. Leave without saving?')) return
    }
    onClose()
  }

  function handleNavigate(key: SectionKey) {
    if (isDirty && isOwner) {
      if (!window.confirm('You have unsaved changes. Leave without saving?')) return
    }
    onNavigate(key)
  }

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose, isDirty, isOwner])

  const currentIndex = SECTION_KEYS.indexOf(sectionKey)
  const prevKey = currentIndex > 0 ? SECTION_KEYS[currentIndex - 1] : null
  const nextKey = currentIndex < SECTION_KEYS.length - 1 ? SECTION_KEYS[currentIndex + 1] : null

  // Minimum fields required per section before auto-detecting as 'complete'
  const SECTION_REQUIRED_KEYS: Partial<Record<SectionKey, string[]>> = {
    sustainability: ['stress_level', 'backup_person'],
  }

  function isFilled(v: unknown): boolean {
    return v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)
  }

  function detectCompletionStatus(key: SectionKey, data: Record<string, unknown>): CompletionStatus {
    const allValues = Object.values(data)
    const anyFilled = allValues.some(isFilled)
    if (!anyFilled) return 'not_started'

    // Check section-specific required fields first
    const requiredKeys = SECTION_REQUIRED_KEYS[key]
    if (requiredKeys) {
      const allRequiredFilled = requiredKeys.every((k) => isFilled(data[k]))
      if (!allRequiredFilled) return 'in_progress'
    }

    // General heuristic: 80% of fields filled
    const keys = Object.keys(data)
    const filledCount = keys.filter((k) => isFilled(data[k])).length
    if (filledCount >= Math.ceil(keys.length * 0.8)) return 'complete'
    return 'in_progress'
  }

  async function handleSave(markComplete = false) {
    if (!isOwner) return
    setSaving(true)
    setSaveError(null)
    try {
      const status: CompletionStatus = markComplete
        ? 'complete'
        : detectCompletionStatus(sectionKey, formData)
      await upsert.mutateAsync({
        carePlanId: carePlan.id,
        sectionKey,
        contentJson: formData,
        completionStatus: status,
      })
      setSaved(true)
      setIsDirty(false)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setSaveError('Save failed. Please check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }

  const FormComponent = FORM_COMPONENTS[sectionKey]

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={(e) => {
        if (e.target === overlayRef.current) handleClose()
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" aria-hidden />

      {/* Panel */}
      <div className="relative w-full sm:max-w-2xl sm:mx-4 bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh]">

        {/* Header */}
        <div className="flex items-start gap-4 px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Section {currentIndex + 1} of {SECTION_KEYS.length}
              </p>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">
              {SECTION_LABELS[sectionKey]}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">{SECTION_SUBTITLES[sectionKey]}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0 -mt-1 -mr-1"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Read-only notice */}
        {!isOwner && (
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2 text-sm text-slate-500 shrink-0">
            <Lock className="w-4 h-4 shrink-0" />
            <span>You can view this section but only the team owner can make changes.</span>
          </div>
        )}

        {/* Save error */}
        {saveError && (
          <div className="px-6 py-3 bg-red-50 border-b border-red-100 flex items-center gap-2 text-sm text-red-700 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {saveError}
          </div>
        )}

        {/* Form body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <FormComponent
            data={formData}
            onChange={handleFormChange}
            isOwner={isOwner}
            readOnly={!isOwner}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0 bg-white">
          {/* Prev */}
          <button
            onClick={() => prevKey && handleNavigate(prevKey)}
            disabled={!prevKey}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {prevKey ? SECTION_LABELS[prevKey] : 'Back'}
          </button>

          {/* Save + Next */}
          <div className="flex items-center gap-2">
            {isOwner && (
              <>
                <button
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  {saved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving…' : 'Save'}
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleSave(true)}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark complete
                </button>
              </>
            )}

            {nextKey && (
              <button
                onClick={() => handleNavigate(nextKey)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors ml-1"
              >
                {SECTION_LABELS[nextKey]}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
