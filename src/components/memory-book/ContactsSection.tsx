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
import { useLocale } from "../../i18n/LocaleContext";

type Props = {
  memoryBookId: string;
  teamId: string;
  isOwner: boolean;
};

const ROLE_TAG_KEYS: { value: string; i18nKey: string }[] = [
  { value: "Family",           i18nKey: "memory_book.role_tag_family" },
  { value: "Friend",           i18nKey: "memory_book.role_tag_friend" },
  { value: "Neighbour",        i18nKey: "memory_book.role_tag_neighbour" },
  { value: "Primary Caregiver",i18nKey: "memory_book.role_tag_primary_caregiver" },
  { value: "Backup Caregiver", i18nKey: "memory_book.role_tag_backup_caregiver" },
  { value: "Doctor",           i18nKey: "memory_book.role_tag_doctor" },
  { value: "Emergency Contact",i18nKey: "memory_book.role_tag_emergency_contact" },
  { value: "Home Care",        i18nKey: "memory_book.role_tag_home_care" },
  { value: "Spiritual / Faith",i18nKey: "memory_book.role_tag_spiritual" },
  { value: "Other",            i18nKey: "memory_book.role_tag_other" },
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
  const { t } = useLocale();

  const roleTagMap = Object.fromEntries(ROLE_TAG_KEYS.map(r => [r.value, r.i18nKey]));
  const getRoleLabel = (value: string) => t(roleTagMap[value] ?? value);
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
      showToast(t("memory_book.toast_contact_required"), "error");
      return;
    }
    try {
      await upsert.mutateAsync({
        memoryBookId,
        teamId,
        contact: editingId ? { ...form, id: editingId } : { ...form, sort_order: contacts.length },
      });
      showToast(editingId ? t("memory_book.toast_contact_updated") : t("memory_book.toast_contact_added"), "success");
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_CONTACT);
    } catch (e: any) {
      showToast(e.message ?? t("memory_book.toast_contact_failed"), "error");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(t("memory_book.confirm_remove_contact", { name }))) return;
    try {
      await deleteContact.mutateAsync({ id, memoryBookId, teamId });
      showToast(t("memory_book.toast_contact_removed"), "success");
    } catch (e: any) {
      showToast(e.message ?? t("memory_book.toast_contact_remove_failed"), "error");
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
          <h3 className="text-base font-semibold text-slate-800">{t("memory_book.contacts_title")}</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {contacts.length === 1
              ? t("memory_book.contacts_count_one")
              : t("memory_book.contacts_count_many", { count: contacts.length })}
          </p>
        </div>
        {isOwner && !showForm && (
          <Button variant="primary" size="sm" onClick={startAdd}>
            <Plus className="w-4 h-4 mr-1 inline" />
            {t("memory_book.contacts_add_btn")}
          </Button>
        )}
      </div>

      {showForm && isOwner && (
        <Card>
          <CardHeader>
            <h4 className="text-sm font-semibold text-slate-700">
              {editingId ? t("memory_book.contacts_edit_heading") : t("memory_book.contacts_new_heading")}
            </h4>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t("memory_book.field_full_name")}
                  value={form.full_name}
                  onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  placeholder={t("memory_book.field_full_name_placeholder")}
                />
                <Input
                  label={t("memory_book.field_relationship")}
                  value={form.relationship}
                  onChange={e => setForm(f => ({ ...f, relationship: e.target.value }))}
                  placeholder={t("memory_book.field_relationship_placeholder")}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">{t("memory_book.field_role")}</label>
                  <select
                    className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-base shadow-sm focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600 bg-white text-slate-800"
                    value={form.role_tag}
                    onChange={e => setForm(f => ({ ...f, role_tag: e.target.value }))}
                  >
                    <option value="">{t("memory_book.field_role_select")}</option>
                    {ROLE_TAG_KEYS.map(r => (
                      <option key={r.value} value={r.value}>{t(r.i18nKey)}</option>
                    ))}
                  </select>
                </div>
                <Input
                  label={t("memory_book.field_phone")}
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+1 (555) 000-0000"
                  type="tel"
                />
              </div>
              <Input
                label={t("memory_book.field_email")}
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="email@example.com"
                type="email"
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t("memory_book.field_notes")}</label>
                <textarea
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-base placeholder-slate-400 shadow-sm focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600 bg-white text-slate-800 min-h-[72px]"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder={t("memory_book.field_notes_placeholder")}
                />
              </div>
              <div className="flex items-center gap-3 pt-1">
                <Button variant="primary" size="md" onClick={handleSave} disabled={upsert.isPending}>
                  <Save className="w-4 h-4 mr-2 inline" />
                  {upsert.isPending ? t("memory_book.saving") : t("memory_book.contact_save_btn")}
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
                  {t("memory_book.cancel")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {contacts.length === 0 && !showForm ? (
        <SectionEmptyState
          title={t("memory_book.contacts_empty_title")}
          description={t("memory_book.contacts_empty_desc")}
          isOwner={isOwner}
          ownerAction={
            <Button variant="primary" size="md" onClick={startAdd}>
              <Users className="w-4 h-4 mr-2 inline" />
              {t("memory_book.contacts_add_first_btn")}
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
              fallbackLabel={t("memory_book.contact_fallback_label")}
              onEdit={() => startEdit(contact)}
              onDelete={() => handleDelete(contact.id, contact.full_name)}
              getRoleLabel={getRoleLabel}
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
  fallbackLabel,
  onEdit,
  onDelete,
  getRoleLabel,
}: {
  contact: MemoryBookContact;
  isOwner: boolean;
  fallbackLabel: string;
  onEdit: () => void;
  onDelete: () => void;
  getRoleLabel: (value: string) => string;
}) {
  const roleLabel = contact.role_tag ? getRoleLabel(contact.role_tag) : '';
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-800">{contact.full_name}</p>
          <p className="text-xs text-slate-500">{contact.relationship || roleLabel || fallbackLabel}</p>
        </div>
        <div className="flex items-center gap-1">
          {contact.role_tag && (
            <span className="px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 text-xs font-medium">
              {roleLabel}
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
