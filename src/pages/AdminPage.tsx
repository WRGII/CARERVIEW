// src/pages/AdminPage.tsx
import React, { useEffect, useState } from 'react';
import { establishSessionFromToken } from '../lib/tokenSession'
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Layout } from '../components/common/Layout';
import { Loading } from '../components/ui/Loading';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { Button } from '../components/ui/Button';
import { TokenManager } from '../components/admin/TokenManager';
import { AggregateData } from '../components/admin/AggregateData';
import { Upload, Link, BarChart3 } from 'lucide-react';

type AdminView = 'dashboard' | 'tokens';

export const AdminPage: React.FC = () => {
  const { token, loading, error } = useAuth(); // returns { tokenId, role }
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const [ctxReady, setCtxReady] = useState(false);

  if (loading) return <Loading message="Validating admin access..." />;

  if (error || !token || token.role !== 'admin') {
    return <ErrorMessage message={error || 'Access denied. Invalid administrator token.'} />;
  }

  // Set DB session context once (safe even if already set)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await supabase.rpc('set_token_context', {
          p_token_id: token.tokenId,
          p_role: token.role,
        });
        if (!cancelled) setCtxReady(true);
      } catch (e) {
        console.error('Failed to set token context', e);
      }
    })();
    return () => { cancelled = true; };
  }, [token.tokenId, token.role]);

  if (!ctxReady) return <Loading message="Preparing secure admin session..." />;

  const renderContent = () => {
    switch (currentView) {
      case 'tokens':
        return <TokenManager />;
      default:
        return <AggregateData />;
    }
  };

  return (
    <Layout title="Administrator Dashboard" role="admin" tokenId={token.tokenId}>
      <div className="space-y-6">
        {/* Navigation */}
        <div className="flex space-x-4 border-b border-slate-200 pb-4">
          <Button
            variant={currentView === 'dashboard' ? 'primary' : 'ghost'}
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center space-x-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Dashboard</span>
          </Button>
          <Button
            variant={currentView === 'tokens' ? 'primary' : 'ghost'}
            onClick={() => setCurrentView('tokens')}
            className="flex items-center space-x-2"
          >
            <Link className="w-4 h-4" />
            <span>Manage Tokens</span>
          </Button>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </Layout>
  );
};
