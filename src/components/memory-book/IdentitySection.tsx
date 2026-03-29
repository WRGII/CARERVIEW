import { useState, useEffect } from "react";
import { Save, User } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useToast } from "../ui/ToastProvider";
import {
  useMemoryBookIdentity,
  useUpsertMemoryBookIdentity,
} from "../../hooks/useMemoryBook";
import ReadOnlyBanner from "./ReadOnlyBanner";
import SectionEmptyState from "./SectionEmptyState";
import { useLocale } from "../../i18n/LocaleContext";

type Props = {
  memoryBookId: string;
  teamId: string;
  isOwner: boolean;
  patientName: string;
};

const EMPTY_FORM = {
  preferred_name: "",
  birthplace: "",
  address_preference: "",
  relationship_status: "",
  cultural_preferences: "",
  language_preferences: "",
  about_me: "",
  photo_url: "",
};

export default function IdentitySection({ memoryBookId, teamId, isOwner, patientName }: Props) {
  const { t } = useLocale();
  const { data: identity, isLoading } = useMemoryBookIdentity(memoryBookId);
  const upsert = useUpsertMemoryBookIdentity();
  const { showToast } = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setEditing(false);
  }, [memoryBookId]);

  useEffect(() => {
    if (identity) {
      setForm({
        preferred_name: identity.preferred_name ?? "",
        birthplace: identity.birthplace ?? "",
        address_preference: identity.address_preference ?? "",
        relationship_status: identity.relationship_status ?? "",
        cultural_preferences: identity.cultural_preferences ?? "",
        language_preferences: identity.language_preferences ?? "",
        about_me: identity.about_me ?? "",
        photo_url: identity.photo_url ?? "",
      });
    }
  }, [identity]);

  const handleSave = async () => {
    try {
      await upsert.mutateAsync({ memoryBookId, teamId, values: form });
      showToast(t("memory_book.toast_identity_saved"), "success");
      setEditing(false);
    } catch (e: any) {
      showToast(e.message ?? t("common.error_generic"), "error");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const hasData = !!identity;
  const isReadOnly = !isOwner;

  if (!hasData && !isOwner) {
    return (
      <SectionEmptyState
        title={t("memory_book.identity_empty_member_title")}
        description={t("memory_book.identity_empty_member_desc")}
        isOwner={false}
      />
    );
  }

  if (!hasData && isOwner && !editing) {
    return (
      <SectionEmptyState
        title={t("memory_book.identity_empty_owner_title")}
        description={t("memory_book.identity_empty_owner_desc")}
        isOwner={true}
        ownerAction={
          <Button variant="primary" size="md" onClick={() => setEditing(true)}>
            <User className="w-4 h-4 mr-2 inline" />
            {t("memory_book.identity_add_btn")}
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {isReadOnly && <ReadOnlyBanner />}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-800">{t("memory_book.identity_title")}</h3>
              <p className="text-sm text-slate-500 mt-0.5">
                {t("memory_book.identity_subtitle", { patientName })}
              </p>
            </div>
            {isOwner && !editing && (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                {t("memory_book.edit")}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editing && isOwner ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t("memory_book.field_preferred_name")}
                  value={form.preferred_name}
                  onChange={e => setForm(f => ({ ...f, preferred_name: e.target.value }))}
                  placeholder={t("memory_book.field_preferred_name_placeholder")}
                />
                <Input
                  label={t("memory_book.field_address_pref")}
                  value={form.address_preference}
                  onChange={e => setForm(f => ({ ...f, address_preference: e.target.value }))}
                  placeholder={t("memory_book.field_address_pref_placeholder")}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t("memory_book.field_birthplace")}
                  value={form.birthplace}
                  onChange={e => setForm(f => ({ ...f, birthplace: e.target.value }))}
                  placeholder={t("memory_book.field_birthplace_placeholder")}
                />
                <Input
                  label={t("memory_book.field_relationship_status")}
                  value={form.relationship_status}
                  onChange={e => setForm(f => ({ ...f, relationship_status: e.target.value }))}
                  placeholder={t("memory_book.field_relationship_status_placeholder")}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t("memory_book.field_cultural_bg")}
                  value={form.cultural_preferences}
                  onChange={e => setForm(f => ({ ...f, cultural_preferences: e.target.value }))}
                  placeholder={t("memory_book.field_cultural_bg_placeholder")}
                />
                <Input
                  label={t("memory_book.field_language_prefs")}
                  value={form.language_preferences}
                  onChange={e => setForm(f => ({ ...f, language_preferences: e.target.value }))}
                  placeholder={t("memory_book.field_language_prefs_placeholder")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t("memory_book.field_about_me")}
                </label>
                <textarea
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-base placeholder-slate-400 shadow-sm focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600 bg-white text-slate-800 min-h-[120px] leading-relaxed"
                  value={form.about_me}
                  onChange={e => setForm(f => ({ ...f, about_me: e.target.value }))}
                  placeholder={t("memory_book.field_about_me_placeholder")}
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleSave}
                  disabled={upsert.isPending}
                >
                  <Save className="w-4 h-4 mr-2 inline" />
                  {upsert.isPending ? t("memory_book.saving") : t("memory_book.save_changes")}
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => {
                    setEditing(false);
                    if (identity) {
                      setForm({
                        preferred_name: identity.preferred_name ?? "",
                        birthplace: identity.birthplace ?? "",
                        address_preference: identity.address_preference ?? "",
                        relationship_status: identity.relationship_status ?? "",
                        cultural_preferences: identity.cultural_preferences ?? "",
                        language_preferences: identity.language_preferences ?? "",
                        about_me: identity.about_me ?? "",
                        photo_url: identity.photo_url ?? "",
                      });
                    }
                  }}
                >
                  {t("memory_book.cancel")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                <FieldRow label={t("memory_book.label_preferred_name")} value={identity?.preferred_name} />
                <FieldRow label={t("memory_book.label_address")} value={identity?.address_preference} />
                <FieldRow label={t("memory_book.label_birthplace")} value={identity?.birthplace} />
                <FieldRow label={t("memory_book.label_relationship_status")} value={identity?.relationship_status} />
                <FieldRow label={t("memory_book.label_cultural_bg")} value={identity?.cultural_preferences} />
                <FieldRow label={t("memory_book.label_language_prefs")} value={identity?.language_preferences} />
              </div>
              {identity?.about_me && (
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t("memory_book.label_about_me")}</p>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{identity.about_me}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FieldRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm text-slate-800">{value}</p>
    </div>
  );
}
