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
  const { data: identity, isLoading } = useMemoryBookIdentity(memoryBookId);
  const upsert = useUpsertMemoryBookIdentity();
  const { showToast } = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(false);

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
      showToast("Identity saved", "success");
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

  const hasData = !!identity;
  const isReadOnly = !isOwner;

  if (!hasData && !isOwner) {
    return (
      <SectionEmptyState
        title="Identity not yet completed"
        description="The team owner needs to fill in the identity section before it appears here."
        isOwner={false}
      />
    );
  }

  if (!hasData && isOwner && !editing) {
    return (
      <SectionEmptyState
        title="Add identity information"
        description="Record preferred name, birthplace, cultural background, and a brief personal summary to help caregivers connect meaningfully."
        isOwner={true}
        ownerAction={
          <Button variant="primary" size="md" onClick={() => setEditing(true)}>
            <User className="w-4 h-4 mr-2 inline" />
            Add Identity Details
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
              <h3 className="text-base font-semibold text-slate-800">Identity &amp; Profile</h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Personal details for {patientName}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Preferred Name / Nickname"
                  value={form.preferred_name}
                  onChange={e => setForm(f => ({ ...f, preferred_name: e.target.value }))}
                  placeholder="What name do they prefer?"
                />
                <Input
                  label="How they like to be addressed"
                  value={form.address_preference}
                  onChange={e => setForm(f => ({ ...f, address_preference: e.target.value }))}
                  placeholder="e.g. Mrs. Smith, Gran, first name only"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Birthplace"
                  value={form.birthplace}
                  onChange={e => setForm(f => ({ ...f, birthplace: e.target.value }))}
                  placeholder="Town, city, or region"
                />
                <Input
                  label="Relationship Status"
                  value={form.relationship_status}
                  onChange={e => setForm(f => ({ ...f, relationship_status: e.target.value }))}
                  placeholder="e.g. Widowed, Married"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Cultural Background"
                  value={form.cultural_preferences}
                  onChange={e => setForm(f => ({ ...f, cultural_preferences: e.target.value }))}
                  placeholder="Cultural identity, traditions, practices"
                />
                <Input
                  label="Language / Communication Preferences"
                  value={form.language_preferences}
                  onChange={e => setForm(f => ({ ...f, language_preferences: e.target.value }))}
                  placeholder="Primary language, communication style"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  About Me — Personal Summary
                </label>
                <textarea
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-base placeholder-slate-400 shadow-sm focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600 bg-white text-slate-800 min-h-[120px] leading-relaxed"
                  value={form.about_me}
                  onChange={e => setForm(f => ({ ...f, about_me: e.target.value }))}
                  placeholder="What would this person want others to know about them? Describe their personality, passions, and what makes them who they are..."
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
                  {upsert.isPending ? "Saving..." : "Save Changes"}
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
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                <FieldRow label="Preferred Name" value={identity?.preferred_name} />
                <FieldRow label="How to Address" value={identity?.address_preference} />
                <FieldRow label="Birthplace" value={identity?.birthplace} />
                <FieldRow label="Relationship Status" value={identity?.relationship_status} />
                <FieldRow label="Cultural Background" value={identity?.cultural_preferences} />
                <FieldRow label="Language Preferences" value={identity?.language_preferences} />
              </div>
              {identity?.about_me && (
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">About Me</p>
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
