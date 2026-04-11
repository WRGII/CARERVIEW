import { User, Users, Stethoscope, Heart, BookOpen, Crown, HeartHandshake, Chrome as Home, Printer } from "lucide-react";
import { Card, CardContent } from "../ui/Card";
import type { TeamMemberRole } from "../../types/memory-book";
import { useLocale } from "../../i18n/LocaleContext";

type Props = {
  patientName: string;
  patientDob: string | null;
  teamRole: TeamMemberRole | null;
  identityPreferredName: string | null;
  identityAboutMe: string | null;
  hasIdentity: boolean;
  hasContacts: boolean;
  hasMedical: boolean;
  hasPreferences: boolean;
  hasInsurance: boolean;
  hasSubscriptions: boolean;
  hasVehicles: boolean;
  contactCount: number;
  onNavigate: (tab: string) => void;
  onPrint: () => void;
  showPrint: boolean;
};

export default function OverviewTab({
  patientName,
  patientDob,
  teamRole,
  identityPreferredName,
  identityAboutMe,
  hasIdentity,
  hasContacts,
  hasMedical,
  hasPreferences,
  hasInsurance,
  hasSubscriptions,
  hasVehicles,
  contactCount,
  onNavigate,
  onPrint,
  showPrint,
}: Props) {
  const { t } = useLocale();
  const completedSections = [hasIdentity, hasContacts, hasMedical, hasPreferences].filter(Boolean).length;
  const totalSections = 4;

  const displayName = identityPreferredName || patientName;
  const age = patientDob ? calculateAge(patientDob) : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-100 to-slate-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-7 h-7 text-cyan-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-xl font-bold text-slate-800">{displayName}</h2>
                    {identityPreferredName && identityPreferredName !== patientName && (
                      <span className="text-sm text-slate-500">({patientName})</span>
                    )}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 text-xs font-medium text-cyan-700">
                      <User className="w-3 h-3" />
                      {t("memory_book.role_resident")}
                    </span>
                  </div>
                  {teamRole && (
                    <p className="text-xs text-slate-400 mt-1">
                      {t("memory_book.viewing_as")}{" "}
                      <span className="font-medium text-slate-500">
                        <ViewerRoleBadge role={teamRole} ownerLabel={t("memory_book.role_owner")} memberLabel={t("memory_book.role_member")} />
                      </span>
                    </p>
                  )}
                  {age && (
                    <p className="text-sm text-slate-500 mt-1">{t("memory_book.overview_age", { age })}</p>
                  )}
                  {identityAboutMe && (
                    <p className="text-sm text-slate-600 mt-3 leading-relaxed line-clamp-3">
                      {identityAboutMe}
                    </p>
                  )}
                  {!identityAboutMe && (
                    <p className="text-sm text-slate-400 mt-3 italic">
                      {t("memory_book.overview_no_summary")}
                      {teamRole === "owner" && t("memory_book.overview_no_summary_owner_hint")}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <SectionCard
              icon={<User className="w-5 h-5" />}
              label={t("memory_book.section_identity")}
              complete={hasIdentity}
              notStartedLabel={t("memory_book.overview_not_started")}
              onClick={() => onNavigate("memory-book")}
            />
            <SectionCard
              icon={<Users className="w-5 h-5" />}
              label={t("memory_book.section_contacts")}
              complete={hasContacts}
              count={contactCount}
              notStartedLabel={t("memory_book.overview_not_started")}
              recordsOneLabel={t("memory_book.overview_records_one")}
              recordsManyLabel={t("memory_book.overview_records_many")}
              onClick={() => onNavigate("memory-book")}
            />
            <SectionCard
              icon={<Stethoscope className="w-5 h-5" />}
              label={t("memory_book.section_medical")}
              complete={hasMedical}
              notStartedLabel={t("memory_book.overview_not_started")}
              onClick={() => onNavigate("memory-book")}
            />
            <SectionCard
              icon={<Heart className="w-5 h-5" />}
              label={t("memory_book.section_preferences")}
              complete={hasPreferences}
              notStartedLabel={t("memory_book.overview_not_started")}
              onClick={() => onNavigate("memory-book")}
            />
            <SectionCard
              icon={<Home className="w-5 h-5" />}
              label={t("memory_book.tab_household")}
              complete={hasInsurance || hasSubscriptions || hasVehicles}
              notStartedLabel={t("memory_book.overview_not_started")}
              onClick={() => onNavigate("memory-book")}
            />
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-700">{t("memory_book.overview_progress_title")}</h3>
                <span className="text-xs text-slate-500">{t("memory_book.overview_sections_count", { completed: completedSections, total: totalSections })}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-cyan-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(completedSections / totalSections) * 100}%` }}
                />
              </div>
              <div className="mt-4 space-y-2">
                {[
                  { label: t("memory_book.section_identity"), done: hasIdentity },
                  { label: t("memory_book.section_contacts"), done: hasContacts },
                  { label: t("memory_book.section_medical"), done: hasMedical },
                  { label: t("memory_book.section_preferences"), done: hasPreferences },
                ].map(({ label, done }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <div
                      className={[
                        "w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0",
                        done ? "bg-emerald-100" : "bg-slate-100",
                      ].join(" ")}
                    >
                      {done && (
                        <svg className="w-2.5 h-2.5 text-emerald-600" fill="currentColor" viewBox="0 0 12 12">
                          <path d="M10 3L5 8 2 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span className={["text-xs", done ? "text-slate-700" : "text-slate-400"].join(" ")}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-start gap-3">
                <BookOpen className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-1">{t("memory_book.overview_coming_title")}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {t("memory_book.overview_coming_desc")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {showPrint && (
            <button
              onClick={onPrint}
              className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 transition-colors text-left group"
            >
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-cyan-50 transition-colors flex-shrink-0">
                <Printer className="w-4 h-4 text-slate-500 group-hover:text-cyan-600 transition-colors" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 group-hover:text-cyan-700">{t("memory_book.print_btn")}</p>
                <p className="text-xs text-slate-400 mt-0.5">{t("memory_book.print_subtitle")}</p>
              </div>
            </button>
          )}

          {teamRole === "owner" && completedSections < totalSections && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs font-medium text-amber-800 mb-1">{t("memory_book.overview_incomplete_title")}</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                {totalSections - completedSections === 1
                  ? t("memory_book.overview_incomplete_desc_one")
                  : t("memory_book.overview_incomplete_desc_many", { count: totalSections - completedSections })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ViewerRoleBadge({ role, ownerLabel, memberLabel }: { role: TeamMemberRole | null; ownerLabel: string; memberLabel: string }) {
  if (!role) return null;
  if (role === "owner") {
    return (
      <span className="inline-flex items-center gap-1">
        <Crown className="w-3 h-3 text-amber-500" />
        {ownerLabel}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1">
      <HeartHandshake className="w-3 h-3 text-slate-400" />
      {memberLabel}
    </span>
  );
}

function SectionCard({
  icon,
  label,
  complete,
  count,
  notStartedLabel,
  recordsOneLabel,
  recordsManyLabel,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  complete: boolean;
  count?: number;
  notStartedLabel: string;
  recordsOneLabel?: string;
  recordsManyLabel?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 bg-white hover:border-cyan-300 hover:bg-cyan-50 transition-colors text-center group"
    >
      <div
        className={[
          "w-10 h-10 rounded-full flex items-center justify-center",
          complete ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400",
        ].join(" ")}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-slate-700 group-hover:text-cyan-700">{label}</p>
        {typeof count === "number" && count > 0 && (
          <p className="text-xs text-slate-400">
            {count === 1
              ? (recordsOneLabel ?? `1 record`)
              : (recordsManyLabel ? recordsManyLabel.replace("{count}", String(count)) : `${count} records`)}
          </p>
        )}
        {!complete && (
          <p className="text-xs text-slate-400">{notStartedLabel}</p>
        )}
      </div>
    </button>
  );
}

function calculateAge(dob: string): number | null {
  try {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age > 0 ? age : null;
  } catch {
    return null;
  }
}
