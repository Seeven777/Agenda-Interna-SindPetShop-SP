import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './firebase/auth';
import Layout from './components/Layout';
import Login from './components/Login';
import ErrorBoundary from './components/ErrorBoundary';
const AppContent = () => {
    const { user, profile, loading, signIn } = useAuth();
    // DEV MODE BYPASS - mostra Login sempre se no dev
    if (import.meta.env.DEV && !import.meta.env.VITE_FIREBASE_API_KEY) {
        return (_jsxs("div", { className: "h-screen w-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-8 text-center", children: [_jsx("div", { className: "mb-8", children: _jsx("div", { className: "inline-block p-6 bg-indigo-600 rounded-[2.5rem] shadow-2xl shadow-indigo-600/40 animate-bounce-subtle", children: _jsx("svg", { className: "w-16 h-16 text-white", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM9 15a1 1 0 011-1h6a1 1 0 110 2h-6a1 1 0 01-1-1z", clipRule: "evenodd" }) }) }) }), _jsx("h1", { className: "text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight", children: "Agenda Sindical" }), _jsx("p", { className: "text-xs font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em] mb-8", children: "DEV MODE - Firebase sem config" }), _jsxs("div", { className: "space-y-4 w-full max-w-sm", children: [_jsx("button", { onClick: signIn, className: "w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-black py-4 px-6 rounded-[2rem] shadow-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all", children: "\uD83D\uDEA7 Entrar com Google (falha dev)" }), _jsx("button", { onClick: () => window.localStorage.setItem('devBypass', 'true'), className: "w-full bg-indigo-600 text-white font-black py-4 px-6 rounded-[2rem] shadow-xl hover:bg-indigo-700 transition-all", children: "\u26A1 Dev Skip \u2192 Dashboard" })] }), _jsx("p", { className: "mt-8 text-xs text-slate-400 absolute bottom-4", children: "Copie .env.local para Firebase real" })] }));
    }
    if (loading) {
        return (_jsxs("div", { className: "h-screen w-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600" }), _jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: _jsx("div", { className: "w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full animate-pulse" }) })] }), _jsx("p", { className: "mt-6 text-xs font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em] animate-pulse", children: "Carregando..." })] }));
    }
    if (!user || !profile) {
        return _jsx(Login, {});
    }
    return (_jsx(ErrorBoundary, { children: _jsx(Layout, {}) }));
};
export default function App() {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                registrations.forEach(registration => registration.unregister());
            });
        }
    }, []);
    return (_jsx(AuthProvider, { children: _jsx(AppContent, {}) }));
}
;
