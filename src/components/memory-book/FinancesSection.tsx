import { useState, useEffect } from "react";
import { Save, Lock, Landmark } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Button } from "../ui/Button";
import { useToast } from "../ui/ToastProvider";
import {
  useMemoryBookFinances,
  useUpsertMemoryBookFinances,
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
  bank_name: "",
  income_sources: "",
  auto_pay_bills: "",
  investment_notes: "",
};

export default function FinancesSection({ memoryBookId, teamId, isOwner }: Props) {
  const { t } = useLocale();
  const { data: finances, isLoading } = useMemoryBookFinances(isOwner ? memoryBookId : null);
  const upsert = useUpsertMemoryBookFinances();
  const { showToast } = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setEditing(false);
  }, [memoryBookId]);

  useEffect(() => {
    if (finances) {
      setForm({
        bank_name: finances.bank_name ?? "",
        income_sources: finances.income_sources ?? "",
        auto_pay_bills: finances.auto_pay_bills ?? "",
        investment_notes: finances.investment_notes ?? "",
      });
    }
  }, [finances]);

  if (!isOwner) {
    return (
      <div className="space-y-4">
        <ReadOnlyBanner />
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <Lock className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-700">{t("memory_book.finances_member_locked_title")}</p>
              <p className="text-xs text-slate-500 mt-1">{t("memory_book.finances_member_locked_desc")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const hasData = !!finances;

  if (!hasData && !editing) {
    return (
      <SectionEmptyState
        title={t("memory_book.finances_empty_owner_title")}
        description={t("memory_book.finances_empty_owner_desc")}
        isOwner={true}
        ownerAction={
          <Button variant="primary" size="md" onClick={() => setEditing(true)}>
            <Landmark className="w-4 h-4 mr-2 inline" />
            {t("memory_book.finances_add_btn")}
          </Button>
        }
      />
    );
  }

  const handleSave = async () => {
    try {
      await upsert.mutateAsync({ memoryBookId, teamId, values: form });
      showToast(t("memory_book.toast_finances_saved"), "success");
      setEditing(false);
    } catch (e: any) {
      showToast(e.message ?? t("common.error_generic"), "error");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-800">{t("memory_book.finances_title")}</h3>
              <p className="text-sm text-slate-500 mt-0.5">{t("memory_book.finances_subtitle")}</p>
            </div>
            {!editing && (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                {t("memory_book.edit")}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editing ? (
            <div className="space-y-5">
              <TextareaField
                label={t("memory_book.field_bank_name")}
                value={form.bank_name}
                onChange={v => setForm(f => ({ ...f, bank_name: v }))}
                placeholder={t("memory_book.field_bank_name_placeholder")}
                rows={2}
              />
              <TextareaField
                label={t("memory_book.field_income_sources")}
                value={form.income_sources}
                onChange={v => setForm(f => ({ ...f, income_sources: v }))}
                placeholder={t("memory_book.field_income_sources_placeholder")}
              />
              <TextareaField
                label={t("memory_book.field_auto_pay_bills")}
                value={form.auto_pay_bills}
                onChange={v => setForm(f => ({ ...f, auto_pay_bills: v }))}
                placeholder={t("memory_book.field_auto_pay_bills_placeholder")}
              />
              <TextareaField
                label={t("memory_book.field_investment_notes")}
                value={form.investment_notes}
                onChange={v => setForm(f => ({ ...f, investment_notes: v }))}
                placeholder={t("memory_book.field_investment_notes_placeholder")}
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
                    if (finances) {
                      setForm({
                        bank_name: finances.bank_name ?? "",
                        income_sources: finances.income_sources ?? "",
                        auto_pay_bills: finances.auto_pay_bills ?? "",
                        investment_notes: finances.investment_notes ?? "",
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
              <ReadFieldBlock label={t("memory_book.field_bank_name")} value={finances?.bank_name} />
              <ReadFieldBlock label={t("memory_book.field_income_sources")} value={finances?.income_sources} />
              <ReadFieldBlock label={t("memory_book.field_auto_pay_bills")} value={finances?.auto_pay_bills} />
              <ReadFieldBlock label={t("memory_book.field_investment_notes")} value={finances?.investment_notes} />
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
