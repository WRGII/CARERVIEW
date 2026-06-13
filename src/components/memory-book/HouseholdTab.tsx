import { useState } from "react";
import { MapPin, ShieldCheck, Landmark, Tv, Car } from "lucide-react";
import HomeAddressSection from "./HomeAddressSection";
import InsuranceSection from "./InsuranceSection";
import FinancesSection from "./FinancesSection";
import SubscriptionsSection from "./SubscriptionsSection";
import VehicleSection from "./VehicleSection";
import type { HouseholdSection } from "../../types/memory-book";

type Props = {
  memoryBookId: string;
  teamId: string;
  isOwner: boolean;
  hasHomeAddress: boolean;
  hasInsurance: boolean;
  hasFinances: boolean;
  hasSubscriptions: boolean;
  hasVehicles: boolean;
};

export default function HouseholdTab({
  memoryBookId,
  teamId,
  isOwner,
  hasHomeAddress,
  hasInsurance,
  hasFinances,
  hasSubscriptions,
  hasVehicles,
}: Props) {
  const [activeSection, setActiveSection] = useState<HouseholdSection>("home_address");

  const SECTIONS: { key: HouseholdSection; label: string; Icon: React.ElementType; ownerOnly?: boolean }[] = [
    { key: "home_address",  label: "Home Address",  Icon: MapPin },
    { key: "insurance",     label: "Insurance",     Icon: ShieldCheck },
    { key: "finances",      label: "Finances",      Icon: Landmark,  ownerOnly: true },
    { key: "subscriptions", label: "Subscriptions", Icon: Tv },
    { key: "vehicle",       label: "Vehicle",       Icon: Car },
  ];

  const visibleSections = SECTIONS.filter(s => isOwner || !s.ownerOnly);

  const completionMap: Record<HouseholdSection, boolean> = {
    home_address:  hasHomeAddress,
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
        {activeSection === "home_address" && (
          <HomeAddressSection memoryBookId={memoryBookId} teamId={teamId} isOwner={isOwner} />
        )}
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
