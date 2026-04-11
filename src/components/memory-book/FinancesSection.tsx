import { useState } from "react";
import { Landmark, Plus, Lock } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { useToast } from "../ui/ToastProvider";
import {
  useMemoryBookFinanceEntries,
  useUpsertMemoryBookFinanceEntry,
  useDeleteMemoryBookFinanceEntry,
} from "../../hooks/useMemoryBook";
import EntryCard, { AddEntryForm, SuggestedPromptChip } from "./EntryCard";
import type { EntryField } from "./EntryCard";
import ReadOnlyBanner from "./ReadOnlyBanner";
import SectionEmptyState from "./SectionEmptyState";
import type { MemoryBookFinanceEntry, FinanceEntryCategory } from "../../types/memory-book";

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

const CATEGORIES: Record<FinanceEntryCategory, CategoryConfig> = {
  bank: {
    label: "Banking",
    color: "bg-blue-50 text-blue-700",
    prompts: [
      "Checking Account",
      "Savings Account",
      "Credit Union Account",
      "Money Market Account",
      "Certificate of Deposit",
    ],
  },
  income: {
    label: "Income",
    color: "bg-emerald-50 text-emerald-700",
    prompts: [
      "Social Security",
      "Pension",
      "VA Benefits",
      "401k / IRA Distribution",
      "Rental Income",
      "Investment Income / Dividends",
      "Annuity",
      "Part-time Employment",
    ],
  },
  auto_pay: {
    label: "Auto-Pay",
    color: "bg-amber-50 text-amber-700",
    prompts: [
      "Mortgage / Rent",
      "HOA Fees",
      "Electric",
      "Gas / Heating",
      "Water & Sewer",
      "Phone / Cell",
      "Internet / Cable",
      "Car Payment",
      "Insurance Premium",
      "Property Tax",
    ],
  },
  investment: {
    label: "Investment",
    color: "bg-slate-100 text-slate-600",
    prompts: [
      "Brokerage Account",
      "401k / 403b",
      "IRA / Roth IRA",
      "Real Estate / Property",
      "Treasury / Bonds",
      "Stock Portfolio",
    ],
  },
};

const ENTRY_FIELDS: EntryField[] = [
  { key: "label", label: "Item Label", placeholder: "e.g. Checking Account, Social Security" },
  { key: "company", label: "Company / Institution Name", placeholder: "e.g. Wells Fargo, Social Security Administration", optional: true },
  { key: "value", label: "Details / Account Info", placeholder: "e.g. Account ending 4521, $1,850/mo", optional: true },
  { key: "notes", label: "Notes", placeholder: "Additional information", optional: true, multiline: true, rows: 2 },
];

function entryToRecord(e: MemoryBookFinanceEntry): Record<string, string> {
  return {
    label: e.label,
    company: e.company,
    value: e.value,
    notes: e.notes,
    category: e.category,
  };
}

export default function FinancesSection({ memoryBookId, teamId, isOwner }: Props) {
  const { data: entries = [], isLoading } = useMemoryBookFinanceEntries(isOwner ? memoryBookId : null);
  const upsert = useUpsertMemoryBookFinanceEntry();
  const del = useDeleteMemoryBookFinanceEntry();
  const { showToast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [addCategory, setAddCategory] = useState<FinanceEntryCategory>("bank");
  const [addDefaults, setAddDefaults] = useState<Record<string, string>>({});

  if (!isOwner) {
    return (
      <div className="space-y-4">
        <ReadOnlyBanner />
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <Lock className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-700">Financial information is private</p>
              <p className="text-xs text-slate-500 mt-1">Only the team owner can view and edit financial details.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const handleAdd = async (values: Record<string, string>) => {
    try {
      await upsert.mutateAsync({
        memoryBookId,
        teamId,
        entry: { ...values, category: addCategory, sort_order: entries.length } as Partial<MemoryBookFinanceEntry>,
      });
      setShowAdd(false);
      setAddDefaults({});
      showToast("Finance entry saved", "success");
    } catch (e: any) {
      showToast(e.message ?? "Error saving entry", "error");
    }
  };

  const handleUpdate = async (id: string, values: Record<string, string>) => {
    try {
      await upsert.mutateAsync({ memoryBookId, teamId, entry: { id, ...values } as Partial<MemoryBookFinanceEntry> & { id: string } });
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

  const handlePromptClick = (cat: FinanceEntryCategory, label: string) => {
    setAddCategory(cat);
    setAddDefaults({ label, category: cat });
    setShowAdd(true);
  };

  const usedLabels = new Set(entries.map(e => e.label));

  const groupedEntries: Record<FinanceEntryCategory, MemoryBookFinanceEntry[]> = {
    bank: [],
    income: [],
    auto_pay: [],
    investment: [],
  };
  entries.forEach(e => {
    const cat = e.category as FinanceEntryCategory;
    if (groupedEntries[cat]) groupedEntries[cat].push(e);
    else groupedEntries.bank.push(e);
  });

  if (entries.length === 0 && !showAdd) {
    return (
      <SectionEmptyState
        title="No financial information yet"
        description="Track banking accounts, income sources, auto-pay bills, and investments. Use the prompts below to get started."
        isOwner={true}
        ownerAction={
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {(["bank", "income", "auto_pay"] as FinanceEntryCategory[]).flatMap(cat =>
                CATEGORIES[cat].prompts.slice(0, 2).map(p => (
                  <SuggestedPromptChip key={`${cat}-${p}`} label={p} onClick={() => handlePromptClick(cat, p)} />
                ))
              )}
            </div>
            <button
              onClick={() => { setAddCategory("bank"); setAddDefaults({}); setShowAdd(true); }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Finance Entry
            </button>
          </div>
        }
      />
    );
  }

  const allCategories = (["bank", "income", "auto_pay", "investment"] as FinanceEntryCategory[]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <Landmark className="w-4 h-4 text-blue-600" />
                Income & Finances
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">Banking, income sources, bills, and investments</p>
            </div>
            <button
              onClick={() => { setAddCategory("bank"); setAddDefaults({}); setShowAdd(true); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 hover:border-slate-300 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            {allCategories.map(cat => {
              const catConfig = CATEGORIES[cat];
              const catEntries = groupedEntries[cat];
              const unusedPrompts = catConfig.prompts.filter(p => !usedLabels.has(p));

              return (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${catConfig.color}`}>
                      {catConfig.label}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {catEntries.map(entry => (
                      <EntryCard
                        key={entry.id}
                        entry={entryToRecord(entry)}
                        fields={ENTRY_FIELDS}
                        isOwner={isOwner}
                        categoryColor={catConfig.color}
                        onSave={values => handleUpdate(entry.id, values)}
                        onDelete={() => handleDelete(entry.id)}
                        isSaving={upsert.isPending}
                        isDeleting={del.isPending}
                      />
                    ))}
                    {catEntries.length === 0 && !showAdd && (
                      <p className="text-xs text-slate-400 italic pl-1">No entries yet</p>
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
                  </div>
                  {unusedPrompts.length > 0 && (!showAdd || addCategory !== cat) && (
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
