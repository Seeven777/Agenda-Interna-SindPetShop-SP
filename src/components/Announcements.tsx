import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, onSnapshot, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { useAuth } from '../firebase/auth';
import { Announcement } from '../types';
import { Plus, X, Megaphone, Trash2, User, Search } from 'lucide-react';
import { formatDate, cn, getRelativeTime } from '../lib/utils';
import { motion } from 'motion/react';
import { logActivity } from '../lib/activity';

const Announcements: React.FC = () => {
  const { profile, isAdmin } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newAnn, setNewAnn] = useState({ title: '', content: '', isUrgent: false });

  useEffect(() => {
    const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setAnnouncements(snap.docs.map(d => ({ id: d.id, ...d.data() } as Announcement)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'announcements'));
    return unsubscribe;
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !isAdmin) return;
    try {
      await addDoc(collection(db, 'announcements'), {
        ...newAnn,
        authorId: profile.uid,
        authorName: profile.displayName,
        createdAt: new Date().toISOString(),
      });

      await logActivity(
        profile.uid,
        profile.displayName || 'Usuário',
        'create',
        'announcement',
        `Postou um comunicado: ${newAnn.title}`
      );

      setShowAddModal(false);
      setNewAnn({ title: '', content: '', isUrgent: false });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'announcements');
    }
  };

  const filteredAnnouncements = announcements.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center px-2">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Comunicados</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest">Informativos Oficiais</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 text-white p-3 rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-95 transition-transform"
          >
            <Plus size={24} />
          </button>
        )}
      </div>

      <div className="px-2">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" placeholder="Buscar comunicados..." 
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-white transition-all"
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredAnnouncements.length > 0 ? filteredAnnouncements.map((ann) => (
          <motion.div 
            layout
            key={ann.id} 
            className={cn(
              "bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden",
              ann.isUrgent && "border-red-200 dark:border-red-900/50"
            )}
          >
            {ann.isUrgent && (
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
            )}
            <div className="flex justify-between items-start mb-4">
              <div className={cn(
                "flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                ann.isUrgent ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" : "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
              )}>
                <Megaphone size={14} />
                <span>{ann.isUrgent ? 'Urgente' : 'Informativo'}</span>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-wider">{getRelativeTime(ann.createdAt)}</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 leading-tight tracking-tight">{ann.title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6 font-medium">{ann.content}</p>
            <div className="flex items-center justify-between pt-5 border-t border-slate-50 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700">
                  <User size={14} className="text-slate-400" />
                </div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{ann.authorName}</span>
              </div>
              {isAdmin && (
                <button onClick={async () => {
                  if(window.confirm('Excluir este comunicado?') && profile) {
                    try {
                      await deleteDoc(doc(db, 'announcements', ann.id!));
                      await logActivity(
                        profile.uid,
                        profile.displayName || 'Usuário',
                        'delete',
                        'announcement',
                        `Excluiu o comunicado: ${ann.title}`
                      );
                    } catch (err) {
                      handleFirestoreError(err, OperationType.DELETE, `announcements/${ann.id}`);
                    }
                  }
                }} className="text-slate-300 dark:text-slate-700 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </motion.div>
        )) : (
          <div className="text-center py-12">
            <Megaphone size={48} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" />
            <p className="text-slate-400 dark:text-slate-600 font-medium">Nenhum comunicado recente</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 space-y-6 shadow-2xl"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Novo Comunicado</h3>
              <button onClick={() => setShowAddModal(false)} className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full text-slate-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Título</label>
                <input 
                  type="text" placeholder="Ex: Reajuste Salarial 2026" required
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  value={newAnn.title} onChange={e => setNewAnn({...newAnn, title: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Conteúdo</label>
                <textarea 
                  placeholder="Escreva o comunicado aqui..." required rows={4}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  value={newAnn.content} onChange={e => setNewAnn({...newAnn, content: e.target.value})}
                />
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <input 
                  type="checkbox" id="urgent"
                  className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  checked={newAnn.isUrgent} onChange={e => setNewAnn({...newAnn, isUrgent: e.target.checked})}
                />
                <label htmlFor="urgent" className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Marcar como Urgente</label>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-indigo-600/20 active:scale-95 transition-all mt-4">
                Publicar Comunicado
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Announcements;
