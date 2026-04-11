import type {
  MemoryBookIdentity,
  MemoryBookContact,
  MemoryBookMedical,
  MemoryBookPreferences,
  MemoryBookProvider,
  MemoryBookInsurance,
  MemoryBookFinances,
  MemoryBookSubscription,
  MemoryBookVehicle,
  MemoryBookInsuranceEntry,
  MemoryBookFinanceEntry,
  MemoryBookMedicalEntry,
  MemoryBookPreferenceEntry,
} from "../../types/memory-book";
import { useLocale } from "../../i18n/LocaleContext";

type Props = {
  residentName: string;
  identity: MemoryBookIdentity | null | undefined;
  contacts: MemoryBookContact[];
  medical: MemoryBookMedical | null | undefined;
  preferences: MemoryBookPreferences | null | undefined;
  providers: MemoryBookProvider[];
  insurance: MemoryBookInsurance | null | undefined;
  finances: MemoryBookFinances | null | undefined;
  subscriptions: MemoryBookSubscription[];
  vehicles: MemoryBookVehicle[];
  insuranceEntries: MemoryBookInsuranceEntry[];
  financeEntries: MemoryBookFinanceEntry[];
  medicalEntries: MemoryBookMedicalEntry[];
  preferenceEntries: MemoryBookPreferenceEntry[];
  isOwner: boolean;
};

export default function PrintView({
  residentName,
  identity,
  contacts,
  medical,
  preferences,
  providers,
  insurance,
  finances,
  subscriptions,
  vehicles,
  insuranceEntries,
  financeEntries,
  medicalEntries,
  preferenceEntries,
  isOwner,
}: Props) {
  const { t } = useLocale();
  const displayName = identity?.preferred_name || residentName;

  return (
    <div id="print-view" className="hidden print:block font-sans text-slate-900 bg-white">
      <div className="print-page">
        <div className="mb-8 border-b-2 border-slate-200 pb-6">
          <h1 className="text-3xl font-bold text-slate-900">{t("memory_book.print_title")}</h1>
          <p className="text-lg text-slate-600 mt-1">{displayName}</p>
          <p className="text-xs text-slate-400 mt-2">{t("memory_book.print_confidential")}</p>
        </div>

        {identity && (
          <PrintSection title={t("memory_book.print_section_identity")}>
            <PrintGrid>
              <PrintField label={t("memory_book.field_preferred_name")} value={identity.preferred_name} />
              <PrintField label={t("memory_book.field_birthplace")} value={identity.birthplace} />
              <PrintField label={t("memory_book.field_address_pref")} value={identity.address_preference} />
              <PrintField label={t("memory_book.field_relationship_status")} value={identity.relationship_status} />
              <PrintField label={t("memory_book.field_cultural_prefs")} value={identity.cultural_preferences} />
              <PrintField label={t("memory_book.field_language_prefs")} value={identity.language_preferences} />
            </PrintGrid>
            {identity.about_me && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{t("memory_book.field_about_me")}</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{identity.about_me}</p>
              </div>
            )}
          </PrintSection>
        )}

        {contacts.length > 0 && (
          <PrintSection title={t("memory_book.print_section_contacts")}>
            <div className="space-y-3">
              {contacts.map(c => (
                <div key={c.id} className="flex gap-6 pb-3 border-b border-slate-100 last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">{c.full_name}</p>
                    <p className="text-xs text-slate-500">{[c.relationship, c.role_tag].filter(Boolean).join(" · ")}</p>
                  </div>
                  <div className="text-xs text-slate-600 text-right flex-shrink-0">
                    {c.phone && <p>{c.phone}</p>}
                    {c.email && <p>{c.email}</p>}
                  </div>
                </div>
              ))}
            </div>
          </PrintSection>
        )}

        {providers.length > 0 && (
          <PrintSection title={t("memory_book.print_section_providers")}>
            <div className="space-y-3">
              {providers.map(p => (
                <div key={p.id} className="flex gap-6 pb-3 border-b border-slate-100 last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">
                      {p.name}{p.is_primary ? ` (${t("memory_book.provider_primary_label")})` : ""}
                    </p>
                    <p className="text-xs text-slate-500">{[p.specialty_label, p.practice_name].filter(Boolean).join(" · ")}</p>
                    {p.address && <p className="text-xs text-slate-500 mt-0.5">{p.address}</p>}
                  </div>
                  <div className="text-xs text-slate-600 text-right flex-shrink-0">
                    {p.phone && <p>{p.phone}</p>}
                  </div>
                </div>
              ))}
            </div>
          </PrintSection>
        )}

        {(medical || medicalEntries.length > 0) && (
          <PrintSection title={t("memory_book.print_section_medical")}>
            {medicalEntries.length > 0 ? (
              <PrintEntryList entries={medicalEntries} />
            ) : medical ? (
              <PrintGrid>
                <PrintField label={t("memory_book.field_conditions")} value={medical.conditions} multiline />
                <PrintField label={t("memory_book.field_allergies")} value={medical.allergies} multiline />
                <PrintField label={t("memory_book.field_hearing")} value={medical.hearing_notes} />
                <PrintField label={t("memory_book.field_vision")} value={medical.vision_notes} />
                <PrintField label={t("memory_book.field_medications")} value={medical.medication_notes} multiline />
                <PrintField label={t("memory_book.field_other_medical")} value={medical.other_medical_notes} multiline />
              </PrintGrid>
            ) : null}
          </PrintSection>
        )}

        {(preferences || preferenceEntries.length > 0) && (
          <PrintSection title={t("memory_book.print_section_preferences")}>
            {preferenceEntries.length > 0 ? (
              <PrintEntryList entries={preferenceEntries} />
            ) : preferences ? (
              <PrintGrid>
                <PrintField label={t("memory_book.field_likes")} value={preferences.likes} multiline />
                <PrintField label={t("memory_book.field_dislikes")} value={preferences.dislikes} multiline />
                <PrintField label={t("memory_book.field_foods_liked")} value={preferences.foods_liked} />
                <PrintField label={t("memory_book.field_foods_disliked")} value={preferences.foods_disliked} />
                <PrintField label={t("memory_book.field_music")} value={preferences.music_preferences} />
                <PrintField label={t("memory_book.field_conversation")} value={preferences.conversation_topics} />
                <PrintField label={t("memory_book.field_comforts")} value={preferences.comforts} multiline />
                <PrintField label={t("memory_book.field_fears")} value={preferences.fears} />
                <PrintField label={t("memory_book.field_sensory")} value={preferences.sensory_preferences} />
                <PrintField label={t("memory_book.field_avoid")} value={preferences.things_to_avoid} multiline />
              </PrintGrid>
            ) : null}
          </PrintSection>
        )}

        {(insuranceEntries.length > 0 || insurance) && (
          <PrintSection title={t("memory_book.print_section_insurance")}>
            {insuranceEntries.length > 0 ? (
              <div className="space-y-3">
                {insuranceEntries.map(e => (
                  <div key={e.id} className="pb-3 border-b border-slate-100 last:border-0">
                    <p className="text-sm font-semibold text-slate-800">{e.label}</p>
                    {e.insurer && <p className="text-xs text-slate-600 mt-0.5">{e.insurer}{e.policy_number ? ` · ${e.policy_number}` : ""}</p>}
                    {e.member_id && <p className="text-xs text-slate-500">Member ID: {e.member_id}</p>}
                    {e.coverage_type && <p className="text-xs text-slate-500">{e.coverage_type}</p>}
                    {e.notes && <p className="text-xs text-slate-500 mt-0.5 italic">{e.notes}</p>}
                  </div>
                ))}
              </div>
            ) : insurance ? (
              <div className="space-y-4">
                <InsurancePrintBlock
                  heading={t("memory_book.insurance_primary_heading")}
                  insurer={insurance.primary_insurer}
                  plan={insurance.primary_plan}
                  memberId={insurance.primary_member_id}
                  coverageType={insurance.primary_coverage_type}
                  insurerLabel={t("memory_book.field_insurer")}
                  planLabel={t("memory_book.field_plan")}
                  memberIdLabel={t("memory_book.field_member_id")}
                  coverageLabel={t("memory_book.field_coverage_type")}
                />
                <InsurancePrintBlock
                  heading={t("memory_book.insurance_secondary_heading")}
                  insurer={insurance.secondary_insurer}
                  plan={insurance.secondary_plan}
                  memberId={insurance.secondary_member_id}
                  coverageType={insurance.secondary_coverage_type}
                  insurerLabel={t("memory_book.field_insurer")}
                  planLabel={t("memory_book.field_plan")}
                  memberIdLabel={t("memory_book.field_member_id")}
                  coverageLabel={t("memory_book.field_coverage_type")}
                />
                {(insurance.dental_vision_insurer || insurance.dental_vision_plan) && (
                  <InsurancePrintBlock
                    heading={t("memory_book.insurance_dental_vision_heading")}
                    insurer={insurance.dental_vision_insurer}
                    plan={insurance.dental_vision_plan}
                    memberId=""
                    coverageType=""
                    insurerLabel={t("memory_book.field_insurer")}
                    planLabel={t("memory_book.field_plan")}
                    memberIdLabel={t("memory_book.field_member_id")}
                    coverageLabel={t("memory_book.field_coverage_type")}
                  />
                )}
                {insurance.notes && (
                  <PrintField label={t("memory_book.field_notes")} value={insurance.notes} multiline />
                )}
              </div>
            ) : null}
          </PrintSection>
        )}

        {subscriptions.length > 0 && (
          <PrintSection title={t("memory_book.print_section_subscriptions")}>
            <div className="grid grid-cols-2 gap-2">
              {subscriptions.map(s => (
                <div key={s.id} className="text-sm">
                  <span className="font-medium text-slate-800">{s.name}</span>
                  {s.category && <span className="text-slate-500 ml-1.5 text-xs">({s.category})</span>}
                  {s.notes && <p className="text-xs text-slate-500 mt-0.5">{s.notes}</p>}
                </div>
              ))}
            </div>
          </PrintSection>
        )}

        {vehicles.length > 0 && (
          <PrintSection title={t("memory_book.print_section_vehicle")}>
            <div className="space-y-3">
              {vehicles.map(v => (
                <div key={v.id} className="flex gap-6 pb-3 border-b border-slate-100 last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">{v.make_model_year}</p>
                    {v.license_plate && <p className="text-xs font-mono text-slate-500">{v.license_plate}</p>}
                    {v.parking_location && <p className="text-xs text-slate-500 mt-0.5">{v.parking_location}</p>}
                    {v.service_provider && <p className="text-xs text-slate-500">{v.service_provider}</p>}
                  </div>
                  {v.registration_due && (
                    <div className="text-xs text-slate-600 text-right flex-shrink-0">
                      <p className="font-medium">{v.registration_due}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </PrintSection>
        )}

        {isOwner && (financeEntries.length > 0 || finances) && (
          <PrintSection title={t("memory_book.print_section_finances")}>
            {financeEntries.length > 0 ? (
              <PrintEntryList entries={financeEntries} />
            ) : finances ? (
              <PrintGrid>
                <PrintField label={t("memory_book.field_bank_name")} value={finances.bank_name} />
                <PrintField label={t("memory_book.field_income_sources")} value={finances.income_sources} multiline />
                <PrintField label={t("memory_book.field_auto_pay_bills")} value={finances.auto_pay_bills} multiline />
                <PrintField label={t("memory_book.field_investment_notes")} value={finances.investment_notes} multiline />
              </PrintGrid>
            ) : null}
          </PrintSection>
        )}

        <div className="mt-10 pt-4 border-t border-slate-200 text-xs text-slate-400 text-center">
          {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
          &nbsp;·&nbsp;CarerView
        </div>
      </div>
    </div>
  );
}

function PrintEntryList({ entries }: { entries: Array<{ id: string; label: string; company?: string; value?: string; notes?: string; category?: string }> }) {
  const grouped: Record<string, typeof entries> = {};
  entries.forEach(e => {
    const cat = e.category ?? "other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(e);
  });
  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat}>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 capitalize">{cat.replace(/_/g, " ")}</p>
          <div className="space-y-2">
            {items.map(e => (
              <div key={e.id} className="flex gap-4">
                <div className="min-w-0">
                  <span className="text-sm font-medium text-slate-800">{e.label}</span>
                  {e.company && (
                    <span className="text-xs text-slate-500 ml-2">{e.company}</span>
                  )}
                </div>
                {(e.value || e.notes) && (
                  <span className="text-sm text-slate-600 flex-1">{e.value}{e.value && e.notes ? " — " : ""}{e.notes}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PrintSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8 break-inside-avoid-page">
      <h2 className="text-base font-bold text-slate-800 border-b border-slate-200 pb-1.5 mb-4">{title}</h2>
      {children}
    </div>
  );
}

function PrintGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-3">
      {children}
    </div>
  );
}

function PrintField({ label, value, multiline }: { label: string; value?: string; multiline?: boolean }) {
  if (!value) return null;
  return (
    <div className={multiline ? "col-span-2" : ""}>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{value}</p>
    </div>
  );
}

function InsurancePrintBlock({
  heading,
  insurer,
  plan,
  memberId,
  coverageType,
  insurerLabel,
  planLabel,
  memberIdLabel,
  coverageLabel,
}: {
  heading: string;
  insurer: string;
  plan: string;
  memberId: string;
  coverageType: string;
  insurerLabel: string;
  planLabel: string;
  memberIdLabel: string;
  coverageLabel: string;
}) {
  if (!insurer && !plan && !memberId && !coverageType) return null;
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{heading}</p>
      <div className="grid grid-cols-2 gap-x-8 gap-y-2">
        {insurer && (
          <div>
            <p className="text-xs text-slate-400">{insurerLabel}</p>
            <p className="text-sm text-slate-700">{insurer}</p>
          </div>
        )}
        {plan && (
          <div>
            <p className="text-xs text-slate-400">{planLabel}</p>
            <p className="text-sm text-slate-700">{plan}</p>
          </div>
        )}
        {memberId && (
          <div>
            <p className="text-xs text-slate-400">{memberIdLabel}</p>
            <p className="text-sm text-slate-700">{memberId}</p>
          </div>
        )}
        {coverageType && (
          <div>
            <p className="text-xs text-slate-400">{coverageLabel}</p>
            <p className="text-sm text-slate-700">{coverageType}</p>
          </div>
        )}
      </div>
    </div>
  );
}
