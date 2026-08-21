import { useState, useEffect, useMemo } from 'react';
import { X, Clock, TriangleAlert as AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import type { CaregiverVisit, VisitFormData, VisitType } from '../../types/visits';
import { VISIT_TYPES, EDIT_WINDOW_HOURS } from '../../types/visits';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: VisitFormData) => void;
  visit?: CaregiverVisit | null;
  submitting?: boolean;
};

function formatDuration(timeIn: string, timeOut: string): string {
  if (!timeIn || !timeOut) return '';
  const [hIn, mIn] = timeIn.split(':').map(Number);
  const [hOut, mOut] = timeOut.split(':').map(Number);
  const mins = (hOut * 60 + mOut) - (hIn * 60 + mIn);
  if (mins <= 0) return '';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

function hoursUntilExpiry(createdAt: string): number {
  const created = new Date(createdAt).getTime();
  const expiry = created + EDIT_WINDOW_HOURS * 60 * 60 * 1000;
  return Math.max(0, (expiry - Date.now()) / (60 * 60 * 1000));
}

export default function VisitFormModal({ open, onClose, onSubmit, visit, submitting }: Props) {
  const [form, setForm] = useState<VisitFormData>({
    date: '',
    time_in: '',
    time_out: '',
    caregiver_name: '',
    visit_type: 'Personal Care',
    notes: '',
    hourly_rate: null,
  });
  const [error, setError] = useState('');

  const isEdit = !!visit;
  const editExpired = isEdit && visit ? hoursUntilExpiry(visit.created_at) <= 0 : false;
  const expiryWarning = isEdit && visit ? hoursUntilExpiry(visit.created_at) <= 2 && hoursUntilExpiry(visit.created_at) > 0 : false;

  useEffect(() => {
    if (visit) {
      setForm({
        date: visit.date,
        time_in: visit.time_in.slice(0, 5),
        time_out: visit.time_out.slice(0, 5),
        caregiver_name: visit.caregiver_name,
        visit_type: visit.visit_type as VisitType,
        notes: visit.notes ?? '',
        hourly_rate: visit.hourly_rate,
      });
    } else {
      setForm({
        date: new Date().toISOString().slice(0, 10),
        time_in: '',
        time_out: '',
        caregiver_name: '',
        visit_type: 'Personal Care',
        notes: '',
        hourly_rate: null,
      });
    }
    setError('');
  }, [visit, open]);

  const duration = useMemo(() => formatDuration(form.time_in, form.time_out), [form.time_in, form.time_out]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.date || !form.time_in || !form.time_out || !form.caregiver_name.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (form.time_out <= form.time_in) {
      setError('End time must be after start time.');
      return;
    }
    onSubmit({ ...form, caregiver_name: form.caregiver_name.trim() });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">
            {isEdit ? (editExpired ? 'View Visit' : 'Edit Visit') : 'Log Visit'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {editExpired && (
          <div className="mx-6 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-800">
              The {EDIT_WINDOW_HOURS}-hour edit window has passed. This entry is now read-only.
            </p>
          </div>
        )}

        {expiryWarning && !editExpired && (
          <div className="mx-6 mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-2">
            <Clock className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
            <p className="text-sm text-orange-800">
              Edit window expires soon. You have less than 2 hours remaining to make changes.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                disabled={editExpired}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Visit Type *</label>
              <select
                value={form.visit_type}
                onChange={(e) => setForm({ ...form, visit_type: e.target.value as VisitType })}
                disabled={editExpired}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-500"
              >
                {VISIT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Time In *</label>
              <input
                type="time"
                value={form.time_in}
                onChange={(e) => setForm({ ...form, time_in: e.target.value })}
                disabled={editExpired}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Time Out *</label>
              <input
                type="time"
                value={form.time_out}
                onChange={(e) => setForm({ ...form, time_out: e.target.value })}
                disabled={editExpired}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
            {duration && (
              <div className="flex items-center gap-1.5 text-sm text-teal-700 font-medium bg-teal-50 px-3 py-2 rounded-lg">
                <Clock className="w-4 h-4" />
                {duration}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Caregiver Name *</label>
            <input
              type="text"
              value={form.caregiver_name}
              onChange={(e) => setForm({ ...form, caregiver_name: e.target.value })}
              disabled={editExpired}
              maxLength={200}
              placeholder="e.g. Jane Smith"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Hourly Rate (optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.hourly_rate ?? ''}
                onChange={(e) => setForm({ ...form, hourly_rate: e.target.value ? parseFloat(e.target.value) : null })}
                disabled={editExpired}
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              disabled={editExpired}
              maxLength={2000}
              rows={3}
              placeholder="Any details about the visit..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-500 resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          {!editExpired && (
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : (isEdit ? 'Update Visit' : 'Log Visit')}
              </Button>
            </div>
          )}

          {editExpired && (
            <div className="flex justify-end pt-2">
              <Button type="button" variant="ghost" onClick={onClose}>Close</Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
