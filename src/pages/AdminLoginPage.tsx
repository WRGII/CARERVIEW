import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader as Loader2, ShieldCheck } from "lucide-react";
import { setAdminToken } from "../hooks/useAdminSession";

const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 60;
const LOCKOUT_KEY = 'admin_lockout';

function readLockoutState(): { attempts: number; lockedUntil: number | null } {
  try {
    const raw = sessionStorage.getItem(LOCKOUT_KEY);
    if (!raw) return { attempts: 0, lockedUntil: null };
    const parsed = JSON.parse(raw);
    return {
      attempts: parsed.attempts ?? 0,
      lockedUntil: parsed.lockedUntil ?? null,
    };
  } catch {
    return { attempts: 0, lockedUntil: null };
  }
}

function writeLockoutState(attempts: number, lockedUntil: number | null): void {
  try {
    sessionStorage.setItem(LOCKOUT_KEY, JSON.stringify({ attempts, lockedUntil }));
  } catch { }
}

function clearLockoutState(): void {
  try {
    sessionStorage.removeItem(LOCKOUT_KEY);
  } catch { }
}

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialState = readLockoutState();
  const [attempts, setAttempts] = useState(initialState.attempts);
  const [lockedUntil, setLockedUntil] = useState<number | null>(initialState.lockedUntil);
  const [countdown, setCountdown] = useState(0);

  React.useEffect(() => {
    if (!lockedUntil) return;
    const tick = () => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setLockedUntil(null);
        setAttempts(0);
        setCountdown(0);
        clearLockoutState();
      } else {
        setCountdown(remaining);
      }
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [lockedUntil]);

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || isLocked) return;
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

      const res = await fetch(`${supabaseUrl}/functions/v1/admin-bootstrap`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${anonKey}`,
          Apikey: anonKey,
        },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!res.ok) {
        const newAttempts = attempts + 1;
        const newLockedUntil = newAttempts >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_SECONDS * 1000 : null;
        setAttempts(newAttempts);
        if (newLockedUntil) setLockedUntil(newLockedUntil);
        writeLockoutState(newAttempts, newLockedUntil);
        if (res.status === 429) {
          setError("Too many attempts. Please wait before trying again.");
        } else if (res.status === 500) {
          setError("Server error. Please try again later.");
        } else {
          setError("Invalid credentials.");
        }
        return;
      }

      let data: any;
      try {
        data = await res.json();
      } catch {
        setError("Authentication failed. Please try again.");
        return;
      }
      if (!data?.token) {
        setError("Authentication failed. Please try again.");
        return;
      }

      clearLockoutState();
      setAdminToken(data.token);
      navigate("/admin", { replace: true });
    } catch (err) {
      console.error('[admin-login] fetch error:', err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4 shadow-lg">
            <ShieldCheck className="w-7 h-7 text-slate-300" />
          </div>
          <h1 className="text-xl font-semibold text-slate-100 tracking-tight">Admin Access</h1>
          <p className="text-sm text-slate-500 mt-1">Restricted area. Authorised personnel only.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="admin-email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLocked || loading}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 text-slate-100 px-4 py-3 text-sm placeholder-slate-600 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:opacity-50 transition-colors"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLocked || loading}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 text-slate-100 px-4 py-3 pr-11 text-sm placeholder-slate-600 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:opacity-50 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div role="alert" className="rounded-xl bg-red-950/50 border border-red-900/60 px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {isLocked && (
              <div role="alert" className="rounded-xl bg-amber-950/50 border border-amber-900/60 px-4 py-3">
                <p className="text-amber-400 text-sm">
                  Too many failed attempts. Please wait {countdown}s before trying again.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || isLocked}
              className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-slate-100 hover:bg-white text-slate-900 font-semibold py-3 text-sm shadow-sm disabled:opacity-50 transition-all duration-200 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-700 mt-6">
          CareView Admin Console
        </p>
      </div>
    </div>
  );
}
