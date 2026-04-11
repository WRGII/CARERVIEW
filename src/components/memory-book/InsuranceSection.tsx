import { useState, useEffect } from "react";
import { Save, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useToast } from "../ui/ToastProvider";
import {
  useMemoryBookInsurance,
  useUpsertMemoryBookInsurance,
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
  primary_insurer: "",
  primary_plan: "",
  primary_member_id: "",
  primary_coverage_type: "",
  secondary_insurer: "",
  secondary_plan: "",
  secondary_member_id: "",
  secondary_coverage_type: "",
  dental_vision_insurer: "",
  dental_vision_plan: "",
  notes: "",
};

export default function InsuranceSection({ memoryBookId, teamId, isOwner }: Props) {
  const { t } = useLocale();
  const { data: insurance, isLoading } = useMemoryBookInsurance(memoryBookId);
  const upsert = useUpsertMemoryBookInsurance();
  const { showToast } = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setEditing(false);
  }, [memoryBookId]);

  useEffect(() => {
    if (insurance) {
      setForm({
        primary_insurer: insurance.primary_insurer ?? "",
        primary_plan: insurance.primary_plan ?? "",
        primary_member_id: insurance.primary_member_id ?? "",
        primary_coverage_type: insurance.primary_coverage_type ?? "",
        secondary_insurer: insurance.secondary_insurer ?? "",
        secondary_plan: insurance.secondary_plan ?? "",
        secondary_member_id: insurance.secondary_member_id ?? "",
        secondary_coverage_type: insurance.secondary_coverage_type ?? "",
        dental_vision_insurer: insurance.dental_vision_insurer ?? "",
        dental_vision_plan: insurance.dental_vision_plan ?? "",
        notes: insurance.notes ?? "",
      });
    }
  }, [insurance]);

  const handleSave = async () => {
    try {
      await upsert.mutateAsync({ memoryBookId, teamId, values: form });
      showToast(t("memory_book.toast_insurance_saved"), "success");
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

  const hasData = !!insurance;
  const isReadOnly = !isOwner;

  if (!hasData && !isOwner) {
    return (
      <SectionEmptyState
        title={t("memory_book.insurance_empty_member_title")}
        description={t("memory_book.insurance_empty_member_desc")}
        isOwner={false}
      />
    );
  }

  if (!hasData && isOwner && !editing) {
    return (
      <SectionEmptyState
        title={t("memory_book.insurance_empty_owner_title")}
        description={t("memory_book.insurance_empty_owner_desc")}
        isOwner={true}
        ownerAction={
          <Button variant="primary" size="md" onClick={() => setEditing(true)}>
            <ShieldCheck className="w-4 h-4 mr-2 inline" />
            {t("memory_book.insurance_add_btn")}
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
              <h3 className="text-base font-semibold text-slate-800">{t("memory_book.insurance_title")}</h3>
              <p className="text-sm text-slate-500 mt-0.5">{t("memory_book.insurance_subtitle")}</p>
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
            <div className="space-y-6">
              <InsuranceGroup label={t("memory_book.insurance_primary_heading")}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={t("memory_book.field_insurer")}
                    value={form.primary_insurer}
                    onChange={e => setForm(f => ({ ...f, primary_insurer: e.target.value }))}
                    placeholder={t("memory_book.field_insurer_placeholder")}
                  />
                  <Input
                    label={t("memory_book.field_plan")}
                    value={form.primary_plan}
                    onChange={e => setForm(f => ({ ...f, primary_plan: e.target.value }))}
                    placeholder={t("memory_book.field_plan_placeholder")}
                  />
                  <Input
                    label={t("memory_book.field_member_id")}
                    value={form.primary_member_id}
                    onChange={e => setForm(f => ({ ...f, primary_member_id: e.target.value }))}
                    placeholder={t("memory_book.field_member_id_placeholder")}
                  />
                  <Input
                    label={t("memory_book.field_coverage_type")}
                    value={form.primary_coverage_type}
                    onChange={e => setForm(f => ({ ...f, primary_coverage_type: e.target.value }))}
                    placeholder={t("memory_book.field_coverage_type_placeholder")}
                  />
                </div>
              </InsuranceGroup>

              <InsuranceGroup label={t("memory_book.insurance_secondary_heading")}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={t("memory_book.field_insurer")}
                    value={form.secondary_insurer}
                    onChange={e => setForm(f => ({ ...f, secondary_insurer: e.target.value }))}
                    placeholder={t("memory_book.field_insurer_placeholder")}
                  />
                  <Input
                    label={t("memory_book.field_plan")}
                    value={form.secondary_plan}
                    onChange={e => setForm(f => ({ ...f, secondary_plan: e.target.value }))}
                    placeholder={t("memory_book.field_plan_placeholder")}
                  />
                  <Input
                    label={t("memory_book.field_member_id")}
                    value={form.secondary_member_id}
                    onChange={e => setForm(f => ({ ...f, secondary_member_id: e.target.value }))}
                    placeholder={t("memory_book.field_member_id_placeholder")}
                  />
                  <Input
                    label={t("memory_book.field_coverage_type")}
                    value={form.secondary_coverage_type}
                    onChange={e => setForm(f => ({ ...f, secondary_coverage_type: e.target.value }))}
                    placeholder={t("memory_book.field_coverage_type_placeholder")}
                  />
                </div>
              </InsuranceGroup>

              <InsuranceGroup label={t("memory_book.insurance_dental_vision_heading")}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={t("memory_book.field_insurer")}
                    value={form.dental_vision_insurer}
                    onChange={e => setForm(f => ({ ...f, dental_vision_insurer: e.target.value }))}
                    placeholder={t("memory_book.field_insurer_placeholder")}
                  />
                  <Input
                    label={t("memory_book.field_plan")}
                    value={form.dental_vision_plan}
                    onChange={e => setForm(f => ({ ...f, dental_vision_plan: e.target.value }))}
                    placeholder={t("memory_book.field_plan_placeholder")}
                  />
                </div>
              </InsuranceGroup>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t("memory_book.field_notes")}</label>
                <textarea
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-base placeholder-slate-400 shadow-sm focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600 bg-white text-slate-800 leading-relaxed"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder={t("memory_book.field_notes_placeholder")}
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
                    if (insurance) {
                      setForm({
                        primary_insurer: insurance.primary_insurer ?? "",
                        primary_plan: insurance.primary_plan ?? "",
                        primary_member_id: insurance.primary_member_id ?? "",
                        primary_coverage_type: insurance.primary_coverage_type ?? "",
                        secondary_insurer: insurance.secondary_insurer ?? "",
                        secondary_plan: insurance.secondary_plan ?? "",
                        secondary_member_id: insurance.secondary_member_id ?? "",
                        secondary_coverage_type: insurance.secondary_coverage_type ?? "",
                        dental_vision_insurer: insurance.dental_vision_insurer ?? "",
                        dental_vision_plan: insurance.dental_vision_plan ?? "",
                        notes: insurance.notes ?? "",
                      });
                    }
                  }}
                >
                  {t("memory_book.cancel")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <InsuranceReadGroup label={t("memory_book.insurance_primary_heading")}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                  <ReadFieldBlock label={t("memory_book.field_insurer")} value={insurance?.primary_insurer} />
                  <ReadFieldBlock label={t("memory_book.field_plan")} value={insurance?.primary_plan} />
                  <ReadFieldBlock label={t("memory_book.field_member_id")} value={insurance?.primary_member_id} />
                  <ReadFieldBlock label={t("memory_book.field_coverage_type")} value={insurance?.primary_coverage_type} />
                </div>
              </InsuranceReadGroup>
              <InsuranceReadGroup label={t("memory_book.insurance_secondary_heading")}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                  <ReadFieldBlock label={t("memory_book.field_insurer")} value={insurance?.secondary_insurer} />
                  <ReadFieldBlock label={t("memory_book.field_plan")} value={insurance?.secondary_plan} />
                  <ReadFieldBlock label={t("memory_book.field_member_id")} value={insurance?.secondary_member_id} />
                  <ReadFieldBlock label={t("memory_book.field_coverage_type")} value={insurance?.secondary_coverage_type} />
                </div>
              </InsuranceReadGroup>
              <InsuranceReadGroup label={t("memory_book.insurance_dental_vision_heading")}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                  <ReadFieldBlock label={t("memory_book.field_insurer")} value={insurance?.dental_vision_insurer} />
                  <ReadFieldBlock label={t("memory_book.field_plan")} value={insurance?.dental_vision_plan} />
                </div>
              </InsuranceReadGroup>
              {insurance?.notes && (
                <ReadFieldBlock label={t("memory_book.field_notes")} value={insurance.notes} />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InsuranceGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
      {children}
    </div>
  );
}

function InsuranceReadGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
      {children}
    </div>
  );
}

function ReadFieldBlock({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</p>
      <p className="text-sm text-slate-700 leading-relaxed">{value}</p>
    </div>
  );
}
