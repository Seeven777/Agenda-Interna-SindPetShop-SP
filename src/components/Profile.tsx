import React, { useState } from 'react';
import { useAuth } from '../firebase/auth';
import { LogOut, Shield, User as UserIcon, Mail, Calendar, Users as UsersIcon, ChevronRight } from 'lucide-react';
import { formatDate } from '../lib/utils';
import Users from './Users';

const Profile: React.FC = () => {
  const { profile, logout, isAdmin } = useAuth();
  const [showUsers, setShowUsers] = useState(false);

  if (!profile) return null;

  if (showUsers) {
    return <Users onBack={() => setShowUsers(false)} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
        <div className="w-28 h-28 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6 overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl">
          {profile.photoURL ? (
            <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <UserIcon size={56} className="text-blue-600 dark:text-blue-400" />
          )}
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{profile.displayName}</h2>
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-4 py-1.5 rounded-full mt-4">
          <Shield size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">{profile.role === 'admin' ? 'Administrador' : 'Equipe'}</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
        <div className="flex items-center gap-5">
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-slate-400 dark:text-slate-500">
            <Mail size={22} />
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-slate-400 dark:text-slate-600 uppercase font-black tracking-widest">Endereço de E-mail</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{profile.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-slate-400 dark:text-slate-500">
            <Calendar size={22} />
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-slate-400 dark:text-slate-600 uppercase font-black tracking-widest">Membro desde</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{formatDate(profile.createdAt)}</p>
          </div>
        </div>
      </div>

      {isAdmin && (
        <button
          onClick={() => setShowUsers(true)}
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] flex items-center justify-between group active:scale-[0.98] transition-all shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-2xl text-indigo-600 dark:text-indigo-400">
              <UsersIcon size={24} />
            </div>
            <div className="text-left">
              <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Gerenciar Equipe</p>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">Controle de Acesso</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-slate-300 dark:text-slate-700 group-hover:translate-x-1 transition-transform" />
        </button>
      )}

      <button
        onClick={logout}
        className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-black py-5 rounded-[2rem] flex items-center justify-center gap-3 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all active:scale-95 shadow-sm"
      >
        <LogOut size={22} />
        Sair da Conta
      </button>

      <div className="text-center text-[10px] text-slate-400 dark:text-slate-600 pt-8 font-bold uppercase tracking-widest space-y-1">
        <p>Agenda Sindical v1.2.0</p>
        <p>© 2026 Equipe de TI do Sindicato</p>
      </div>
    </div>
  );
};

export default Profile;
