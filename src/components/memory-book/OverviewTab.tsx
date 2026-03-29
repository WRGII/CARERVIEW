import { User, Users, Stethoscope, Heart, BookOpen, Crown, Shield } from "lucide-react";
import { Card, CardContent } from "../ui/Card";
import type { TeamMemberRole } from "../../types/memory-book";

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
  contactCount: number;
  onNavigate: (tab: string) => void;
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
  contactCount,
  onNavigate,
}: Props) {
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
                    <RoleBadge role={teamRole} />
                  </div>
                  {age && (
                    <p className="text-sm text-slate-500 mt-1">Age {age}</p>
                  )}
                  {identityAboutMe && (
                    <p className="text-sm text-slate-600 mt-3 leading-relaxed line-clamp-3">
                      {identityAboutMe}
                    </p>
                  )}
                  {!identityAboutMe && (
                    <p className="text-sm text-slate-400 mt-3 italic">
                      No personal summary added yet.
                      {teamRole === "owner" && " Add one in the Memory Book tab."}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SectionCard
              icon={<User className="w-5 h-5" />}
              label="Identity"
              complete={hasIdentity}
              onClick={() => onNavigate("memory-book")}
            />
            <SectionCard
              icon={<Users className="w-5 h-5" />}
              label="Contacts"
              complete={hasContacts}
              count={contactCount}
              onClick={() => onNavigate("memory-book")}
            />
            <SectionCard
              icon={<Stethoscope className="w-5 h-5" />}
              label="Medical"
              complete={hasMedical}
              onClick={() => onNavigate("memory-book")}
            />
            <SectionCard
              icon={<Heart className="w-5 h-5" />}
              label="Preferences"
              complete={hasPreferences}
              onClick={() => onNavigate("memory-book")}
            />
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-700">Memory Book Progress</h3>
                <span className="text-xs text-slate-500">{completedSections}/{totalSections} sections</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-cyan-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(completedSections / totalSections) * 100}%` }}
                />
              </div>
              <div className="mt-4 space-y-2">
                {[
                  { label: "Identity", done: hasIdentity },
                  { label: "Contacts", done: hasContacts },
                  { label: "Medical", done: hasMedical },
                  { label: "Preferences", done: hasPreferences },
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
                  <h3 className="text-sm font-semibold text-slate-700 mb-1">Coming in Phase 2</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Daily Living, Activities, Meals, Behavior &amp; Safety, Journal, and Change Log will be available after Phase 2.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {teamRole === "owner" && completedSections < totalSections && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs font-medium text-amber-800 mb-1">Memory Book Incomplete</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                {totalSections - completedSections} section{totalSections - completedSections !== 1 ? "s" : ""} still need to be filled in to give caregivers a complete picture.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: TeamMemberRole | null }) {
  if (!role) return null;
  if (role === "owner") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-medium text-amber-700">
        <Crown className="w-3 h-3" />
        Owner
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600">
      <Shield className="w-3 h-3" />
      Member
    </span>
  );
}

function SectionCard({
  icon,
  label,
  complete,
  count,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  complete: boolean;
  count?: number;
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
          <p className="text-xs text-slate-400">{count} record{count !== 1 ? "s" : ""}</p>
        )}
        {!complete && (
          <p className="text-xs text-slate-400">Not started</p>
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
