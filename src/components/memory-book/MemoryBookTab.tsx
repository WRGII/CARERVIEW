import { useState } from "react";
import { User, Users, Stethoscope, ShieldCheck, Landmark, Tv, Car, Share2, Chrome as Home } from "lucide-react";
import IdentitySection from "./IdentitySection";
import ContactsSection from "./ContactsSection";
import MedicalSection from "./MedicalSection";
import InsuranceSection from "./InsuranceSection";
import FinancesSection from "./FinancesSection";
import SubscriptionsSection from "./SubscriptionsSection";
import VehicleSection from "./VehicleSection";
import SocialAccountsSection from "./SocialAccountsSection";
import HouseholdProvidersSection from "./HouseholdProvidersSection";
import type { MemoryBookSection } from "../../types/memory-book";

type Props = {
  memoryBookId: string;
  teamId: string;
  isOwner: boolean;
  residentName: string;
  hasIdentity: boolean;
  hasContacts: boolean;
  hasMedical: boolean;
  hasInsurance: boolean;
  hasFinances: boolean;
  hasSubscriptions: boolean;
  hasVehicles: boolean;
  hasSocialAccounts: boolean;
  hasHouseholdProviders: boolean;
};

type SectionConfig = {
  key: MemoryBookSection;
  label: string;
  Icon: React.ElementType;
  ownerOnly?: boolean;
  group: "personal" | "household";
};

const SECTIONS: SectionConfig[] = [
  { key: "identity",            label: "Identity",        Icon: User,        group: "personal" },
  { key: "contacts",            label: "Contacts",        Icon: Users,       group: "personal" },
  { key: "medical",             label: "Medical",         Icon: Stethoscope, group: "personal" },
  { key: "social_accounts",     label: "Online Accounts", Icon: Share2,      group: "personal" },
  { key: "insurance",           label: "Insurance",       Icon: ShieldCheck, group: "household" },
  { key: "finances",            label: "Finances",        Icon: Landmark,    group: "household", ownerOnly: true },
  { key: "subscriptions",       label: "Subscriptions",   Icon: Tv,          group: "household" },
  { key: "vehicle",             label: "Vehicle",         Icon: Car,         group: "household" },
  { key: "household_providers", label: "Household",       Icon: Home,        group: "household" },
];

export default function MemoryBookTab({
  memoryBookId,
  teamId,
  isOwner,
  residentName,
  hasIdentity,
  hasContacts,
  hasMedical,
  hasInsurance,
  hasFinances,
  hasSubscriptions,
  hasVehicles,
  hasSocialAccounts,
  hasHouseholdProviders,
}: Props) {
  const [activeSection, setActiveSection] = useState<MemoryBookSection>("identity");

  const completionMap: Partial<Record<MemoryBookSection, boolean>> = {
    identity:             hasIdentity,
    contacts:             hasContacts,
    medical:              hasMedical,
    social_accounts:      hasSocialAccounts,
    insurance:            hasInsurance,
    finances:             hasFinances,
    subscriptions:        hasSubscriptions,
    vehicle:              hasVehicles,
    household_providers:  hasHouseholdProviders,
  };

  const visibleSections = SECTIONS.filter(s => isOwner || !s.ownerOnly);
  const personalSections = visibleSections.filter(s => s.group === "personal");
  const householdSections = visibleSections.filter(s => s.group === "household");

  const renderChips = (sections: SectionConfig[]) =>
    sections.map(({ key, label, Icon }) => {
      const isActive = activeSection === key;
      const isDone = completionMap[key] ?? false;
      return (
        <button
          key={key}
          onClick={() => setActiveSection(key)}
          className={[
            "flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
            isActive
              ? "bg-cyan-600 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800",
          ].join(" ")}
        >
          <Icon className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{label}</span>
          {isDone && (
            <span
              className={[
                "w-1.5 h-1.5 rounded-full flex-shrink-0",
                isActive ? "bg-white/70" : "bg-emerald-400",
              ].join(" ")}
            />
          )}
        </button>
      );
    });

  return (
    <div className="space-y-5">
      {/* Unified tab navigation */}
      <div className="bg-white border border-slate-200 rounded-2xl px-3 py-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {renderChips(personalSections)}

          {/* Visual separator between personal and household */}
          <div className="self-stretch flex items-center" aria-hidden>
            <div className="w-px h-5 bg-slate-200 rounded-full mx-1" />
          </div>

          {/* Inline household label + chips */}
          <span className="self-center text-[10px] font-bold text-slate-400 uppercase tracking-widest select-none mr-0.5">
            Household
          </span>
          {renderChips(householdSections)}
        </div>
      </div>

      {/* Active section content */}
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
        {activeSection === "social_accounts" && (
          <SocialAccountsSection
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
        {activeSection === "household_providers" && (
          <HouseholdProvidersSection
            memoryBookId={memoryBookId}
            teamId={teamId}
            isOwner={isOwner}
          />
        )}
      </div>
    </div>
  );
}
