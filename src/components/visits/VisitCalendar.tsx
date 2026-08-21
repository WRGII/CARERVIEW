import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, List } from 'lucide-react';
import type { CaregiverVisit } from '../../types/visits';
import { EDIT_WINDOW_HOURS } from '../../types/visits';

type Props = {
  visits: CaregiverVisit[];
  onDateClick: (date: string) => void;
  onVisitClick: (visit: CaregiverVisit) => void;
  onAddClick: () => void;
  currentMonth: string;
  onMonthChange: (month: string) => void;
};

const VISIT_TYPE_COLORS: Record<string, string> = {
  'Personal Care': 'bg-teal-100 text-teal-800 border-teal-200',
  'Companionship': 'bg-blue-100 text-blue-800 border-blue-200',
  'Medical Support': 'bg-rose-100 text-rose-800 border-rose-200',
  'Other': 'bg-slate-100 text-slate-800 border-slate-200',
};

const VISIT_TYPE_DOTS: Record<string, string> = {
  'Personal Care': 'bg-teal-500',
  'Companionship': 'bg-blue-500',
  'Medical Support': 'bg-rose-500',
  'Other': 'bg-slate-400',
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function VisitCalendar({ visits, onDateClick, onVisitClick, onAddClick, currentMonth, onMonthChange }: Props) {
  const [view, setView] = useState<'month' | 'list'>('month');

  const [year, month] = currentMonth.split('-').map(Number);
  const daysInMonth = getDaysInMonth(year, month - 1);
  const firstDay = getFirstDayOfWeek(year, month - 1);
  const today = new Date().toISOString().slice(0, 10);

  const visitsByDate = useMemo(() => {
    const map: Record<string, CaregiverVisit[]> = {};
    for (const v of visits) {
      if (!map[v.date]) map[v.date] = [];
      map[v.date].push(v);
    }
    return map;
  }, [visits]);

  function prevMonth() {
    const d = new Date(year, month - 2, 1);
    onMonthChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  function nextMonth() {
    const d = new Date(year, month, 1);
    onMonthChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  const monthLabel = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const sortedVisits = useMemo(() =>
    [...visits].sort((a, b) => a.date < b.date ? 1 : a.date > b.date ? -1 : a.time_in.localeCompare(b.time_in)),
    [visits]
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 min-w-[160px] text-center">{monthLabel}</h2>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center bg-slate-100 rounded-lg p-0.5">
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${view === 'month' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${view === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            onClick={onAddClick}
            className="flex items-center gap-1.5 px-3 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Schedule Visit</span>
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 sm:px-6 py-2 flex flex-wrap gap-3 border-b border-slate-50 bg-slate-50/50">
        {Object.entries(VISIT_TYPE_DOTS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
            <span className="text-xs text-slate-600">{type}</span>
          </div>
        ))}
      </div>

      {view === 'month' ? (
        <div className="p-2 sm:p-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-center text-xs font-medium text-slate-400 py-2">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-px bg-slate-100 rounded-lg overflow-hidden">
            {/* Empty cells before first day */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-slate-50 min-h-[72px] sm:min-h-[88px]" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayVisits = visitsByDate[dateStr] ?? [];
              const isToday = dateStr === today;
              const isPast = dateStr < today;

              return (
                <div
                  key={day}
                  onClick={() => onDateClick(dateStr)}
                  className={`bg-white min-h-[72px] sm:min-h-[88px] p-1 cursor-pointer hover:bg-teal-50/50 transition-colors relative ${isPast ? 'opacity-80' : ''}`}
                >
                  <span className={`text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full ${isToday ? 'bg-teal-600 text-white' : 'text-slate-700'}`}>
                    {day}
                  </span>
                  <div className="mt-0.5 space-y-0.5">
                    {dayVisits.slice(0, 3).map((v) => (
                      <button
                        key={v.id}
                        onClick={(e) => { e.stopPropagation(); onVisitClick(v); }}
                        className={`w-full text-left text-[10px] sm:text-xs truncate px-1 py-0.5 rounded border ${VISIT_TYPE_COLORS[v.visit_type] ?? VISIT_TYPE_COLORS['Other']}`}
                      >
                        {v.time_in.slice(0, 5)} {v.caregiver_name.split(' ')[0]}
                      </button>
                    ))}
                    {dayVisits.length > 3 && (
                      <span className="text-[10px] text-slate-400 px-1">+{dayVisits.length - 3} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List view */
        <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
          {sortedVisits.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-400">
              No visits recorded for this month.
            </div>
          )}
          {sortedVisits.map((v) => {
            const isPast = v.date < today;
            const canEdit = v.created_by === 'self' || (new Date(v.created_at).getTime() + EDIT_WINDOW_HOURS * 3600000 > Date.now());
            return (
              <button
                key={v.id}
                onClick={() => onVisitClick(v)}
                className="w-full flex items-center gap-4 px-4 sm:px-6 py-3 hover:bg-slate-50 transition-colors text-left"
              >
                <div className={`w-3 h-3 rounded-full shrink-0 ${VISIT_TYPE_DOTS[v.visit_type] ?? VISIT_TYPE_DOTS['Other']}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900 truncate">{v.caregiver_name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${isPast ? 'bg-slate-100 text-slate-500' : 'bg-teal-50 text-teal-700'}`}>
                      {isPast ? 'Completed' : 'Scheduled'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(v.date + 'T00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    {' '}&middot;{' '}{v.time_in.slice(0, 5)} - {v.time_out.slice(0, 5)}
                    {' '}&middot;{' '}{v.visit_type}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
