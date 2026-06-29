import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { ErrorBoundary } from './components/util/ErrorBoundary';

const rootFallback = (
  <div className="min-h-screen flex items-center justify-center bg-white px-4">
    <div className="max-w-sm w-full text-center">
      <h2 className="text-base font-semibold text-slate-800 mb-2">CarerView failed to load</h2>
      <p className="text-sm text-slate-500 leading-relaxed mb-5">
        An unexpected error occurred on startup. Please refresh the page to try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
      >
        Refresh
      </button>
    </div>
  </div>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary fallback={rootFallback}>
      <App />
    </ErrorBoundary>
  </StrictMode>
);