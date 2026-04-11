import { useState } from "react";
import { Heart, Plus } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { useToast } from "../ui/ToastProvider";
import {
  useMemoryBookPreferenceEntries,
  useUpsertMemoryBookPreferenceEntry,
  useDeleteMemoryBookPreferenceEntry,
} from "../../hooks/useMemoryBook";
import EntryCard, { AddEntryForm, SuggestedPromptChip } from "./EntryCard";
import type { EntryField } from "./EntryCard";
import ReadOnlyBanner from "./ReadOnlyBanner";
import SectionEmptyState from "./SectionEmptyState";
import type { MemoryBookPreferenceEntry, PreferenceEntryCategory } from "../../types/memory-book";

type Props = {
  memoryBookId: string;
  teamId: string;
  isOwner: boolean;
};

type CategoryConfig = {
  label: string;
  color: string;
  prompts: string[];
};

const CATEGORIES: Record<PreferenceEntryCategory, CategoryConfig> = {
  likes: {
    label: "Enjoys",
    color: "bg-emerald-50 text-emerald-700",
    prompts: [
      "Gardening",
      "Reading",
      "Music",
      "Puzzles / Crosswords",
      "Nature Walks",
      "Family Visits",
      "Watching Sports",
      "Baking / Cooking",
      "Bird Watching",
      "Church / Faith",
      "Card Games",
      "TV Classics",
    ],
  },
  dislikes: {
    label: "Dislikes",
    color: "bg-red-50 text-red-700",
    prompts: [
      "Loud Noises",
      "Crowds",
      "Cold Temperatures",
      "Being Rushed",
      "Strangers in Personal Space",
      "Spicy Foods",
      "Bright / Fluorescent Lights",
      "Strong Perfumes",
    ],
  },
  food_liked: {
    label: "Favourite Foods",
    color: "bg-amber-50 text-amber-700",
    prompts: [
      "Soup",
      "Scrambled Eggs",
      "Tea / Coffee",
      "Oatmeal",
      "Soft Bread / Toast",
      "Mashed Potatoes",
      "Fruit / Berries",
      "Chocolate",
      "Ice Cream",
    ],
  },
  food_disliked: {
    label: "Foods to Avoid",
    color: "bg-orange-50 text-orange-700",
    prompts: [
      "Spicy Food",
      "Raw Onions",
      "Seafood",
      "Nuts",
      "Grapefruit (medication interaction)",
      "High-Sodium Foods",
    ],
  },
  music: {
    label: "Music",
    color: "bg-fuchsia-50 text-fuchsia-700",
    prompts: [
      "Classical Music",
      "Country Music",
      "Big Band / Jazz",
      "Gospel / Hymns",
      "Oldies / 1950s–60s",
      "Soft Rock",
      "Opera",
      "Folk Music",
    ],
  },
  conversation: {
    label: "Conversation Topics",
    color: "bg-sky-50 text-sky-700",
    prompts: [
      "Grandchildren / Family",
      "Past Career / Work Stories",
      "Hometown / Childhood Memories",
      "Sports",
      "History / WWII",
      "Faith / Spirituality",
      "Travel Memories",
      "Current Events (gentle)",
      "Animals / Pets",
    ],
  },
  comfort: {
    label: "Comforts",
    color: "bg-teal-50 text-teal-700",
    prompts: [
      "Warm Blanket",
      "Familiar Music",
      "Hand Holding",
      "Prayer / Rosary",
      "Familiar Scents",
      "Photo Albums",
      "Soft Lighting",
      "Pet Visits",
      "Gentle Rocking / Motion",
    ],
  },
  fear: {
    label: "Fears / Anxieties",
    color: "bg-rose-50 text-rose-700",
    prompts: [
      "Being Alone at Night",
      "Unfamiliar People Entering Room",
      "Medical Procedures",
      "Heights",
      "Water / Bathing",
      "Loud Sudden Noises",
      "Confusion About Where They Are",
    ],
  },
  sensory: {
    label: "Sensory Preferences",
    color: "bg-slate-100 text-slate-600",
    prompts: [
      "Soft Textures / Blankets",
      "Dim Lighting Preferred",
      "Bright Lighting Needed",
      "Quiet Environment",
      "Background Music Helpful",
      "Prefers Warm Room",
      "Sensitive to Cold",
      "Dislikes Rough Fabrics",
    ],
  },
  avoid: {
    label: "Things to Avoid",
    color: "bg-zinc-100 text-zinc-700",
    prompts: [
      "Discussing Death / Dying",
      "Arguing / Confrontation",
      "Certain TV Shows (violence)",
      "Rushed Transitions",
      "Overstimulating Environments",
      "Certain Family Members (conflict)",
    ],
  },
};

const ENTRY_FIELDS: EntryField[] = [
  { key: "label", label: "Item", placeholder: "e.g. Gardening, Warm Blanket" },
  { key: "value", label: "Details / Notes", placeholder: "Additional context", optional: true, multiline: true, rows: 2 },
];

function entryToRecord(e: MemoryBookPreferenceEntry): Record<string, string> {
  return {
    label: e.label,
    value: e.value,
    category: e.category,
  };
}

export default function PreferencesSection({ memoryBookId, teamId, isOwner }: Props) {
  const { data: entries = [], isLoading } = useMemoryBookPreferenceEntries(memoryBookId);
  const upsert = useUpsertMemoryBookPreferenceEntry();
  const del = useDeleteMemoryBookPreferenceEntry();
  const { showToast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [addCategory, setAddCategory] = useState<PreferenceEntryCategory>("likes");
  const [addDefaults, setAddDefaults] = useState<Record<string, string>>({});

  const handleAdd = async (values: Record<string, string>) => {
    try {
      await upsert.mutateAsync({
        memoryBookId,
        teamId,
        entry: { ...values, category: addCategory, sort_order: entries.length } as Partial<MemoryBookPreferenceEntry>,
      });
      setShowAdd(false);
      setAddDefaults({});
      showToast("Preference saved", "success");
    } catch (e: any) {
      showToast(e.message ?? "Error saving entry", "error");
    }
  };

  const handleUpdate = async (id: string, values: Record<string, string>) => {
    try {
      await upsert.mutateAsync({ memoryBookId, teamId, entry: { id, ...values } as Partial<MemoryBookPreferenceEntry> & { id: string } });
      showToast("Preference updated", "success");
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

  const handlePromptClick = (cat: PreferenceEntryCategory, label: string) => {
    setAddCategory(cat);
    setAddDefaults({ label, category: cat });
    setShowAdd(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const usedLabels = new Set(entries.map(e => e.label));

  const groupedEntries: Record<PreferenceEntryCategory, MemoryBookPreferenceEntry[]> = {
    likes: [],
    dislikes: [],
    food_liked: [],
    food_disliked: [],
    music: [],
    conversation: [],
    comfort: [],
    fear: [],
    sensory: [],
    avoid: [],
  };
  entries.forEach(e => {
    const cat = e.category as PreferenceEntryCategory;
    if (groupedEntries[cat]) groupedEntries[cat].push(e);
    else groupedEntries.likes.push(e);
  });

  if (entries.length === 0 && !showAdd && !isOwner) {
    return (
      <SectionEmptyState
        title="No preferences recorded yet"
        description="The team owner hasn't added care preferences yet."
        isOwner={false}
      />
    );
  }

  if (entries.length === 0 && !showAdd && isOwner) {
    return (
      <SectionEmptyState
        title="No preferences added yet"
        description="Record what the care recipient enjoys, dislikes, foods, music, comforts, and things to avoid. This helps every caregiver provide personalised care."
        isOwner={true}
        ownerAction={
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {(["likes", "dislikes", "comfort"] as PreferenceEntryCategory[]).flatMap(cat =>
                CATEGORIES[cat].prompts.slice(0, 3).map(p => (
                  <SuggestedPromptChip key={`${cat}-${p}`} label={p} onClick={() => handlePromptClick(cat, p)} />
                ))
              )}
            </div>
            <button
              onClick={() => { setAddCategory("likes"); setAddDefaults({}); setShowAdd(true); }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Preference
            </button>
          </div>
        }
      />
    );
  }

  const allCategories = (["likes", "dislikes", "food_liked", "food_disliked", "music", "conversation", "comfort", "fear", "sensory", "avoid"] as PreferenceEntryCategory[]);

  return (
    <div className="space-y-4">
      {!isOwner && <ReadOnlyBanner />}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                Personal Preferences
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">Likes, dislikes, foods, music, comforts, and care notes</p>
            </div>
            {isOwner && (
              <button
                onClick={() => { setAddCategory("likes"); setAddDefaults({}); setShowAdd(true); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 hover:border-slate-300 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {allCategories.map(cat => {
              const catConfig = CATEGORIES[cat];
              const catEntries = groupedEntries[cat];
              const unusedPrompts = catConfig.prompts.filter(p => !usedLabels.has(p));
              const showSection = catEntries.length > 0 || isOwner;

              if (!showSection) return null;

              return (
                <div key={cat} className="space-y-2">
                  <div className="flex items-center gap-2">
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
                  {catEntries.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {catEntries.map(entry => (
                        <PreferenceChip
                          key={entry.id}
                          entry={entry}
                          fields={ENTRY_FIELDS}
                          isOwner={isOwner}
                          color={catConfig.color}
                          onSave={values => handleUpdate(entry.id, values)}
                          onDelete={() => handleDelete(entry.id)}
                          isSaving={upsert.isPending}
                          isDeleting={del.isPending}
                        />
                      ))}
                    </div>
                  ) : (
                    isOwner && !showAdd && (
                      <p className="text-xs text-slate-400 italic">No entries yet</p>
                    )
                  )}
                  {showAdd && addCategory === cat && (
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
                  {isOwner && unusedPrompts.length > 0 && (!showAdd || addCategory !== cat) && (
                    <div className="flex flex-wrap gap-1.5">
                      {unusedPrompts.slice(0, 4).map(p => (
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

function PreferenceChip({
  entry,
  fields,
  isOwner,
  color,
  onSave,
  onDelete,
  isSaving,
  isDeleting,
}: {
  entry: MemoryBookPreferenceEntry;
  fields: EntryField[];
  isOwner: boolean;
  color: string;
  onSave: (values: Record<string, string>) => Promise<void>;
  onDelete: () => Promise<void>;
  isSaving?: boolean;
  isDeleting?: boolean;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="w-full">
        <AddEntryForm
          fields={fields}
          onSave={async (values) => { await onSave(values); setEditing(false); }}
          onCancel={() => setEditing(false)}
          isSaving={isSaving}
          defaultValues={{ label: entry.label, value: entry.value }}
        />
      </div>
    );
  }

  return (
    <div className={`group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${color} border border-current/10`}>
      <span>{entry.label}</span>
      {entry.value && (
        <span className="text-current/60 font-normal truncate max-w-24">— {entry.value}</span>
      )}
      {isOwner && (
        <div className="hidden group-hover:flex items-center gap-0.5 ml-0.5">
          <button
            onClick={() => setEditing(true)}
            className="p-0.5 rounded hover:bg-current/10 transition-colors"
          >
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="p-0.5 rounded hover:bg-red-100 hover:text-red-600 transition-colors disabled:opacity-40"
          >
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
