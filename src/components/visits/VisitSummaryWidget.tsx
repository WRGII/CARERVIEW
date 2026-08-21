import { useMemo } from 'react';
import { Clock, DollarSign, Users, TrendingUp, User } from 'lucide-react';
import type { CaregiverVisit } from '../../types/visits';

export type MemberInfo = {
  user_id: string;
  display_name: string;
};

type Props = {
  visits: CaregiverVisit[];
  userId?: string | null;
  showTeamSummary?: boolean;
  teamMembers?: MemberInfo[];
};

function calcHours(timeIn: string, timeOut: string): number {
  const [hIn, mIn] = timeIn.split(':').map(Number);
  const [hOut, mOut] = timeOut.split(':').map(Number);
  return Math.max(0, (hOut * 60 + mOut - hIn * 60 - mIn) / 60);
}

function getWeekKey(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00');
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
  return `W${week}`;
}

type MemberStats = {
  display_name: string;
  weekHours: number;
  monthHours: number;
  totalVisits: number;
  totalCost: number;
};

export default function VisitSummaryWidget({ visits, userId, showTeamSummary, teamMembers = [] }: Props) {
  const thisMonth = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);
  const thisWeek = useMemo(() => getWeekKey(new Date().toISOString().slice(0, 10)), []);

  const stats = useMemo(() => {
    const personalVisits = userId ? visits.filter((v) => v.created_by === userId) : visits;
    const teamVisits = visits;

    function computeStats(list: CaregiverVisit[]) {
      let totalHours = 0;
      let totalCost = 0;
      let weekHours = 0;
      let monthHours = 0;
      const caregiverHours: Record<string, number> = {};

      for (const v of list) {
        const h = calcHours(v.time_in, v.time_out);
        totalHours += h;
        const rate = v.hourly_rate ?? 0;
        totalCost += h * rate;

        if (v.date.startsWith(thisMonth)) monthHours += h;
        if (getWeekKey(v.date) === thisWeek) weekHours += h;

        caregiverHours[v.caregiver_name] = (caregiverHours[v.caregiver_name] ?? 0) + h;
      }

      return { totalHours, totalCost, weekHours, monthHours, caregiverHours, count: list.length };
    }

    return {
      personal: computeStats(personalVisits),
      team: showTeamSummary ? computeStats(teamVisits) : null,
    };
  }, [visits, userId, showTeamSummary, thisMonth, thisWeek]);

  const topCaregivers = useMemo(() => {
    const entries = Object.entries(stats.personal.caregiverHours);
    entries.sort((a, b) => b[1] - a[1]);
    return entries.slice(0, 5);
  }, [stats.personal.caregiverHours]);

  const memberBreakdown = useMemo((): MemberStats[] => {
    if (!showTeamSummary || teamMembers.length === 0) return [];

    const byCreator: Record<string, { weekH: number; monthH: number; visits: number; cost: number }> = {};

    for (const v of visits) {
      if (!byCreator[v.created_by]) {
        byCreator[v.created_by] = { weekH: 0, monthH: 0, visits: 0, cost: 0 };
      }
      const h = calcHours(v.time_in, v.time_out);
      const rate = v.hourly_rate ?? 0;
      byCreator[v.created_by].visits++;
      byCreator[v.created_by].cost += h * rate;
      if (v.date.startsWith(thisMonth)) byCreator[v.created_by].monthH += h;
      if (getWeekKey(v.date) === thisWeek) byCreator[v.created_by].weekH += h;
    }

    return teamMembers.map((m) => {
      const s = byCreator[m.user_id];
      return {
        display_name: m.display_name,
        weekHours: s?.weekH ?? 0,
        monthHours: s?.monthH ?? 0,
        totalVisits: s?.visits ?? 0,
        totalCost: s?.cost ?? 0,
      };
    }).filter((m) => m.totalVisits > 0 || m.weekHours > 0);
  }, [visits, teamMembers, showTeamSummary, thisMonth, thisWeek]);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
        Caregiver Hours Summary
      </h3>

      {/* Personal stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={<Clock className="w-4 h-4 text-teal-600" />}
          label="This Week"
          value={`${stats.personal.weekHours.toFixed(1)}h`}
        />
        <StatCard
          icon={<TrendingUp className="w-4 h-4 text-blue-600" />}
          label="This Month"
          value={`${stats.personal.monthHours.toFixed(1)}h`}
        />
        <StatCard
          icon={<Users className="w-4 h-4 text-amber-600" />}
          label="Total Visits"
          value={String(stats.personal.count)}
        />
        <StatCard
          icon={<DollarSign className="w-4 h-4 text-green-600" />}
          label="Est. Cost (Month)"
          value={`$${stats.personal.totalCost.toFixed(0)}`}
        />
      </div>

      {/* Top caregivers */}
      {topCaregivers.length > 0 && (
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-xs font-medium text-slate-500 mb-2">Hours by Caregiver</p>
          <div className="space-y-2">
            {topCaregivers.map(([name, hours]) => (
              <div key={name} className="flex items-center justify-between">
                <span className="text-sm text-slate-700 truncate">{name}</span>
                <span className="text-sm font-medium text-slate-900">{hours.toFixed(1)}h</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team aggregate */}
      {stats.team && (
        <div className="border-t border-slate-200 pt-4 mt-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Family Circle Total
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              icon={<Clock className="w-4 h-4 text-teal-600" />}
              label="This Week"
              value={`${stats.team.weekHours.toFixed(1)}h`}
            />
            <StatCard
              icon={<TrendingUp className="w-4 h-4 text-blue-600" />}
              label="This Month"
              value={`${stats.team.monthHours.toFixed(1)}h`}
            />
            <StatCard
              icon={<Users className="w-4 h-4 text-amber-600" />}
              label="Total Visits"
              value={String(stats.team.count)}
            />
            <StatCard
              icon={<DollarSign className="w-4 h-4 text-green-600" />}
              label="Est. Cost (Total)"
              value={`$${stats.team.totalCost.toFixed(0)}`}
            />
          </div>

          {/* Per-member breakdown */}
          {memberBreakdown.length > 0 && (
            <div className="mt-4 bg-slate-50 rounded-xl p-4">
              <p className="text-xs font-medium text-slate-500 mb-3">Hours by Team Member</p>
              <div className="space-y-3">
                {memberBreakdown.map((m) => (
                  <div key={m.display_name} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5 text-teal-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{m.display_name}</p>
                      <p className="text-xs text-slate-500">
                        {m.weekHours.toFixed(1)}h this week &middot; {m.monthHours.toFixed(1)}h this month &middot; {m.totalVisits} visits
                        {m.totalCost > 0 && <> &middot; ${m.totalCost.toFixed(0)}</>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <span className="text-lg font-bold text-slate-900">{value}</span>
    </div>
  );
}
