import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import { Plus, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

/** Generate a long random password so admin can "pre-create" a user.
 *  Because email confirmations are enabled in your project, this will NOT
 *  swap the admin's session.
 */
function randomPassword(len = 24) {
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+";
  return Array.from({ length: len }, () =>
    alphabet[Math.floor(Math.random() * alphabet.length)]
  ).join("");
}

type CaregiverRow = {
  id: string;
  display_name: string | null;
  email: string | null;
  role: string;
  disabled: boolean;
  created_at: string;
};

export default function ActiveCaregiversPage() {
  const qc = useQueryClient();

  // ---- Load caregivers ------------------------------------------------------
  const caregiversQ = useQuery({
    queryKey: ["admin", "caregivers"],
    queryFn: async (): Promise<CaregiverRow[]> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, email, role, disabled, created_at")
        .eq("role", "caregiver")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    staleTime: 30_000,
  });

  // ---- Add caregiver (pre-create auth user + upsert profile) ----------------
  const addM = useMutation({
    mutationFn: async (payload: { email: string; display_name: string }) => {
      const tempPassword = randomPassword();

      // 1) Create auth user (email confirmation ON => no session swap)
      const { data, error } = await supabase.auth.signUp({
        email: payload.email,
        password: tempPassword,
        options: { data: { display_name: payload.display_name } },
      });
      if (error) throw error;

      const newUser = data.user;
      if (!newUser?.id) {
        // No user id yet (e.g., email provider blocked); abort gracefully.
        throw new Error(
          "Sign-up email sent. The user will appear after they confirm."
        );
      }

      // 2) Upsert their profile as caregiver (admin is allowed by your RLS)
      const { error: upErr } = await supabase.from("profiles").upsert({
        id: newUser.id,
        email: payload.email,
        display_name: payload.display_name,
        role: "caregiver",
        disabled: false,
      });
      if (upErr) throw upErr;

      return { id: newUser.id };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "caregivers"] });
    },
  });

  // ---- Toggle disabled (soft delete / restore) ------------------------------
  const toggleM = useMutation({
    mutationFn: async (row: CaregiverRow) => {
      const { error } = await supabase
        .from("profiles")
        .update({ disabled: !row.disabled })
        .eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin", "caregivers"] }),
  });

  // ---- UI -------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-warm-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Title row */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-gray">
              Active Caregivers
            </h1>
            <p className="text-slate-gray/70">
              View, add, or temporarily disable caregiver accounts.
            </p>
          </div>

          <button
            type="button"
            onClick={() => caregiversQ.refetch()}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-gray/30 px-4 py-2 text-sm font-semibold text-slate-gray hover:bg-peach-blush/20 transition-all"
            disabled={caregiversQ.isRefetching}
            aria-busy={caregiversQ.isRefetching}
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Add form */}
        <div className="bg-white border border-slate-gray/20 rounded-2xl p-6 shadow-sm mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-cyan-primary/15 flex items-center justify-center">
              <Plus className="w-5 h-5 text-cyan-primary" />
            </div>
            <h2 className="text-lg font-semibold text-slate-gray">
              Add caregiver
            </h2>
          </div>

          <AddForm
            busy={addM.isPending}
            error={addM.error as Error | null}
            onSubmit={(values) => addM.mutate(values)}
          />

          {addM.isSuccess && (
            <p className="mt-3 text-sm text-mint-green-700">
              Invitation created. The caregiver will be able to complete signup
              from the email they receive. (Your session remains active.)
            </p>
          )}
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-gray/20 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-gray/10">
            <h3 className="text-lg font-semibold text-slate-gray">
              Caregiver accounts ({caregiversQ.data?.length ?? 0})
            </h3>
          </div>

          {caregiversQ.isLoading ? (
            <div className="p-6 text-slate-gray/70">Loading caregivers…</div>
          ) : caregiversQ.error ? (
            <div className="p-6 text-red-700">
              {(caregiversQ.error as Error).message}
            </div>
          ) : (caregiversQ.data?.length ?? 0) === 0 ? (
            <div className="p-6 text-slate-gray/70">
              No caregivers found yet.
            </div>
          ) : (
            <ul role="list" className="divide-y divide-slate-gray/10">
              {caregiversQ.data!.map((c) => (
                <li key={c.id} className="px-6 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-gray">
                          {c.display_name || "—"}
                        </span>
                        <span className="text-slate-gray/60">•</span>
                        <span className="text-slate-gray/70 text-sm">
                          {c.email || "no email"}
                        </span>
                      </div>
                      <div className="text-xs text-slate-gray/60 mt-1">
                        Created {new Date(c.created_at).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {c.disabled ? (
                        <span className="inline-flex items-center gap-1 text-sm text-slate-gray/70">
                          <XCircle className="w-4 h-4" />
                          Disabled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-sm text-mint-green-700">
                          <CheckCircle2 className="w-4 h-4" />
                          Active
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleM.mutate(c)}
                        disabled={toggleM.isPending}
                        aria-busy={toggleM.isPending}
                        className="inline-flex items-center gap-2 rounded-lg border-2 border-slate-gray/30 px-3 py-2 text-sm font-semibold text-slate-gray hover:bg-peach-blush/20 transition-all"
                      >
                        {c.disabled ? "Enable" : "Disable"}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Note about hard delete */}
        <p className="mt-6 text-xs text-slate-gray/60">
          Need to permanently remove an authentication account? That requires a
          Supabase Edge Function with the service role (auth admin). We can add
          this in a Phase-2.
        </p>
      </div>
    </div>
  );
}

function AddForm({
  busy,
  error,
  onSubmit,
}: {
  busy: boolean;
  error: Error | null;
  onSubmit: (values: { email: string; display_name: string }) => void;
}) {
  const [email, setEmail] = React.useState("");
  const [displayName, setDisplayName] = React.useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!email) return;
        onSubmit({ email: email.trim(), display_name: displayName.trim() });
      }}
      className="grid gap-4 md:grid-cols-[1fr_1fr_auto]"
    >
      <div>
        <label className="block text-sm font-medium text-slate-gray mb-1">
          Display name
        </label>
        <input
          type="text"
          className="w-full rounded-lg border-slate-gray/30 shadow-sm focus:border-cyan-primary focus:ring-cyan-primary px-4 py-2 text-base bg-warm-white text-slate-gray"
          placeholder="How should we address them?"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-gray mb-1">
          Email address
        </label>
        <input
          type="email"
          required
          className="w-full rounded-lg border-slate-gray/30 shadow-sm focus:border-cyan-primary focus:ring-cyan-primary px-4 py-2 text-base bg-warm-white text-slate-gray"
          placeholder="their.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="flex items-end">
        <button
          type="submit"
          disabled={busy}
          aria-busy={busy}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-primary px-5 py-2.5 font-semibold text-warm-white shadow-lg hover:bg-cyan-hover disabled:opacity-60 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add caregiver
        </button>
      </div>

      {error && (
        <div className="md:col-span-3 rounded-lg bg-peach-blush/30 border border-peach-blush p-3 text-sm text-slate-gray">
          {error.message}
        </div>
      )}
    </form>
  );
}
