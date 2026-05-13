import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 bg-black/50 backdrop-blur-xl rounded-[2rem] border border-red-500/20 text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="text-red-500" size={32} />
          </div>
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-4">Module Malfunction</h2>
          <p className="text-white/60 text-sm max-w-md mb-8">
            The data stream encountered an anomaly. System integrity remains intact, but this module needs a manual override.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-black uppercase italic text-xs tracking-widest hover:scale-105 active:scale-95 transition-all"
          >
            <RefreshCw size={14} />
            <span>Re-initialize System</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
