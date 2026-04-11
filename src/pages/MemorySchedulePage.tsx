import { useState } from "react";
import { BookOpen, LayoutDashboard, Utensils, ClipboardList, CalendarDays, SquareCheck as CheckSquare, FileText, History, RefreshCw, CircleAlert as AlertCircle, Chrome as Home, Printer } from "lucide-react";
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
  useMemoryBookProviders,
  useMemoryBookInsurance,
  useMemoryBookFinances,
  useMemoryBookSubscriptions,
  useMemoryBookVehicles,
} from "../hooks/useMemoryBook";
import type { MemoryBookTab } from "../types/memory-book";
import OverviewTab from "../components/memory-book/OverviewTab";
import MemoryBookTab from "../components/memory-book/MemoryBookTab";
import HouseholdTab from "../components/memory-book/HouseholdTab";
import ComingSoonTab from "../components/memory-book/ComingSoonTab";
import ObservationsTab from "../components/memory-book/ObservationsTab";
import PrintView from "../components/memory-book/PrintView";

const TABS: { key: MemoryBookTab; label: string; Icon: React.ElementType }[] = [
  { key: "overview",     label: "Overview",     Icon: LayoutDashboard },
  { key: "memory-book",  label: "Memory Book",  Icon: BookOpen },
  { key: "household",    label: "Household",    Icon: Home },
  { key: "daily-living", label: "Daily Living", Icon: Utensils },
  { key: "routines",     label: "Routines",     Icon: ClipboardList },
  { key: "calendar",     label: "Calendar",     Icon: CalendarDays },
  { key: "tasks",        label: "Tasks",        Icon: CheckSquare },
  { key: "observations", label: "Observations", Icon: FileText },
  { key: "changes",      label: "Change Log",   Icon: History },
];

export default function MemorySchedulePage() {
  const [activeTab, setActiveTab] = useState<MemoryBookTab>("overview");
  const { teamId, loading: teamLoading } = useActiveTeam();
  const { user, loading: authLoading } = useAuth();

  const { data: teamRole, isLoading: roleLoading } = useTeamRole(teamId, user?.id);
  const { data: patient, isLoading: patientLoading } = useTeamPatient(teamId);

  const roleResolved = !roleLoading;
  const isOwner = teamRole === "owner";

  const {
    data: book,
    isLoading: bookLoading,
    error: bookError,
    isFetching: bookFetching,
    refetch: refetchBook,
  } = useMemoryBook(teamId, isOwner, roleResolved);

  const bookId = book?.id ?? null;

  const { data: identity } = useMemoryBookIdentity(bookId);
  const { data: contacts = [] } = useMemoryBookContacts(bookId);
  const { data: medical } = useMemoryBookMedical(bookId);
  const { data: preferences } = useMemoryBookPreferences(bookId);
  const { data: providers = [] } = useMemoryBookProviders(bookId);
  const { data: insurance } = useMemoryBookInsurance(bookId);
  const { data: finances } = useMemoryBookFinances(isOwner ? bookId : null);
  const { data: subscriptions = [] } = useMemoryBookSubscriptions(bookId);
  const { data: vehicles = [] } = useMemoryBookVehicles(bookId);

  const hasIdentity = !!identity;
  const hasContacts = contacts.length > 0;
  const hasMedical = !!medical;
  const hasPreferences = !!preferences;
  const hasInsurance = !!insurance;
  const hasFinances = !!finances;
  const hasSubscriptions = subscriptions.length > 0;
  const hasVehicles = vehicles.length > 0;

  const handlePrint = () => window.print();

  const isReady = !authLoading && !teamLoading;
  const isLoading = bookLoading || roleLoading || patientLoading;
  const patientName = patient?.full_name ?? "Care Recipient";

  if (!isReady) {
    return (
      <PageLayout title="Memory & Schedule" hideSignOut>
        <div className="space-y-4 animate-pulse">
          <div className="h-10 bg-slate-100 rounded-xl w-1/2" />
          <div className="h-64 bg-slate-100 rounded-xl" />
        </div>
      </PageLayout>
    );
  }

  if (!user) return null;

  if (!teamId) {
    return (
      <PageLayout title="Memory & Schedule" hideSignOut>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h3 className="text-base font-semibold text-slate-700 mb-2">No active team selected</h3>
          <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
            Set up or select a team from your dashboard before accessing Memory & Schedule.
          </p>
        </div>
      </PageLayout>
    );
  }

  if (isLoading) {
    return (
      <PageLayout title="Memory & Schedule" hideSignOut>
        <div className="space-y-4 animate-pulse">
          <div className="h-10 bg-slate-100 rounded-xl w-1/2" />
          <div className="h-64 bg-slate-100 rounded-xl" />
        </div>
      </PageLayout>
    );
  }

  if (isOwner && bookError) {
    return (
      <PageLayout title="Memory & Schedule" hideSignOut>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-amber-500" />
          </div>
          <h3 className="text-base font-semibold text-slate-700 mb-2">
            Could not initialize Memory Book
          </h3>
          <p className="text-sm text-slate-500 max-w-sm leading-relaxed mb-5">
            Something went wrong while setting up your Memory Book. This sometimes happens on first load.
          </p>
          <button
            onClick={() => refetchBook()}
            disabled={bookFetching}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {bookFetching ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Initializing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Try Again
              </>
            )}
          </button>
        </div>
      </PageLayout>
    );
  }

  if (!isOwner && !book && teamRole) {
    return (
      <PageLayout title="Memory & Schedule" hideSignOut>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-700 mb-2">Memory Book not yet set up</h3>
          <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
            The team owner needs to open Memory & Schedule first to initialize the memory book for this team.
          </p>
        </div>
      </PageLayout>
    );
  }

  if (!teamRole) {
    return (
      <PageLayout title="Memory & Schedule" hideSignOut>
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
      title={`Memory & Schedule — ${patientName}`}
      hideSignOut
    >
      <div className="space-y-6 print:hidden">
        <div className="flex items-center gap-3">
          <nav className="flex-1 flex flex-wrap gap-1.5 bg-white border border-slate-200 rounded-xl p-2 shadow-sm">
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
          {bookId && (
            <button
              onClick={handlePrint}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-sm"
              title="Print Memory Book"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden md:inline">Print</span>
            </button>
          )}
        </div>

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
              hasInsurance={hasInsurance}
              hasSubscriptions={hasSubscriptions}
              hasVehicles={hasVehicles}
              contactCount={contacts.length}
              onNavigate={setActiveTab as (tab: string) => void}
              onPrint={handlePrint}
              showPrint={!!bookId}
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
            <InitMemoryBook patientName={patientName} onRetry={refetchBook} isRetrying={bookFetching} />
          )}

          {activeTab === "household" && bookId && (
            <HouseholdTab
              memoryBookId={bookId}
              teamId={teamId!}
              isOwner={isOwner}
              hasInsurance={hasInsurance}
              hasFinances={hasFinances}
              hasSubscriptions={hasSubscriptions}
              hasVehicles={hasVehicles}
            />
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
          {activeTab === "observations" && teamId && teamRole && (
            <ObservationsTab
              teamId={teamId}
              teamRole={teamRole}
              patientName={patientName}
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

      {bookId && (
        <PrintView
          patientName={patientName}
          identity={identity}
          contacts={contacts}
          medical={medical}
          preferences={preferences}
          providers={providers}
          insurance={insurance}
          finances={finances}
          subscriptions={subscriptions}
          vehicles={vehicles}
          isOwner={isOwner}
        />
      )}
    </PageLayout>
  );
}

function InitMemoryBook({
  patientName,
  onRetry,
  isRetrying,
}: {
  patientName: string;
  onRetry: () => void;
  isRetrying: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-full bg-cyan-50 flex items-center justify-center mb-4">
        <BookOpen className="w-6 h-6 text-cyan-600" />
      </div>
      <h3 className="text-base font-semibold text-slate-700 mb-2">
        Memory Book for {patientName}
      </h3>
      <p className="text-sm text-slate-500 max-w-sm leading-relaxed mb-5">
        The Memory Book is being initialized. If this message persists, use the button below.
      </p>
      <button
        onClick={onRetry}
        disabled={isRetrying}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isRetrying ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            Initializing...
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4" />
            Retry Initialization
          </>
        )}
      </button>
    </div>
  );
}
