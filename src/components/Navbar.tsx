import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { SubscriptionBadge } from './SubscriptionBadge';

export function Navbar() {
  const { user } = useAuth();
  const { subscription } = useSubscription(user);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
    setMobileOpen(false);
  };

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center group-hover:bg-teal-700 transition-colors">
            <Heart className="w-4 h-4 text-white" fill="currentColor" />
          </div>
          <span className="font-semibold text-gray-900 tracking-tight">CarerView</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Pricing
          </Link>
          {user ? (
            <>
              <SubscriptionBadge subscription={subscription} />
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/auth" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Sign in
              </Link>
              <Link
                to="/auth?mode=signup"
                className="px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          <Link to="/#pricing" className="block text-sm text-gray-600 py-2" onClick={() => setMobileOpen(false)}>
            Pricing
          </Link>
          {user ? (
            <>
              <div className="py-2"><SubscriptionBadge subscription={subscription} /></div>
              <Link to="/dashboard" className="block text-sm text-gray-600 py-2" onClick={() => setMobileOpen(false)}>
                Dashboard
              </Link>
              <button onClick={handleSignOut} className="block text-sm text-red-600 py-2 w-full text-left">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/auth" className="block text-sm text-gray-600 py-2" onClick={() => setMobileOpen(false)}>
                Sign in
              </Link>
              <Link
                to="/auth?mode=signup"
                className="block px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium text-center"
                onClick={() => setMobileOpen(false)}
              >
                Get started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}