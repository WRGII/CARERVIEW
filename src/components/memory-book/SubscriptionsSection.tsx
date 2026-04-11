import { useState } from "react";
import { Plus, Pencil, Trash2, Save, X, Tv } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useToast } from "../ui/ToastProvider";
import {
  useMemoryBookSubscriptions,
  useUpsertMemoryBookSubscription,
  useDeleteMemoryBookSubscription,
} from "../../hooks/useMemoryBook";
import type { MemoryBookSubscription } from "../../types/memory-book";
import ReadOnlyBanner from "./ReadOnlyBanner";
import SectionEmptyState from "./SectionEmptyState";
import { useLocale } from "../../i18n/LocaleContext";

type Props = {
  memoryBookId: string;
  teamId: string;
  isOwner: boolean;
};

const CATEGORY_KEYS: { value: string; i18nKey: string }[] = [
  { value: "Streaming",         i18nKey: "memory_book.sub_cat_streaming" },
  { value: "News",              i18nKey: "memory_book.sub_cat_news" },
  { value: "Music",             i18nKey: "memory_book.sub_cat_music" },
  { value: "Software",          i18nKey: "memory_book.sub_cat_software" },
  { value: "Health & Wellness", i18nKey: "memory_book.sub_cat_health" },
  { value: "Delivery",          i18nKey: "memory_book.sub_cat_delivery" },
  { value: "Utility",           i18nKey: "memory_book.sub_cat_utility" },
  { value: "Other",             i18nKey: "memory_book.sub_cat_other" },
];

const EMPTY_SUBSCRIPTION = {
  name: "",
  category: "",
  notes: "",
};

export default function SubscriptionsSection({ memoryBookId, teamId, isOwner }: Props) {
  const { t } = useLocale();
  const { data: subscriptions = [], isLoading } = useMemoryBookSubscriptions(memoryBookId);
  const upsert = useUpsertMemoryBookSubscription();
  const deleteSub = useDeleteMemoryBookSubscription();
  const { showToast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_SUBSCRIPTION);

  const catMap = Object.fromEntries(CATEGORY_KEYS.map(c => [c.value, c.i18nKey]));
  const getCatLabel = (value: string) => t(catMap[value] ?? value);

  const startAdd = () => {
    setForm(EMPTY_SUBSCRIPTION);
    setEditingId(null);
    setShowForm(true);
  };

  const startEdit = (sub: MemoryBookSubscription) => {
    setForm({ name: sub.name, category: sub.category, notes: sub.notes });
    setEditingId(sub.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      showToast(t("memory_book.toast_sub_required"), "error");
      return;
    }
    try {
      await upsert.mutateAsync({
        memoryBookId,
        teamId,
        subscription: editingId ? { ...form, id: editingId } : { ...form, sort_order: subscriptions.length },
      });
      showToast(editingId ? t("memory_book.toast_sub_updated") : t("memory_book.toast_sub_added"), "success");
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_SUBSCRIPTION);
    } catch (e: any) {
      showToast(e.message ?? t("common.error_generic"), "error");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(t("memory_book.confirm_remove_sub", { name }))) return;
    try {
      await deleteSub.mutateAsync({ id, memoryBookId, teamId });
      showToast(t("memory_book.toast_sub_removed"), "success");
    } catch (e: any) {
      showToast(e.message ?? t("common.error_generic"), "error");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!isOwner && <ReadOnlyBanner />}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-800">{t("memory_book.subs_title")}</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {subscriptions.length === 1
              ? t("memory_book.subs_count_one")
              : t("memory_book.subs_count_many", { count: subscriptions.length })}
          </p>
        </div>
        {isOwner && !showForm && (
          <Button variant="primary" size="sm" onClick={startAdd}>
            <Plus className="w-4 h-4 mr-1 inline" />
            {t("memory_book.subs_add_btn")}
          </Button>
        )}
      </div>

      {showForm && isOwner && (
        <Card>
          <CardHeader>
            <h4 className="text-sm font-semibold text-slate-700">
              {editingId ? t("memory_book.subs_edit_heading") : t("memory_book.subs_new_heading")}
            </h4>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t("memory_book.field_sub_name")}
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder={t("memory_book.field_sub_name_placeholder")}
                />
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">{t("memory_book.field_sub_category")}</label>
                  <select
                    className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-base shadow-sm focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600 bg-white text-slate-800"
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  >
                    <option value="">{t("memory_book.field_sub_category_select")}</option>
                    {CATEGORY_KEYS.map(c => (
                      <option key={c.value} value={c.value}>{t(c.i18nKey)}</option>
                    ))}
                  </select>
                </div>
              </div>
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
                    setForm(EMPTY_SUBSCRIPTION);
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

      {subscriptions.length === 0 && !showForm ? (
        <SectionEmptyState
          title={t("memory_book.subs_empty_title")}
          description={t("memory_book.subs_empty_desc")}
          isOwner={isOwner}
          ownerAction={
            <Button variant="primary" size="md" onClick={startAdd}>
              <Tv className="w-4 h-4 mr-2 inline" />
              {t("memory_book.subs_add_first_btn")}
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {subscriptions.map(sub => (
            <SubscriptionCard
              key={sub.id}
              sub={sub}
              isOwner={isOwner}
              getCatLabel={getCatLabel}
              onEdit={() => startEdit(sub)}
              onDelete={() => handleDelete(sub.id, sub.name)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SubscriptionCard({
  sub,
  isOwner,
  getCatLabel,
  onEdit,
  onDelete,
}: {
  sub: MemoryBookSubscription;
  isOwner: boolean;
  getCatLabel: (v: string) => string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{sub.name}</p>
        {sub.category && (
          <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
            {getCatLabel(sub.category)}
          </span>
        )}
        {sub.notes && (
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{sub.notes}</p>
        )}
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
  );
}
