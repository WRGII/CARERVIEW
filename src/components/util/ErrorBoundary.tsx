import React from "react";

type Props = { children: React.ReactNode; fallback?: React.ReactNode };
type State = { error: any };

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { error };
  }

  componentDidCatch(error: any, info: any) {
    // You can also POST this to your logging service
    // eslint-disable-next-line no-console
    console.error("App crashed:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div style={{ padding: 24 }}>
            <h2 className="text-xl font-semibold mb-2">Something went wrong.</h2>
            <pre style={{ whiteSpace: "pre-wrap" }}>
              {String(this.state.error?.message || this.state.error)}
            </pre>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
