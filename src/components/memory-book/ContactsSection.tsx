import { useState } from "react";
import { Plus, Pencil, Trash2, Save, X, Phone, Mail, Users } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useToast } from "../ui/ToastProvider";
import {
  useMemoryBookContacts,
  useUpsertMemoryBookContact,
  useDeleteMemoryBookContact,
} from "../../hooks/useMemoryBook";
import type { MemoryBookContact } from "../../types/memory-book";
import ReadOnlyBanner from "./ReadOnlyBanner";
import SectionEmptyState from "./SectionEmptyState";

type Props = {
  memoryBookId: string;
  teamId: string;
  isOwner: boolean;
};

const ROLE_TAGS = [
  "Family",
  "Friend",
  "Neighbour",
  "Primary Caregiver",
  "Backup Caregiver",
  "Doctor",
  "Emergency Contact",
  "Home Care",
  "Spiritual / Faith",
  "Other",
];

const EMPTY_CONTACT = {
  full_name: "",
  relationship: "",
  role_tag: "",
  phone: "",
  email: "",
  notes: "",
};

export default function ContactsSection({ memoryBookId, teamId, isOwner }: Props) {
  const { data: contacts = [], isLoading } = useMemoryBookContacts(memoryBookId);
  const upsert = useUpsertMemoryBookContact();
  const deleteContact = useDeleteMemoryBookContact();
  const { showToast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_CONTACT);

  const startAdd = () => {
    setForm(EMPTY_CONTACT);
    setEditingId(null);
    setShowForm(true);
  };

  const startEdit = (contact: MemoryBookContact) => {
    setForm({
      full_name: contact.full_name,
      relationship: contact.relationship,
      role_tag: contact.role_tag,
      phone: contact.phone,
      email: contact.email,
      notes: contact.notes,
    });
    setEditingId(contact.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.full_name.trim()) {
      showToast("Contact name is required", "error");
      return;
    }
    try {
      await upsert.mutateAsync({
        memoryBookId,
        teamId,
        contact: editingId ? { ...form, id: editingId } : { ...form, sort_order: contacts.length },
      });
      showToast(editingId ? "Contact updated" : "Contact added", "success");
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_CONTACT);
    } catch (e: any) {
      showToast(e.message ?? "Failed to save contact", "error");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove ${name} from contacts?`)) return;
    try {
      await deleteContact.mutateAsync({ id, memoryBookId });
      showToast("Contact removed", "success");
    } catch (e: any) {
      showToast(e.message ?? "Failed to remove", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!isOwner && <ReadOnlyBanner />}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Care Network &amp; Contacts</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {contacts.length} contact{contacts.length !== 1 ? "s" : ""} on file
          </p>
        </div>
        {isOwner && !showForm && (
          <Button variant="primary" size="sm" onClick={startAdd}>
            <Plus className="w-4 h-4 mr-1 inline" />
            Add Contact
          </Button>
        )}
      </div>

      {showForm && isOwner && (
        <Card>
          <CardHeader>
            <h4 className="text-sm font-semibold text-slate-700">
              {editingId ? "Edit Contact" : "New Contact"}
            </h4>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name *"
                  value={form.full_name}
                  onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  placeholder="Contact's full name"
                />
                <Input
                  label="Relationship"
                  value={form.relationship}
                  onChange={e => setForm(f => ({ ...f, relationship: e.target.value }))}
                  placeholder="e.g. Daughter, Family Doctor"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Role</label>
                  <select
                    className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-base shadow-sm focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600 bg-white text-slate-800"
                    value={form.role_tag}
                    onChange={e => setForm(f => ({ ...f, role_tag: e.target.value }))}
                  >
                    <option value="">Select role...</option>
                    {ROLE_TAGS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Phone"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+1 (555) 000-0000"
                  type="tel"
                />
              </div>
              <Input
                label="Email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="email@example.com"
                type="email"
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                <textarea
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-base placeholder-slate-400 shadow-sm focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600 bg-white text-slate-800 min-h-[72px]"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Additional notes about this contact..."
                />
              </div>
              <div className="flex items-center gap-3 pt-1">
                <Button variant="primary" size="md" onClick={handleSave} disabled={upsert.isPending}>
                  <Save className="w-4 h-4 mr-2 inline" />
                  {upsert.isPending ? "Saving..." : "Save Contact"}
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setForm(EMPTY_CONTACT);
                  }}
                >
                  <X className="w-4 h-4 mr-1 inline" />
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {contacts.length === 0 && !showForm ? (
        <SectionEmptyState
          title="No contacts added yet"
          description="Add family members, doctors, emergency contacts, and other key support people to help caregivers reach the right person quickly."
          isOwner={isOwner}
          ownerAction={
            <Button variant="primary" size="md" onClick={startAdd}>
              <Users className="w-4 h-4 mr-2 inline" />
              Add First Contact
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {contacts.map(contact => (
            <ContactCard
              key={contact.id}
              contact={contact}
              isOwner={isOwner}
              onEdit={() => startEdit(contact)}
              onDelete={() => handleDelete(contact.id, contact.full_name)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ContactCard({
  contact,
  isOwner,
  onEdit,
  onDelete,
}: {
  contact: MemoryBookContact;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-800">{contact.full_name}</p>
          <p className="text-xs text-slate-500">{contact.relationship || contact.role_tag || "Contact"}</p>
        </div>
        <div className="flex items-center gap-1">
          {contact.role_tag && (
            <span className="px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 text-xs font-medium">
              {contact.role_tag}
            </span>
          )}
          {isOwner && (
            <>
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
            </>
          )}
        </div>
      </div>
      <div className="space-y-1.5">
        {contact.phone && (
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <a href={`tel:${contact.phone}`} className="hover:text-cyan-600 transition-colors">
              {contact.phone}
            </a>
          </div>
        )}
        {contact.email && (
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <a href={`mailto:${contact.email}`} className="hover:text-cyan-600 transition-colors truncate">
              {contact.email}
            </a>
          </div>
        )}
        {contact.notes && (
          <p className="text-xs text-slate-500 leading-relaxed pt-1 border-t border-slate-100">
            {contact.notes}
          </p>
        )}
      </div>
    </div>
  );
}
