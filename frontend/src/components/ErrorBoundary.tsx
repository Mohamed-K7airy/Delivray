'use client';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';
import Button from './Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl p-10 border border-gray-100 shadow-2xl text-center">
            <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500">
              <AlertTriangle size={40} />
            </div>
            <h2 className="text-2xl font-black text-[#111111] tracking-tighter mb-4">Something went wrong</h2>
            <p className="text-sm font-bold text-[#888888] mb-8 leading-relaxed">
              An unexpected error occurred in the application. Our team has been notified.
            </p>
            <Button 
              variant="primary" 
              className="w-full h-14 uppercase tracking-widest text-[10px] font-black gap-3"
              onClick={() => window.location.reload()}
            >
              <RotateCcw size={16} />
              Reload Application
            </Button>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 p-4 bg-gray-50 rounded-xl text-left overflow-auto max-h-40">
                <p className="text-[10px] font-mono text-gray-500">{this.state.error?.message}</p>
                <pre className="text-[8px] font-mono text-gray-300 mt-2">{this.state.error?.stack}</pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.children;
  }
}

export default ErrorBoundary;
