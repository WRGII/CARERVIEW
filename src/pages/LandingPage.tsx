// src/pages/LandingPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

export default function LandingPage() {
  const navigate = useNavigate();

  // Supabase auth state (use your existing hook)
  const { user, authLoading } = useAuth();

  // Fetch the logged-in user's profile (role/disabled/display_name/email)
  const {
    data: profile,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useProfile(user?.id);

  // Simple local form state (adjust/remove if you already have a form)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState(''); // optional for sign-up

  // Once user & profile are known, route based on role
  useEffect(() => {
    if (authLoading || profileLoading) return;
    if (!user) return;

    if (profile?.disabled) {
      alert('Your account is disabled. Please contact an administrator.');
      return;
    }

    const isAdmin = profile?.role === 'admin';
    navigate(isAdmin ? '/admin' : '/caregiver', { replace: true });
  }, [user, profile, authLoading, profileLoading, navigate]);

  // ---- Handlers ----

  // Sign In → fetch profile → route by role
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
      return;
    }

    // Ensure we have the latest profile for the now-signed-in user
    await refetchProfile();

    const { data: sessionUser } = await supabase.auth.getUser();
    const { data: p, error: pErr } = await supabase
      .from('profiles')
      .select('role, disabled')
      .eq('id', sessionUser.user?.id)
      .single();

    if (pErr) {
      console.warn('Profile fetch after sign-in failed:', pErr.message);
    }

    if (p?.disabled) {
      alert('Your account is disabled. Please contact an administrator.');
      return;
    }

    navigate(p?.role === 'admin' ? '/admin' : '/caregiver');
  };

  // Sign Up → upsert profiles row (if no DB trigger) → route by role (default caregiver)
  const handleSignUp = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName || '' } },
    });
    if (error) {
      alert(error.message);
      return;
    }

    // If email confirmations are ON, user may not be logged in yet:
    const { data: sessionUser } = await supabase.auth.getUser();

    // Safety: create profile row if a DB trigger doesn’t do it
    if (sessionUser.user?.id) {
      const { error: upsertErr } = await supabase.from('profiles').upsert({
        id: sessionUser.user.id,
        email,
        display_name: displayName || '',
        role: 'caregiver', // DB default is caregiver; setting explicitly is fine
        disabled: false,
      });
      if (upsertErr) console.warn('profiles upsert warning:', upsertErr.message);

      const { data: p } = await supabase
        .from('profiles')
        .select('role, disabled')
        .eq('id', sessionUser.user.id)
        .single();

      if (p?.disabled) {
        alert('Your account is disabled. Please contact an administrator.');
        return;
      }
      navigate(p?.role === 'admin' ? '/admin' : '/caregiver');
    } else {
      // If confirmations are ON
      alert('Please check your email to confirm your account before signing in.');
    }
  };

  // ---- UI ----
  return (
    <div className="mx-auto max-w-5xl p-6">
      {/* Hero / Marketing copy — keep or customize */}
      <section className="text-center mt-8">
        <h1 className="text-3xl md:text-4xl font-bold">
          CarerView — Daily Functional Assessment Made Easy
        </h1>
        <p className="mt-3 text-slate-700 max-w-2xl mx-auto">
          For family and professional caregivers to record daily observations across ADA and OT
          Activities of Daily Living categories using a simple 1–10 scale. Administrators can view
          system-wide aggregates. Patients do not log in.
        </p>
      </section>

      {/* Auth card */}
      <section className="mt-10 mx-auto max-w-md border rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Sign in or create an account</h2>

        <form className="space-y-3" onSubmit={handleSignIn}>
          <input
            className="w-full border rounded p-2"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <input
            className="w-full border rounded p-2"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          {/* Optional: only used during sign-up */}
          <input
            className="w-full border rounded p-2"
            type="text"
            placeholder="Display name (optional for sign up)"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />

          <div className="flex gap-3 pt-2">
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">
              Sign in
            </button>

            <button
              type="button"
              className="px-4 py-2 rounded border"
              onClick={handleSignUp}
            >
              Sign up
            </button>
          </div>
        </form>

        {/* Optional: password reset link if you have /reset-password configured */}
        <div className="mt-3">
          <button
            className="text-sm underline"
            onClick={async () => {
              if (!email) {
                alert('Enter your email above first, then click reset.');
                return;
              }
              const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
              });
              if (error) alert(error.message);
              else alert('If that email exists, a reset link has been sent.');
            }}
          >
            Forgot your password?
          </button>
        </div>
      </section>

      {/* Loading hint on first mount (optional) */}
      {(authLoading || profileLoading) && user && (
        <p className="mt-4 text-center text-sm text-slate-500">Checking your access…</p>
      )}
    </div>
  );
}
