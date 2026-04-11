import { useState, useEffect } from "react";
import { Save, Stethoscope } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Button } from "../ui/Button";
import { useToast } from "../ui/ToastProvider";
import {
  useMemoryBookMedical,
  useUpsertMemoryBookMedical,
} from "../../hooks/useMemoryBook";
import ReadOnlyBanner from "./ReadOnlyBanner";
import SectionEmptyState from "./SectionEmptyState";
import ProvidersSection from "./ProvidersSection";
import { useLocale } from "../../i18n/LocaleContext";

type Props = {
  memoryBookId: string;
  teamId: string;
  isOwner: boolean;
};

const EMPTY_FORM = {
  conditions: "",
  allergies: "",
  hearing_notes: "",
  vision_notes: "",
  medication_notes: "",
  other_medical_notes: "",
};

export default function MedicalSection({ memoryBookId, teamId, isOwner }: Props) {
  const { t } = useLocale();
  const { data: medical, isLoading } = useMemoryBookMedical(memoryBookId);
  const upsert = useUpsertMemoryBookMedical();
  const { showToast } = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setEditing(false);
  }, [memoryBookId]);

  useEffect(() => {
    if (medical) {
      setForm({
        conditions: medical.conditions ?? "",
        allergies: medical.allergies ?? "",
        hearing_notes: medical.hearing_notes ?? "",
        vision_notes: medical.vision_notes ?? "",
        medication_notes: medical.medication_notes ?? "",
        other_medical_notes: medical.other_medical_notes ?? "",
      });
    }
  }, [medical]);

  const handleSave = async () => {
    try {
      await upsert.mutateAsync({ memoryBookId, teamId, values: form });
      showToast(t("memory_book.toast_medical_saved"), "success");
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

  const hasData = !!medical;
  const isReadOnly = !isOwner;

  if (!hasData && !isOwner) {
    return (
      <SectionEmptyState
        title={t("memory_book.medical_empty_member_title")}
        description={t("memory_book.medical_empty_member_desc")}
        isOwner={false}
      />
    );
  }

  if (!hasData && isOwner && !editing) {
    return (
      <SectionEmptyState
        title={t("memory_book.medical_empty_owner_title")}
        description={t("memory_book.medical_empty_owner_desc")}
        isOwner={true}
        ownerAction={
          <Button variant="primary" size="md" onClick={() => setEditing(true)}>
            <Stethoscope className="w-4 h-4 mr-2 inline" />
            {t("memory_book.medical_add_btn")}
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {isReadOnly && <ReadOnlyBanner />}

      <ProvidersSection memoryBookId={memoryBookId} teamId={teamId} isOwner={isOwner} />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-800">{t("memory_book.medical_title")}</h3>
              <p className="text-sm text-slate-500 mt-0.5">
                {t("memory_book.medical_subtitle")}
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
              <TextareaField
                label={t("memory_book.field_conditions")}
                value={form.conditions}
                onChange={v => setForm(f => ({ ...f, conditions: v }))}
                placeholder={t("memory_book.field_conditions_placeholder")}
              />
              <TextareaField
                label={t("memory_book.field_allergies")}
                value={form.allergies}
                onChange={v => setForm(f => ({ ...f, allergies: v }))}
                placeholder={t("memory_book.field_allergies_placeholder")}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextareaField
                  label={t("memory_book.field_hearing")}
                  value={form.hearing_notes}
                  onChange={v => setForm(f => ({ ...f, hearing_notes: v }))}
                  placeholder={t("memory_book.field_hearing_placeholder")}
                  rows={3}
                />
                <TextareaField
                  label={t("memory_book.field_vision")}
                  value={form.vision_notes}
                  onChange={v => setForm(f => ({ ...f, vision_notes: v }))}
                  placeholder={t("memory_book.field_vision_placeholder")}
                  rows={3}
                />
              </div>
              <TextareaField
                label={t("memory_book.field_medications")}
                value={form.medication_notes}
                onChange={v => setForm(f => ({ ...f, medication_notes: v }))}
                placeholder={t("memory_book.field_medications_placeholder")}
              />
              <TextareaField
                label={t("memory_book.field_other_medical")}
                value={form.other_medical_notes}
                onChange={v => setForm(f => ({ ...f, other_medical_notes: v }))}
                placeholder={t("memory_book.field_other_medical_placeholder")}
              />
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
                    if (medical) {
                      setForm({
                        conditions: medical.conditions ?? "",
                        allergies: medical.allergies ?? "",
                        hearing_notes: medical.hearing_notes ?? "",
                        vision_notes: medical.vision_notes ?? "",
                        medication_notes: medical.medication_notes ?? "",
                        other_medical_notes: medical.other_medical_notes ?? "",
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
              <ReadFieldBlock label={t("memory_book.field_conditions")} value={medical?.conditions} />
              <ReadFieldBlock label={t("memory_book.field_allergies")} value={medical?.allergies} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                <ReadFieldBlock label={t("memory_book.field_hearing")} value={medical?.hearing_notes} />
                <ReadFieldBlock label={t("memory_book.field_vision")} value={medical?.vision_notes} />
              </div>
              <ReadFieldBlock label={t("memory_book.field_medications")} value={medical?.medication_notes} />
              <ReadFieldBlock label={t("memory_book.field_other_medical")} value={medical?.other_medical_notes} />
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

function ReadFieldBlock({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</p>
      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{value}</p>
    </div>
  );
}
