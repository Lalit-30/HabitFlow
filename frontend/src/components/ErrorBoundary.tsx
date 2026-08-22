import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((error?: Error, resetState?: () => void) => ReactNode);
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback(this.state.error, this.handleReset);
        }
        return this.props.fallback;
      }

      return (
        <div className="min-h-[60vh] text-white flex items-center justify-center p-6">
          <div className="glass-panel p-8 sm:p-10 border border-rose-500/30 max-w-md text-center space-y-5 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Component Render Error</h1>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                An unexpected component error occurred. We isolated the issue so the rest of your session remains safe.
              </p>
              {this.state.error && (
                <p className="text-[11px] font-mono text-rose-300 mt-2 bg-rose-950/40 p-2 rounded border border-rose-500/20 truncate">
                  {this.state.error.message}
                </p>
              )}
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg transition flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Retry Component
              </button>
              <button
                onClick={this.handleReload}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition flex items-center gap-2"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
