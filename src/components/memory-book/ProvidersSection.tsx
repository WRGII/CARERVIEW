import { useState } from "react";
import { Plus, Pencil, Trash2, Save, X, Stethoscope, Phone, Star } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useToast } from "../ui/ToastProvider";
import {
  useMemoryBookProviders,
  useUpsertMemoryBookProvider,
  useDeleteMemoryBookProvider,
} from "../../hooks/useMemoryBook";
import type { MemoryBookProvider } from "../../types/memory-book";
import ReadOnlyBanner from "./ReadOnlyBanner";
import SectionEmptyState from "./SectionEmptyState";
import { useLocale } from "../../i18n/LocaleContext";

type Props = {
  memoryBookId: string;
  teamId: string;
  isOwner: boolean;
};

const EMPTY_PROVIDER = {
  name: "",
  specialty_label: "",
  practice_name: "",
  phone: "",
  address: "",
  notes: "",
  is_primary: false,
};

export default function ProvidersSection({ memoryBookId, teamId, isOwner }: Props) {
  const { t } = useLocale();
  const { data: providers = [], isLoading } = useMemoryBookProviders(memoryBookId);
  const upsert = useUpsertMemoryBookProvider();
  const deleteProvider = useDeleteMemoryBookProvider();
  const { showToast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_PROVIDER);

  const startAdd = () => {
    setForm(EMPTY_PROVIDER);
    setEditingId(null);
    setShowForm(true);
  };

  const startEdit = (provider: MemoryBookProvider) => {
    setForm({
      name: provider.name,
      specialty_label: provider.specialty_label,
      practice_name: provider.practice_name,
      phone: provider.phone,
      address: provider.address,
      notes: provider.notes,
      is_primary: provider.is_primary,
    });
    setEditingId(provider.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      showToast(t("memory_book.toast_provider_required"), "error");
      return;
    }
    try {
      await upsert.mutateAsync({
        memoryBookId,
        teamId,
        provider: editingId ? { ...form, id: editingId } : { ...form, sort_order: providers.length },
      });
      showToast(editingId ? t("memory_book.toast_provider_updated") : t("memory_book.toast_provider_added"), "success");
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_PROVIDER);
    } catch (e: any) {
      showToast(e.message ?? t("common.error_generic"), "error");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(t("memory_book.confirm_remove_provider", { name }))) return;
    try {
      await deleteProvider.mutateAsync({ id, memoryBookId, teamId });
      showToast(t("memory_book.toast_provider_removed"), "success");
    } catch (e: any) {
      showToast(e.message ?? t("common.error_generic"), "error");
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
          <h3 className="text-base font-semibold text-slate-800">{t("memory_book.providers_title")}</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {providers.length === 1
              ? t("memory_book.providers_count_one")
              : t("memory_book.providers_count_many", { count: providers.length })}
          </p>
        </div>
        {isOwner && !showForm && (
          <Button variant="primary" size="sm" onClick={startAdd}>
            <Plus className="w-4 h-4 mr-1 inline" />
            {t("memory_book.providers_add_btn")}
          </Button>
        )}
      </div>

      {showForm && isOwner && (
        <Card>
          <CardHeader>
            <h4 className="text-sm font-semibold text-slate-700">
              {editingId ? t("memory_book.providers_edit_heading") : t("memory_book.providers_new_heading")}
            </h4>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t("memory_book.field_provider_name")}
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder={t("memory_book.field_provider_name_placeholder")}
                />
                <Input
                  label={t("memory_book.field_specialty")}
                  value={form.specialty_label}
                  onChange={e => setForm(f => ({ ...f, specialty_label: e.target.value }))}
                  placeholder={t("memory_book.field_specialty_placeholder")}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t("memory_book.field_practice_name")}
                  value={form.practice_name}
                  onChange={e => setForm(f => ({ ...f, practice_name: e.target.value }))}
                  placeholder={t("memory_book.field_practice_name_placeholder")}
                />
                <Input
                  label={t("memory_book.field_phone")}
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+1 (555) 000-0000"
                  type="tel"
                />
              </div>
              <Input
                label={t("memory_book.field_address")}
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder={t("memory_book.field_address_placeholder")}
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t("memory_book.field_notes")}</label>
                <textarea
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-base placeholder-slate-400 shadow-sm focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600 bg-white text-slate-800 min-h-[72px]"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder={t("memory_book.field_notes_placeholder")}
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_primary}
                  onChange={e => setForm(f => ({ ...f, is_primary: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                />
                <span className="text-sm text-slate-700">{t("memory_book.field_provider_is_primary")}</span>
              </label>
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
                    setForm(EMPTY_PROVIDER);
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

      {providers.length === 0 && !showForm ? (
        <SectionEmptyState
          title={t("memory_book.providers_empty_title")}
          description={t("memory_book.providers_empty_desc")}
          isOwner={isOwner}
          ownerAction={
            <Button variant="primary" size="md" onClick={startAdd}>
              <Stethoscope className="w-4 h-4 mr-2 inline" />
              {t("memory_book.providers_add_first_btn")}
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {providers.map(provider => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              isOwner={isOwner}
              primaryLabel={t("memory_book.provider_primary_label")}
              onEdit={() => startEdit(provider)}
              onDelete={() => handleDelete(provider.id, provider.name)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProviderCard({
  provider,
  isOwner,
  primaryLabel,
  onEdit,
  onDelete,
}: {
  provider: MemoryBookProvider;
  isOwner: boolean;
  primaryLabel: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-slate-800">{provider.name}</p>
            {provider.is_primary && (
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-slate-500">
            {[provider.specialty_label, provider.practice_name].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {provider.is_primary && (
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
              {primaryLabel}
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
        {provider.phone && (
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <a href={`tel:${provider.phone}`} className="hover:text-cyan-600 transition-colors">
              {provider.phone}
            </a>
          </div>
        )}
        {provider.address && (
          <p className="text-xs text-slate-500">{provider.address}</p>
        )}
        {provider.notes && (
          <p className="text-xs text-slate-500 leading-relaxed pt-1 border-t border-slate-100">
            {provider.notes}
          </p>
        )}
      </div>
    </div>
  );
}
