import React, { useState } from 'react';
import { Database, CheckCircle, XCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { useDatabaseHealth } from '../../hooks/useDatabaseHealth';
import { useAuth } from '../../hooks/useAuth';

export default function DatabaseStatus() {
  const { isAdmin, loading: authLoading } = useAuth();
  const { isChecking, connectionStatus, schemaValidation, envValidation, overallStatus, retry } =
    useDatabaseHealth(true);
  const [isExpanded, setIsExpanded] = useState(false);

  if (authLoading || !isAdmin) {
    return null;
  }

  if (overallStatus === 'unchecked') {
    return null;
  }

  const statusColor =
    overallStatus === 'healthy'
      ? 'bg-green-500'
      : overallStatus === 'unhealthy'
      ? 'bg-red-500'
      : 'bg-yellow-500';

  const StatusIcon =
    overallStatus === 'healthy' ? CheckCircle : overallStatus === 'unhealthy' ? XCircle : Database;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden max-w-md">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${statusColor} animate-pulse`} />
            <StatusIcon className="w-5 h-5 text-gray-700" />
            <span className="text-sm font-medium text-slate-700">
              Database {overallStatus === 'checking' ? 'Checking...' : overallStatus}
            </span>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {isExpanded && (
          <div className="border-t border-gray-200 p-4 space-y-3">
            {envValidation && !envValidation.isValid && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-red-700">Environment Issues</h4>
                <ul className="text-xs text-red-600 space-y-1 list-disc list-inside">
                  {envValidation.errors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
                <p className="text-xs text-gray-600 mt-2">
                  Check your <code className="bg-gray-100 px-1 rounded">.env</code> file and ensure
                  both VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set correctly.
                </p>
              </div>
            )}

            {connectionStatus && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700">Connection Status</h4>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={
                        connectionStatus.isConnected ? 'text-green-600' : 'text-red-600'
                      }
                    >
                      {connectionStatus.isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                  {connectionStatus.details && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">URL:</span>
                        <span className="text-gray-800 truncate max-w-[200px]" title={connectionStatus.details.url}>
                          {connectionStatus.details.url}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Auth:</span>
                        <span className="text-gray-800">
                          {connectionStatus.details.hasAuth ? 'Configured' : 'Missing'}
                        </span>
                      </div>
                    </>
                  )}
                  {connectionStatus.error && (
                    <p className="text-red-600 mt-2">{connectionStatus.error}</p>
                  )}
                </div>
              </div>
            )}

            {schemaValidation && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700">Schema Validation</h4>
                <div className="text-xs">
                  {schemaValidation.isValid ? (
                    <p className="text-green-600">All required tables found</p>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-red-600">{schemaValidation.error}</p>
                      {schemaValidation.missingTables && (
                        <p className="text-gray-600 mt-1">
                          Missing: {schemaValidation.missingTables.join(', ')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={retry}
                disabled={isChecking}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
                Retry Connection
              </button>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
              >
                <Database className="w-3 h-3" />
                Open Dashboard
              </a>
            </div>

            {overallStatus === 'unhealthy' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-3">
                <h4 className="text-xs font-semibold text-yellow-800 mb-1">Troubleshooting Steps:</h4>
                <ol className="text-xs text-yellow-700 space-y-1 list-decimal list-inside">
                  <li>Verify your Supabase project is active in the dashboard</li>
                  <li>Check that environment variables match your Supabase project</li>
                  <li>Ensure your database migrations have been applied</li>
                  <li>Try refreshing the page or clicking "Retry Connection"</li>
                </ol>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
