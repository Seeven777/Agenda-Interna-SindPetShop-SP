import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Calendar as CalendarIcon, Scale, CheckSquare, Megaphone, User, Bell, Search, Moon, Sun, Plus } from 'lucide-react';
import BottomNav from './BottomNav';
import Dashboard from './Dashboard';
import Calendar from './Calendar';
import Legal from './Legal';
import Tasks from './Tasks';
import Announcements from './Announcements';
import Profile from './Profile';
import { useAuth } from '../firebase/auth';

export type View = 'dashboard' | 'calendar' | 'legal' | 'tasks' | 'announcements' | 'profile';

const Layout: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Load from localStorage or system preference
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      const initialDark = saved === 'true';
      setIsDarkMode(initialDark);
      if (initialDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
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
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Save to localStorage
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  const viewTitles: Record<View, string> = {
    dashboard: 'Painel',
    calendar: 'Agenda',
    legal: 'Jurídico',
    tasks: 'Tarefas',
    announcements: 'Comunicados',
    profile: 'Perfil'
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard setView={setCurrentView} />;
      case 'calendar': return <Calendar />;
      case 'legal': return <Legal />;
      case 'tasks': return <Tasks />;
      case 'announcements': return <Announcements />;
      case 'profile': return <Profile />;
      default: return <Dashboard setView={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 transition-colors duration-500">
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 p-5 sticky top-0 z-30 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-xl shadow-indigo-600/20">
            <Scale size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
              {viewTitles[currentView]}
            </h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] mt-1">
              Agenda Sindical
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-3 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-2xl transition-all active:scale-90"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="p-3 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-2xl transition-all active:scale-90 relative">
            <Bell size={20} />
            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
          </button>
        </div>
      </header>
      
      <main className="p-5 max-w-2xl mx-auto">
        {renderView()}
      </main>

      <BottomNav currentView={currentView} setView={setCurrentView} />
    </div>
  );
};

export default Layout;
