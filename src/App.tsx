/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './firebase/auth';
import Layout from './components/Layout';
import Login from './components/Login';
import ErrorBoundary from './components/ErrorBoundary';

const AppContent: React.FC = () => {
  const { user, profile, loading, signIn } = useAuth();

  // DEV MODE BYPASS - mostra Login sempre se no dev
  if (import.meta.env.DEV && !import.meta.env.VITE_FIREBASE_API_KEY) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-8 text-center">
        <div className="mb-8">
          <div className="inline-block p-6 bg-indigo-600 rounded-[2.5rem] shadow-2xl shadow-indigo-600/40 animate-bounce-subtle">
            <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM9 15a1 1 0 011-1h6a1 1 0 110 2h-6a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Agenda Sindical</h1>
        <p className="text-xs font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em] mb-8">DEV MODE - Firebase sem config</p>
        <div className="space-y-4 w-full max-w-sm">
          <button
            onClick={signIn}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-black py-4 px-6 rounded-[2rem] shadow-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            🚧 Entrar com Google (falha dev)
          </button>
          <button
            onClick={() => window.localStorage.setItem('devBypass', 'true')}
            className="w-full bg-indigo-600 text-white font-black py-4 px-6 rounded-[2rem] shadow-xl hover:bg-indigo-700 transition-all"
          >
            ⚡ Dev Skip → Dashboard
          </button>
        </div>
        <p className="mt-8 text-xs text-slate-400 absolute bottom-4">
          Copie .env.local para Firebase real
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full animate-pulse"></div>
          </div>
        </div>
        <p className="mt-6 text-xs font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em] animate-pulse">Carregando...</p>
      </div>
    );
  }

  if (!user || !profile) {
    return <Login />;
  }

  return (
    <ErrorBoundary>
      <Layout />
    </ErrorBoundary>
  );
};

export default function App() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => registration.unregister());
      });
    }
  }, []);

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

