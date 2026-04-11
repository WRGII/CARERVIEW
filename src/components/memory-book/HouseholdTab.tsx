import { useState } from "react";
import { ShieldCheck, Landmark, Tv, Car } from "lucide-react";
import InsuranceSection from "./InsuranceSection";
import FinancesSection from "./FinancesSection";
import SubscriptionsSection from "./SubscriptionsSection";
import VehicleSection from "./VehicleSection";
import type { HouseholdSection } from "../../types/memory-book";
import { useLocale } from "../../i18n/LocaleContext";

type Props = {
  memoryBookId: string;
  teamId: string;
  isOwner: boolean;
  hasInsurance: boolean;
  hasFinances: boolean;
  hasSubscriptions: boolean;
  hasVehicles: boolean;
};

export default function HouseholdTab({
  memoryBookId,
  teamId,
  isOwner,
  hasInsurance,
  hasFinances,
  hasSubscriptions,
  hasVehicles,
}: Props) {
  const { t } = useLocale();
  const [activeSection, setActiveSection] = useState<HouseholdSection>("insurance");

  const SECTIONS: { key: HouseholdSection; label: string; Icon: React.ElementType; ownerOnly?: boolean }[] = [
    { key: "insurance",     label: t("memory_book.household_section_insurance"),     Icon: ShieldCheck },
    { key: "finances",      label: t("memory_book.household_section_finances"),      Icon: Landmark,   ownerOnly: true },
    { key: "subscriptions", label: t("memory_book.household_section_subscriptions"), Icon: Tv },
    { key: "vehicle",       label: t("memory_book.household_section_vehicle"),       Icon: Car },
  ];

  const visibleSections = SECTIONS.filter(s => isOwner || !s.ownerOnly);

  const completionMap: Record<HouseholdSection, boolean> = {
    providers:     false,
    insurance:     hasInsurance,
    finances:      hasFinances,
    subscriptions: hasSubscriptions,
    vehicle:       hasVehicles,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {visibleSections.map(({ key, label, Icon }) => {
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
        {activeSection === "insurance" && (
          <InsuranceSection memoryBookId={memoryBookId} teamId={teamId} isOwner={isOwner} />
        )}
        {activeSection === "finances" && isOwner && (
          <FinancesSection memoryBookId={memoryBookId} teamId={teamId} isOwner={isOwner} />
        )}
        {activeSection === "subscriptions" && (
          <SubscriptionsSection memoryBookId={memoryBookId} teamId={teamId} isOwner={isOwner} />
        )}
        {activeSection === "vehicle" && (
          <VehicleSection memoryBookId={memoryBookId} teamId={teamId} isOwner={isOwner} />
        )}
      </div>
    </div>
  );
}
