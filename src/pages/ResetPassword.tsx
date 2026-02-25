// src/pages/ResetPassword.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useLocale } from '../i18n/LocaleContext';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const [tokenFound, setTokenFound] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    
    // Validate password confirmation
    if (password !== confirmPassword) {
      setErr(t('reset_pw.mismatch'));
      setSubmitting(false);
      return;
    }

    if (password.length < 8) {
      setErr(t('reset_pw.too_short'));
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setErr(error.message);
    } else {
      setMsg(t('reset_pw.success'));
      // Redirect to sign-in page after a brief delay
      setTimeout(() => {
        navigate('/#get-started', { replace: true });
      }, 2000);
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold text-slate-gray mb-4">{t('reset_pw.title')}</h1>
      {!tokenFound && (
        <p className="text-slate-gray/80">
          {t('reset_pw.no_token')}
        </p>
      )}
      {tokenFound && (
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-sm text-slate-gray">{t('reset_pw.new_password')}</span>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border-slate-gray/30 px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
              placeholder={t('reset_pw.new_password_placeholder')}
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-gray">{t('reset_pw.confirm_password')}</span>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border-slate-gray/30 px-3 py-2"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              required
              placeholder={t('reset_pw.confirm_placeholder')}
            />
          </label>
          {err && <div className="text-sm text-red-600">{err}</div>}
          {msg && <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">{msg}</div>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-cyan-primary text-white px-4 py-3 disabled:opacity-60 font-semibold hover:bg-cyan-hover transition-colors"
          >
            {submitting ? t('reset_pw.updating') : t('reset_pw.submit')}
          </button>
        </form>
      )}
    </div>
  );
}
