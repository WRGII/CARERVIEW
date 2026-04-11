import { useState } from "react";
import { ShieldCheck, Plus } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { useToast } from "../ui/ToastProvider";
import {
  useMemoryBookInsuranceEntries,
  useUpsertMemoryBookInsuranceEntry,
  useDeleteMemoryBookInsuranceEntry,
} from "../../hooks/useMemoryBook";
import EntryCard, { AddEntryForm, SuggestedPromptChip } from "./EntryCard";
import type { EntryField } from "./EntryCard";
import ReadOnlyBanner from "./ReadOnlyBanner";
import SectionEmptyState from "./SectionEmptyState";
import type { MemoryBookInsuranceEntry } from "../../types/memory-book";

type Props = {
  memoryBookId: string;
  teamId: string;
  isOwner: boolean;
};

const ENTRY_FIELDS: EntryField[] = [
  { key: "label", label: "Policy Type / Label", placeholder: "e.g. Health - Primary, Auto, Home & Contents" },
  { key: "insurer", label: "Insurance Company", placeholder: "e.g. Blue Cross Blue Shield", optional: true },
  { key: "policy_number", label: "Policy / Plan Number", placeholder: "e.g. XYZ-123456", optional: true },
  { key: "member_id", label: "Member ID", placeholder: "e.g. 987654321", optional: true },
  { key: "coverage_type", label: "Coverage Details", placeholder: "e.g. HMO, $500 deductible, in-network only", optional: true },
  { key: "notes", label: "Notes", placeholder: "Any additional information", optional: true, multiline: true, rows: 2 },
];

const SUGGESTED_PROMPTS = [
  "Health - Primary",
  "Health - Secondary",
  "Dental & Vision",
  "Medicare Part A & B",
  "Medicare Part D",
  "Long-Term Care",
  "Life Insurance",
  "Disability",
  "Auto",
  "Home & Contents",
  "Renters Insurance",
  "Supplemental / Medigap",
];

function entryCategoryColor(): string {
  return "bg-teal-50 text-teal-700";
}

function entryToRecord(e: MemoryBookInsuranceEntry): Record<string, string> {
  return {
    label: e.label,
    insurer: e.insurer,
    policy_number: e.policy_number,
    member_id: e.member_id,
    coverage_type: e.coverage_type,
    notes: e.notes,
  };
}

export default function InsuranceSection({ memoryBookId, teamId, isOwner }: Props) {
  const { data: entries = [], isLoading } = useMemoryBookInsuranceEntries(memoryBookId);
  const upsert = useUpsertMemoryBookInsuranceEntry();
  const del = useDeleteMemoryBookInsuranceEntry();
  const { showToast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [addDefaults, setAddDefaults] = useState<Record<string, string>>({});

  const handleAdd = async (values: Record<string, string>) => {
    try {
      await upsert.mutateAsync({
        memoryBookId,
        teamId,
        entry: { ...values, sort_order: entries.length },
      });
      setShowAdd(false);
      setAddDefaults({});
      showToast("Insurance policy saved", "success");
    } catch (e: any) {
      showToast(e.message ?? "Error saving entry", "error");
    }
  };

  const handleUpdate = async (id: string, values: Record<string, string>) => {
    try {
      await upsert.mutateAsync({ memoryBookId, teamId, entry: { id, ...values } });
      showToast("Insurance policy updated", "success");
    } catch (e: any) {
      showToast(e.message ?? "Error updating entry", "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await del.mutateAsync({ id, memoryBookId, teamId });
      showToast("Policy removed", "success");
    } catch (e: any) {
      showToast(e.message ?? "Error removing entry", "error");
    }
  };

  const handlePromptClick = (label: string) => {
    setAddDefaults({ label });
    setShowAdd(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const usedPrompts = new Set(entries.map(e => e.label));
  const unusedPrompts = SUGGESTED_PROMPTS.filter(p => !usedPrompts.has(p));

  if (entries.length === 0 && !showAdd) {
    if (!isOwner) {
      return (
        <SectionEmptyState
          title="No insurance information yet"
          description="The team owner hasn't added any insurance details."
          isOwner={false}
        />
      );
    }
    return (
      <SectionEmptyState
        title="No insurance policies added yet"
        description="Add health, auto, home, life, and other insurance policies. Use the prompts below to get started quickly."
        isOwner={true}
        ownerAction={
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.slice(0, 6).map(p => (
                <SuggestedPromptChip key={p} label={p} onClick={() => handlePromptClick(p)} />
              ))}
            </div>
            <button
              onClick={() => { setAddDefaults({}); setShowAdd(true); }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Insurance Policy
            </button>
          </div>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {!isOwner && <ReadOnlyBanner />}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                Insurance Policies
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">Health, auto, home, life, and other coverage</p>
            </div>
            {isOwner && (
              <button
                onClick={() => { setAddDefaults({}); setShowAdd(true); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 hover:border-slate-300 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {entries.map(entry => (
              <EntryCard
                key={entry.id}
                entry={entryToRecord(entry)}
                fields={ENTRY_FIELDS}
                isOwner={isOwner}
                categoryBadge={entry.label}
                categoryColor={entryCategoryColor()}
                onSave={values => handleUpdate(entry.id, values)}
                onDelete={() => handleDelete(entry.id)}
                isSaving={upsert.isPending}
                isDeleting={del.isPending}
              />
            ))}

            {showAdd && isOwner && (
              <AddEntryForm
                fields={ENTRY_FIELDS}
                onSave={handleAdd}
                onCancel={() => { setShowAdd(false); setAddDefaults({}); }}
                isSaving={upsert.isPending}
                defaultValues={Object.keys(addDefaults).length > 0
                  ? { ...Object.fromEntries(ENTRY_FIELDS.map(f => [f.key, ""])), ...addDefaults }
                  : undefined}
              />
            )}
          </div>

          {isOwner && unusedPrompts.length > 0 && !showAdd && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Quick Add</p>
              <div className="flex flex-wrap gap-2">
                {unusedPrompts.map(p => (
                  <SuggestedPromptChip key={p} label={p} onClick={() => handlePromptClick(p)} />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
