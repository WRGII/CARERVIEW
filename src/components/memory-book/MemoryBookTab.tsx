import { useState } from "react";
import { User, Users, Stethoscope, Heart } from "lucide-react";
import IdentitySection from "./IdentitySection";
import ContactsSection from "./ContactsSection";
import MedicalSection from "./MedicalSection";
import PreferencesSection from "./PreferencesSection";
import type { MemoryBookSection } from "../../types/memory-book";

type Props = {
  memoryBookId: string;
  teamId: string;
  isOwner: boolean;
  patientName: string;
  hasIdentity: boolean;
  hasContacts: boolean;
  hasMedical: boolean;
  hasPreferences: boolean;
};

const SECTIONS: { key: MemoryBookSection; label: string; Icon: React.ElementType }[] = [
  { key: "identity", label: "Identity", Icon: User },
  { key: "contacts", label: "Contacts", Icon: Users },
  { key: "medical", label: "Medical", Icon: Stethoscope },
  { key: "preferences", label: "Likes &amp; Dislikes", Icon: Heart },
];

export default function MemoryBookTab({
  memoryBookId,
  teamId,
  isOwner,
  patientName,
  hasIdentity,
  hasContacts,
  hasMedical,
  hasPreferences,
}: Props) {
  const [activeSection, setActiveSection] = useState<MemoryBookSection>("identity");

  const completionMap: Record<MemoryBookSection, boolean> = {
    identity: hasIdentity,
    contacts: hasContacts,
    medical: hasMedical,
    preferences: hasPreferences,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {SECTIONS.map(({ key, label, Icon }) => {
          const isActive = activeSection === key;
          const isDone = completionMap[key];
          return (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={[
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-cyan-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300",
              ].join(" ")}
            >
              <Icon className="w-4 h-4" />
              <span dangerouslySetInnerHTML={{ __html: label }} />
              {isDone && (
                <span
                  className={[
                    "w-2 h-2 rounded-full",
                    isActive ? "bg-white/60" : "bg-emerald-400",
                  ].join(" ")}
                />
              )}
            </button>
          );
        })}
      </div>

      <div>
        {activeSection === "identity" && (
          <IdentitySection
            memoryBookId={memoryBookId}
            teamId={teamId}
            isOwner={isOwner}
            patientName={patientName}
          />
        )}
        {activeSection === "contacts" && (
          <ContactsSection
            memoryBookId={memoryBookId}
            teamId={teamId}
            isOwner={isOwner}
          />
        )}
        {activeSection === "medical" && (
          <MedicalSection
            memoryBookId={memoryBookId}
            teamId={teamId}
            isOwner={isOwner}
          />
        )}
        {activeSection === "preferences" && (
          <PreferencesSection
            memoryBookId={memoryBookId}
            teamId={teamId}
            isOwner={isOwner}
          />
        )}
      </div>
    </div>
  );
}
