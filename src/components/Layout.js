import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Scale, Bell, Moon, Sun } from 'lucide-react';
import BottomNav from './BottomNav';
import Dashboard from './Dashboard';
import Calendar from './Calendar';
import Legal from './Legal';
import Tasks from './Tasks';
import Announcements from './Announcements';
import Profile from './Profile';
import { useAuth } from '../firebase/auth';
const Layout = () => {
    const [currentView, setCurrentView] = useState('dashboard');
    const [isDarkMode, setIsDarkMode] = useState(false);
    useEffect(() => {
        // Load from localStorage or system preference
        const saved = localStorage.getItem('darkMode');
        if (saved !== null) {
            const initialDark = saved === 'true';
            setIsDarkMode(initialDark);
            if (initialDark) {
                document.documentElement.classList.add('dark');
            }
            else {
                document.documentElement.classList.remove('dark');
            }
        }
        else {
            // Default to system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setIsDarkMode(prefersDark);
            if (prefersDark) {
                document.documentElement.classList.add('dark');
            }
        }
    }, []);
    const { profile } = useAuth();
    useEffect(() => {
        // Apply class change
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        }
        else {
            document.documentElement.classList.remove('dark');
        }
        // Save to localStorage
        localStorage.setItem('darkMode', isDarkMode.toString());
    }, [isDarkMode]);
    const viewTitles = {
        dashboard: 'Painel',
        calendar: 'Agenda',
        legal: 'Jurídico',
        tasks: 'Tarefas',
        announcements: 'Comunicados',
        profile: 'Perfil'
    };
    const renderView = () => {
        switch (currentView) {
            case 'dashboard': return _jsx(Dashboard, { setView: setCurrentView });
            case 'calendar': return _jsx(Calendar, {});
            case 'legal': return _jsx(Legal, {});
            case 'tasks': return _jsx(Tasks, {});
            case 'announcements': return _jsx(Announcements, {});
            case 'profile': return _jsx(Profile, {});
            default: return _jsx(Dashboard, { setView: setCurrentView });
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 transition-colors duration-500", children: [_jsxs("header", { className: "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 p-5 sticky top-0 z-30 flex justify-between items-center", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "bg-indigo-600 p-2.5 rounded-2xl shadow-xl shadow-indigo-600/20", children: _jsx(Scale, { size: 20, className: "text-white" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-xl font-black text-slate-900 dark:text-white leading-none tracking-tight", children: viewTitles[currentView] }), _jsx("p", { className: "text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] mt-1", children: "Agenda Sindical" })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => setIsDarkMode(!isDarkMode), className: "p-3 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-2xl transition-all active:scale-90", children: isDarkMode ? _jsx(Sun, { size: 20 }) : _jsx(Moon, { size: 20 }) }), _jsxs("button", { className: "p-3 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-2xl transition-all active:scale-90 relative", children: [_jsx(Bell, { size: 20 }), _jsx("span", { className: "absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-800" })] })] })] }), _jsx("main", { className: "p-5 max-w-2xl mx-auto", children: renderView() }), _jsx(BottomNav, { currentView: currentView, setView: setCurrentView })] }));
};
export default Layout;
