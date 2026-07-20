import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Printer, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2, Circle, Clock, ClipboardList, ExternalLink } from 'lucide-react'
import { useActiveTeam } from '../../context/ActiveTeam'
import { useAuth } from '../../hooks/useAuth'
import { useTeamResident } from '../../hooks/useMemoryBook'
import {
  useCarePlan,
  useCarePlanSections,
  getSectionByKey,
  getSectionLabels,
  SECTION_KEYS,
  type SectionKey,
  type CarePlanSection,
} from '../../hooks/useCarePlan'
import { detectGaps, type GapItem } from '../../lib/carePlanGaps'
import PageSEO from '../../components/seo/PageSEO'
import Breadcrumbs from '../../components/common/Breadcrumbs'
import { useLocale } from '../../i18n/LocaleContext'

// ── Section summary blocks ────────────────────────────────────────────────────

function SectionStatus({ section, t }: { section: CarePlanSection | undefined; t: (k: string) => string }) {
  const status = section?.completion_status ?? 'not_started'
  if (status === 'complete')
    return <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700"><CheckCircle2 className="w-3.5 h-3.5" />{t('care_plan.status_complete')}</span>
  if (status === 'in_progress')
    return <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600"><Clock className="w-3.5 h-3.5" />{t('care_plan.status_in_progress')}</span>
  return <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400"><Circle className="w-3.5 h-3.5" />{t('care_plan.status_not_started')}</span>
}

function SectionBlock({ label, section, t, children }: { label: string; section: CarePlanSection | undefined; t: (k: string) => string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900">{label}</h2>
        <SectionStatus section={section} t={t} />
      </div>
      {children}
    </div>
  )
}

function TextRow({ label, value, emptyLabel }: { label: string; value: string | undefined; emptyLabel: string }) {
  if (!value) return (
    <div className="text-xs text-slate-400 italic">— {emptyLabel}</div>
  )
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 mb-0.5">{label}</p>
      <p className="text-sm text-slate-800 leading-relaxed">{value}</p>
    </div>
  )
}

function TagList({ label, values }: { label: string; values: string[] }) {
  if (!values || values.length === 0) return null
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {values.map((v) => (
          <span key={v} className="px-2.5 py-1 bg-blue-50 text-blue-800 text-xs font-medium rounded-full border border-blue-100">
            {v}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function CarePlanSummaryPage() {
  const { t } = useLocale()
  const { teamId } = useActiveTeam()
  const { user } = useAuth()
  const { data: resident } = useTeamResident(teamId)
  const { data: carePlan, isLoading: planLoading } = useCarePlan(teamId)
  const { data: sections = [], isLoading: sectionsLoading } = useCarePlanSections(carePlan?.id)
  const printRef = useRef<HTMLDivElement>(null)

  const isLoading = planLoading || sectionsLoading
  const gaps = detectGaps(sections, t)
  const completedCount = sections.filter((s) => s.completion_status === 'complete').length
  const sectionLabels = getSectionLabels(t)

  if (!teamId) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 text-center">
        <div>
          <p className="text-slate-500 mb-4">{t('care_plan.no_team_title')}</p>
          <Link to="/caregiver" className="text-sm font-semibold text-blue-600 hover:underline">{t('care_plan.go_to_dashboard')}</Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <PageSEO
        title="Care Plan Summary — Care Hub"
        description="A compiled summary of your care team's Care Plan."
        canonical="/care-hub/care-plan/summary"
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20 print:bg-white">
        {/* ── Header (no-print) ── */}
        <div className="bg-white border-b border-slate-200 print:hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Breadcrumbs
              homeTo="/caregiver"
              homeLabel={t('caregiver.dashboard_title')}
              items={[
                { label: t('care_plan.title'), to: '/care-hub/care-plan' },
                { label: t('care_plan.summary_breadcrumb') },
              ]}
            />

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 mb-1">{t('care_plan.summary_title')}</h1>
                {resident && (
                  <p className="text-sm text-slate-500">
                    {t('care_plan.summary_for_resident', {
                      name: resident.full_name ?? t('care_plan.resident_fallback'),
                      completed: completedCount,
                      total: SECTION_KEYS.length,
                    })}
                  </p>
                )}
              </div>
              <button
                onClick={() => window.print()}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <Printer className="w-4 h-4" />
                {t('care_plan.print')}
              </button>
            </div>
          </div>
        </div>

        {/* ── Print header ── */}
        <div className="hidden print:block max-w-4xl mx-auto px-8 pt-8 pb-4">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">{t('care_plan.summary_title')}</h1>
          <p className="text-sm text-slate-500">{t('care_plan.generated_on', { date: new Date().toLocaleDateString() })}</p>
          <hr className="mt-4 border-slate-200" />
        </div>

        {/* ── Body ── */}
        <div ref={printRef} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 print:px-8">

          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]" />
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]" />
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" />
              </div>
            </div>
          )}

          {!isLoading && (
            <>
              {/* ── Gaps ── */}
              {gaps.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <h2 className="text-base font-bold text-amber-900">
                      {t('care_plan.gaps_identified', { count: gaps.length, plural: gaps.length !== 1 ? 's' : '' })}
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {gaps.map((gap: GapItem, i) => (
                      <div key={i} className={`bg-white rounded-xl border p-4 ${
                        gap.severity === 'critical' ? 'border-red-200' : gap.severity === 'important' ? 'border-amber-200' : 'border-slate-200'
                      }`}>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${
                            gap.severity === 'critical' ? 'bg-red-500' : gap.severity === 'important' ? 'bg-amber-500' : 'bg-slate-400'
                          }`} />
                          <p className={`text-sm font-semibold ${
                            gap.severity === 'critical' ? 'text-red-900' : 'text-amber-900'
                          }`}>{gap.label}</p>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed pl-4">{gap.action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {gaps.length === 0 && completedCount === SECTION_KEYS.length && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <p className="text-sm font-semibold text-emerald-900">
                    {t('care_plan.all_complete_no_gaps')}
                  </p>
                </div>
              )}

              {/* ── Section 1: Situation ── */}
              {(() => {
                const s = getSectionByKey(sections, 'situation')
                const d = (s?.content_json ?? {}) as Record<string, string | string[]>
                return (
                  <SectionBlock label={sectionLabels.situation} section={s} t={t}>
                    <TextRow label={t('care_plan.situation_current')} value={d.current_situation as string} emptyLabel={t('care_plan.not_filled_in')} />
                    <TextRow label={t('care_plan.situation_trigger')} value={d.trigger as string} emptyLabel={t('care_plan.not_filled_in')} />
                    <TagList label={t('care_plan.situation_concerns')} values={(d.concerns as string[]) ?? []} />
                    <TextRow label={t('care_plan.situation_anticipated')} value={d.anticipated_changes as string} emptyLabel={t('care_plan.not_filled_in')} />
                    <TextRow label={t('care_plan.situation_urgent')} value={d.urgent_decisions as string} emptyLabel={t('care_plan.not_filled_in')} />
                  </SectionBlock>
                )
              })()}

              {/* ── Section 2: Authority ── */}
              {(() => {
                const s = getSectionByKey(sections, 'authority')
                const d = (s?.content_json ?? {}) as Record<string, string>
                const authFields = [
                  { key: 'health_decisions', label: t('care_plan.auth_health'), personKey: 'health_decision_person' },
                  { key: 'financial_authority', label: t('care_plan.auth_financial'), personKey: 'financial_authority_person' },
                  { key: 'legal_documents', label: t('care_plan.auth_legal'), personKey: 'legal_documents_person' },
                  { key: 'care_preferences_documented', label: t('care_plan.auth_preferences'), personKey: 'care_preferences_person' },
                  { key: 'document_location', label: t('care_plan.auth_records'), personKey: 'document_location_person' },
                  { key: 'emergency_access', label: t('care_plan.auth_emergency'), personKey: 'emergency_access_person' },
                ]
                const statusStyle: Record<string, string> = {
                  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                  unclear: 'bg-amber-50 text-amber-700 border-amber-100',
                  missing: 'bg-red-50 text-red-700 border-red-100',
                  not_applicable: 'bg-slate-50 text-slate-500 border-slate-100',
                }
                return (
                  <SectionBlock label={sectionLabels.authority} section={s} t={t}>
                    <div className="space-y-2">
                      {authFields.map((f) => {
                        const status = d[f.key]
                        const person = d[f.personKey]
                        if (!status) return null
                        return (
                          <div key={f.key} className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm ${statusStyle[status] ?? 'bg-slate-50 text-slate-700 border-slate-100'}`}>
                            <span className="font-medium">{f.label}</span>
                            <div className="flex items-center gap-3 text-xs">
                              {person && <span className="text-slate-500">{person}</span>}
                              <span className="font-semibold capitalize">{status.replace('_', ' ')}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </SectionBlock>
                )
              })()}

              {/* ── Section 3: Responsibilities ── */}
              {(() => {
                const s = getSectionByKey(sections, 'responsibilities')
                const d = (s?.content_json ?? {}) as Record<string, Record<string, string>>
                const areas = [
                  { key: 'household', label: t('care_plan.resp_household') },
                  { key: 'personal_care', label: t('care_plan.resp_personal_care') },
                  { key: 'emotional', label: t('care_plan.resp_emotional') },
                  { key: 'health', label: t('care_plan.resp_health') },
                  { key: 'scheduling', label: t('care_plan.resp_scheduling') },
                  { key: 'admin', label: t('care_plan.resp_admin') },
                  { key: 'respite', label: t('care_plan.resp_respite') },
                ]
                const statusStyle: Record<string, string> = {
                  assigned: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                  unclear: 'bg-amber-50 text-amber-700 border-amber-100',
                  gap: 'bg-red-50 text-red-700 border-red-100',
                }
                return (
                  <SectionBlock label={sectionLabels.responsibilities} section={s} t={t}>
                    <div className="space-y-2">
                      {areas.map((a) => {
                        const areaData = d[a.key]
                        if (!areaData) return (
                          <div key={a.key} className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-sm">
                            <span className="font-medium text-slate-700">{a.label}</span>
                            <span className="text-xs text-slate-400 italic">{t('care_plan.not_filled_in')}</span>
                          </div>
                        )
                        return (
                          <div key={a.key} className={`px-4 py-2.5 rounded-xl border text-sm ${statusStyle[areaData.status] ?? 'bg-slate-50 text-slate-700 border-slate-100'}`}>
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="font-medium">{a.label}</span>
                              {areaData.status && <span className="text-xs font-semibold capitalize">{areaData.status}</span>}
                            </div>
                            <div className="flex gap-4 text-xs opacity-80">
                              {areaData.person && <span>{t('care_plan.owner_label')}: {areaData.person}</span>}
                              {areaData.backup && <span>{t('care_plan.backup_label')}: {areaData.backup}</span>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </SectionBlock>
                )
              })()}

              {/* ── Section 4: Living Arrangement ── */}
              {(() => {
                const s = getSectionByKey(sections, 'living_arrangement')
                const d = (s?.content_json ?? {}) as Record<string, string | string[]>
                const arrangementLabels: Record<string, string> = {
                  resident_home: t('care_plan.living_resident_home'),
                  family_home: t('care_plan.living_family_home'),
                  paid_in_home: t('care_plan.living_paid_in_home'),
                  assisted_living: t('care_plan.living_assisted'),
                  undecided: t('care_plan.living_undecided'),
                }
                return (
                  <SectionBlock label={sectionLabels.living_arrangement} section={s} t={t}>
                    {d.current_arrangement && (
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-slate-500">{t('care_plan.living_arrangement_label')}</span>
                        <span className="px-3 py-1 bg-blue-50 text-blue-800 text-xs font-medium rounded-full border border-blue-100">
                          {arrangementLabels[d.current_arrangement as string] ?? String(d.current_arrangement)}
                        </span>
                        {d.currently_working && (
                          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${
                            d.currently_working === 'Yes' ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : d.currently_working === 'Struggling' || d.currently_working === 'No' ? 'bg-red-50 text-red-700 border-red-100'
                            : 'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {t('care_plan.living_working_label')}: {d.currently_working as string}
                          </span>
                        )}
                      </div>
                    )}
                    <TextRow label={t('care_plan.living_safety')} value={d.safety_concerns as string} emptyLabel={t('care_plan.not_filled_in')} />
                    <TextRow label={t('care_plan.living_alternatives')} value={d.alternatives_considered as string} emptyLabel={t('care_plan.not_filled_in')} />
                    <TagList label={t('care_plan.living_triggers')} values={(d.change_triggers as string[]) ?? []} />
                    <TextRow label={t('care_plan.living_constraints')} value={d.constraints as string} emptyLabel={t('care_plan.not_filled_in')} />
                  </SectionBlock>
                )
              })()}

              {/* ── Section 5: Sustainability ── */}
              {(() => {
                const s = getSectionByKey(sections, 'sustainability')
                const d = (s?.content_json ?? {}) as Record<string, string | string[]>
                return (
                  <SectionBlock label={sectionLabels.sustainability} section={s} t={t}>
                    {d.primary_caregiver && (
                      <TextRow label={t('care_plan.sust_primary')} value={d.primary_caregiver as string} emptyLabel={t('care_plan.not_filled_in')} />
                    )}
                    <div className="flex flex-wrap gap-4 text-sm">
                      {d.available_hours && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 mb-0.5">{t('care_plan.sust_hours')}</p>
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">{d.available_hours as string}</span>
                        </div>
                      )}
                      {d.stress_level && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 mb-0.5">{t('care_plan.sust_stress_level')}</p>
                          <span className={`px-2.5 py-1 text-xs rounded-full ${
                            d.stress_level === 'High' || d.stress_level === 'Very high' ? 'bg-red-50 text-red-700'
                            : d.stress_level === 'Moderate' ? 'bg-amber-50 text-amber-700'
                            : 'bg-emerald-50 text-emerald-700'
                          }`}>{d.stress_level as string}</span>
                        </div>
                      )}
                    </div>
                    <TagList label={t('care_plan.sust_stress_factors')} values={(d.stress_factors as string[]) ?? []} />
                    {d.backup_person && <TextRow label={t('care_plan.sust_backup')} value={d.backup_person as string} emptyLabel={t('care_plan.not_filled_in')} />}
                    {d.respite_plan && <TextRow label={t('care_plan.sust_respite')} value={d.respite_plan as string} emptyLabel={t('care_plan.not_filled_in')} />}
                    {d.sustainability_threshold && <TextRow label={t('care_plan.sust_threshold')} value={d.sustainability_threshold as string} emptyLabel={t('care_plan.not_filled_in')} />}
                  </SectionBlock>
                )
              })()}

              {/* ── Section 6: Review ── */}
              {(() => {
                const s = getSectionByKey(sections, 'review')
                const d = (s?.content_json ?? {}) as Record<string, string | string[]>
                return (
                  <SectionBlock label={sectionLabels.review} section={s} t={t}>
                    <div className="flex flex-wrap gap-4">
                      {d.review_frequency && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 mb-0.5">{t('care_plan.review_frequency_label')}</p>
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-800 text-xs font-medium rounded-full border border-blue-100">{d.review_frequency as string}</span>
                        </div>
                      )}
                      {d.next_review_date && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 mb-0.5">{t('care_plan.review_next_date_label')}</p>
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-800 text-xs font-medium rounded-full border border-blue-100">{new Date(d.next_review_date as string).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    {d.review_owner && <TextRow label={t('care_plan.review_owner_label')} value={d.review_owner as string} emptyLabel={t('care_plan.not_filled_in')} />}
                    <TagList label={t('care_plan.review_triggers_label')} values={(d.review_triggers as string[]) ?? []} />
                    {d.decisions_to_revisit && <TextRow label={t('care_plan.review_decisions_label')} value={d.decisions_to_revisit as string} emptyLabel={t('care_plan.not_filled_in')} />}
                  </SectionBlock>
                )
              })()}

              {/* ── Actions ── */}
              <div className="flex flex-wrap gap-3 print:hidden">
                <Link
                  to="/care-hub/care-plan"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <ClipboardList className="w-4 h-4" />
                  {t('care_plan.edit_care_plan')}
                </Link>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  {t('care_plan.print_summary')}
                </button>
                <Link
                  to="/caregiver/memory-schedule"
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t('care_plan.open_memory_book')}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
