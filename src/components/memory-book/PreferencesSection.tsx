import { useState, useEffect } from "react";
import { Save, Heart } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Button } from "../ui/Button";
import { useToast } from "../ui/ToastProvider";
import {
  useMemoryBookPreferences,
  useUpsertMemoryBookPreferences,
} from "../../hooks/useMemoryBook";
import ReadOnlyBanner from "./ReadOnlyBanner";
import SectionEmptyState from "./SectionEmptyState";
import { useLocale } from "../../i18n/LocaleContext";

type Props = {
  memoryBookId: string;
  teamId: string;
  isOwner: boolean;
};

const EMPTY_FORM = {
  likes: "",
  dislikes: "",
  foods_liked: "",
  foods_disliked: "",
  music_preferences: "",
  conversation_topics: "",
  comforts: "",
  fears: "",
  sensory_preferences: "",
  things_to_avoid: "",
};

export default function PreferencesSection({ memoryBookId, teamId, isOwner }: Props) {
  const { t } = useLocale();
  const { data: prefs, isLoading } = useMemoryBookPreferences(memoryBookId);
  const upsert = useUpsertMemoryBookPreferences();
  const { showToast } = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setEditing(false);
  }, [memoryBookId]);

  useEffect(() => {
    if (prefs) {
      setForm({
        likes: prefs.likes ?? "",
        dislikes: prefs.dislikes ?? "",
        foods_liked: prefs.foods_liked ?? "",
        foods_disliked: prefs.foods_disliked ?? "",
        music_preferences: prefs.music_preferences ?? "",
        conversation_topics: prefs.conversation_topics ?? "",
        comforts: prefs.comforts ?? "",
        fears: prefs.fears ?? "",
        sensory_preferences: prefs.sensory_preferences ?? "",
        things_to_avoid: prefs.things_to_avoid ?? "",
      });
    }
  }, [prefs]);

  const handleSave = async () => {
    try {
      await upsert.mutateAsync({ memoryBookId, teamId, values: form });
      showToast(t("memory_book.toast_prefs_saved"), "success");
      setEditing(false);
    } catch (e: any) {
      showToast(e.message ?? t("common.error_generic"), "error");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const hasData = !!prefs;
  const isReadOnly = !isOwner;

  if (!hasData && !isOwner) {
    return (
      <SectionEmptyState
        title={t("memory_book.prefs_empty_member_title")}
        description={t("memory_book.prefs_empty_member_desc")}
        isOwner={false}
      />
    );
  }

  if (!hasData && isOwner && !editing) {
    return (
      <SectionEmptyState
        title={t("memory_book.prefs_empty_owner_title")}
        description={t("memory_book.prefs_empty_owner_desc")}
        isOwner={true}
        ownerAction={
          <Button variant="primary" size="md" onClick={() => setEditing(true)}>
            <Heart className="w-4 h-4 mr-2 inline" />
            {t("memory_book.prefs_add_btn")}
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
              <h3 className="text-base font-semibold text-slate-800">{t("memory_book.prefs_title")}</h3>
              <p className="text-sm text-slate-500 mt-0.5">
                {t("memory_book.prefs_subtitle")}
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
                <TextareaField
                  label={t("memory_book.field_likes")}
                  value={form.likes}
                  onChange={v => setForm(f => ({ ...f, likes: v }))}
                  placeholder={t("memory_book.field_likes_placeholder")}
                />
                <TextareaField
                  label={t("memory_book.field_dislikes")}
                  value={form.dislikes}
                  onChange={v => setForm(f => ({ ...f, dislikes: v }))}
                  placeholder={t("memory_book.field_dislikes_placeholder")}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextareaField
                  label={t("memory_book.field_foods_liked")}
                  value={form.foods_liked}
                  onChange={v => setForm(f => ({ ...f, foods_liked: v }))}
                  placeholder={t("memory_book.field_foods_liked_placeholder")}
                  rows={3}
                />
                <TextareaField
                  label={t("memory_book.field_foods_disliked")}
                  value={form.foods_disliked}
                  onChange={v => setForm(f => ({ ...f, foods_disliked: v }))}
                  placeholder={t("memory_book.field_foods_disliked_placeholder")}
                  rows={3}
                />
              </div>
              <TextareaField
                label={t("memory_book.field_music")}
                value={form.music_preferences}
                onChange={v => setForm(f => ({ ...f, music_preferences: v }))}
                placeholder={t("memory_book.field_music_placeholder")}
              />
              <TextareaField
                label={t("memory_book.field_conversation")}
                value={form.conversation_topics}
                onChange={v => setForm(f => ({ ...f, conversation_topics: v }))}
                placeholder={t("memory_book.field_conversation_placeholder")}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextareaField
                  label={t("memory_book.field_comforts")}
                  value={form.comforts}
                  onChange={v => setForm(f => ({ ...f, comforts: v }))}
                  placeholder={t("memory_book.field_comforts_placeholder")}
                  rows={3}
                />
                <TextareaField
                  label={t("memory_book.field_fears")}
                  value={form.fears}
                  onChange={v => setForm(f => ({ ...f, fears: v }))}
                  placeholder={t("memory_book.field_fears_placeholder")}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextareaField
                  label={t("memory_book.field_sensory")}
                  value={form.sensory_preferences}
                  onChange={v => setForm(f => ({ ...f, sensory_preferences: v }))}
                  placeholder={t("memory_book.field_sensory_placeholder")}
                  rows={3}
                />
                <TextareaField
                  label={t("memory_book.field_avoid")}
                  value={form.things_to_avoid}
                  onChange={v => setForm(f => ({ ...f, things_to_avoid: v }))}
                  placeholder={t("memory_book.field_avoid_placeholder")}
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button variant="primary" size="md" onClick={handleSave} disabled={upsert.isPending}>
                  <Save className="w-4 h-4 mr-2 inline" />
                  {upsert.isPending ? t("memory_book.saving") : t("memory_book.save_changes")}
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => {
                    setEditing(false);
                    if (prefs) {
                      setForm({
                        likes: prefs.likes ?? "",
                        dislikes: prefs.dislikes ?? "",
                        foods_liked: prefs.foods_liked ?? "",
                        foods_disliked: prefs.foods_disliked ?? "",
                        music_preferences: prefs.music_preferences ?? "",
                        conversation_topics: prefs.conversation_topics ?? "",
                        comforts: prefs.comforts ?? "",
                        fears: prefs.fears ?? "",
                        sensory_preferences: prefs.sensory_preferences ?? "",
                        things_to_avoid: prefs.things_to_avoid ?? "",
                      });
                    }
                  }}
                >
                  {t("memory_book.cancel")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              <ReadBlock label={t("memory_book.label_enjoys")} value={prefs?.likes} />
              <ReadBlock label={t("memory_book.label_dislikes")} value={prefs?.dislikes} />
              <ReadBlock label={t("memory_book.label_foods_liked")} value={prefs?.foods_liked} />
              <ReadBlock label={t("memory_book.label_foods_disliked")} value={prefs?.foods_disliked} />
              <ReadBlock label={t("memory_book.label_music")} value={prefs?.music_preferences} />
              <ReadBlock label={t("memory_book.label_conversation")} value={prefs?.conversation_topics} />
              <ReadBlock label={t("memory_book.label_comforts")} value={prefs?.comforts} />
              <ReadBlock label={t("memory_book.label_fears")} value={prefs?.fears} />
              <ReadBlock label={t("memory_book.label_sensory")} value={prefs?.sensory_preferences} />
              <ReadBlock label={t("memory_book.label_avoid")} value={prefs?.things_to_avoid} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      <textarea
        className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-base placeholder-slate-400 shadow-sm focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600 bg-white text-slate-800 leading-relaxed"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  );
}

function ReadBlock({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</p>
      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{value}</p>
    </div>
  );
}
