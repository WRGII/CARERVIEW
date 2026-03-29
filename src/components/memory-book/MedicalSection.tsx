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
  const { data: medical, isLoading } = useMemoryBookMedical(memoryBookId);
  const upsert = useUpsertMemoryBookMedical();
  const { showToast } = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(false);

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
      showToast("Medical information saved", "success");
      setEditing(false);
    } catch (e: any) {
      showToast(e.message ?? "Failed to save", "error");
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
        title="Medical information not yet completed"
        description="The team owner needs to fill in the medical section before it appears here."
        isOwner={false}
      />
    );
  }

  if (!hasData && isOwner && !editing) {
    return (
      <SectionEmptyState
        title="Add medical context"
        description="Record conditions, allergies, hearing, vision, and medication notes to help caregivers provide safe and informed care."
        isOwner={true}
        ownerAction={
          <Button variant="primary" size="md" onClick={() => setEditing(true)}>
            <Stethoscope className="w-4 h-4 mr-2 inline" />
            Add Medical Information
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
              <h3 className="text-base font-semibold text-slate-800">Medical Context</h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Caregiver-oriented health information — not a clinical record
              </p>
            </div>
            {isOwner && !editing && (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editing && isOwner ? (
            <div className="space-y-5">
              <TextareaField
                label="Primary Conditions / Diagnosis"
                value={form.conditions}
                onChange={v => setForm(f => ({ ...f, conditions: v }))}
                placeholder="List key conditions relevant to day-to-day care..."
              />
              <TextareaField
                label="Allergies"
                value={form.allergies}
                onChange={v => setForm(f => ({ ...f, allergies: v }))}
                placeholder="Food allergies, medication allergies, environmental allergies..."
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextareaField
                  label="Hearing Notes"
                  value={form.hearing_notes}
                  onChange={v => setForm(f => ({ ...f, hearing_notes: v }))}
                  placeholder="Hearing aids, preferences, tips..."
                  rows={3}
                />
                <TextareaField
                  label="Vision Notes"
                  value={form.vision_notes}
                  onChange={v => setForm(f => ({ ...f, vision_notes: v }))}
                  placeholder="Glasses, impairments, preferences..."
                  rows={3}
                />
              </div>
              <TextareaField
                label="Medication Notes"
                value={form.medication_notes}
                onChange={v => setForm(f => ({ ...f, medication_notes: v }))}
                placeholder="Current medications, dosages, timing, administration notes..."
              />
              <TextareaField
                label="Other Medical Considerations"
                value={form.other_medical_notes}
                onChange={v => setForm(f => ({ ...f, other_medical_notes: v }))}
                placeholder="Any other health information caregivers should know..."
              />
              <div className="flex items-center gap-3 pt-2">
                <Button variant="primary" size="md" onClick={handleSave} disabled={upsert.isPending}>
                  <Save className="w-4 h-4 mr-2 inline" />
                  {upsert.isPending ? "Saving..." : "Save Changes"}
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
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <ReadFieldBlock label="Primary Conditions / Diagnosis" value={medical?.conditions} />
              <ReadFieldBlock label="Allergies" value={medical?.allergies} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                <ReadFieldBlock label="Hearing Notes" value={medical?.hearing_notes} />
                <ReadFieldBlock label="Vision Notes" value={medical?.vision_notes} />
              </div>
              <ReadFieldBlock label="Medication Notes" value={medical?.medication_notes} />
              <ReadFieldBlock label="Other Medical Considerations" value={medical?.other_medical_notes} />
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
