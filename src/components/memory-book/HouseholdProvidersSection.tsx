import { useState } from "react";
import {
  Zap, Droplets, Flame, Wifi, Phone, Smartphone, Trash2,
  Wrench, Plug, Scissors, Wind, Bug, Hammer,
  Plus, Pencil, X, Save, ExternalLink, ChevronDown, ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useToast } from "../ui/ToastProvider";
import {
  useMemoryBookHouseholdProviders,
  useUpsertMemoryBookHouseholdProvider,
  useDeleteMemoryBookHouseholdProvider,
} from "../../hooks/useMemoryBook";
import type {
  MemoryBookHouseholdProvider,
  HouseholdProviderCategory,
} from "../../types/memory-book";
import ReadOnlyBanner from "./ReadOnlyBanner";
import SectionEmptyState from "./SectionEmptyState";

type Props = {
  memoryBookId: string;
  teamId: string;
  isOwner: boolean;
};

type SubCategoryMeta = {
  value: string;
  label: string;
  Icon: React.ElementType;
};

const UTILITY_SUB_CATEGORIES: SubCategoryMeta[] = [
  { value: "electricity",   label: "Electricity",    Icon: Zap },
  { value: "water",         label: "Water",          Icon: Droplets },
  { value: "gas",           label: "Gas",            Icon: Flame },
  { value: "internet",      label: "Internet",       Icon: Wifi },
  { value: "phone_home",    label: "Home Phone",     Icon: Phone },
  { value: "mobile",        label: "Mobile Phone",   Icon: Smartphone },
  { value: "waste_removal", label: "Waste Removal",  Icon: Trash2 },
  { value: "other",         label: "Other Utility",  Icon: Plug },
];

const MAINTENANCE_SUB_CATEGORIES: SubCategoryMeta[] = [
  { value: "plumber",      label: "Plumber",         Icon: Wrench },
  { value: "electrician",  label: "Electrician",     Icon: Zap },
  { value: "lawn_care",    label: "Lawn Care",       Icon: Scissors },
  { value: "hvac",         label: "HVAC",            Icon: Wind },
  { value: "pest_control", label: "Pest Control",    Icon: Bug },
  { value: "handyman",     label: "Handyman",        Icon: Hammer },
  { value: "other",        label: "Other Maintenance", Icon: Wrench },
];

const ALL_SUB_CATEGORIES = [...UTILITY_SUB_CATEGORIES, ...MAINTENANCE_SUB_CATEGORIES];

function getSubCategoryMeta(sub: string): SubCategoryMeta {
  return ALL_SUB_CATEGORIES.find(s => s.value === sub) ?? { value: sub, label: sub, Icon: Wrench };
}

const EMPTY_FORM = {
  category: "utility" as HouseholdProviderCategory,
  sub_category: "",
  provider_name: "",
  account_number: "",
  phone: "",
  website: "",
  notes: "",
};

type FormState = typeof EMPTY_FORM;

export default function HouseholdProvidersSection({ memoryBookId, teamId, isOwner }: Props) {
  const { data: providers = [], isLoading } = useMemoryBookHouseholdProviders(memoryBookId);
  const upsert = useUpsertMemoryBookHouseholdProvider();
  const remove = useDeleteMemoryBookHouseholdProvider();
  const { showToast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  // Collapsible groups: track which are open
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    utility: true,
    maintenance: true,
  });

  const utilities = providers.filter(p => p.category === "utility");
  const maintenance = providers.filter(p => p.category === "maintenance");

  const toggleGroup = (group: string) =>
    setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));

  const startAdd = (category: HouseholdProviderCategory = "utility") => {
    setForm({ ...EMPTY_FORM, category });
    setEditingId(null);
    setShowForm(true);
  };

  const startEdit = (p: MemoryBookHouseholdProvider) => {
    setForm({
      category: p.category,
      sub_category: p.sub_category,
      provider_name: p.provider_name,
      account_number: p.account_number,
      phone: p.phone,
      website: p.website,
      notes: p.notes,
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async () => {
    if (!form.provider_name.trim()) {
      showToast("Provider name is required.", "error");
      return;
    }
    if (!form.sub_category) {
      showToast("Please select a type.", "error");
      return;
    }
    try {
      const count = providers.filter(p => p.category === form.category).length;
      await upsert.mutateAsync({
        memoryBookId,
        teamId,
        provider: editingId
          ? { ...form, id: editingId }
          : { ...form, sort_order: count },
      });
      showToast(editingId ? "Provider updated." : "Provider added.", "success");
      cancelForm();
    } catch (e: any) {
      showToast(e.message ?? "Something went wrong.", "error");
    }
  };

  const handleDelete = async (p: MemoryBookHouseholdProvider) => {
    if (!confirm(`Remove "${p.provider_name}"?`)) return;
    try {
      await remove.mutateAsync({ id: p.id, memoryBookId, teamId });
      showToast("Provider removed.", "success");
    } catch (e: any) {
      showToast(e.message ?? "Something went wrong.", "error");
    }
  };

  const subCategories =
    form.category === "utility" ? UTILITY_SUB_CATEGORIES : MAINTENANCE_SUB_CATEGORIES;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const isEmpty = providers.length === 0;

  return (
    <div className="space-y-6">
      {!isOwner && <ReadOnlyBanner />}

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Household Providers</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {isEmpty
              ? "Track utilities and maintenance contacts for the household."
              : `${providers.length} provider${providers.length !== 1 ? "s" : ""} on record`}
          </p>
        </div>
        {isOwner && !showForm && !isEmpty && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="ghost" size="sm" onClick={() => startAdd("utility")}>
              <Plus className="w-4 h-4 mr-1 inline" />
              Utility
            </Button>
            <Button variant="primary" size="sm" onClick={() => startAdd("maintenance")}>
              <Plus className="w-4 h-4 mr-1 inline" />
              Maintenance
            </Button>
          </div>
        )}
      </div>

      {/* Add / Edit Form */}
      {showForm && isOwner && (
        <Card>
          <CardHeader>
            <h4 className="text-sm font-semibold text-slate-700">
              {editingId ? "Edit Provider" : "Add Provider"}
            </h4>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Category toggle */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                <div className="flex rounded-xl bg-slate-100 p-1 w-fit gap-1">
                  {(["utility", "maintenance"] as HouseholdProviderCategory[]).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, category: cat, sub_category: "" }))}
                      className={[
                        "px-4 py-1.5 rounded-lg text-sm font-medium transition capitalize",
                        form.category === cat
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-700",
                      ].join(" ")}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Sub-category */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Type</label>
                  <select
                    className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600 bg-white text-slate-800"
                    value={form.sub_category}
                    onChange={e => setForm(f => ({ ...f, sub_category: e.target.value }))}
                  >
                    <option value="">Select type…</option>
                    {subCategories.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Provider Name"
                  value={form.provider_name}
                  onChange={e => setForm(f => ({ ...f, provider_name: e.target.value }))}
                  placeholder="e.g. ComEd, Roto-Rooter"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Phone"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="(555) 000-0000"
                />
                {form.category === "utility" ? (
                  <Input
                    label="Account Number"
                    value={form.account_number}
                    onChange={e => setForm(f => ({ ...f, account_number: e.target.value }))}
                    placeholder="Optional"
                  />
                ) : (
                  <Input
                    label="Website"
                    value={form.website}
                    onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                    placeholder="https://…"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
                <textarea
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 shadow-sm focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600 bg-white text-slate-800 min-h-[60px]"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Service schedule, preferred contact method, etc."
                  rows={2}
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <Button variant="primary" size="md" onClick={handleSave} disabled={upsert.isPending}>
                  <Save className="w-4 h-4 mr-2 inline" />
                  {upsert.isPending ? "Saving…" : "Save Provider"}
                </Button>
                <Button variant="ghost" size="md" onClick={cancelForm}>
                  <X className="w-4 h-4 mr-1 inline" />
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {isEmpty && !showForm && (
        <SectionEmptyState
          title="No household providers yet"
          description="Add utility contacts (electricity, water, gas, internet) and maintenance providers (plumber, electrician, lawn care) for quick reference."
          isOwner={isOwner}
          ownerAction={
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Button variant="ghost" size="md" onClick={() => startAdd("utility")}>
                <Plus className="w-4 h-4 mr-2 inline" />
                Add Utility
              </Button>
              <Button variant="primary" size="md" onClick={() => startAdd("maintenance")}>
                <Plus className="w-4 h-4 mr-2 inline" />
                Add Maintenance
              </Button>
            </div>
          }
        />
      )}

      {/* Provider Groups */}
      {!isEmpty && (
        <div className="space-y-4">
          {/* Utilities */}
          <ProviderGroup
            title="Utilities"
            accentClass="bg-amber-50 border-amber-200"
            headerClass="text-amber-700"
            dotClass="bg-amber-400"
            providers={utilities}
            isOpen={openGroups.utility}
            onToggle={() => toggleGroup("utility")}
            isOwner={isOwner}
            onEdit={startEdit}
            onDelete={handleDelete}
            onAdd={() => startAdd("utility")}
          />

          {/* Maintenance */}
          <ProviderGroup
            title="Maintenance"
            accentClass="bg-slate-50 border-slate-200"
            headerClass="text-slate-700"
            dotClass="bg-slate-400"
            providers={maintenance}
            isOpen={openGroups.maintenance}
            onToggle={() => toggleGroup("maintenance")}
            isOwner={isOwner}
            onEdit={startEdit}
            onDelete={handleDelete}
            onAdd={() => startAdd("maintenance")}
          />
        </div>
      )}
    </div>
  );
}

function ProviderGroup({
  title,
  accentClass,
  headerClass,
  dotClass,
  providers,
  isOpen,
  onToggle,
  isOwner,
  onEdit,
  onDelete,
  onAdd,
}: {
  title: string;
  accentClass: string;
  headerClass: string;
  dotClass: string;
  providers: MemoryBookHouseholdProvider[];
  isOpen: boolean;
  onToggle: () => void;
  isOwner: boolean;
  onEdit: (p: MemoryBookHouseholdProvider) => void;
  onDelete: (p: MemoryBookHouseholdProvider) => void;
  onAdd: () => void;
}) {
  return (
    <div className={`rounded-xl border ${accentClass} overflow-hidden`}>
      {/* Group header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-black/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className={`w-2 h-2 rounded-full ${dotClass}`} />
          <span className={`text-sm font-semibold ${headerClass}`}>{title}</span>
          <span className="text-xs text-slate-400 font-medium">
            {providers.length === 0 ? "None added" : `${providers.length} provider${providers.length !== 1 ? "s" : ""}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isOwner && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onAdd(); }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-white/60 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          )}
          {isOpen
            ? <ChevronDown className="w-4 h-4 text-slate-400" />
            : <ChevronRight className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {/* Provider cards */}
      {isOpen && providers.length > 0 && (
        <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {providers.map(p => (
            <ProviderCard
              key={p.id}
              provider={p}
              isOwner={isOwner}
              onEdit={() => onEdit(p)}
              onDelete={() => onDelete(p)}
            />
          ))}
        </div>
      )}

      {isOpen && providers.length === 0 && (
        <div className="px-4 pb-4">
          <p className="text-xs text-slate-400 italic">
            {isOwner ? "Click \"Add\" above to add a provider." : "No providers added yet."}
          </p>
        </div>
      )}
    </div>
  );
}

function ProviderCard({
  provider,
  isOwner,
  onEdit,
  onDelete,
}: {
  provider: MemoryBookHouseholdProvider;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const meta = getSubCategoryMeta(provider.sub_category);
  const { Icon } = meta;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex gap-3 shadow-sm">
      {/* Icon */}
      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center mt-0.5">
        <Icon className="w-4.5 h-4.5 text-slate-500" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{provider.provider_name || "—"}</p>
            <span className="inline-block mt-0.5 text-xs text-slate-500">{meta.label}</span>
          </div>
          {isOwner && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={onEdit}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onDelete}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="mt-2 space-y-1">
          {provider.phone && (
            <a
              href={`tel:${provider.phone}`}
              className="flex items-center gap-1.5 text-xs text-cyan-700 hover:text-cyan-900 transition-colors w-fit"
            >
              <Phone className="w-3 h-3 flex-shrink-0" />
              <span>{provider.phone}</span>
            </a>
          )}
          {provider.account_number && (
            <p className="text-xs text-slate-500">
              <span className="font-medium text-slate-600">Acct:</span> {provider.account_number}
            </p>
          )}
          {provider.website && (
            <a
              href={provider.website.startsWith("http") ? provider.website : `https://${provider.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-cyan-700 hover:text-cyan-900 transition-colors w-fit"
            >
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
              <span className="truncate max-w-[140px]">Website</span>
            </a>
          )}
          {provider.notes && (
            <p className="text-xs text-slate-500 leading-relaxed pt-0.5 border-t border-slate-100 mt-1.5">
              {provider.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
