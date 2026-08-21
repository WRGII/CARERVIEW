import { useState, useRef } from 'react';
import { Upload, FileText, CircleAlert as AlertCircle, CircleCheck as CheckCircle, X } from 'lucide-react';
import { Button } from '../ui/Button';
import type { VisitFormData, VisitType } from '../../types/visits';
import { VISIT_TYPES } from '../../types/visits';

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (rows: VisitFormData[]) => void;
  submitting?: boolean;
};

type ParsedRow = VisitFormData & { _error?: string; _row: number };

function parseCSV(text: string): ParsedRow[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  const header = lines[0].toLowerCase().replace(/\r/g, '');
  const cols = header.split(',').map((c) => c.trim());

  const dateIdx = cols.indexOf('date');
  const timeInIdx = cols.indexOf('time_in');
  const timeOutIdx = cols.indexOf('time_out');
  const nameIdx = cols.indexOf('caregiver_name');
  const typeIdx = cols.indexOf('visit_type');
  const notesIdx = cols.indexOf('notes');

  const rows: ParsedRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].replace(/\r/g, '').trim();
    if (!line) continue;

    const parts = line.split(',').map((p) => p.trim());
    const row: ParsedRow = {
      date: parts[dateIdx] ?? '',
      time_in: parts[timeInIdx] ?? '',
      time_out: parts[timeOutIdx] ?? '',
      caregiver_name: parts[nameIdx] ?? '',
      visit_type: (parts[typeIdx] ?? 'Other') as VisitType,
      notes: parts[notesIdx] ?? '',
      hourly_rate: null,
      _row: i + 1,
    };

    // Validate
    const errors: string[] = [];
    if (!row.date || !/^\d{4}-\d{2}-\d{2}$/.test(row.date)) errors.push('Invalid date format (YYYY-MM-DD)');
    if (!row.time_in || !/^\d{2}:\d{2}$/.test(row.time_in)) errors.push('Invalid time_in (HH:MM)');
    if (!row.time_out || !/^\d{2}:\d{2}$/.test(row.time_out)) errors.push('Invalid time_out (HH:MM)');
    if (!row.caregiver_name) errors.push('Missing caregiver_name');
    if (row.time_in && row.time_out && row.time_out <= row.time_in) errors.push('time_out must be after time_in');
    if (!VISIT_TYPES.includes(row.visit_type)) errors.push(`Invalid visit_type. Use: ${VISIT_TYPES.join(', ')}`);

    if (errors.length > 0) row._error = errors.join('; ');
    rows.push(row);
  }

  return rows;
}

export default function CsvUploadModal({ open, onClose, onConfirm, submitting }: Props) {
  const [parsed, setParsed] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setParsed(parseCSV(text));
    };
    reader.readAsText(file);
  }

  const validRows = parsed.filter((r) => !r._error);
  const invalidRows = parsed.filter((r) => !!r._error);

  function handleConfirm() {
    const data: VisitFormData[] = validRows.map(({ _error, _row, ...rest }) => rest);
    onConfirm(data);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">Import Visits from CSV</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Format info */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <p className="text-sm font-medium text-slate-700 mb-2">Expected CSV format:</p>
            <code className="text-xs text-slate-600 bg-white px-3 py-2 rounded-lg block overflow-x-auto">
              date,time_in,time_out,caregiver_name,visit_type,notes<br/>
              2026-08-21,09:00,12:00,Jane Smith,Personal Care,Morning routine
            </code>
            <p className="text-xs text-slate-500 mt-2">
              Visit types: {VISIT_TYPES.join(', ')}
            </p>
          </div>

          {/* Upload area */}
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-colors"
          >
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-600">
              {fileName ? fileName : 'Click to select a CSV file'}
            </p>
            <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />
          </div>

          {/* Preview */}
          {parsed.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  {validRows.length} valid
                </span>
                {invalidRows.length > 0 && (
                  <span className="flex items-center gap-1.5 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    {invalidRows.length} invalid (will be skipped)
                  </span>
                )}
              </div>

              {/* Valid preview table */}
              {validRows.length > 0 && (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto max-h-[200px]">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left text-slate-600">Date</th>
                          <th className="px-3 py-2 text-left text-slate-600">Time</th>
                          <th className="px-3 py-2 text-left text-slate-600">Caregiver</th>
                          <th className="px-3 py-2 text-left text-slate-600">Type</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {validRows.slice(0, 20).map((r) => (
                          <tr key={r._row}>
                            <td className="px-3 py-1.5 text-slate-700">{r.date}</td>
                            <td className="px-3 py-1.5 text-slate-700">{r.time_in}-{r.time_out}</td>
                            <td className="px-3 py-1.5 text-slate-700">{r.caregiver_name}</td>
                            <td className="px-3 py-1.5 text-slate-700">{r.visit_type}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {validRows.length > 20 && (
                    <p className="text-xs text-slate-400 px-3 py-2 bg-slate-50">
                      ...and {validRows.length - 20} more rows
                    </p>
                  )}
                </div>
              )}

              {/* Error rows */}
              {invalidRows.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-1">
                  <p className="text-xs font-medium text-red-700 mb-1">Rows with errors (will be skipped):</p>
                  {invalidRows.slice(0, 5).map((r) => (
                    <p key={r._row} className="text-xs text-red-600">
                      Row {r._row}: {r._error}
                    </p>
                  ))}
                  {invalidRows.length > 5 && (
                    <p className="text-xs text-red-500">...and {invalidRows.length - 5} more</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={validRows.length === 0 || submitting}
          >
            {submitting ? 'Importing...' : `Import ${validRows.length} Visit${validRows.length !== 1 ? 's' : ''}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
