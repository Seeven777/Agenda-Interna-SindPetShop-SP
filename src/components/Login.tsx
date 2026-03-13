import React from 'react';
import { useAuth } from '../firebase/auth';
import { Scale } from 'lucide-react';

const Login: React.FC = () => {
  const { signIn } = useAuth();

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-8 text-center transition-colors duration-500">
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-indigo-600 blur-3xl opacity-20 dark:opacity-40 rounded-full"></div>
        <div className="relative bg-indigo-600 p-6 rounded-[2.5rem] shadow-2xl shadow-indigo-600/40 animate-bounce-subtle">
          <Scale size={64} className="text-white" />
        </div>
      </div>
      
      <div className="space-y-2 mb-12">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
          Agenda Sindical
        </h1>
        <p className="text-xs font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em]">
          Hub Operacional Interno
        </p>
      </div>

      <div className="w-full max-w-xs space-y-4">
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8">
          Bem-vindo ao portal de gestão do sindicato. Acesse para gerenciar processos, tarefas e agenda.
        </p>
        
        <button
          onClick={signIn}
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-black py-5 px-6 rounded-[2rem] flex items-center justify-center gap-4 shadow-xl shadow-slate-200/50 dark:shadow-none hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 group"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="uppercase tracking-widest text-[11px]">Entrar com Google</span>
        </button>
      </div>

      <div className="mt-20 space-y-2">
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-700 uppercase tracking-widest">
          Uso Restrito e Autorizado
        </p>
        <div className="flex items-center justify-center gap-4 opacity-30 grayscale">
          <div className="h-px w-8 bg-slate-400"></div>
          <span className="text-[8px] font-black uppercase tracking-widest">v1.2.0</span>
          <div className="h-px w-8 bg-slate-400"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
