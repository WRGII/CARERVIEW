import { useState } from "react";
import { Plus, Pencil, Trash2, Save, X, Pill, Phone, Star } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useToast } from "../ui/ToastProvider";
import {
  useMemoryBookPharmacies,
  useUpsertMemoryBookPharmacy,
  useDeleteMemoryBookPharmacy,
} from "../../hooks/useMemoryBook";
import type { MemoryBookPharmacy } from "../../types/memory-book";
import SectionEmptyState from "./SectionEmptyState";

type Props = {
  memoryBookId: string;
  teamId: string;
  isOwner: boolean;
};

const EMPTY_PHARMACY = {
  name: "",
  phone: "",
  fax: "",
  address: "",
  notes: "",
  is_primary: false,
};

export default function PharmacySection({ memoryBookId, teamId, isOwner }: Props) {
  const { data: pharmacies = [], isLoading } = useMemoryBookPharmacies(memoryBookId);
  const upsert = useUpsertMemoryBookPharmacy();
  const deletePharmacy = useDeleteMemoryBookPharmacy();
  const { showToast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_PHARMACY);

  const startAdd = () => {
    setForm(EMPTY_PHARMACY);
    setEditingId(null);
    setShowForm(true);
  };

  const startEdit = (pharmacy: MemoryBookPharmacy) => {
    setForm({
      name: pharmacy.name,
      phone: pharmacy.phone ?? "",
      fax: pharmacy.fax ?? "",
      address: pharmacy.address ?? "",
      notes: pharmacy.notes ?? "",
      is_primary: pharmacy.is_primary,
    });
    setEditingId(pharmacy.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      showToast("Pharmacy name is required", "error");
      return;
    }
    try {
      await upsert.mutateAsync({
        memoryBookId,
        teamId,
        pharmacy: editingId
          ? { ...form, id: editingId }
          : { ...form, sort_order: pharmacies.length },
      });
      showToast(editingId ? "Pharmacy updated" : "Pharmacy added", "success");
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_PHARMACY);
    } catch (e: any) {
      showToast(e.message ?? "Error saving pharmacy", "error");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove ${name}?`)) return;
    try {
      await deletePharmacy.mutateAsync({ id, memoryBookId, teamId });
      showToast("Pharmacy removed", "success");
    } catch (e: any) {
      showToast(e.message ?? "Error removing pharmacy", "error");
    }
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <Pill className="w-4 h-4 text-emerald-600" />
              Pharmacies
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {pharmacies.length === 1
                ? "1 pharmacy on file"
                : `${pharmacies.length} pharmacies on file`}
            </p>
          </div>
          {isOwner && !showForm && (
            <Button variant="primary" size="sm" onClick={startAdd}>
              <Plus className="w-4 h-4 mr-1 inline" />
              Add Pharmacy
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {showForm && isOwner && (
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-4">
              <h4 className="text-sm font-semibold text-slate-700">
                {editingId ? "Edit Pharmacy" : "New Pharmacy"}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Pharmacy Name"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. CVS Pharmacy, Walgreens"
                />
                <Input
                  label="Phone"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+1 (555) 000-0000"
                  type="tel"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Fax"
                  value={form.fax}
                  onChange={e => setForm(f => ({ ...f, fax: e.target.value }))}
                  placeholder="+1 (555) 000-0001"
                  type="tel"
                />
                <Input
                  label="Address"
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="123 Main St, City, ST 00000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                <textarea
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-base placeholder-slate-400 shadow-sm focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600 bg-white text-slate-800 min-h-[72px]"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="e.g. 24-hour, handles specialty medications"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_primary}
                  onChange={e => setForm(f => ({ ...f, is_primary: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                />
                <span className="text-sm text-slate-700">Primary pharmacy</span>
              </label>
              <div className="flex items-center gap-3 pt-1">
                <Button variant="primary" size="md" onClick={handleSave} disabled={upsert.isPending}>
                  <Save className="w-4 h-4 mr-2 inline" />
                  {upsert.isPending ? "Saving..." : "Save Pharmacy"}
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setForm(EMPTY_PHARMACY);
                  }}
                >
                  <X className="w-4 h-4 mr-1 inline" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {pharmacies.length === 0 && !showForm ? (
            <SectionEmptyState
              title="No pharmacies on file"
              description={isOwner ? "Add your pharmacy information for quick reference." : "The team owner hasn't added any pharmacy details."}
              isOwner={isOwner}
              ownerAction={
                <Button variant="primary" size="md" onClick={startAdd}>
                  <Pill className="w-4 h-4 mr-2 inline" />
                  Add First Pharmacy
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pharmacies.map(pharmacy => (
                <PharmacyCard
                  key={pharmacy.id}
                  pharmacy={pharmacy}
                  isOwner={isOwner}
                  onEdit={() => startEdit(pharmacy)}
                  onDelete={() => handleDelete(pharmacy.id, pharmacy.name)}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function PharmacyCard({
  pharmacy,
  isOwner,
  onEdit,
  onDelete,
}: {
  pharmacy: MemoryBookPharmacy;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-slate-800">{pharmacy.name}</p>
            {pharmacy.is_primary && (
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
            )}
          </div>
          {pharmacy.address && (
            <p className="text-xs text-slate-500">{pharmacy.address}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {pharmacy.is_primary && (
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
              Primary
            </span>
          )}
          {isOwner && (
            <>
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
            </>
          )}
        </div>
      </div>
      <div className="space-y-1.5">
        {pharmacy.phone && (
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <a href={`tel:${pharmacy.phone}`} className="hover:text-cyan-600 transition-colors">
              {pharmacy.phone}
            </a>
          </div>
        )}
        {pharmacy.fax && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-3.5 h-3.5 text-slate-400 text-center text-[10px] font-bold leading-[14px]">FX</span>
            <span>{pharmacy.fax}</span>
          </div>
        )}
        {pharmacy.notes && (
          <p className="text-xs text-slate-500 leading-relaxed pt-1 border-t border-slate-100">
            {pharmacy.notes}
          </p>
        )}
      </div>
    </div>
  );
}
