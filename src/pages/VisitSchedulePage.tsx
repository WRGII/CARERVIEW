import { useState } from 'react';
import { CalendarDays, Upload } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useActiveTeam } from '../context/ActiveTeam';
import { useVisits, useCreateVisit, useUpdateVisit, useDeleteVisit, useBulkCreateVisits } from '../hooks/useVisits';
import { useUserPlan, hasActivePlan } from '../hooks/useUserPlan';
import { cvListMembersWithProfile } from '../lib/cv';
import VisitCalendar from '../components/visits/VisitCalendar';
import VisitFormModal from '../components/visits/VisitFormModal';
import VisitSummaryWidget from '../components/visits/VisitSummaryWidget';
import CsvUploadModal from '../components/visits/CsvUploadModal';
import { PageLayout } from '../components/layout/PageLayout';
import { Loading } from '../components/ui/Loading';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import type { CaregiverVisit, VisitFormData } from '../types/visits';

export default function VisitSchedulePage() {
  const { user, profile } = useAuth();
  const { teamId } = useActiveTeam();
  const planQuery = useUserPlan();
  const paid = hasActivePlan(planQuery.data);

  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  );

  const { data: visits = [], isLoading, error } = useVisits(currentMonth);

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-members', teamId],
    enabled: !!teamId,
    queryFn: async () => {
      const members = await cvListMembersWithProfile(teamId!);
      return members.map((m) => ({
        user_id: m.user_id,
        display_name: m.display_name || m.email,
      }));
    },
    staleTime: 5 * 60_000,
  });

  const createVisit = useCreateVisit();
  const updateVisit = useUpdateVisit();
  const deleteVisit = useDeleteVisit();
  const bulkCreate = useBulkCreateVisits();

  const [formOpen, setFormOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<CaregiverVisit | null>(null);
  const [csvOpen, setCsvOpen] = useState(false);
  const [formError, setFormError] = useState('');

  const isOwner = !!teamId;

  function handleAddClick() {
    setEditingVisit(null);
    setFormOpen(true);
  }

  function handleVisitClick(visit: CaregiverVisit) {
    setEditingVisit(visit);
    setFormOpen(true);
  }

  function handleDateClick(date: string) {
    setEditingVisit(null);
    setFormOpen(true);
  }

  async function handleFormSubmit(data: VisitFormData) {
    setFormError('');
    try {
      if (editingVisit) {
        await updateVisit.mutateAsync({ id: editingVisit.id, form: data });
      } else {
        await createVisit.mutateAsync(data);
      }
      setFormOpen(false);
      setEditingVisit(null);
    } catch (err: any) {
      setFormError(err.message ?? 'Failed to save visit');
    }
  }

  async function handleCsvConfirm(rows: VisitFormData[]) {
    try {
      await bulkCreate.mutateAsync(rows);
      setCsvOpen(false);
    } catch (err: any) {
      // error handled by mutation
    }
  }

  if (!user || !profile) return <Loading />;

  if (!paid) {
    return (
      <PageLayout>
        <div className="max-w-lg mx-auto text-center py-16">
          <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Care Schedule</h1>
          <p className="text-sm text-slate-500">
            Upgrade to a paid plan to access the care scheduling feature.
          </p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Care Schedule</h1>
            <p className="text-sm text-slate-500 mt-1">
              Schedule and track caregiver visits for your resident.
            </p>
          </div>
          <button
            onClick={() => setCsvOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
        </div>

        {/* Summary widget */}
        <VisitSummaryWidget
          visits={visits}
          userId={user.id}
          showTeamSummary={isOwner}
          teamMembers={teamMembers}
        />

        {/* Calendar */}
        {isLoading ? (
          <Loading />
        ) : error ? (
          <ErrorMessage message="Failed to load visits. Please try again." />
        ) : (
          <VisitCalendar
            visits={visits}
            onDateClick={handleDateClick}
            onVisitClick={handleVisitClick}
            onAddClick={handleAddClick}
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
          />
        )}

        {/* Form modal */}
        <VisitFormModal
          open={formOpen}
          onClose={() => { setFormOpen(false); setEditingVisit(null); }}
          onSubmit={handleFormSubmit}
          visit={editingVisit}
          submitting={createVisit.isPending || updateVisit.isPending}
          teamMembers={teamMembers}
        />

        {/* CSV upload modal */}
        <CsvUploadModal
          open={csvOpen}
          onClose={() => setCsvOpen(false)}
          onConfirm={handleCsvConfirm}
          submitting={bulkCreate.isPending}
        />
      </div>
    </PageLayout>
  );
}
