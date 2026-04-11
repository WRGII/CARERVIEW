import { useState } from "react";
import { User, Users, Stethoscope, Heart, ShieldCheck, Landmark, Tv, Car } from "lucide-react";
import IdentitySection from "./IdentitySection";
import ContactsSection from "./ContactsSection";
import MedicalSection from "./MedicalSection";
import PreferencesSection from "./PreferencesSection";
import InsuranceSection from "./InsuranceSection";
import FinancesSection from "./FinancesSection";
import SubscriptionsSection from "./SubscriptionsSection";
import VehicleSection from "./VehicleSection";
import type { MemoryBookSection } from "../../types/memory-book";

type Props = {
  memoryBookId: string;
  teamId: string;
  isOwner: boolean;
  residentName: string;
  hasIdentity: boolean;
  hasContacts: boolean;
  hasMedical: boolean;
  hasPreferences: boolean;
  hasInsurance: boolean;
  hasFinances: boolean;
  hasSubscriptions: boolean;
  hasVehicles: boolean;
};

type SectionConfig = {
  key: MemoryBookSection;
  label: string;
  Icon: React.ElementType;
  ownerOnly?: boolean;
  group: "personal" | "household";
};

const SECTIONS: SectionConfig[] = [
  { key: "identity",      label: "Identity",        Icon: User,        group: "personal" },
  { key: "contacts",      label: "Contacts",         Icon: Users,       group: "personal" },
  { key: "medical",       label: "Medical",          Icon: Stethoscope, group: "personal" },
  { key: "preferences",   label: "Preferences",      Icon: Heart,       group: "personal" },
  { key: "insurance",     label: "Insurance",        Icon: ShieldCheck, group: "household" },
  { key: "finances",      label: "Finances",         Icon: Landmark,    group: "household", ownerOnly: true },
  { key: "subscriptions", label: "Subscriptions",    Icon: Tv,          group: "household" },
  { key: "vehicle",       label: "Vehicle",          Icon: Car,         group: "household" },
];

export default function MemoryBookTab({
  memoryBookId,
  teamId,
  isOwner,
  residentName,
  hasIdentity,
  hasContacts,
  hasMedical,
  hasPreferences,
  hasInsurance,
  hasFinances,
  hasSubscriptions,
  hasVehicles,
}: Props) {
  const [activeSection, setActiveSection] = useState<MemoryBookSection>("identity");

  const completionMap: Record<MemoryBookSection, boolean> = {
    identity:      hasIdentity,
    contacts:      hasContacts,
    medical:       hasMedical,
    preferences:   hasPreferences,
    insurance:     hasInsurance,
    finances:      hasFinances,
    subscriptions: hasSubscriptions,
    vehicle:       hasVehicles,
  };

  const visibleSections = SECTIONS.filter(s => isOwner || !s.ownerOnly);
  const personalSections = visibleSections.filter(s => s.group === "personal");
  const householdSections = visibleSections.filter(s => s.group === "household");

  const renderTabGroup = (sections: SectionConfig[]) =>
    sections.map(({ key, label, Icon }) => {
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
          <span>{label}</span>
          {isDone && (
            <span
              className={[
                "w-2 h-2 rounded-full flex-shrink-0",
                isActive ? "bg-white/60" : "bg-emerald-400",
              ].join(" ")}
            />
          )}
        </button>
      );
    });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {renderTabGroup(personalSections)}
        </div>
        <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
          <span className="self-center text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">Household</span>
          {renderTabGroup(householdSections)}
        </div>
      </div>

      <div>
        {activeSection === "identity" && (
          <IdentitySection
            memoryBookId={memoryBookId}
            teamId={teamId}
            isOwner={isOwner}
            residentName={residentName}
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
        {activeSection === "insurance" && (
          <InsuranceSection
            memoryBookId={memoryBookId}
            teamId={teamId}
            isOwner={isOwner}
          />
        )}
        {activeSection === "finances" && (
          <FinancesSection
            memoryBookId={memoryBookId}
            teamId={teamId}
            isOwner={isOwner}
          />
        )}
        {activeSection === "subscriptions" && (
          <SubscriptionsSection
            memoryBookId={memoryBookId}
            teamId={teamId}
            isOwner={isOwner}
          />
        )}
        {activeSection === "vehicle" && (
          <VehicleSection
            memoryBookId={memoryBookId}
            teamId={teamId}
            isOwner={isOwner}
          />
        )}
      </div>
    </div>
  );
}
