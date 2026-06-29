import { useState } from "react";
import {
  Plus, Pencil, Trash2, Save, X, Car, TriangleAlert as AlertTriangle,
  Wrench, CircleDot, Disc3, Sparkles, ClipboardCheck, PaintBucket,
  Phone, ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useToast } from "../ui/ToastProvider";
import {
  useMemoryBookVehicles,
  useUpsertMemoryBookVehicle,
  useDeleteMemoryBookVehicle,
  useMemoryBookVehicleCare,
  useUpsertMemoryBookVehicleCare,
  useDeleteMemoryBookVehicleCare,
} from "../../hooks/useMemoryBook";
import type { MemoryBookVehicle, MemoryBookVehicleCare } from "../../types/memory-book";
import ReadOnlyBanner from "./ReadOnlyBanner";
import SectionEmptyState from "./SectionEmptyState";
import { useLocale } from "../../i18n/LocaleContext";

type Props = {
  memoryBookId: string;
  teamId: string;
  isOwner: boolean;
};

type VehicleTab = "vehicles" | "vehicle_care";

// ── Vehicle form ──────────────────────────────────────────────────────────────

const EMPTY_VEHICLE = {
  make_model_year: "",
  license_plate: "",
  registration_due: "",
  service_provider: "",
  parking_location: "",
  notes: "",
};

function isRegistrationSoon(dateStr: string): boolean {
  if (!dateStr) return false;
  const due = new Date(dateStr);
  const now = new Date();
  const diff = due.getTime() - now.getTime();
  return diff > 0 && diff < 60 * 24 * 60 * 60 * 1000;
}

function isRegistrationOverdue(dateStr: string): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

// ── Vehicle Care sub-categories ───────────────────────────────────────────────

type CareSubMeta = {
  value: string;
  label: string;
  Icon: React.ElementType;
};

const CARE_SUB_CATEGORIES: CareSubMeta[] = [
  { value: "oil_change",  label: "Oil Change",  Icon: Wrench },
  { value: "tires",       label: "Tires",       Icon: CircleDot },
  { value: "brakes",      label: "Brakes",      Icon: Disc3 },
  { value: "detailing",   label: "Detailing",   Icon: Sparkles },
  { value: "inspection",  label: "Inspection",  Icon: ClipboardCheck },
  { value: "body_work",   label: "Body Work",   Icon: PaintBucket },
  { value: "dealer",      label: "Dealer",      Icon: Car },
  { value: "other",       label: "Other",       Icon: Wrench },
];

function getCareSubMeta(sub: string): CareSubMeta {
  return CARE_SUB_CATEGORIES.find(s => s.value === sub) ?? { value: sub, label: sub, Icon: Wrench };
}

const EMPTY_CARE = {
  provider_name: "",
  sub_category: "",
  phone: "",
  website: "",
  notes: "",
};

// ── Main component ────────────────────────────────────────────────────────────

export default function VehicleSection({ memoryBookId, teamId, isOwner }: Props) {
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState<VehicleTab>("vehicles");

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="flex items-center gap-2">
        {(["vehicles", "vehicle_care"] as VehicleTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={[
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
              activeTab === tab
                ? "bg-cyan-600 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800",
            ].join(" ")}
          >
            {tab === "vehicles"
              ? <Car className="w-3.5 h-3.5" />
              : <Wrench className="w-3.5 h-3.5" />}
            {tab === "vehicles" ? "Vehicles" : "Vehicle Care"}
          </button>
        ))}
      </div>

      {activeTab === "vehicles" ? (
        <VehiclesTab memoryBookId={memoryBookId} teamId={teamId} isOwner={isOwner} t={t} />
      ) : (
        <VehicleCareTab memoryBookId={memoryBookId} teamId={teamId} isOwner={isOwner} />
      )}
    </div>
  );
}

// ── Vehicles tab ──────────────────────────────────────────────────────────────

function VehiclesTab({
  memoryBookId,
  teamId,
  isOwner,
  t,
}: Props & { t: (key: string, vars?: Record<string, string | number>) => string }) {
  const { data: vehicles = [], isLoading } = useMemoryBookVehicles(memoryBookId);
  const upsert = useUpsertMemoryBookVehicle();
  const deleteVehicle = useDeleteMemoryBookVehicle();
  const { showToast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_VEHICLE);

  const startAdd = () => {
    setForm(EMPTY_VEHICLE);
    setEditingId(null);
    setShowForm(true);
  };

  const startEdit = (vehicle: MemoryBookVehicle) => {
    setForm({
      make_model_year:   vehicle.make_model_year,
      license_plate:     vehicle.license_plate,
      registration_due:  vehicle.registration_due ?? "",
      service_provider:  vehicle.service_provider,
      parking_location:  vehicle.parking_location,
      notes:             vehicle.notes,
    });
    setEditingId(vehicle.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.make_model_year.trim()) {
      showToast(t("memory_book.toast_vehicle_required"), "error");
      return;
    }
    try {
      await upsert.mutateAsync({
        memoryBookId,
        teamId,
        vehicle: editingId ? { ...form, id: editingId } : { ...form, sort_order: vehicles.length },
      });
      showToast(editingId ? t("memory_book.toast_vehicle_updated") : t("memory_book.toast_vehicle_added"), "success");
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_VEHICLE);
    } catch (e: any) {
      showToast(e.message ?? t("common.error_generic"), "error");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(t("memory_book.confirm_remove_vehicle", { name }))) return;
    try {
      await deleteVehicle.mutateAsync({ id, memoryBookId, teamId });
      showToast(t("memory_book.toast_vehicle_removed"), "success");
    } catch (e: any) {
      showToast(e.message ?? t("common.error_generic"), "error");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!isOwner && <ReadOnlyBanner />}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-800">{t("memory_book.vehicles_title")}</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {vehicles.length === 1
              ? t("memory_book.vehicles_count_one")
              : t("memory_book.vehicles_count_many", { count: vehicles.length })}
          </p>
        </div>
        {isOwner && !showForm && (
          <Button variant="primary" size="sm" onClick={startAdd}>
            <Plus className="w-4 h-4 mr-1 inline" />
            {t("memory_book.vehicles_add_btn")}
          </Button>
        )}
      </div>

      {showForm && isOwner && (
        <Card>
          <CardHeader>
            <h4 className="text-sm font-semibold text-slate-700">
              {editingId ? t("memory_book.vehicles_edit_heading") : t("memory_book.vehicles_new_heading")}
            </h4>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t("memory_book.field_make_model_year")}
                  value={form.make_model_year}
                  onChange={e => setForm(f => ({ ...f, make_model_year: e.target.value }))}
                  placeholder={t("memory_book.field_make_model_year_placeholder")}
                />
                <Input
                  label={t("memory_book.field_license_plate")}
                  value={form.license_plate}
                  onChange={e => setForm(f => ({ ...f, license_plate: e.target.value }))}
                  placeholder={t("memory_book.field_license_plate_placeholder")}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t("memory_book.field_registration_due")}
                  value={form.registration_due}
                  onChange={e => setForm(f => ({ ...f, registration_due: e.target.value }))}
                  placeholder="YYYY-MM-DD"
                  type="date"
                />
                <Input
                  label={t("memory_book.field_service_provider")}
                  value={form.service_provider}
                  onChange={e => setForm(f => ({ ...f, service_provider: e.target.value }))}
                  placeholder={t("memory_book.field_service_provider_placeholder")}
                />
              </div>
              <Input
                label={t("memory_book.field_parking_location")}
                value={form.parking_location}
                onChange={e => setForm(f => ({ ...f, parking_location: e.target.value }))}
                placeholder={t("memory_book.field_parking_location_placeholder")}
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t("memory_book.field_notes")}</label>
                <textarea
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-base placeholder-slate-400 shadow-sm focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600 bg-white text-slate-800 min-h-[60px]"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder={t("memory_book.field_notes_placeholder")}
                  rows={2}
                />
              </div>
              <div className="flex items-center gap-3 pt-1">
                <Button variant="primary" size="md" onClick={handleSave} disabled={upsert.isPending}>
                  <Save className="w-4 h-4 mr-2 inline" />
                  {upsert.isPending ? t("memory_book.saving") : t("memory_book.contact_save_btn")}
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_VEHICLE); }}
                >
                  <X className="w-4 h-4 mr-1 inline" />
                  {t("memory_book.cancel")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {vehicles.length === 0 && !showForm ? (
        <SectionEmptyState
          title={t("memory_book.vehicles_empty_title")}
          description={t("memory_book.vehicles_empty_desc")}
          isOwner={isOwner}
          ownerAction={
            <Button variant="primary" size="md" onClick={startAdd}>
              <Car className="w-4 h-4 mr-2 inline" />
              {t("memory_book.vehicles_add_first_btn")}
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {vehicles.map(vehicle => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              isOwner={isOwner}
              regSoonLabel={t("memory_book.vehicle_reg_soon")}
              regOverdueLabel={t("memory_book.vehicle_reg_overdue")}
              onEdit={() => startEdit(vehicle)}
              onDelete={() => handleDelete(vehicle.id, vehicle.make_model_year)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function VehicleCard({
  vehicle,
  isOwner,
  regSoonLabel,
  regOverdueLabel,
  onEdit,
  onDelete,
}: {
  vehicle: MemoryBookVehicle;
  isOwner: boolean;
  regSoonLabel: string;
  regOverdueLabel: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const soon = isRegistrationSoon(vehicle.registration_due);
  const overdue = isRegistrationOverdue(vehicle.registration_due);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-800">{vehicle.make_model_year}</p>
          {vehicle.license_plate && (
            <p className="text-xs text-slate-500 font-mono mt-0.5">{vehicle.license_plate}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {(soon || overdue) && (
            <span className={[
              "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
              overdue ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700",
            ].join(" ")}>
              <AlertTriangle className="w-3 h-3" />
              {overdue ? regOverdueLabel : regSoonLabel}
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
      <div className="space-y-1">
        {vehicle.registration_due && (
          <p className="text-xs text-slate-500">
            <span className="font-medium">{vehicle.registration_due}</span>
          </p>
        )}
        {vehicle.service_provider && (
          <p className="text-xs text-slate-500">{vehicle.service_provider}</p>
        )}
        {vehicle.parking_location && (
          <p className="text-xs text-slate-500">{vehicle.parking_location}</p>
        )}
        {vehicle.notes && (
          <p className="text-xs text-slate-500 leading-relaxed pt-1 border-t border-slate-100">
            {vehicle.notes}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Vehicle Care tab ──────────────────────────────────────────────────────────

function VehicleCareTab({ memoryBookId, teamId, isOwner }: Props) {
  const { data: providers = [], isLoading } = useMemoryBookVehicleCare(memoryBookId);
  const upsert = useUpsertMemoryBookVehicleCare();
  const remove = useDeleteMemoryBookVehicleCare();
  const { showToast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_CARE);

  const startAdd = () => {
    setForm(EMPTY_CARE);
    setEditingId(null);
    setShowForm(true);
  };

  const startEdit = (p: MemoryBookVehicleCare) => {
    setForm({
      provider_name: p.provider_name,
      sub_category:  p.sub_category,
      phone:         p.phone,
      website:       p.website,
      notes:         p.notes,
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_CARE);
  };

  const handleSave = async () => {
    if (!form.provider_name.trim()) {
      showToast("Provider name is required.", "error");
      return;
    }
    if (!form.sub_category) {
      showToast("Please select a service type.", "error");
      return;
    }
    try {
      await upsert.mutateAsync({
        memoryBookId,
        teamId,
        provider: editingId
          ? { ...form, id: editingId }
          : { ...form, sort_order: providers.length },
      });
      showToast(editingId ? "Provider updated." : "Provider added.", "success");
      cancelForm();
    } catch (e: any) {
      showToast(e.message ?? "Something went wrong.", "error");
    }
  };

  const handleDelete = async (p: MemoryBookVehicleCare) => {
    if (!confirm(`Remove "${p.provider_name}"?`)) return;
    try {
      await remove.mutateAsync({ id: p.id, memoryBookId, teamId });
      showToast("Provider removed.", "success");
    } catch (e: any) {
      showToast(e.message ?? "Something went wrong.", "error");
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
    <div className="space-y-6">
      {!isOwner && <ReadOnlyBanner />}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Vehicle Care Providers</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {providers.length === 0
              ? "Track auto shops and service providers for this vehicle."
              : `${providers.length} provider${providers.length !== 1 ? "s" : ""} on record`}
          </p>
        </div>
        {isOwner && !showForm && providers.length > 0 && (
          <Button variant="primary" size="sm" onClick={startAdd}>
            <Plus className="w-4 h-4 mr-1 inline" />
            Add Provider
          </Button>
        )}
      </div>

      {showForm && isOwner && (
        <Card>
          <CardHeader>
            <h4 className="text-sm font-semibold text-slate-700">
              {editingId ? "Edit Provider" : "Add Vehicle Care Provider"}
            </h4>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Service Type</label>
                  <select
                    className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600 bg-white text-slate-800"
                    value={form.sub_category}
                    onChange={e => setForm(f => ({ ...f, sub_category: e.target.value }))}
                  >
                    <option value="">Select type…</option>
                    {CARE_SUB_CATEGORIES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Provider Name"
                  value={form.provider_name}
                  onChange={e => setForm(f => ({ ...f, provider_name: e.target.value }))}
                  placeholder="e.g. Jiffy Lube, Mike's Auto"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Phone"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="(555) 000-0000"
                />
                <Input
                  label="Website"
                  value={form.website}
                  onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                  placeholder="https://…"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
                <textarea
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 shadow-sm focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600 bg-white text-slate-800 min-h-[60px]"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Preferred mechanic, service intervals, appointment notes…"
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

      {providers.length === 0 && !showForm && (
        <SectionEmptyState
          title="No vehicle care providers yet"
          description="Add auto shops, mechanics, and service providers — oil changes, tires, brakes, detailing, and more."
          isOwner={isOwner}
          ownerAction={
            <Button variant="primary" size="md" onClick={startAdd}>
              <Wrench className="w-4 h-4 mr-2 inline" />
              Add Provider
            </Button>
          }
        />
      )}

      {providers.length > 0 && !showForm && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {providers.map(p => (
            <VehicleCareCard
              key={p.id}
              provider={p}
              isOwner={isOwner}
              onEdit={() => startEdit(p)}
              onDelete={() => handleDelete(p)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function VehicleCareCard({
  provider,
  isOwner,
  onEdit,
  onDelete,
}: {
  provider: MemoryBookVehicleCare;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const meta = getCareSubMeta(provider.sub_category);
  const { Icon } = meta;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex gap-3 shadow-sm">
      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-cyan-50 flex items-center justify-center mt-0.5">
        <Icon className="w-4 h-4 text-cyan-600" />
      </div>
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
          {provider.website && (
            <a
              href={provider.website.startsWith("http") ? provider.website : `https://${provider.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-cyan-700 hover:text-cyan-900 transition-colors w-fit"
            >
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
              <span>Website</span>
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
