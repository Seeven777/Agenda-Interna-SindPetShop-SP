import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { UnionEvent, LegalCase, Task, Announcement, Activity as ActivityType } from '../types';
import { Calendar, Scale, CheckSquare, Megaphone, Clock, AlertCircle, TrendingUp, Users, FileText, Activity, History } from 'lucide-react';
import { formatDate, cn, getRelativeTime } from '../lib/utils';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { View } from './Layout';

import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { useAuth } from '../firebase/auth';

interface DashboardProps {
  setView: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  const { profile } = useAuth();
  const [events, setEvents] = useState<UnionEvent[]>([]);
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [stats, setStats] = useState({ totalCases: 0, activeTasks: 0, upcomingEvents: 0 });

  useEffect(() => {
    const qEvents = query(collection(db, 'events'), orderBy('date', 'asc'), limit(3));
    const qAnnouncements = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'), limit(2));

    const unsubEvents = onSnapshot(qEvents, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as UnionEvent));
      setEvents(data);
      setStats(prev => ({ ...prev, upcomingEvents: data.length }));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'events'));
    
    const unsubCases = onSnapshot(query(collection(db, 'cases')), (snap) => {
      const allCases = snap.docs.map(d => ({ id: d.id, ...d.data() } as LegalCase));
      setCases(allCases.filter(c => c.status === 'Audiência Marcada').slice(0, 3));
      setStats(prev => ({ ...prev, totalCases: snap.size }));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'cases'));

    const unsubTasks = onSnapshot(query(collection(db, 'tasks'), where('status', '!=', 'Concluído')), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Task));
      setTasks(data.slice(0, 3));
      setStats(prev => ({ ...prev, activeTasks: snap.size }));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'tasks'));

    const unsubAnnouncements = onSnapshot(qAnnouncements, (snap) => {
      setAnnouncements(snap.docs.map(d => ({ id: d.id, ...d.data() } as Announcement)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'announcements'));

    const qActivities = query(collection(db, 'activityLog'), orderBy('timestamp', 'desc'), limit(5));
    const unsubActivities = onSnapshot(qActivities, (snap) => {
      setActivities(snap.docs.map(d => ({ id: d.id, ...d.data() } as ActivityType)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'activityLog'));

    return () => {
      unsubEvents();
      unsubCases();
      unsubTasks();
      unsubAnnouncements();
      unsubActivities();
    };
  }, []);

  const chartData = [
    { name: 'Casos', value: stats.totalCases, color: '#ef4444' },
    { name: 'Tarefas', value: stats.activeTasks, color: '#10b981' },
    { name: 'Agenda', value: stats.upcomingEvents, color: '#3b82f6' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-8">
      {/* Welcome Header */}
      <div className="flex flex-col gap-1 px-2">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Olá, {profile?.displayName?.split(' ')[0] || 'Bom dia'}! 👋
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Resumo Operacional</p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4 px-2 overflow-x-auto no-scrollbar pb-2">
        {[
          { label: 'Novo Processo', icon: Scale, color: 'bg-red-500', view: 'legal' as View },
          { label: 'Nova Tarefa', icon: CheckSquare, color: 'bg-emerald-500', view: 'tasks' as View },
          { label: 'Agendar Evento', icon: Calendar, color: 'bg-blue-500', view: 'calendar' as View },
          { label: 'Postar Aviso', icon: Megaphone, color: 'bg-indigo-500', view: 'announcements' as View },
        ].map((action, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.95 }}
            onClick={() => setView(action.view)}
            className="flex flex-col items-center gap-2 shrink-0"
          >
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg", action.color)}>
              <action.icon size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{action.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="relative overflow-hidden bg-red-600 p-6 rounded-[2.5rem] text-white shadow-xl shadow-red-600/20 flex flex-col justify-between h-44"
        >
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          <div className="bg-white/20 backdrop-blur-md w-12 h-12 rounded-2xl flex items-center justify-center">
            <Scale size={24} />
          </div>
          <div>
            <span className="text-5xl font-black tracking-tighter">{stats.totalCases}</span>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mt-1">Processos Ativos</p>
          </div>
        </motion.div>

        <div className="grid grid-rows-2 gap-4">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="relative overflow-hidden bg-emerald-500 p-5 rounded-[2rem] text-white shadow-xl shadow-emerald-500/20 flex items-center gap-4"
          >
            <div className="bg-white/20 backdrop-blur-md w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
              <CheckSquare size={20} />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tighter block leading-none">{stats.activeTasks}</span>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-80">Tarefas</p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="relative overflow-hidden bg-blue-500 p-5 rounded-[2rem] text-white shadow-xl shadow-blue-500/20 flex items-center gap-4"
          >
            <div className="bg-white/20 backdrop-blur-md w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
              <Calendar size={20} />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tighter block leading-none">{stats.upcomingEvents}</span>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-80">Eventos</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-widest">Métricas da Semana</h3>
          <TrendingUp size={18} className="text-blue-600" />
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:opacity-5" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 900 }} />
              <Bar dataKey="value" radius={[12, 12, 12, 12]} barSize={48}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Announcements Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Megaphone size={18} className="text-indigo-600" />
            <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Comunicados</h2>
          </div>
          <button className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Ver Todos</button>
        </div>
        <div className="space-y-3">
          {announcements.length > 0 ? announcements.map((item) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              key={item.id} 
              className="bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-600 p-5 rounded-r-[2rem]"
            >
              <h3 className="font-black text-indigo-900 dark:text-indigo-300 text-sm leading-tight">{item.title}</h3>
              <p className="text-xs text-indigo-800 dark:text-indigo-400/80 line-clamp-2 mt-2 font-bold leading-relaxed">{item.content}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-500 uppercase tracking-widest">{getRelativeTime(item.createdAt)}</span>
              </div>
            </motion.div>
          )) : (
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] p-8 text-center border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Nenhum comunicado recente</p>
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-blue-600" />
            <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Próximos Eventos</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {events.length > 0 ? events.map((event) => (
            <div key={event.id} className="bg-white dark:bg-slate-900 p-5 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-5">
              <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 w-16 h-16 rounded-3xl flex flex-col items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
                <span className="text-[10px] font-black uppercase tracking-tighter">{new Date(event.date).toLocaleDateString('pt-BR', { month: 'short' })}</span>
                <span className="text-2xl font-black leading-none">{new Date(event.date).getDate()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-slate-900 dark:text-white truncate tracking-tight">{event.title}</h3>
                <div className="flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase mt-2 tracking-widest">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{event.time}</span>
                  </div>
                  <span className="w-1.5 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full"></span>
                  <span>{event.category}</span>
                </div>
              </div>
            </div>
          )) : (
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] p-8 text-center border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Nenhum evento agendado</p>
            </div>
          )}
        </div>
      </section>

      {/* Legal Alerts */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <Scale size={18} className="text-red-600" />
          <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Audiências Urgentes</h2>
        </div>
        <div className="space-y-3">
          {cases.length > 0 ? cases.map((c) => (
            <div key={c.id} className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-6 rounded-[2.5rem] flex items-start gap-5">
              <div className="bg-red-600 p-3 rounded-2xl text-white mt-1 shadow-lg shadow-red-600/20">
                <AlertCircle size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-red-900 dark:text-red-400 leading-tight tracking-tight">{c.workerName}</h3>
                <p className="text-[10px] font-black text-red-700 dark:text-red-500 uppercase tracking-widest mt-2">Empresa: {c.companyName}</p>
                <div className="mt-4">
                  <span className="text-[10px] font-black text-red-600 bg-red-100 dark:bg-red-900/50 px-4 py-1.5 rounded-full uppercase tracking-widest">
                    Audiência: {formatDate(c.hearingDate)}
                  </span>
                </div>
              </div>
            </div>
          )) : (
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] p-8 text-center border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Nenhuma audiência marcada</p>
            </div>
          )}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <History size={18} className="text-slate-600 dark:text-slate-400" />
          <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Atividade Recente</h2>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
          {activities.length > 0 ? activities.map((act) => (
            <div key={act.id} className="flex gap-4 items-start">
              <div className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                act.type === 'create' ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30" :
                act.type === 'delete' ? "bg-red-100 text-red-600 dark:bg-red-900/30" :
                "bg-blue-100 text-blue-600 dark:bg-blue-900/30"
              )}>
                {act.resource === 'case' ? <Scale size={14} /> :
                 act.resource === 'task' ? <CheckSquare size={14} /> :
                 act.resource === 'event' ? <Calendar size={14} /> :
                 <Megaphone size={14} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  <span className="text-blue-600 dark:text-blue-400">{act.userName}</span> {act.details}
                </p>
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mt-1">
                  {act.timestamp?.toDate ? getRelativeTime(act.timestamp.toDate().toISOString()) : 'Agora mesmo'}
                </p>
              </div>
            </div>
          )) : (
            <p className="text-center text-xs text-slate-400 font-bold uppercase tracking-widest py-4">Sem atividades registradas</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
