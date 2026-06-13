import { useState, useEffect } from "react";
import { Save, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useToast } from "../ui/ToastProvider";
import {
  useMemoryBookHomeAddress,
  useUpsertMemoryBookHomeAddress,
} from "../../hooks/useMemoryBook";
import ReadOnlyBanner from "./ReadOnlyBanner";
import SectionEmptyState from "./SectionEmptyState";

type Props = {
  memoryBookId: string;
  teamId: string;
  isOwner: boolean;
};

const EMPTY_FORM = {
  street_number: "",
  street_name: "",
  apt_unit: "",
  building_name: "",
  city: "",
  county_township: "",
  state_province: "",
  country: "",
  postal_code: "",
  history_description: "",
};

export default function HomeAddressSection({ memoryBookId, teamId, isOwner }: Props) {
  const { data: address, isLoading } = useMemoryBookHomeAddress(memoryBookId);
  const upsert = useUpsertMemoryBookHomeAddress();
  const { showToast } = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(false);

  useEffect(() => { setEditing(false); }, [memoryBookId]);

  useEffect(() => {
    if (address) {
      setForm({
        street_number:       address.street_number ?? "",
        street_name:         address.street_name ?? "",
        apt_unit:            address.apt_unit ?? "",
        building_name:       address.building_name ?? "",
        city:                address.city ?? "",
        county_township:     address.county_township ?? "",
        state_province:      address.state_province ?? "",
        country:             address.country ?? "",
        postal_code:         address.postal_code ?? "",
        history_description: address.history_description ?? "",
      });
    }
  }, [address]);

  const handleSave = async () => {
    try {
      await upsert.mutateAsync({ memoryBookId, teamId, values: form });
      showToast("Home address saved.", "success");
      setEditing(false);
    } catch (e: any) {
      showToast(e.message ?? "Something went wrong.", "error");
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setForm({
      street_number:       address?.street_number ?? "",
      street_name:         address?.street_name ?? "",
      apt_unit:            address?.apt_unit ?? "",
      building_name:       address?.building_name ?? "",
      city:                address?.city ?? "",
      county_township:     address?.county_township ?? "",
      state_province:      address?.state_province ?? "",
      country:             address?.country ?? "",
      postal_code:         address?.postal_code ?? "",
      history_description: address?.history_description ?? "",
    });
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

  const hasData = !!address && (
    !!address.street_name || !!address.city || !!address.street_number
  );
  const isReadOnly = !isOwner;

  if (!hasData && !isOwner) {
    return (
      <SectionEmptyState
        title="No address on record"
        description="The team owner hasn't added a home address yet."
        isOwner={false}
      />
    );
  }

  if (!hasData && isOwner && !editing) {
    return (
      <SectionEmptyState
        title="Add a home address"
        description="Record the home address and any relevant history or notes about the property."
        isOwner={true}
        ownerAction={
          <Button variant="primary" size="md" onClick={() => setEditing(true)}>
            <MapPin className="w-4 h-4 mr-2 inline" />
            Add Home Address
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
              <h3 className="text-base font-semibold text-slate-800">Home Address</h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Physical address and property notes
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
                  label="Street Number"
                  value={form.street_number}
                  onChange={e => setForm(f => ({ ...f, street_number: e.target.value }))}
                  placeholder="e.g. 42"
                />
                <Input
                  label="Street Name"
                  value={form.street_name}
                  onChange={e => setForm(f => ({ ...f, street_name: e.target.value }))}
                  placeholder="e.g. Maple Avenue"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="APT / Condo / Unit"
                  value={form.apt_unit}
                  onChange={e => setForm(f => ({ ...f, apt_unit: e.target.value }))}
                  placeholder="e.g. Unit 3B"
                />
                <Input
                  label="Building Name"
                  value={form.building_name}
                  onChange={e => setForm(f => ({ ...f, building_name: e.target.value }))}
                  placeholder="e.g. Sunrise Court"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="City"
                  value={form.city}
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  placeholder="e.g. Denver"
                />
                <Input
                  label="County / Township"
                  value={form.county_township}
                  onChange={e => setForm(f => ({ ...f, county_township: e.target.value }))}
                  placeholder="e.g. Denver County"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="State / Province"
                  value={form.state_province}
                  onChange={e => setForm(f => ({ ...f, state_province: e.target.value }))}
                  placeholder="e.g. Colorado"
                />
                <Input
                  label="Country"
                  value={form.country}
                  onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                  placeholder="e.g. United States"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Postal Code"
                  value={form.postal_code}
                  onChange={e => setForm(f => ({ ...f, postal_code: e.target.value }))}
                  placeholder="e.g. 80202"
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  History &amp; Description
                </label>
                <textarea
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-base placeholder-slate-400 shadow-sm focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600 bg-white text-slate-800 min-h-[120px] leading-relaxed"
                  value={form.history_description}
                  onChange={e => setForm(f => ({ ...f, history_description: e.target.value }))}
                  placeholder="Notes about the home — how long they've lived here, ownership history, accessibility features, relevant property details..."
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
                  {upsert.isPending ? "Saving…" : "Save Changes"}
                </Button>
                <Button variant="ghost" size="md" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Formatted address block */}
              <div className="bg-slate-50 rounded-xl px-4 py-4 border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Address</p>
                <div className="text-sm text-slate-800 leading-relaxed space-y-0.5">
                  {(address?.building_name) && (
                    <p>{address.building_name}</p>
                  )}
                  {(address?.street_number || address?.street_name) && (
                    <p>
                      {[address.street_number, address.street_name].filter(Boolean).join(" ")}
                      {address?.apt_unit ? `, ${address.apt_unit}` : ""}
                    </p>
                  )}
                  {(address?.city || address?.state_province || address?.postal_code) && (
                    <p>
                      {[address.city, address.state_province, address.postal_code]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                  {address?.county_township && (
                    <p className="text-slate-500 text-xs">{address.county_township}</p>
                  )}
                  {address?.country && (
                    <p>{address.country}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                <FieldRow label="Street Number" value={address?.street_number} />
                <FieldRow label="Street Name" value={address?.street_name} />
                <FieldRow label="APT / Unit" value={address?.apt_unit} />
                <FieldRow label="Building Name" value={address?.building_name} />
                <FieldRow label="City" value={address?.city} />
                <FieldRow label="County / Township" value={address?.county_township} />
                <FieldRow label="State / Province" value={address?.state_province} />
                <FieldRow label="Country" value={address?.country} />
                <FieldRow label="Postal Code" value={address?.postal_code} />
              </div>

              {address?.history_description && (
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    History &amp; Description
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {address.history_description}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FieldRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm text-slate-800">{value}</p>
    </div>
  );
}
