import React from 'react';
import { LayoutDashboard, Calendar, Scale, CheckSquare, Megaphone, User } from 'lucide-react';
import { View } from './Layout';
import { cn } from '../lib/utils';

interface BottomNavProps {
  currentView: View;
  setView: (view: View) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Início' },
    { id: 'calendar', icon: Calendar, label: 'Agenda' },
    { id: 'legal', icon: Scale, label: 'Jurídico' },
    { id: 'tasks', icon: CheckSquare, label: 'Tarefas' },
    { id: 'announcements', icon: Megaphone, label: 'Avisos' },
    { id: 'profile', icon: User, label: 'Perfil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-4 py-3 flex justify-around items-center z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setView(item.id as View)}
          className={cn(
            "flex flex-col items-center gap-1 transition-all duration-300 relative",
            currentView === item.id ? "text-blue-600 dark:text-blue-400 scale-110" : "text-slate-400 dark:text-slate-500 hover:text-slate-600"
          )}
        >
          <item.icon size={22} strokeWidth={currentView === item.id ? 2.5 : 2} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
          {currentView === item.id && (
            <span className="absolute -top-1 w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
          )}
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
