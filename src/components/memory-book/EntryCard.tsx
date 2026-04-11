import { useState } from "react";
import { Pencil, Trash2, Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../ui/Button";

export type EntryField = {
  key: string;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  optional?: boolean;
};

type Props = {
  entry: Record<string, string>;
  fields: EntryField[];
  isOwner: boolean;
  onSave: (updated: Record<string, string>) => Promise<void>;
  onDelete: () => Promise<void>;
  isSaving?: boolean;
  isDeleting?: boolean;
  categoryBadge?: string;
  categoryColor?: string;
};

export default function EntryCard({
  entry,
  fields,
  isOwner,
  onSave,
  onDelete,
  isSaving,
  isDeleting,
  categoryBadge,
  categoryColor = "bg-slate-100 text-slate-600",
}: Props) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, string>>(entry);
  const [expanded, setExpanded] = useState(false);

  const primaryField = fields[0];
  const secondaryFields = fields.slice(1);
  const hasFilledSecondary = secondaryFields.some(f => !!entry[f.key]);

  const handleSave = async () => {
    await onSave(form);
    setEditing(false);
  };

  const handleCancel = () => {
    setForm(entry);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="bg-white border border-cyan-300 rounded-xl p-4 shadow-sm space-y-3">
        {fields.map(field => (
          <div key={field.key}>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              {field.label}
              {field.optional && <span className="text-slate-400 font-normal normal-case ml-1">(optional)</span>}
            </label>
            {field.multiline ? (
              <textarea
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 shadow-sm focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600 bg-white text-slate-800 leading-relaxed resize-none"
                value={form[field.key] ?? ""}
                onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                rows={field.rows ?? 2}
              />
            ) : (
              <input
                type="text"
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 shadow-sm focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600 bg-white text-slate-800"
                value={form[field.key] ?? ""}
                onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
              />
            )}
          </div>
        ))}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 text-white text-xs font-medium hover:bg-cyan-700 transition-colors disabled:opacity-60"
          >
            <Check className="w-3.5 h-3.5" />
            {isSaving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={handleCancel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm hover:border-slate-300 transition-colors">
      <div className="flex items-start gap-3 px-4 py-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {categoryBadge && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${categoryColor}`}>
                {categoryBadge}
              </span>
            )}
            <p className="text-sm font-semibold text-slate-800 truncate">
              {entry[primaryField.key] || <span className="text-slate-400 font-normal italic">Untitled</span>}
            </p>
          </div>
          {hasFilledSecondary && (
            <div className={[
              "overflow-hidden transition-all duration-200",
              expanded ? "max-h-96 mt-3" : "max-h-0",
            ].join(" ")}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                {secondaryFields.map(f => {
                  if (!entry[f.key]) return null;
                  return (
                    <div key={f.key}>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{f.label}</p>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{entry[f.key]}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {hasFilledSecondary && (
            <button
              onClick={() => setExpanded(v => !v)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
          {isOwner && (
            <>
              <button
                onClick={() => { setForm(entry); setEditing(true); setExpanded(false); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onDelete}
                disabled={isDeleting}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

type AddEntryFormProps = {
  fields: EntryField[];
  onSave: (values: Record<string, string>) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
  defaultValues?: Record<string, string>;
};

export function AddEntryForm({ fields, onSave, onCancel, isSaving, defaultValues }: AddEntryFormProps) {
  const [form, setForm] = useState<Record<string, string>>(
    defaultValues ?? Object.fromEntries(fields.map(f => [f.key, ""]))
  );

  const handleSave = async () => {
    await onSave(form);
  };

  return (
    <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 space-y-3">
      {fields.map(field => (
        <div key={field.key}>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
            {field.label}
            {field.optional && <span className="text-slate-400 font-normal normal-case ml-1">(optional)</span>}
          </label>
          {field.multiline ? (
            <textarea
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 shadow-sm focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600 bg-white text-slate-800 leading-relaxed resize-none"
              value={form[field.key] ?? ""}
              onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
              placeholder={field.placeholder}
              rows={field.rows ?? 2}
            />
          ) : (
            <input
              type="text"
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 shadow-sm focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600 bg-white text-slate-800"
              value={form[field.key] ?? ""}
              onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
              placeholder={field.placeholder}
            />
          )}
        </div>
      ))}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleSave}
          disabled={isSaving || !form[fields[0].key]?.trim()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 text-white text-xs font-medium hover:bg-cyan-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Check className="w-3.5 h-3.5" />
          {isSaving ? "Saving..." : "Add Entry"}
        </button>
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Cancel
        </button>
      </div>
    </div>
  );
}

type SuggestedPromptChipProps = {
  label: string;
  onClick: () => void;
};

export function SuggestedPromptChip({ label, onClick }: SuggestedPromptChipProps) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-dashed border-slate-300 text-xs font-medium text-slate-500 hover:border-cyan-400 hover:text-cyan-600 hover:bg-cyan-50 transition-colors"
    >
      <span>+</span>
      {label}
    </button>
  );
}
