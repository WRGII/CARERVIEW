import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Plus, Eye, Calendar, User, ChevronRight } from "lucide-react";
import { useTeamObservations } from "../../hooks/useObservations";
import { useFormatDate } from "../../hooks/useFormatDate";
import type { TeamMemberRole } from "../../types/memory-book";

type Props = {
  teamId: string;
  teamRole: TeamMemberRole;
  residentName: string;
};

type ObservationRow = {
  id: string;
  user_id: string;
  author_user_id: string | null;
  resident_name: string | null;
  observation_date: string;
  notes: string | null;
  caregiver_name: string | null;
  caregiver_email: string | null;
  created_at: string;
  updated_at: string;
  form_type: "ADL" | "IADL" | "COMPREHENSIVE" | null;
  team_id: string | null;
};

const FORM_TYPE_STYLES: Record<string, { label: string; classes: string }> = {
  ADL: { label: "ADL", classes: "border-cyan-600 text-cyan-700" },
  IADL: { label: "IADL", classes: "border-emerald-600 text-emerald-700" },
  COMPREHENSIVE: { label: "ADL + IADL", classes: "border-slate-500 text-slate-700" },
};

function FormTypeChip({ type }: { type: ObservationRow["form_type"] }) {
  if (!type) return null;
  const style = FORM_TYPE_STYLES[type];
  if (!style) return null;
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full border bg-white inline-flex items-center leading-none ${style.classes}`}
    >
      {style.label}
    </span>
  );
}

export default function ObservationsTab({ teamId, residentName }: Props) {
  const navigate = useNavigate();
  const { formatDate } = useFormatDate();
  const { data: observations, isLoading, error } = useTeamObservations(teamId);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
        <FileText className="w-4 h-4 flex-shrink-0" />
        Failed to load observations. Please refresh the page.
      </div>
    );
  }

  const rows = (observations ?? []) as ObservationRow[];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Observations</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            All care observations recorded by your team for {residentName}.
          </p>
        </div>
        <button
          onClick={() => navigate("/caregiver/observations/new")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Observation</span>
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-700 mb-2">No observations yet</h3>
          <p className="text-sm text-slate-500 max-w-sm leading-relaxed mb-5">
            Start recording observations for {residentName}. All caregivers in your team can contribute.
          </p>
          <button
            onClick={() => navigate("/caregiver/observations/new")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Record First Observation
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
          {rows.map((obs) => {
            const isExpanded = expandedId === obs.id;
            return (
              <div key={obs.id} className="group">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : obs.id)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-cyan-50 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-cyan-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-slate-900 truncate">
                        {obs.resident_name || residentName}
                      </span>
                      <FormTypeChip type={obs.form_type} />
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                        <Calendar className="w-3 h-3" />
                        {formatDate(obs.observation_date)}
                      </span>
                      {obs.caregiver_name && (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                          <User className="w-3 h-3" />
                          {obs.caregiver_name}
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-150 ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  />
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 bg-slate-50 border-t border-slate-100">
                    <div className="pt-3 space-y-3">
                      {obs.notes && (
                        <p className="text-sm text-slate-600 leading-relaxed">{obs.notes}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Observed: {formatDate(obs.observation_date)}
                        </span>
                        {obs.caregiver_name && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            By: {obs.caregiver_name}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => navigate("/caregiver")}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-700 hover:text-cyan-800 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View full observation on Dashboard
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-slate-400 text-center">
        {rows.length > 0 &&
          `${rows.length} observation${rows.length === 1 ? "" : "s"} recorded for this team`}
      </p>
    </div>
  );
}
