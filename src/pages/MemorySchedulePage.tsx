import { useState } from "react";
import { BookOpen, LayoutDashboard, Utensils, ClipboardList, CalendarDays, SquareCheck as CheckSquare, BookMarked, History } from "lucide-react";
import PageLayout from "../components/layout/PageLayout";
import { useActiveTeam } from "../context/ActiveTeam";
import { useAuth } from "../hooks/useAuth";
import {
  useMemoryBook,
  useTeamRole,
  useTeamPatient,
  useMemoryBookIdentity,
  useMemoryBookContacts,
  useMemoryBookMedical,
  useMemoryBookPreferences,
} from "../hooks/useMemoryBook";
import type { MemoryBookTab } from "../types/memory-book";
import OverviewTab from "../components/memory-book/OverviewTab";
import MemoryBookTab from "../components/memory-book/MemoryBookTab";
import ComingSoonTab from "../components/memory-book/ComingSoonTab";

const TABS: { key: MemoryBookTab; label: string; Icon: React.ElementType }[] = [
  { key: "overview", label: "Overview", Icon: LayoutDashboard },
  { key: "memory-book", label: "Memory Book", Icon: BookOpen },
  { key: "daily-living", label: "Daily Living", Icon: Utensils },
  { key: "routines", label: "Routines", Icon: ClipboardList },
  { key: "calendar", label: "Calendar", Icon: CalendarDays },
  { key: "tasks", label: "Tasks", Icon: CheckSquare },
  { key: "journal", label: "Journal", Icon: BookMarked },
  { key: "changes", label: "Changes", Icon: History },
];

export default function MemorySchedulePage() {
  const [activeTab, setActiveTab] = useState<MemoryBookTab>("overview");
  const { teamId } = useActiveTeam();
  const { user } = useAuth();

  const { data: book, isLoading: bookLoading, error: bookError } = useMemoryBook(teamId);
  const { data: teamRole, isLoading: roleLoading } = useTeamRole(teamId);
  const { data: patient, isLoading: patientLoading } = useTeamPatient(teamId);

  const bookId = book?.id ?? null;
  const isOwner = teamRole === "owner";

  const { data: identity } = useMemoryBookIdentity(bookId);
  const { data: contacts = [] } = useMemoryBookContacts(bookId);
  const { data: medical } = useMemoryBookMedical(bookId);
  const { data: preferences } = useMemoryBookPreferences(bookId);

  const hasIdentity = !!identity;
  const hasContacts = contacts.length > 0;
  const hasMedical = !!medical;
  const hasPreferences = !!preferences;

  const isLoading = bookLoading || roleLoading || patientLoading;
  const patientName = patient?.full_name ?? "Care Recipient";

  if (!user) return null;

  if (isLoading) {
    return (
      <PageLayout title="Memory &amp; Schedule" hideSignOut>
        <div className="space-y-4 animate-pulse">
          <div className="h-10 bg-slate-100 rounded-xl w-1/2" />
          <div className="h-64 bg-slate-100 rounded-xl" />
        </div>
      </PageLayout>
    );
  }

  if (bookError || (!book && teamRole && teamRole !== "owner")) {
    return (
      <PageLayout title="Memory &amp; Schedule" hideSignOut>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6 text-red-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-700 mb-2">Memory Book not yet set up</h3>
          <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
            The team owner needs to open Memory &amp; Schedule first to initialize the memory book for this team.
          </p>
        </div>
      </PageLayout>
    );
  }

  if (!teamRole) {
    return (
      <PageLayout title="Memory &amp; Schedule" hideSignOut>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h3 className="text-base font-semibold text-slate-700 mb-2">No team access</h3>
          <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
            You are not an active member of this team.
          </p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={`Memory &amp; Schedule — ${patientName}`}
      hideSignOut
    >
      <div className="space-y-6">
        <nav className="flex flex-wrap gap-1.5 bg-white border border-slate-200 rounded-xl p-2 shadow-sm">
          {TABS.map(({ key, label, Icon }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={[
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-cyan-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-800 hover:bg-slate-100",
                ].join(" ")}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}
        </nav>

        <div>
          {activeTab === "overview" && (
            <OverviewTab
              patientName={patientName}
              patientDob={patient?.date_of_birth ?? null}
              teamRole={teamRole}
              identityPreferredName={identity?.preferred_name ?? null}
              identityAboutMe={identity?.about_me ?? null}
              hasIdentity={hasIdentity}
              hasContacts={hasContacts}
              hasMedical={hasMedical}
              hasPreferences={hasPreferences}
              contactCount={contacts.length}
              onNavigate={setActiveTab as (tab: string) => void}
            />
          )}

          {activeTab === "memory-book" && bookId && (
            <MemoryBookTab
              memoryBookId={bookId}
              teamId={teamId!}
              isOwner={isOwner}
              patientName={patientName}
              hasIdentity={hasIdentity}
              hasContacts={hasContacts}
              hasMedical={hasMedical}
              hasPreferences={hasPreferences}
            />
          )}

          {activeTab === "memory-book" && !bookId && isOwner && (
            <InitMemoryBook patientName={patientName} />
          )}

          {activeTab === "daily-living" && (
            <ComingSoonTab
              title="Daily Living"
              description="Structured care support for bathing, dressing, meals, mobility, and daily routines."
              phase="Phase 2"
            />
          )}
          {activeTab === "routines" && (
            <ComingSoonTab
              title="Daily Routines"
              description="Morning, afternoon, evening, and night routine builders for consistent care handoffs."
              phase="Phase 3"
            />
          )}
          {activeTab === "calendar" && (
            <ComingSoonTab
              title="Weekly Calendar"
              description="A simple recurring-event grid for appointments, activities, and regular outings."
              phase="Phase 3"
            />
          )}
          {activeTab === "tasks" && (
            <ComingSoonTab
              title="Care Tasks"
              description="Task management for medication reminders, hygiene routines, appointments, and check-ins."
              phase="Phase 3"
            />
          )}
          {activeTab === "journal" && (
            <ComingSoonTab
              title="Journal"
              description="A running log of care observations, mood changes, and notable events contributed by all caregivers."
              phase="Phase 2"
            />
          )}
          {activeTab === "changes" && (
            <ComingSoonTab
              title="Change Log"
              description="A record of all updates made to the Memory Book, including who made changes and when."
              phase="Phase 2"
            />
          )}
        </div>
      </div>
    </PageLayout>
  );
}

function InitMemoryBook({ patientName }: { patientName: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-full bg-cyan-50 flex items-center justify-center mb-4">
        <BookOpen className="w-6 h-6 text-cyan-600" />
      </div>
      <h3 className="text-base font-semibold text-slate-700 mb-2">
        Memory Book for {patientName}
      </h3>
      <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
        The Memory Book is being initialized. If this message persists, try refreshing the page.
      </p>
    </div>
  );
}
