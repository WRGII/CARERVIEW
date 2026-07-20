import { useState, useEffect } from "react";
import { setLastModule } from "../lib/lastModule";
import { BookOpen, LayoutDashboard, Activity, ClipboardList, CalendarDays, SquareCheck as CheckSquare, FileText, History, RefreshCw, CircleAlert as AlertCircle, Printer } from "lucide-react";
import PageLayout from "../components/layout/PageLayout";
import { useActiveTeam } from "../context/ActiveTeam";
import { useAuth } from "../hooks/useAuth";
import { useLocale } from "../i18n/LocaleContext";
import {
  useMemoryBook,
  useTeamRole,
  useTeamResident,
  useMemoryBookIdentity,
  useMemoryBookContacts,
  useMemoryBookMedical,
  useMemoryBookPreferences,
  useMemoryBookProviders,
  useMemoryBookInsurance,
  useMemoryBookFinances,
  useMemoryBookSubscriptions,
  useMemoryBookVehicles,
  useMemoryBookSocialAccounts,
  useMemoryBookInsuranceEntries,
  useMemoryBookFinanceEntries,
  useMemoryBookMedicalEntries,
  useMemoryBookPreferenceEntries,
  useMemoryBookDailyLivingEntries,
  useMemoryBookHouseholdProviders,
  useMemoryBookHomeAddress,
} from "../hooks/useMemoryBook";
import type { MemoryBookTab as MemoryBookTabKey } from "../types/memory-book";
import OverviewTab from "../components/memory-book/OverviewTab";
import MemoryBookTab from "../components/memory-book/MemoryBookTab";
import DailyLivingTab from "../components/memory-book/DailyLivingTab";
import ComingSoonTab from "../components/memory-book/ComingSoonTab";
import ObservationsTab from "../components/memory-book/ObservationsTab";
import PrintView from "../components/memory-book/PrintView";
import Breadcrumbs from "../components/common/Breadcrumbs";

export default function MemorySchedulePage() {
  useEffect(() => { setLastModule('memory_book'); }, []);
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState<MemoryBookTabKey>("overview");

  const TABS: { key: MemoryBookTabKey; label: string; Icon: React.ElementType; comingSoon?: boolean }[] = [
    { key: "overview",     label: t("memory_book.tab_overview"),     Icon: LayoutDashboard },
    { key: "memory-book",  label: t("memory_book.tab_memory_book"),  Icon: BookOpen },
    { key: "daily-living", label: t("memory_book.tab_daily_living"), Icon: Activity },
    { key: "routines",     label: t("memory_book.tab_routines"),     Icon: ClipboardList,  comingSoon: true },
    { key: "calendar",     label: t("memory_book.tab_calendar"),     Icon: CalendarDays,   comingSoon: true },
    { key: "tasks",        label: t("memory_book.tab_tasks"),        Icon: CheckSquare,    comingSoon: true },
    { key: "observations", label: t("memory_book.tab_observations"), Icon: FileText },
    { key: "changes",      label: t("memory_book.tab_change_log"),   Icon: History,        comingSoon: true },
  ];

  const { teamId, loading: teamLoading } = useActiveTeam();
  const { user, loading: authLoading } = useAuth();

  const { data: teamRole, isLoading: roleLoading } = useTeamRole(teamId, user?.id);
  const { data: resident, isLoading: residentLoading } = useTeamResident(teamId);

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
  const { data: socialAccounts = [] } = useMemoryBookSocialAccounts(bookId);

  const { data: insuranceEntries = [] } = useMemoryBookInsuranceEntries(bookId);
  const { data: financeEntries = [] } = useMemoryBookFinanceEntries(isOwner ? bookId : null);
  const { data: medicalEntries = [] } = useMemoryBookMedicalEntries(bookId);
  const { data: preferenceEntries = [] } = useMemoryBookPreferenceEntries(bookId);
  const { data: dailyLivingEntries = [] } = useMemoryBookDailyLivingEntries(bookId);
  const { data: householdProviders = [] } = useMemoryBookHouseholdProviders(bookId);
  const { data: homeAddress } = useMemoryBookHomeAddress(bookId);

  const hasIdentity = !!identity;
  const hasContacts = contacts.length > 0;
  const hasMedical = !!medical || medicalEntries.length > 0;
  const hasInsurance = !!insurance || insuranceEntries.length > 0;
  const hasFinances = !!finances || financeEntries.length > 0;
  const hasSubscriptions = subscriptions.length > 0;
  const hasVehicles = vehicles.length > 0;
  const hasSocialAccounts = socialAccounts.length > 0;
  const hasHouseholdProviders = householdProviders.length > 0;
  const hasHomeAddress = !!homeAddress && (!!homeAddress.street_name || !!homeAddress.city || !!homeAddress.street_number);
  const hasDailyLiving = dailyLivingEntries.length > 0 || !!preferences || preferenceEntries.length > 0;

  const handlePrint = () => window.print();

  const isReady = !authLoading && !teamLoading;
  const isLoading = bookLoading || roleLoading || residentLoading;
  const residentName = resident?.full_name ?? "Care Recipient";

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
      title={`Memory & Schedule — ${residentName}`}
      hideSignOut
    >
      <Breadcrumbs homeTo="/caregiver" homeLabel={t('caregiver.dashboard_title')} items={[{ label: `Memory & Schedule — ${residentName}` }]} />
      <div className="space-y-6 print:hidden">
        <div className="flex items-center gap-3">
          <nav className="flex-1 flex flex-wrap gap-1.5 bg-white border border-slate-200 rounded-xl p-2 shadow-sm">
            {TABS.map(({ key, label, Icon, comingSoon }) => {
              const isActive = activeTab === key;
              let cls = "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors";
              if (comingSoon) {
                cls += isActive
                  ? " bg-slate-100 text-slate-400 border border-dashed border-slate-300"
                  : " text-slate-400 hover:bg-slate-50 hover:text-slate-500";
              } else {
                cls += isActive
                  ? " bg-cyan-600 text-white shadow-sm"
                  : " text-slate-600 hover:text-slate-800 hover:bg-slate-100";
              }
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  title={comingSoon ? "Coming soon" : undefined}
                  className={cls}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                  {comingSoon && (
                    <span className="hidden sm:inline text-xs font-normal text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full border border-slate-200 leading-none">
                      {t("memory_book.soon_label")}
                    </span>
                  )}
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
              residentName={residentName}
              residentDob={resident?.date_of_birth ?? null}
              teamRole={teamRole}
              identityPreferredName={identity?.preferred_name ?? null}
              identityAboutMe={identity?.about_me ?? null}
              hasIdentity={hasIdentity}
              hasContacts={hasContacts}
              hasMedical={hasMedical}
              hasDailyLiving={hasDailyLiving}
              hasInsurance={hasInsurance}
              hasSubscriptions={hasSubscriptions}
              hasVehicles={hasVehicles}
              contactCount={contacts.length}
              medicalEntries={medicalEntries}
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
              residentName={residentName}
              hasIdentity={hasIdentity}
              hasContacts={hasContacts}
              hasMedical={hasMedical}
              hasInsurance={hasInsurance}
              hasFinances={hasFinances}
              hasSubscriptions={hasSubscriptions}
              hasVehicles={hasVehicles}
              hasSocialAccounts={hasSocialAccounts}
              hasHouseholdProviders={hasHouseholdProviders}
              hasHomeAddress={hasHomeAddress}
            />
          )}

          {activeTab === "memory-book" && !bookId && isOwner && (
            <InitMemoryBook residentName={residentName} onRetry={refetchBook} isRetrying={bookFetching} />
          )}

          {activeTab === "daily-living" && bookId && (
            <DailyLivingTab
              memoryBookId={bookId}
              teamId={teamId!}
              isOwner={isOwner}
            />
          )}

          {activeTab === "daily-living" && !bookId && isOwner && (
            <InitMemoryBook residentName={residentName} onRetry={refetchBook} isRetrying={bookFetching} />
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
              residentName={residentName}
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
          residentName={residentName}
          identity={identity}
          contacts={contacts}
          medical={medical}
          preferences={preferences}
          providers={providers}
          insurance={insurance}
          finances={finances}
          subscriptions={subscriptions}
          vehicles={vehicles}
          insuranceEntries={insuranceEntries}
          financeEntries={financeEntries}
          medicalEntries={medicalEntries}
          preferenceEntries={preferenceEntries}
          isOwner={isOwner}
        />
      )}
    </PageLayout>
  );
}

function InitMemoryBook({
  residentName,
  onRetry,
  isRetrying,
}: {
  residentName: string;
  onRetry: () => void;
  isRetrying: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-full bg-cyan-50 flex items-center justify-center mb-4">
        <BookOpen className="w-6 h-6 text-cyan-600" />
      </div>
      <h3 className="text-base font-semibold text-slate-700 mb-2">
        Memory Book for {residentName}
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
