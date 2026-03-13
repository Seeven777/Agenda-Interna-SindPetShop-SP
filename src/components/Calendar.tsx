import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, onSnapshot, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { useAuth } from '../firebase/auth';
import { UnionEvent } from '../types';
import { Plus, X, MapPin, Clock, Tag, Trash2, Calendar as CalendarIcon, Search } from 'lucide-react';
import { formatDate, cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { logActivity } from '../lib/activity';
import ConfirmDeleteModal from './ConfirmDeleteModal';

const Calendar: React.FC = () => {
  const { profile, isAdmin } = useAuth();
  const [events, setEvents] = useState<UnionEvent[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<UnionEvent | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<UnionEvent>>({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    location: '',
    category: 'Atividades Sindicais',
    status: 'Agendado',
  });

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() } as UnionEvent)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'events'));
    return unsubscribe;
  }, []);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    try {
      const docRef = await addDoc(collection(db, 'events'), {
        ...newEvent,
        responsibleUserId: profile.uid,
        createdAt: new Date().toISOString(),
        createdBy: profile.uid,
      });
      
      await logActivity(
        profile.uid,
        profile.displayName || 'Usuário',
        'create',
        'event',
        `Criou o evento: ${newEvent.title}`
      );

      setShowAddModal(false);
      setNewEvent({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        location: '',
        category: 'Atividades Sindicais',
        status: 'Agendado',
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'events');
    }
  };

  // handleDelete removed - now handled in modal onConfirm

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center px-2">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Agenda</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest">Compromissos do Sindicato</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white p-3 rounded-2xl shadow-xl shadow-blue-600/20 active:scale-95 transition-transform"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="px-2">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" placeholder="Buscar eventos..." 
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-white transition-all"
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredEvents.length > 0 ? filteredEvents.map((event) => (
          <motion.div 
            layout
            key={event.id} 
            className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-widest",
                  event.category === 'Jurídico' ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" :
                  event.category === 'Atividades Sindicais' ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" :
                  "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                )}>
                  {event.category}
                </span>
                <span className={cn(
                  "text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-widest",
                  event.status === 'Concluído' ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" :
                  event.status === 'Cancelado' ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" :
                  "bg-blue-50 text-blue-600 dark:bg-blue-900/10 dark:text-blue-500"
                )}>
                  {event.status}
                </span>
              </div>
              {isAdmin && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setEventToDelete(event);
                    setShowDeleteModal(true);
                  }}
                  className="text-slate-300 dark:text-slate-700 hover:text-red-500 transition-colors p-1 -m-1"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">{event.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 font-medium line-clamp-2">{event.description}</p>
            
            <div className="flex flex-wrap gap-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-blue-500" />
                <span>{formatDate(event.date)} às {event.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-blue-500" />
                <span className="truncate max-w-[150px]">{event.location || 'Sem local definido'}</span>
              </div>
            </div>
          </motion.div>
        )) : (
          <div className="text-center py-12">
            <CalendarIcon size={48} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" />
            <p className="text-slate-400 dark:text-slate-600 font-medium">Nenhum evento agendado</p>
          </div>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        title={eventToDelete?.title || ''}
        description="Este evento será excluído permanentemente."
        onClose={() => {
          setShowDeleteModal(false);
          setEventToDelete(null);
        }}
        onConfirm={async () => {
          if (eventToDelete && profile) {
            try {
              await deleteDoc(doc(db, 'events', eventToDelete.id!));
              await logActivity(
                profile.uid,
                profile.displayName || 'Usuário',
                'delete',
                'event',
                `Excluiu o evento: ${eventToDelete.title}`
              );
            } catch (err) {
              handleFirestoreError(err, OperationType.DELETE, `events/${eventToDelete.id}`);
            }
            setShowDeleteModal(false);
            setEventToDelete(null);
          }
        }}
        type="event"
      />

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 space-y-6 shadow-2xl"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Novo Evento</h3>
              <button onClick={() => setShowAddModal(false)} className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full text-slate-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Título</label>
                <input 
                  type="text" placeholder="Ex: Assembleia Geral" required
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Descrição</label>
                <textarea 
                  placeholder="Detalhes do evento..."
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none font-medium min-h-[100px]"
                  value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Data</label>
                  <input 
                    type="date" required
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Hora</label>
                  <input 
                    type="time" required
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Local</label>
                <input 
                  type="text" placeholder="Ex: Sede do Sindicato"
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Categoria</label>
                <div className="flex flex-wrap gap-2">
                  {['Atividades Sindicais', 'Jurídico', 'Administrativo', 'Fiscalização', 'Eventos'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewEvent({...newEvent, category: cat as any})}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        newEvent.category === cat 
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Status</label>
                <div className="flex flex-wrap gap-2">
                  {['Agendado', 'Concluído', 'Cancelado'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setNewEvent({...newEvent, status: st as any})}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        newEvent.status === st 
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                      )}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-blue-600/20 active:scale-95 transition-all mt-4">
                Salvar Evento
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
