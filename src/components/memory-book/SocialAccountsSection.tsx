import { useState } from "react";
import { Plus, Pencil, Trash2, Save, X, Share2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useToast } from "../ui/ToastProvider";
import {
  useMemoryBookSocialAccounts,
  useUpsertMemoryBookSocialAccount,
  useDeleteMemoryBookSocialAccount,
} from "../../hooks/useMemoryBook";
import type { MemoryBookSocialAccount } from "../../types/memory-book";
import ReadOnlyBanner from "./ReadOnlyBanner";
import SectionEmptyState from "./SectionEmptyState";
import { useLocale } from "../../i18n/LocaleContext";

type Props = {
  memoryBookId: string;
  teamId: string;
  isOwner: boolean;
};

const SUGGESTED_PLATFORMS = [
  "Facebook",
  "Instagram",
  "X (Twitter)",
  "LinkedIn",
  "YouTube",
  "TikTok",
  "Pinterest",
  "Snapchat",
  "WhatsApp",
  "Reddit",
  "Nextdoor",
  "Threads",
  "Gmail",
  "Outlook / Hotmail",
  "Yahoo Mail",
  "Amazon",
  "Apple ID / iCloud",
  "Google Account",
  "Netflix",
  "Other / Custom",
];

const PLATFORM_COLORS: Record<string, string> = {
  "Facebook":          "bg-blue-100 text-blue-700",
  "Instagram":         "bg-pink-100 text-pink-700",
  "X (Twitter)":       "bg-slate-100 text-slate-700",
  "LinkedIn":          "bg-sky-100 text-sky-700",
  "YouTube":           "bg-red-100 text-red-700",
  "TikTok":            "bg-rose-100 text-rose-700",
  "Pinterest":         "bg-red-100 text-red-600",
  "Snapchat":          "bg-yellow-100 text-yellow-700",
  "WhatsApp":          "bg-green-100 text-green-700",
  "Reddit":            "bg-orange-100 text-orange-700",
  "Nextdoor":          "bg-teal-100 text-teal-700",
  "Threads":           "bg-slate-100 text-slate-700",
  "Gmail":             "bg-red-100 text-red-700",
  "Outlook / Hotmail": "bg-blue-100 text-blue-700",
  "Yahoo Mail":        "bg-violet-100 text-violet-700",
  "Amazon":            "bg-amber-100 text-amber-700",
  "Apple ID / iCloud": "bg-slate-100 text-slate-600",
  "Google Account":    "bg-blue-100 text-blue-700",
  "Netflix":           "bg-red-100 text-red-700",
};

const EMPTY_ACCOUNT = { platform: "", username: "", url: "", notes: "" };

export default function SocialAccountsSection({ memoryBookId, teamId, isOwner }: Props) {
  const { t } = useLocale();
  const { data: accounts = [], isLoading } = useMemoryBookSocialAccounts(memoryBookId);
  const upsert = useUpsertMemoryBookSocialAccount();
  const deleteAccount = useDeleteMemoryBookSocialAccount();
  const { showToast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_ACCOUNT);
  const [customPlatform, setCustomPlatform] = useState("");
  const [isCustom, setIsCustom] = useState(false);

  const effectivePlatform = isCustom ? customPlatform : form.platform;

  const startAdd = () => {
    setForm(EMPTY_ACCOUNT);
    setCustomPlatform("");
    setIsCustom(false);
    setEditingId(null);
    setShowForm(true);
  };

  const startEdit = (account: MemoryBookSocialAccount) => {
    const isSuggested = SUGGESTED_PLATFORMS.includes(account.platform);
    setForm({ platform: isSuggested ? account.platform : "Other / Custom", username: account.username, url: account.url, notes: account.notes });
    setCustomPlatform(isSuggested ? "" : account.platform);
    setIsCustom(!isSuggested);
    setEditingId(account.id);
    setShowForm(true);
  };

  const handlePlatformChange = (value: string) => {
    if (value === "Other / Custom") {
      setIsCustom(true);
      setForm(f => ({ ...f, platform: value }));
    } else {
      setIsCustom(false);
      setCustomPlatform("");
      setForm(f => ({ ...f, platform: value }));
    }
  };

  const handleSave = async () => {
    const platform = isCustom ? customPlatform.trim() : form.platform;
    if (!platform) {
      showToast(t("memory_book.toast_social_platform_required"), "error");
      return;
    }
    try {
      await upsert.mutateAsync({
        memoryBookId,
        teamId,
        account: editingId
          ? { ...form, platform, id: editingId }
          : { ...form, platform, sort_order: accounts.length },
      });
      showToast(editingId ? t("memory_book.toast_social_updated") : t("memory_book.toast_social_added"), "success");
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_ACCOUNT);
      setCustomPlatform("");
      setIsCustom(false);
    } catch (e: any) {
      showToast(e.message ?? t("common.error_generic"), "error");
    }
  };

  const handleDelete = async (id: string, platform: string) => {
    if (!confirm(t("memory_book.confirm_remove_social", { platform }))) return;
    try {
      await deleteAccount.mutateAsync({ id, memoryBookId, teamId });
      showToast(t("memory_book.toast_social_removed"), "success");
    } catch (e: any) {
      showToast(e.message ?? t("common.error_generic"), "error");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_ACCOUNT);
    setCustomPlatform("");
    setIsCustom(false);
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
          <h3 className="text-base font-semibold text-slate-800">{t("memory_book.social_title")}</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {accounts.length === 1
              ? t("memory_book.social_count_one")
              : t("memory_book.social_count_many", { count: accounts.length })}
          </p>
        </div>
        {isOwner && !showForm && (
          <Button variant="primary" size="sm" onClick={startAdd}>
            <Plus className="w-4 h-4 mr-1 inline" />
            {t("memory_book.social_add_btn")}
          </Button>
        )}
      </div>

      {showForm && isOwner && (
        <Card>
          <CardHeader>
            <h4 className="text-sm font-semibold text-slate-700">
              {editingId ? t("memory_book.social_edit_heading") : t("memory_book.social_new_heading")}
            </h4>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    {t("memory_book.field_social_platform")}
                  </label>
                  <select
                    className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-base shadow-sm focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600 bg-white text-slate-800"
                    value={form.platform}
                    onChange={e => handlePlatformChange(e.target.value)}
                  >
                    <option value="">{t("memory_book.field_social_platform_select")}</option>
                    {SUGGESTED_PLATFORMS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <Input
                  label={t("memory_book.field_social_username")}
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  placeholder={t("memory_book.field_social_username_placeholder")}
                />
              </div>

              {isCustom && (
                <Input
                  label={t("memory_book.field_social_custom_platform")}
                  value={customPlatform}
                  onChange={e => setCustomPlatform(e.target.value)}
                  placeholder={t("memory_book.field_social_custom_platform_placeholder")}
                />
              )}

              <Input
                label={t("memory_book.field_social_url")}
                value={form.url}
                onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                placeholder={t("memory_book.field_social_url_placeholder")}
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t("memory_book.field_notes")}
                </label>
                <textarea
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-base placeholder-slate-400 shadow-sm focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600 bg-white text-slate-800 min-h-[60px]"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder={t("memory_book.field_social_notes_placeholder")}
                  rows={2}
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <Button variant="primary" size="md" onClick={handleSave} disabled={upsert.isPending}>
                  <Save className="w-4 h-4 mr-2 inline" />
                  {upsert.isPending ? t("memory_book.saving") : t("memory_book.contact_save_btn")}
                </Button>
                <Button variant="ghost" size="md" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-1 inline" />
                  {t("memory_book.cancel")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {accounts.length === 0 && !showForm ? (
        <SectionEmptyState
          title={t("memory_book.social_empty_title")}
          description={t("memory_book.social_empty_desc")}
          isOwner={isOwner}
          ownerAction={
            <Button variant="primary" size="md" onClick={startAdd}>
              <Share2 className="w-4 h-4 mr-2 inline" />
              {t("memory_book.social_add_first_btn")}
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {accounts.map(account => (
            <SocialAccountCard
              key={account.id}
              account={account}
              isOwner={isOwner}
              onEdit={() => startEdit(account)}
              onDelete={() => handleDelete(account.id, account.platform)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SocialAccountCard({
  account,
  isOwner,
  onEdit,
  onDelete,
}: {
  account: MemoryBookSocialAccount;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const pillColor = PLATFORM_COLORS[account.platform] ?? "bg-slate-100 text-slate-600";

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${pillColor}`}>
            {account.platform}
          </span>
        </div>
        {account.username && (
          <p className="text-sm font-medium text-slate-700 mt-1.5 truncate">
            {account.username}
          </p>
        )}
        {account.url && (
          <a
            href={account.url.startsWith("http") ? account.url : `https://${account.url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-cyan-600 hover:text-cyan-700 mt-1 truncate max-w-full"
            onClick={e => e.stopPropagation()}
          >
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{account.url}</span>
          </a>
        )}
        {account.notes && (
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{account.notes}</p>
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
