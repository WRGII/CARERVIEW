import React from "react";

type Props = { children: React.ReactNode; fallback?: React.ReactNode };
type State = { error: any; showDetails: boolean };

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null, showDetails: false };
  }

  static getDerivedStateFromError(error: any) {
    return { error };
  }

  componentDidCatch(error: any, info: any) {
    console.error('[CarerView] ErrorBoundary caught:', error, info?.componentStack)
  }

  reset = () => {
    this.setState({ error: null, showDetails: false });
  };

  render() {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorMessage = this.state.error?.message || String(this.state.error);

      return (
        <div className="min-h-[40vh] flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Something went wrong</h2>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              An unexpected error occurred. You can try again or return to the dashboard.
            </p>
            <div className="flex gap-3 justify-center mb-4">
              <button
                onClick={this.reset}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Try again
              </button>
              <button
                onClick={() => { window.location.href = '/caregiver'; }}
                className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
              >
                Go to dashboard
              </button>
            </div>
            <button
              onClick={() => this.setState(s => ({ ...s, showDetails: !s.showDetails }))}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              {this.state.showDetails ? 'Hide details' : 'Show error details'}
            </button>
            {this.state.showDetails && (
              <pre className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-left text-xs text-slate-600 overflow-auto max-h-40 whitespace-pre-wrap break-words">
                {errorMessage}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
