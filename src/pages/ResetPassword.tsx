import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useLocale } from '../i18n/LocaleContext';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const [tokenValid, setTokenValid] = useState<'checking' | 'valid' | 'invalid'>('checking');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setTokenValid('valid');
        return;
      }

      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY' && session) {
          setTokenValid('valid');
          sub.unsubscribe();
        }
      });
      subscription = sub;

      timer = setTimeout(() => {
        sub.unsubscribe();
        setTokenValid((prev) => prev === 'checking' ? 'invalid' : prev);
      }, 4000);
    });

    return () => {
      if (timer) clearTimeout(timer);
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;

    setErr(null);
    setMsg(null);

    if (password !== confirmPassword) {
      setErr(t('reset_pw.err_mismatch'));
      return;
    }

    if (password.length < 8) {
      setErr(t('reset_pw.err_too_short'));
      return;
    }

    submittingRef.current = true;
    const { error } = await supabase.auth.updateUser({ password });
    submittingRef.current = false;

    if (error) {
      setErr(error.message);
    } else {
      setMsg(t('reset_pw.success'));
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 2000);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold text-slate-gray mb-4">{t('reset_pw.title')}</h1>

      {tokenValid === 'checking' && (
        <p className="text-slate-gray/60 text-sm">{t('common.loading')}</p>
      )}

      {tokenValid === 'invalid' && (
        <p className="text-slate-gray/80">
          {t('reset_pw.no_token')}
        </p>
      )}

      {tokenValid === 'valid' && (
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-sm text-slate-gray">{t('reset_pw.new_pw_label')}</span>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border-slate-gray/30 px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
              placeholder={t('reset_pw.new_pw_ph')}
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-gray">{t('reset_pw.confirm_label')}</span>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border-slate-gray/30 px-3 py-2"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              required
              placeholder={t('reset_pw.confirm_ph')}
            />
          </label>
          {err && <div className="text-sm text-red-600">{err}</div>}
          {msg && <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">{msg}</div>}
          <button
            type="submit"
            disabled={submittingRef.current}
            className="w-full rounded-lg bg-cyan-primary text-white px-4 py-3 disabled:opacity-60 font-semibold hover:bg-cyan-hover transition-colors"
          >
            {t('reset_pw.submit_btn')}
          </button>
        </form>
      )}
    </div>
  );
}
