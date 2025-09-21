import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { ClipboardList, ActivitySquare, Layers } from "lucide-react";

export default function NewObservationPage() {
  const navigate = useNavigate();

  const Tile = ({
    title,
    desc,
    icon,
    onClick,
    badge,
    to,
  }: {
    title: string;
    desc: string;
    icon: React.ReactNode;
    onClick: () => void;
    badge?: string;
    to: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left focus:outline-none"
      aria-label={title}
    >
      <Card className="bg-warm-white hover:shadow-lg transition-shadow duration-200 h-full">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-primary/15 flex items-center justify-center shrink-0">
              {icon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-slate-gray">{title}</h3>
                {badge && (
                  <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-mint-green/70 text-slate-gray border border-mint-green/70">
                    {badge}
                  </span>
                )}
              </div>
              <p className="text-slate-gray/80 mt-1">{desc}</p>
              <div className="mt-4">
                <span className="inline-flex items-center gap-2 rounded-lg border-2 border-slate-gray/30 px-3 py-1.5 text-sm font-semibold text-slate-gray">
                  Start
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </button>
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-gray">Create Observation</h1>
        <p className="text-slate-gray/70">
          Choose the type of form to start.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Tile
          title="ADL Observation"
          desc="Activities of Daily Living (e.g., eating, dressing, bathing)"
          icon={<ActivitySquare className="w-6 h-6 text-cyan-primary" />}
          to="/caregiver/observations/new/adl"
          onClick={() => navigate("/caregiver/observations/new/adl")}
        />
        <Tile
          title="IADL Observation"
          desc="Instrumental ADLs (e.g., shopping, managing meds, housekeeping)"
          icon={<ClipboardList className="w-6 h-6 text-cyan-primary" />}
          to="/caregiver/observations/new/iadl"
          onClick={() => navigate("/caregiver/observations/new/iadl")}
        />
        <div className="md:col-span-2">
          <Tile
            title="Comprehensive Observation"
            desc="ADL + IADL combined in one report"
            icon={<Layers className="w-6 h-6 text-cyan-primary" />}
            badge="Recommended"
            to="/caregiver/observations/new/comprehensive"
            onClick={() => navigate("/caregiver/observations/new/comprehensive")}
          />
        </div>
      </div>

      <div className="mt-8">
        <Button variant="outline" onClick={() => navigate("/caregiver")}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
