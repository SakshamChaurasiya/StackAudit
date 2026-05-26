"use client";

import React from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";

type State = { hasError: boolean; error?: Error };

type Props = {
  children: React.ReactNode;
  /** Optional custom fallback. Defaults to a built-in recovery UI. */
  fallback?: React.ReactNode;
};

/**
 * React Error Boundary — catches any unhandled JS error in the component tree.
 * Shows a friendly recovery UI and logs to console in dev.
 * Must be a class component (React requirement for componentDidCatch).
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-6 px-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <span className="text-2xl" aria-hidden>
              ⚠️
            </span>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight">Something went wrong</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              An unexpected error occurred while rendering this page. Try refreshing — your data is safe.
            </p>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <pre className="mt-3 max-w-md overflow-auto rounded-lg bg-muted p-3 text-left text-xs text-muted-foreground">
                {this.state.error.message}
              </pre>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex items-center rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90"
            >
              Go home
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
