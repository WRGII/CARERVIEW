// src/pages/AdminTranslationsPage.tsx
import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import { getAdminToken } from "../hooks/useAdminSession";
import { Search, Save, RefreshCw, Globe, ChevronDown, ChevronRight, ArrowLeft } from "lucide-react";
import { useLocale } from "../i18n/LocaleContext";

type TranslationRow = {
  key: string;
  locale: string;
  value: string;
};

type SupportedLocale = {
  code: string;
  label: string;
};

const NAMESPACES = [
  "common", "nav", "footer", "auth", "landing", "about", "why", "pricing",
  "choose_plan", "checkout", "caregiver", "obs_form", "scale", "obs_list",
  "view_obs", "new_obs", "obs_edit", "tutorial", "welcome", "account_menu",
  "team", "accept_invite", "create_account", "reset_pw", "not_found",
  "admin", "policy", "family_setup", "inactive", "billing", "delete_acct",
  "subscription", "plan_pill", "dementia", "active_cg", "lang", "memory_book",
  "community_banner",
];

function getNamespace(key: string): string {
  const dot = key.indexOf(".");
  return dot > -1 ? key.slice(0, dot) : "other";
}

export default function AdminTranslationsPage() {
  const { t } = useLocale();
  const qc = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeLocale, setActiveLocale] = useState("en");
  const [openNamespaces, setOpenNamespaces] = useState<Set<string>>(new Set(["common"]));
  const [pendingEdits, setPendingEdits] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const { data: locales = [] } = useQuery<SupportedLocale[]>({
    queryKey: ["supported_locales_admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("supported_locales")
        .select("code, label")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60 * 60 * 1000,
  });

  const { data: allTranslations = [], isLoading: transLoading, refetch } = useQuery<TranslationRow[]>({
    queryKey: ["admin_translations", activeLocale],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_translations_for_locale', { p_locale: activeLocale });
      if (error) throw error;
      const map = (data as Record<string, string>) ?? {};
      return Object.entries(map)
        .map(([key, value]) => ({ key, locale: activeLocale, value }))
        .sort((a, b) => a.key.localeCompare(b.key));
    },
    staleTime: 30 * 1000,
  });

  const saveMutation = useMutation({
    mutationFn: async (edits: Record<string, string>) => {
      const rows = Object.entries(edits).map(([key, value]) => ({
        key,
        locale: activeLocale,
        value,
      }));
      const token = getAdminToken();
      if (!token) throw new Error("Not authenticated as admin");
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-data`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action: "upsert_translations", payload: { rows } }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Save failed");
    },
    onSuccess: () => {
      setPendingEdits({});
      setSaveStatus("saved");
      qc.invalidateQueries({ queryKey: ["ui_translations", activeLocale] });
      qc.invalidateQueries({ queryKey: ["admin_translations", activeLocale] });
      setTimeout(() => setSaveStatus("idle"), 3000);
    },
    onError: () => {
      setSaveStatus("error");
    },
  });

  const handleSaveAll = async () => {
    if (Object.keys(pendingEdits).length === 0) return;
    setSaveStatus("saving");
    saveMutation.mutate(pendingEdits);
  };

  const translationMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const row of allTranslations) {
      m[row.key] = row.value;
    }
    return m;
  }, [allTranslations]);

  const getCurrentValue = (key: string): string => {
    if (key in pendingEdits) return pendingEdits[key];
    return translationMap[key] ?? "";
  };

  const handleEdit = (key: string, value: string) => {
    const original = translationMap[key] ?? "";
    if (value === original) {
      const next = { ...pendingEdits };
      delete next[key];
      setPendingEdits(next);
    } else {
      setPendingEdits((prev) => ({ ...prev, [key]: value }));
    }
  };

  const groupedByNamespace = useMemo(() => {
    const allKeys = new Set<string>();
    for (const row of allTranslations) allKeys.add(row.key);

    const groups: Record<string, string[]> = {};
    for (const key of allKeys) {
      const ns = getNamespace(key);
      if (!groups[ns]) groups[ns] = [];
      groups[ns].push(key);
    }
    for (const ns of Object.keys(groups)) {
      groups[ns].sort();
    }
    return groups;
  }, [allTranslations]);

  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return groupedByNamespace;
    const lower = searchTerm.toLowerCase();
    const result: Record<string, string[]> = {};
    for (const [ns, keys] of Object.entries(groupedByNamespace)) {
      const filtered = keys.filter(
        (k) =>
          k.toLowerCase().includes(lower) ||
          getCurrentValue(k).toLowerCase().includes(lower)
      );
      if (filtered.length > 0) result[ns] = filtered;
    }
    return result;
  }, [groupedByNamespace, searchTerm, pendingEdits, translationMap]);

  const totalKeys = allTranslations.length;
  const pendingCount = Object.keys(pendingEdits).length;

  const toggleNamespace = (ns: string) => {
    setOpenNamespaces((prev) => {
      const next = new Set(prev);
      if (next.has(ns)) next.delete(ns);
      else next.add(ns);
      return next;
    });
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-6">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            {t('admin.return_to_dashboard')}
          </Link>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-gray flex items-center gap-3">
              <Globe className="w-8 h-8 text-cyan-primary" />
              Translations Editor
            </h1>
            <p className="text-slate-gray/70 mt-1">
              {totalKeys} keys loaded · {pendingCount > 0 ? `${pendingCount} unsaved change${pendingCount > 1 ? "s" : ""}` : "No unsaved changes"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-gray/30 px-4 py-2 text-sm font-semibold text-slate-gray hover:bg-peach-blush/20 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Reload
            </button>

            <button
              type="button"
              onClick={handleSaveAll}
              disabled={pendingCount === 0 || saveStatus === "saving"}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-primary px-5 py-2 text-sm font-semibold text-white hover:bg-cyan-hover disabled:opacity-50 transition-all shadow-sm"
            >
              <Save className="w-4 h-4" />
              {saveStatus === "saving"
                ? "Saving…"
                : saveStatus === "saved"
                ? "Saved!"
                : saveStatus === "error"
                ? "Error — retry"
                : `Save ${pendingCount > 0 ? `(${pendingCount})` : "changes"}`}
            </button>
          </div>
        </div>

        {/* Locale tabs + search */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm mb-6 overflow-hidden">
          <div className="flex items-center gap-0 border-b border-slate-200 px-4">
            {locales.map((loc) => (
              <button
                key={loc.code}
                type="button"
                onClick={() => {
                  setPendingEdits({});
                  setActiveLocale(loc.code);
                }}
                className={`px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
                  activeLocale === loc.code
                    ? "border-cyan-primary text-cyan-primary"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {loc.label}
              </button>
            ))}
          </div>

          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search keys or values…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-primary focus:outline-none focus:ring-2 focus:ring-cyan-primary/20 bg-slate-50"
              />
            </div>
          </div>
        </div>

        {/* Namespace accordion */}
        {transLoading ? (
          <div className="py-16 text-center text-slate-gray/60">Loading translations…</div>
        ) : Object.keys(filteredGroups).length === 0 ? (
          <div className="py-16 text-center text-slate-gray/60">No matching translations found.</div>
        ) : (
          <div className="space-y-2">
            {Object.entries(filteredGroups)
              .sort(([a], [b]) => {
                const ai = NAMESPACES.indexOf(a);
                const bi = NAMESPACES.indexOf(b);
                if (ai === -1 && bi === -1) return a.localeCompare(b);
                if (ai === -1) return 1;
                if (bi === -1) return -1;
                return ai - bi;
              })
              .map(([ns, keys]) => {
                const isOpen = openNamespaces.has(ns) || searchTerm.trim().length > 0;
                const nsPendingCount = keys.filter((k) => k in pendingEdits).length;

                return (
                  <div key={ns} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <button
                      type="button"
                      onClick={() => toggleNamespace(ns)}
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {isOpen ? (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                        <span className="font-semibold text-slate-700 font-mono text-sm">{ns}</span>
                        <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
                          {keys.length}
                        </span>
                        {nsPendingCount > 0 && (
                          <span className="text-xs text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-full px-2 py-0.5">
                            {nsPendingCount} edited
                          </span>
                        )}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="divide-y divide-slate-100 border-t border-slate-100">
                        {keys.map((key) => {
                          const isDirty = key in pendingEdits;
                          return (
                            <div
                              key={key}
                              className={`px-5 py-3 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-3 items-start ${
                                isDirty ? "bg-cyan-50/40" : ""
                              }`}
                            >
                              <div className="flex items-start gap-2 pt-1">
                                {isDirty && (
                                  <span className="mt-0.5 h-2 w-2 rounded-full bg-cyan-500 flex-shrink-0" />
                                )}
                                <code className="text-xs text-slate-500 break-all leading-relaxed">
                                  {key}
                                </code>
                              </div>
                              <textarea
                                value={getCurrentValue(key)}
                                onChange={(e) => handleEdit(key, e.target.value)}
                                rows={1}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-cyan-primary focus:outline-none focus:ring-2 focus:ring-cyan-primary/20 text-sm text-slate-700 bg-white resize-y transition-colors"
                                onInput={(e) => {
                                  const el = e.currentTarget;
                                  el.style.height = "auto";
                                  el.style.height = `${el.scrollHeight}px`;
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}

        {/* Floating save bar when there are pending changes */}
        {pendingCount > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white rounded-2xl shadow-2xl px-6 py-3 flex items-center gap-4">
            <span className="text-sm font-medium">{pendingCount} unsaved change{pendingCount > 1 ? "s" : ""}</span>
            <button
              type="button"
              onClick={() => setPendingEdits({})}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={saveStatus === "saving"}
              className="inline-flex items-center gap-2 bg-cyan-primary hover:bg-cyan-hover px-4 py-1.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
            >
              <Save className="w-3.5 h-3.5" />
              {saveStatus === "saving" ? "Saving…" : "Save now"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
