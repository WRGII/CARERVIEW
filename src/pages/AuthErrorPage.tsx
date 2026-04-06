import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { SITE_URL } from '../lib/siteConfig';
import { useLocale } from '../i18n/LocaleContext';
import { CircleAlert as AlertCircle, Mail, ArrowLeft, CircleCheck as CheckCircle } from 'lucide-react';

type ResendState = 'idle' | 'sending' | 'sent' | 'error';

export default function AuthErrorPage() {
  const [searchParams] = useSearchParams();
  const { t } = useLocale();
  const type = searchParams.get('type');
  const isRecovery = type === 'recovery';

  const [email, setEmail] = useState('');
  const [resendState, setResendState] = useState<ResendState>('idle');
  const [resendError, setResendError] = useState<string | null>(null);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || resendState === 'sending') return;

    setResendState('sending');
    setResendError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${SITE_URL}/auth/callback?type=recovery`,
    });

    if (error) {
      setResendError(t('auth_error.resend_failed'));
      setResendState('error');
    } else {
      setResendState('sent');
    }
  };

  return (
    <div className="min-h-screen bg-warm-white flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-amber-50 border-b border-amber-100 px-8 py-6 flex items-start gap-4">
            <div className="flex-shrink-0 mt-0.5">
              <AlertCircle className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-800 leading-tight">
                {isRecovery ? t('auth_error.recovery_title') : t('auth_error.generic_title')}
              </h1>
              <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                {isRecovery ? t('auth_error.recovery_body') : t('auth_error.generic_body')}
              </p>
            </div>
          </div>

          <div className="px-8 py-7">
            {isRecovery && resendState !== 'sent' && (
              <>
                <p className="text-sm font-medium text-slate-700 mb-4">
                  {t('auth_error.resend_prompt')}
                </p>
                <form onSubmit={handleResend} className="space-y-4">
                  <div>
                    <label
                      htmlFor="resend-email"
                      className="block text-sm text-slate-600 mb-1.5"
                    >
                      {t('auth_error.email_label')}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      <input
                        id="resend-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('auth.email_placeholder')}
                        className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400 transition-colors"
                      />
                    </div>
                    {resendError && (
                      <p className="mt-2 text-xs text-red-600">{resendError}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={resendState === 'sending' || !email.trim()}
                    className="w-full rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2.5 transition-colors"
                  >
                    {resendState === 'sending'
                      ? t('auth_error.resend_sending')
                      : t('auth_error.resend_btn')}
                  </button>
                </form>
              </>
            )}

            {isRecovery && resendState === 'sent' && (
              <div className="flex items-start gap-3 bg-teal-50 border border-teal-100 rounded-xl p-4">
                <CheckCircle className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-teal-800">
                    {t('auth_error.resend_success_title')}
                  </p>
                  <p className="text-sm text-teal-700 mt-0.5 leading-relaxed">
                    {t('auth_error.resend_success_body')}
                  </p>
                </div>
              </div>
            )}

            {!isRecovery && (
              <p className="text-sm text-slate-500 leading-relaxed">
                {t('auth_error.generic_help')}
              </p>
            )}

            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {t('auth_error.back_home')}
              </Link>
              {isRecovery && resendState === 'sent' && (
                <Link
                  to="/"
                  className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
                >
                  {t('common.sign_in')}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
