import { useState } from "react";
import { Activity, Heart, Plus, ChevronDown, ChevronUp, Trash2, Pencil, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { useToast } from "../ui/ToastProvider";
import {
  useMemoryBookDailyLivingEntries,
  useUpsertMemoryBookDailyLivingEntry,
  useDeleteMemoryBookDailyLivingEntry,
} from "../../hooks/useMemoryBook";
import PreferencesSection from "./PreferencesSection";
import ReadOnlyBanner from "./ReadOnlyBanner";
import SectionEmptyState from "./SectionEmptyState";
import type {
  MemoryBookDailyLivingEntry,
  ADLCategory,
  IADLCategory,
  IndependenceLevel,
  DailyLivingSection,
} from "../../types/memory-book";

type Props = {
  memoryBookId: string;
  teamId: string;
  isOwner: boolean;
};

type CategoryConfig = {
  label: string;
  prompts: string[];
};

const ADL_CATEGORIES: Record<ADLCategory, CategoryConfig> = {
  bathing: {
    label: "Bathing & Hygiene",
    prompts: ["Shower / Bath", "Sponge Bath", "Hair Washing", "Oral Care", "Nail Care"],
  },
  dressing: {
    label: "Dressing",
    prompts: ["Choosing Clothing", "Putting On Clothes", "Buttons / Zippers", "Footwear"],
  },
  grooming: {
    label: "Grooming",
    prompts: ["Shaving", "Hair Brushing / Styling", "Skincare / Moisturising", "Make-up"],
  },
  mobility: {
    label: "Mobility",
    prompts: ["Walking / Ambulation", "Stair Navigation", "Outdoor Walking", "Balance / Steadiness"],
  },
  transfers: {
    label: "Transfers",
    prompts: ["Bed to Chair", "Chair to Toilet", "Car Transfers", "Standing from Seated"],
  },
  eating: {
    label: "Eating & Swallowing",
    prompts: ["Self-Feeding", "Swallowing Safety", "Using Utensils", "Drinking Independently"],
  },
  continence: {
    label: "Continence",
    prompts: ["Bladder Control", "Bowel Control", "Managing Incontinence Aids"],
  },
  toileting: {
    label: "Toileting",
    prompts: ["Getting to Toilet", "Toilet Use", "Hygiene After Toileting", "Commode Use"],
  },
  other: {
    label: "Other ADL",
    prompts: [],
  },
};

const IADL_CATEGORIES: Record<IADLCategory, CategoryConfig> = {
  meal_prep: {
    label: "Meal Preparation",
    prompts: ["Making Breakfast", "Preparing Hot Meals", "Using Microwave", "Safely Using Stove"],
  },
  medications: {
    label: "Medication Management",
    prompts: ["Taking Medications On Time", "Organising Pills / Dosette", "Recognising Own Medications"],
  },
  housekeeping: {
    label: "Housekeeping",
    prompts: ["Tidying / Cleaning", "Vacuuming", "Dish Washing", "Laundry (see below)"],
  },
  laundry: {
    label: "Laundry",
    prompts: ["Sorting Laundry", "Using Washing Machine", "Folding / Putting Away Clothes"],
  },
  transportation: {
    label: "Transportation",
    prompts: ["Driving", "Using Public Transit", "Getting to Appointments"],
  },
  shopping: {
    label: "Shopping",
    prompts: ["Grocery Shopping", "Online Ordering", "Managing a Shopping List"],
  },
  finances_mgmt: {
    label: "Finances",
    prompts: ["Paying Bills", "Managing Cash", "Online Banking", "Understanding Bank Statements"],
  },
  communication: {
    label: "Communication",
    prompts: ["Using a Phone", "Texting / Email", "Answering the Door / Intercom"],
  },
  other: {
    label: "Other IADL",
    prompts: [],
  },
};

const INDEPENDENCE_LEVELS: { value: IndependenceLevel; label: string; color: string; dot: string }[] = [
  { value: "independent",      label: "Independent",      color: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-500" },
  { value: "needs_reminders",  label: "Needs Reminders",  color: "bg-sky-100 text-sky-800",         dot: "bg-sky-500" },
  { value: "supervision",      label: "Supervision",      color: "bg-amber-100 text-amber-800",     dot: "bg-amber-500" },
  { value: "assistance",       label: "Assistance",       color: "bg-orange-100 text-orange-800",   dot: "bg-orange-500" },
  { value: "fully_dependent",  label: "Fully Dependent",  color: "bg-red-100 text-red-800",         dot: "bg-red-500" },
];

function levelInfo(level: IndependenceLevel) {
  return INDEPENDENCE_LEVELS.find(l => l.value === level) ?? INDEPENDENCE_LEVELS[0];
}

type AddFormState = {
  section: DailyLivingSection;
  category: ADLCategory | IADLCategory;
  label: string;
  independence_level: IndependenceLevel;
  notes: string;
};

type EditState = AddFormState & { id: string };

function AddEntryRow({
  section,
  category,
  memoryBookId,
  teamId,
  onClose,
}: {
  section: DailyLivingSection;
  category: ADLCategory | IADLCategory;
  memoryBookId: string;
  teamId: string;
  onClose: () => void;
}) {
  const { showToast } = useToast();
  const upsert = useUpsertMemoryBookDailyLivingEntry();
  const [form, setForm] = useState<Omit<AddFormState, "section" | "category">>({
    label: "",
    independence_level: "independent",
    notes: "",
  });

  const categoryConfig = section === "adl"
    ? ADL_CATEGORIES[category as ADLCategory]
    : IADL_CATEGORIES[category as IADLCategory];

  async function handleSave() {
    if (!form.label.trim()) return;
    try {
      await upsert.mutateAsync({
        memoryBookId,
        teamId,
        entry: { section, category, ...form, label: form.label.trim() },
      });
      showToast("Entry added", "success");
      onClose();
    } catch {
      showToast("Could not save entry", "error");
    }
  }

  return (
    <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
      {categoryConfig.prompts.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {categoryConfig.prompts.map(p => (
            <button
              key={p}
              onClick={() => setForm(f => ({ ...f, label: p }))}
              className="px-2.5 py-1 text-xs rounded-full border border-slate-300 bg-white hover:border-cyan-400 hover:bg-cyan-50 hover:text-cyan-700 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      )}
      <input
        value={form.label}
        onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
        placeholder={`Describe the task or activity…`}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
      />
      <div>
        <p className="text-xs font-medium text-slate-600 mb-1.5">Independence Level</p>
        <div className="flex flex-wrap gap-2">
          {INDEPENDENCE_LEVELS.map(l => (
            <button
              key={l.value}
              onClick={() => setForm(f => ({ ...f, independence_level: l.value }))}
              className={[
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                form.independence_level === l.value
                  ? `${l.color} border-current ring-2 ring-offset-1 ring-current/30`
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300",
              ].join(" ")}
            >
              <span className={`w-2 h-2 rounded-full ${l.dot}`} />
              {l.label}
            </button>
          ))}
        </div>
      </div>
      <textarea
        value={form.notes}
        onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
        placeholder="Notes or care instructions (optional)"
        rows={2}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent resize-none"
      />
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleSave}
          disabled={!form.label.trim() || upsert.isPending}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 disabled:opacity-50 transition-colors"
        >
          <Check className="w-3.5 h-3.5" />
          Save
        </button>
        <button
          onClick={onClose}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Cancel
        </button>
      </div>
    </div>
  );
}

function EntryRow({
  entry,
  isOwner,
  memoryBookId,
  teamId,
}: {
  entry: MemoryBookDailyLivingEntry;
  isOwner: boolean;
  memoryBookId: string;
  teamId: string;
}) {
  const { showToast } = useToast();
  const upsert = useUpsertMemoryBookDailyLivingEntry();
  const del = useDeleteMemoryBookDailyLivingEntry();
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Omit<EditState, "section" | "category">>({
    id: entry.id,
    label: entry.label,
    independence_level: entry.independence_level,
    notes: entry.notes,
  });

  const info = levelInfo(entry.independence_level);

  async function handleSave() {
    try {
      await upsert.mutateAsync({
        memoryBookId,
        teamId,
        entry: {
          id: entry.id,
          label: editForm.label.trim(),
          independence_level: editForm.independence_level,
          notes: editForm.notes,
        },
      });
      showToast("Entry updated", "success");
      setEditing(false);
    } catch {
      showToast("Could not update entry", "error");
    }
  }

  async function handleDelete() {
    try {
      await del.mutateAsync({ id: entry.id, memoryBookId, teamId });
      showToast("Entry removed", "success");
    } catch {
      showToast("Could not delete entry", "error");
    }
  }

  if (editing) {
    return (
      <div className="rounded-xl border border-cyan-200 bg-cyan-50/40 p-4 space-y-3">
        <input
          value={editForm.label}
          onChange={e => setEditForm(f => ({ ...f, label: e.target.value }))}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent bg-white"
        />
        <div className="flex flex-wrap gap-2">
          {INDEPENDENCE_LEVELS.map(l => (
            <button
              key={l.value}
              onClick={() => setEditForm(f => ({ ...f, independence_level: l.value }))}
              className={[
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                editForm.independence_level === l.value
                  ? `${l.color} border-current ring-2 ring-offset-1 ring-current/30`
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300",
              ].join(" ")}
            >
              <span className={`w-2 h-2 rounded-full ${l.dot}`} />
              {l.label}
            </button>
          ))}
        </div>
        <textarea
          value={editForm.notes}
          onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
          rows={2}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent bg-white resize-none"
          placeholder="Notes or care instructions (optional)"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={!editForm.label.trim() || upsert.isPending}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-600 text-white text-xs font-medium hover:bg-cyan-700 disabled:opacity-50 transition-colors"
          >
            <Check className="w-3 h-3" />
            Save
          </button>
          <button
            onClick={() => { setEditing(false); setEditForm({ id: entry.id, label: entry.label, independence_level: entry.independence_level, notes: entry.notes }); }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs hover:bg-slate-50 transition-colors"
          >
            <X className="w-3 h-3" />
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${info.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${info.dot}`} />
          {info.label}
        </span>
        <span className="flex-1 text-sm font-medium text-slate-800 truncate">{entry.label}</span>
        {isOwner && (
          <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setEditing(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 transition-colors"
              title="Edit"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              disabled={del.isPending}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {entry.notes ? (
          expanded ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
        ) : null}
      </button>
      {expanded && entry.notes && (
        <div className="px-4 pb-3 -mt-1">
          <p className="text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-2">{entry.notes}</p>
        </div>
      )}
    </div>
  );
}

function ADLCategoryBlock({
  section,
  categoryKey,
  config,
  entries,
  isOwner,
  memoryBookId,
  teamId,
}: {
  section: DailyLivingSection;
  categoryKey: ADLCategory | IADLCategory;
  config: CategoryConfig;
  entries: MemoryBookDailyLivingEntry[];
  isOwner: boolean;
  memoryBookId: string;
  teamId: string;
}) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-700">{config.label}</h4>
        {isOwner && !adding && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1 text-xs text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        )}
      </div>
      {entries.length > 0 && (
        <div className="space-y-2">
          {entries.map(e => (
            <EntryRow
              key={e.id}
              entry={e}
              isOwner={isOwner}
              memoryBookId={memoryBookId}
              teamId={teamId}
            />
          ))}
        </div>
      )}
      {adding && (
        <AddEntryRow
          section={section}
          category={categoryKey}
          memoryBookId={memoryBookId}
          teamId={teamId}
          onClose={() => setAdding(false)}
        />
      )}
      {entries.length === 0 && !adding && (
        <p className="text-xs text-slate-400 italic">No entries yet</p>
      )}
    </div>
  );
}

function ADLSectionBlock({
  section,
  title,
  description,
  categories,
  entries,
  isOwner,
  memoryBookId,
  teamId,
}: {
  section: DailyLivingSection;
  title: string;
  description: string;
  categories: Record<string, CategoryConfig>;
  entries: MemoryBookDailyLivingEntry[];
  isOwner: boolean;
  memoryBookId: string;
  teamId: string;
}) {
  const sectionEntries = entries.filter(e => e.section === section);
  const assessedCount = new Set(sectionEntries.map(e => e.category)).size;
  const totalCategories = Object.keys(categories).filter(k => k !== "other").length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-slate-800">{title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          </div>
          <div className="flex-shrink-0 text-right">
            <span className="text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{assessedCount}</span> / {totalCategories} assessed
            </span>
            <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-1.5 ml-auto">
              <div
                className="bg-cyan-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((assessedCount / totalCategories) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid sm:grid-cols-2 gap-6">
          {Object.entries(categories).map(([key, config]) => {
            if (key === "other") return null;
            const catEntries = sectionEntries.filter(e => e.category === key);
            return (
              <ADLCategoryBlock
                key={key}
                section={section}
                categoryKey={key as ADLCategory | IADLCategory}
                config={config}
                entries={catEntries}
                isOwner={isOwner}
                memoryBookId={memoryBookId}
                teamId={teamId}
              />
            );
          })}
          <ADLCategoryBlock
            key="other"
            section={section}
            categoryKey="other"
            config={section === "adl" ? ADL_CATEGORIES["other"] : IADL_CATEGORIES["other"]}
            entries={sectionEntries.filter(e => e.category === "other")}
            isOwner={isOwner}
            memoryBookId={memoryBookId}
            teamId={teamId}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default function DailyLivingTab({ memoryBookId, teamId, isOwner }: Props) {
  const { data: entries = [], isLoading } = useMemoryBookDailyLivingEntries(memoryBookId);
  const [activeView, setActiveView] = useState<"adl" | "preferences">("adl");

  const totalADL = entries.filter(e => e.section === "adl").length;
  const totalIADL = entries.filter(e => e.section === "iadl").length;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="h-40 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {!isOwner && <ReadOnlyBanner />}

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setActiveView("adl")}
          className={[
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            activeView === "adl"
              ? "bg-cyan-600 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50",
          ].join(" ")}
        >
          <Activity className="w-4 h-4" />
          Daily Living
          {(totalADL + totalIADL) > 0 && (
            <span className={[
              "text-xs px-1.5 py-0.5 rounded-full font-medium",
              activeView === "adl" ? "bg-white/20" : "bg-slate-100 text-slate-600",
            ].join(" ")}>
              {totalADL + totalIADL}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveView("preferences")}
          className={[
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            activeView === "preferences"
              ? "bg-cyan-600 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50",
          ].join(" ")}
        >
          <Heart className="w-4 h-4" />
          Preferences
        </button>
      </div>

      {activeView === "adl" && (
        <div className="space-y-5">
          {entries.length === 0 && (
            <SectionEmptyState
              isOwner={isOwner}
              title="No ADL entries yet"
              description={isOwner
                ? "Record how the resident manages daily activities. Start by adding entries to any category below."
                : "No daily living entries have been recorded yet."}
            />
          )}

          <ADLSectionBlock
            section="adl"
            title="Personal Care (ADLs)"
            description="Basic self-care activities performed daily"
            categories={ADL_CATEGORIES}
            entries={entries}
            isOwner={isOwner}
            memoryBookId={memoryBookId}
            teamId={teamId}
          />

          <ADLSectionBlock
            section="iadl"
            title="Instrumental Activities (IADLs)"
            description="Complex tasks for independent community living"
            categories={IADL_CATEGORIES}
            entries={entries}
            isOwner={isOwner}
            memoryBookId={memoryBookId}
            teamId={teamId}
          />
        </div>
      )}

      {activeView === "preferences" && (
        <PreferencesSection
          memoryBookId={memoryBookId}
          teamId={teamId}
          isOwner={isOwner}
        />
      )}
    </div>
  );
}
