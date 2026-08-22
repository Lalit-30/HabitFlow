import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';

export const NotFoundView: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
      <div className="glass-panel p-8 sm:p-12 border border-slate-800 max-w-md space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mx-auto">
          <Compass className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold font-mono text-brand-400 uppercase tracking-widest">404 Error</span>
          <h1 className="text-2xl font-bold text-white">Page Not Found</h1>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            The page or route you are looking for does not exist or has been moved.
          </p>
        </div>

        <div className="pt-2 flex items-center justify-center gap-3">
          <Link
            to="/"
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-500/20 transition flex items-center gap-2"
          >
            <Home className="w-4 h-4" /> Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};
