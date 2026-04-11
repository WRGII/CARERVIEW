import { useState } from "react";
import { Stethoscope, Plus } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { useToast } from "../ui/ToastProvider";
import {
  useMemoryBookMedicalEntries,
  useUpsertMemoryBookMedicalEntry,
  useDeleteMemoryBookMedicalEntry,
} from "../../hooks/useMemoryBook";
import EntryCard, { AddEntryForm, SuggestedPromptChip } from "./EntryCard";
import type { EntryField } from "./EntryCard";
import ReadOnlyBanner from "./ReadOnlyBanner";
import SectionEmptyState from "./SectionEmptyState";
import ProvidersSection from "./ProvidersSection";
import type { MemoryBookMedicalEntry, MedicalEntryCategory } from "../../types/memory-book";

type Props = {
  memoryBookId: string;
  teamId: string;
  isOwner: boolean;
};

type CategoryConfig = {
  label: string;
  color: string;
  prompts: string[];
  fields: EntryField[];
};

const CATEGORIES: Record<MedicalEntryCategory, CategoryConfig> = {
  condition: {
    label: "Condition",
    color: "bg-rose-50 text-rose-700",
    prompts: [
      "Alzheimer's Disease",
      "Dementia",
      "Parkinson's Disease",
      "Diabetes - Type 2",
      "Heart Disease / CHF",
      "Hypertension",
      "COPD",
      "Arthritis",
      "Stroke",
      "Kidney Disease",
      "Osteoporosis",
      "Depression / Anxiety",
    ],
    fields: [
      { key: "label", label: "Condition Name", placeholder: "e.g. Type 2 Diabetes, Hypertension" },
      { key: "value", label: "Details / Notes", placeholder: "e.g. Diagnosed 2019, managed with medication", optional: true, multiline: true, rows: 2 },
      { key: "notes", label: "Care Instructions", placeholder: "e.g. Monitor blood sugar daily", optional: true, multiline: true, rows: 2 },
    ],
  },
  allergy: {
    label: "Allergy",
    color: "bg-orange-50 text-orange-700",
    prompts: [
      "Penicillin",
      "Aspirin / NSAIDs",
      "Sulfa Drugs",
      "Codeine / Opioids",
      "Latex",
      "Shellfish",
      "Peanuts / Tree Nuts",
      "Environmental / Pollen",
      "Iodine / Contrast Dye",
    ],
    fields: [
      { key: "label", label: "Allergy / Substance", placeholder: "e.g. Penicillin, Shellfish" },
      { key: "value", label: "Reaction / Severity", placeholder: "e.g. Anaphylaxis, hives, mild rash", optional: true },
      { key: "notes", label: "Notes", placeholder: "e.g. Carry EpiPen", optional: true, multiline: true, rows: 2 },
    ],
  },
  medication: {
    label: "Medication",
    color: "bg-cyan-50 text-cyan-700",
    prompts: [
      "Metformin",
      "Lisinopril",
      "Atorvastatin",
      "Aspirin (daily)",
      "Warfarin / Eliquis",
      "Levothyroxine",
      "Amlodipine",
      "Donepezil",
      "Memantine",
      "Furosemide",
      "Vitamin D",
      "Omega-3 / Fish Oil",
    ],
    fields: [
      { key: "label", label: "Medication Name", placeholder: "e.g. Metformin, Lisinopril" },
      { key: "value", label: "Dosage & Frequency", placeholder: "e.g. 500mg twice daily with meals", optional: true },
      { key: "notes", label: "Prescribing Doctor / Notes", placeholder: "e.g. Dr. Smith - refill every 90 days", optional: true, multiline: true, rows: 2 },
    ],
  },
  hearing: {
    label: "Hearing",
    color: "bg-violet-50 text-violet-700",
    prompts: [
      "Hearing Aids - Right Ear",
      "Hearing Aids - Left Ear",
      "Bilateral Hearing Loss",
      "Tinnitus",
      "Cochlear Implant",
    ],
    fields: [
      { key: "label", label: "Hearing Note", placeholder: "e.g. Hearing Aids - Right Ear" },
      { key: "value", label: "Details", placeholder: "e.g. Mild-moderate loss, wears hearing aid daily", optional: true, multiline: true, rows: 2 },
      { key: "notes", label: "Care Instructions", placeholder: "e.g. Change battery weekly", optional: true, multiline: true, rows: 2 },
    ],
  },
  vision: {
    label: "Vision",
    color: "bg-sky-50 text-sky-700",
    prompts: [
      "Glasses / Corrective Lenses",
      "Cataracts",
      "Macular Degeneration",
      "Glaucoma",
      "Diabetic Retinopathy",
      "Low Vision",
    ],
    fields: [
      { key: "label", label: "Vision Note", placeholder: "e.g. Glasses, Macular Degeneration" },
      { key: "value", label: "Details", placeholder: "e.g. Wears bifocals, annual eye exam needed", optional: true, multiline: true, rows: 2 },
      { key: "notes", label: "Care Instructions", placeholder: "e.g. Ensure good lighting at all times", optional: true, multiline: true, rows: 2 },
    ],
  },
  other: {
    label: "Other",
    color: "bg-slate-100 text-slate-600",
    prompts: [
      "Mobility Aid - Walker",
      "Mobility Aid - Wheelchair",
      "Fall Risk",
      "Incontinence",
      "Sleep Apnea / CPAP",
      "DNR / Advance Directive",
      "Surgical History",
    ],
    fields: [
      { key: "label", label: "Note", placeholder: "e.g. Fall Risk, Uses Walker" },
      { key: "value", label: "Details", placeholder: "Additional details", optional: true, multiline: true, rows: 2 },
      { key: "notes", label: "Care Instructions", placeholder: "e.g. Always have call button accessible", optional: true, multiline: true, rows: 2 },
    ],
  },
};

function entryToRecord(e: MemoryBookMedicalEntry): Record<string, string> {
  return {
    label: e.label,
    value: e.value,
    notes: e.notes,
    category: e.category,
  };
}

export default function MedicalSection({ memoryBookId, teamId, isOwner }: Props) {
  const { data: entries = [], isLoading } = useMemoryBookMedicalEntries(memoryBookId);
  const upsert = useUpsertMemoryBookMedicalEntry();
  const del = useDeleteMemoryBookMedicalEntry();
  const { showToast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [addCategory, setAddCategory] = useState<MedicalEntryCategory>("condition");
  const [addDefaults, setAddDefaults] = useState<Record<string, string>>({});

  const handleAdd = async (values: Record<string, string>) => {
    try {
      await upsert.mutateAsync({
        memoryBookId,
        teamId,
        entry: { ...values, category: addCategory, sort_order: entries.length } as Partial<MemoryBookMedicalEntry>,
      });
      setShowAdd(false);
      setAddDefaults({});
      showToast("Medical entry saved", "success");
    } catch (e: any) {
      showToast(e.message ?? "Error saving entry", "error");
    }
  };

  const handleUpdate = async (id: string, values: Record<string, string>) => {
    try {
      await upsert.mutateAsync({ memoryBookId, teamId, entry: { id, ...values } as Partial<MemoryBookMedicalEntry> & { id: string } });
      showToast("Entry updated", "success");
    } catch (e: any) {
      showToast(e.message ?? "Error updating entry", "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await del.mutateAsync({ id, memoryBookId, teamId });
      showToast("Entry removed", "success");
    } catch (e: any) {
      showToast(e.message ?? "Error removing entry", "error");
    }
  };

  const handlePromptClick = (cat: MedicalEntryCategory, label: string) => {
    setAddCategory(cat);
    setAddDefaults({ label, category: cat });
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

  const usedLabels = new Set(entries.map(e => e.label));

  const groupedEntries: Record<MedicalEntryCategory, MemoryBookMedicalEntry[]> = {
    condition: [],
    allergy: [],
    medication: [],
    hearing: [],
    vision: [],
    other: [],
  };
  entries.forEach(e => {
    const cat = e.category as MedicalEntryCategory;
    if (groupedEntries[cat]) groupedEntries[cat].push(e);
    else groupedEntries.other.push(e);
  });

  if (entries.length === 0 && !showAdd && !isOwner) {
    return (
      <div className="space-y-6">
        <ReadOnlyBanner />
        <ProvidersSection memoryBookId={memoryBookId} teamId={teamId} isOwner={isOwner} />
        <SectionEmptyState
          title="No medical information yet"
          description="The team owner hasn't added any medical details."
          isOwner={false}
        />
      </div>
    );
  }

  if (entries.length === 0 && !showAdd && isOwner) {
    return (
      <div className="space-y-6">
        <ProvidersSection memoryBookId={memoryBookId} teamId={teamId} isOwner={isOwner} />
        <SectionEmptyState
          title="No medical entries yet"
          description="Add conditions, allergies, medications, and care notes. Use the prompts below to get started quickly."
          isOwner={true}
          ownerAction={
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {(["condition", "allergy", "medication"] as MedicalEntryCategory[]).flatMap(cat =>
                  CATEGORIES[cat].prompts.slice(0, 2).map(p => (
                    <SuggestedPromptChip key={`${cat}-${p}`} label={p} onClick={() => handlePromptClick(cat, p)} />
                  ))
                )}
              </div>
              <button
                onClick={() => { setAddCategory("condition"); setAddDefaults({}); setShowAdd(true); }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Medical Entry
              </button>
            </div>
          }
        />
      </div>
    );
  }

  const allCategories = (["condition", "allergy", "medication", "hearing", "vision", "other"] as MedicalEntryCategory[]);

  return (
    <div className="space-y-6">
      {!isOwner && <ReadOnlyBanner />}

      <ProvidersSection memoryBookId={memoryBookId} teamId={teamId} isOwner={isOwner} />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-rose-600" />
                Medical Information
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">Conditions, allergies, medications, and care notes</p>
            </div>
            {isOwner && (
              <button
                onClick={() => { setAddCategory("condition"); setAddDefaults({}); setShowAdd(true); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 hover:border-slate-300 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            {allCategories.map(cat => {
              const catConfig = CATEGORIES[cat];
              const catEntries = groupedEntries[cat];
              const unusedPrompts = catConfig.prompts.filter(p => !usedLabels.has(p));
              const showSection = catEntries.length > 0 || (isOwner && (showAdd ? addCategory === cat : true));

              if (!showSection && !isOwner) return null;

              return (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${catConfig.color}`}>
                      {catConfig.label}
                    </span>
                    {isOwner && !showAdd && (
                      <button
                        onClick={() => { setAddCategory(cat); setAddDefaults({ category: cat }); setShowAdd(true); }}
                        className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-600 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        Add
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {catEntries.map(entry => (
                      <EntryCard
                        key={entry.id}
                        entry={entryToRecord(entry)}
                        fields={catConfig.fields}
                        isOwner={isOwner}
                        categoryColor={catConfig.color}
                        onSave={values => handleUpdate(entry.id, values)}
                        onDelete={() => handleDelete(entry.id)}
                        isSaving={upsert.isPending}
                        isDeleting={del.isPending}
                      />
                    ))}
                    {catEntries.length === 0 && (!showAdd || addCategory !== cat) && isOwner && (
                      <p className="text-xs text-slate-400 italic pl-1">No entries yet</p>
                    )}
                    {showAdd && addCategory === cat && (
                      <AddEntryForm
                        fields={catConfig.fields}
                        onSave={handleAdd}
                        onCancel={() => { setShowAdd(false); setAddDefaults({}); }}
                        isSaving={upsert.isPending}
                        defaultValues={Object.keys(addDefaults).length > 0
                          ? { ...Object.fromEntries(catConfig.fields.map(f => [f.key, ""])), ...addDefaults }
                          : undefined}
                      />
                    )}
                  </div>
                  {isOwner && unusedPrompts.length > 0 && (!showAdd || addCategory !== cat) && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {unusedPrompts.map(p => (
                        <SuggestedPromptChip key={p} label={p} onClick={() => handlePromptClick(cat, p)} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
