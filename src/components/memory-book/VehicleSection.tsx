import { useState } from "react";
import { Plus, Pencil, Trash2, Save, X, Car, TriangleAlert as AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useToast } from "../ui/ToastProvider";
import {
  useMemoryBookVehicles,
  useUpsertMemoryBookVehicle,
  useDeleteMemoryBookVehicle,
} from "../../hooks/useMemoryBook";
import type { MemoryBookVehicle } from "../../types/memory-book";
import ReadOnlyBanner from "./ReadOnlyBanner";
import SectionEmptyState from "./SectionEmptyState";
import { useLocale } from "../../i18n/LocaleContext";

type Props = {
  memoryBookId: string;
  teamId: string;
  isOwner: boolean;
};

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

export default function VehicleSection({ memoryBookId, teamId, isOwner }: Props) {
  const { t } = useLocale();
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
      make_model_year: vehicle.make_model_year,
      license_plate: vehicle.license_plate,
      registration_due: vehicle.registration_due ?? "",
      service_provider: vehicle.service_provider,
      parking_location: vehicle.parking_location,
      notes: vehicle.notes,
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
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setForm(EMPTY_VEHICLE);
                  }}
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
