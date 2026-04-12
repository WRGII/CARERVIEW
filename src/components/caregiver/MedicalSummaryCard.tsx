import { Stethoscope, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useActiveTeam } from "../../context/ActiveTeam";
import {
  useMemoryBook,
  useTeamRole,
  useMemoryBookMedicalEntries,
} from "../../hooks/useMemoryBook";

export default function MedicalSummaryCard() {
  const { user } = useAuth();
  const { teamId } = useActiveTeam();

  const { data: teamRole, isLoading: roleLoading } = useTeamRole(teamId, user?.id);
  const roleResolved = !roleLoading;
  const isOwner = teamRole === "owner";

  const { data: book, isLoading: bookLoading } = useMemoryBook(teamId, isOwner, roleResolved);
  const bookId = book?.id ?? null;

  const { data: medicalEntries = [], isLoading: entriesLoading } = useMemoryBookMedicalEntries(bookId);

  const isLoading = roleLoading || bookLoading || entriesLoading;

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5 animate-pulse">
        <div className="h-4 bg-slate-100 rounded w-1/3 mb-4" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (!book || medicalEntries.length === 0) return null;

  const conditions = medicalEntries.filter(e => e.category === "condition");
  const medications = medicalEntries.filter(e => e.category === "medication");
  const allergies = medicalEntries.filter(e => e.category === "allergy");
  const hearing = medicalEntries.filter(e => e.category === "hearing");
  const vision = medicalEntries.filter(e => e.category === "vision");

  const hasData = conditions.length > 0 || medications.length > 0 || allergies.length > 0;
  if (!hasData) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
            <Stethoscope className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Medical Summary</h3>
            <p className="text-xs text-slate-500">From the Memory Book</p>
          </div>
        </div>
        <Link
          to="/caregiver/memory-schedule"
          className="flex items-center gap-1 text-xs font-medium text-cyan-600 hover:text-cyan-700 transition-colors group"
        >
          View Memory Book
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="p-5">
        <div className="grid sm:grid-cols-3 gap-3">
          {conditions.length > 0 && (
            <MedicalGroup
              label="Conditions"
              items={conditions.map(e => e.label)}
              badgeColor="bg-rose-50 border-rose-200 text-rose-700"
              dotColor="bg-rose-400"
              max={4}
            />
          )}
          {medications.length > 0 && (
            <MedicalGroup
              label="Medications"
              items={medications.map(e => e.label)}
              badgeColor="bg-cyan-50 border-cyan-200 text-cyan-700"
              dotColor="bg-cyan-400"
              max={4}
            />
          )}
          {allergies.length > 0 && (
            <MedicalGroup
              label="Allergies"
              items={allergies.map(e => e.label)}
              badgeColor="bg-orange-50 border-orange-200 text-orange-700"
              dotColor="bg-orange-400"
              max={4}
            />
          )}
        </div>

        {(hearing.length > 0 || vision.length > 0) && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-3">
            {hearing.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                Hearing: {hearing[0].label}{hearing.length > 1 ? ` +${hearing.length - 1}` : ""}
              </span>
            )}
            {vision.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                Vision: {vision[0].label}{vision.length > 1 ? ` +${vision.length - 1}` : ""}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MedicalGroup({
  label,
  items,
  badgeColor,
  dotColor,
  max,
}: {
  label: string;
  items: string[];
  badgeColor: string;
  dotColor: string;
  max: number;
}) {
  const shown = items.slice(0, max);
  const remaining = items.length - max;
  return (
    <div className={`rounded-xl border p-3 ${badgeColor}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-75 mb-2">{label}</p>
      <ul className="space-y-1.5">
        {shown.map(item => (
          <li key={item} className="flex items-center gap-2 text-xs">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`} />
            <span className="truncate font-medium">{item}</span>
          </li>
        ))}
        {remaining > 0 && (
          <li className="text-xs opacity-60 pl-3.5">+{remaining} more</li>
        )}
      </ul>
    </div>
  );
}
