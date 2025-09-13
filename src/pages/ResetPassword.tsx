// src/pages/ResetPassword.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function ResetPassword() {
  const [tokenFound, setTokenFound] = useState(false);
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // When the user lands here from the email link, Supabase can parse the URL hash
  // because detectSessionInUrl: true is enabled in supabaseClient.
  useEffect(() => {
    const hash = window.location.hash ?? '';
    const params = new URLSearchParams(hash.replace(/^#/, ''));
    const type = params.get('type');
    const access_token = params.get('access_token');
    setTokenFound(!!access_token && type === 'recovery');
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErr(null);
    setMsg(null);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setErr(error.message);
    else setMsg('Password updated. You can now sign in.');
    setSubmitting(false);
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold text-slate-gray mb-4">Reset your password</h1>
      {!tokenFound && (
        <p className="text-slate-gray/80">
          We couldn’t find a recovery token. Please use the link from your email, or request a new reset.
        </p>
      )}
      {tokenFound && (
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-sm text-slate-gray">New password</span>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border-slate-gray/30 px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </label>
          {err && <div className="text-sm text-red-600">{err}</div>}
          {msg && <div className="text-sm text-green-700">{msg}</div>}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-cyan-primary text-white px-4 py-2 disabled:opacity-60"
          >
            {submitting ? 'Updating…' : 'Update password'}
          </button>
        </form>
      )}
    </div>
  );
}
