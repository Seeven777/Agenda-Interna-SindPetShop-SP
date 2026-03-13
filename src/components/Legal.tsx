import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, onSnapshot, orderBy, deleteDoc, doc, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { useAuth } from '../firebase/auth';
import { LegalCase } from '../types';
import { Plus, X, Search, Filter, Scale, Trash2, ChevronRight } from 'lucide-react';
import { formatDate, cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { logActivity } from '../lib/activity';
import ConfirmDeleteModal from './ConfirmDeleteModal';

const Legal: React.FC = () => {
  const { profile, isAdmin } = useAuth();
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [selectedCase, setSelectedCase] = useState<LegalCase | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [caseToDelete, setCaseToDelete] = useState<LegalCase | null>(null);
  
  const [newCase, setNewCase] = useState<Partial<LegalCase>>({
    caseNumber: '',
    companyName: '',
    workerName: '',
    status: 'Novo',
    priority: 'Média',
    hearingDate: new Date().toISOString(),
    deadline: new Date().toISOString(),
  });

  useEffect(() => {
    const q = query(collection(db, 'cases'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setCases(snap.docs.map(d => ({ id: d.id, ...d.data() } as LegalCase)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'cases'));
    return unsubscribe;
  }, []);

  const handleAddCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      await addDoc(collection(db, 'cases'), {
        ...newCase,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      await logActivity(
        profile.uid,
        profile.displayName || 'Usuário',
        'create',
        'case',
        `Criou o processo: ${newCase.caseNumber}`
      );

      setShowAddModal(false);
      setNewCase({ caseNumber: '', companyName: '', workerName: '', status: 'Novo', priority: 'Média' });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'cases');
    }
  };

  const filteredCases = cases.filter(c => {
    const matchesSearch = c.workerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Todos' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center px-2">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Jurídico</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest">Gestão de Processos</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-red-600 text-white p-3 rounded-2xl shadow-xl shadow-red-600/20 active:scale-95 transition-transform"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="flex gap-3 px-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" placeholder="Buscar processos..." 
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-red-500 outline-none text-sm dark:text-white transition-all"
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative group">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3 pr-10 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-400 outline-none focus:ring-2 focus:ring-red-500"
          >
            <option>Todos</option>
            <option>Novo</option>
            <option>Em Andamento</option>
            <option>Audiência Marcada</option>
            <option>Concluído</option>
          </select>
          <Filter size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div className="space-y-4">
        {filteredCases.length > 0 ? filteredCases.map((c) => (
          <motion.div 
            layout
            key={c.id} 
            onClick={() => setSelectedCase(c)}
            className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between group active:scale-[0.98] transition-transform cursor-pointer"
          >
            <div className="flex items-center gap-5">
              <div className={cn(
                "p-4 rounded-2xl transition-colors shadow-inner relative",
                c.status === 'Audiência Marcada' ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
              )}>
                <Scale size={28} />
                {c.priority === 'Alta' && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></div>
                )}
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-lg leading-tight">{c.workerName}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 uppercase tracking-wider">{c.companyName}</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className={cn(
                    "text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest",
                    c.status === 'Audiência Marcada' ? "bg-red-100 text-red-600 dark:bg-red-900/30" : 
                    c.status === 'Concluído' ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30" :
                    "bg-slate-100 text-slate-600 dark:bg-slate-800"
                  )}>
                    {c.status}
                  </span>
                  <span className={cn(
                    "text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest",
                    c.priority === 'Alta' ? "bg-red-500 text-white" :
                    c.priority === 'Média' ? "bg-orange-500 text-white" :
                    "bg-blue-500 text-white"
                  )}>
                    {c.priority}
                  </span>
                  <span className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">#{c.caseNumber}</span>
                </div>
              </div>
            </div>
            <ChevronRight className="text-slate-300 dark:text-slate-700 group-hover:translate-x-1 transition-transform" />
          </motion.div>
        )) : (
          <div className="text-center py-12">
            <Search size={48} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" />
            <p className="text-slate-400 dark:text-slate-600 font-medium">Nenhum processo encontrado</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Novo Processo</h3>
              <button onClick={() => setShowAddModal(false)} className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full text-slate-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddCase} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Número do Processo</label>
                <input 
                  type="text" placeholder="0000000-00.2026.5.00.0000" required
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-red-500 outline-none font-medium"
                  value={newCase.caseNumber} onChange={e => setNewCase({...newCase, caseNumber: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nome do Trabalhador</label>
                <input 
                  type="text" placeholder="Nome Completo" required
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-red-500 outline-none font-medium"
                  value={newCase.workerName} onChange={e => setNewCase({...newCase, workerName: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Empresa / Reclamada</label>
                <input 
                  type="text" placeholder="Razão Social" required
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-red-500 outline-none font-medium"
                  value={newCase.companyName} onChange={e => setNewCase({...newCase, companyName: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Data Audiência</label>
                  <input 
                    type="date"
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-red-500 outline-none font-medium"
                    value={newCase.hearingDate?.split('T')[0]} onChange={e => setNewCase({...newCase, hearingDate: new Date(e.target.value).toISOString()})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Prioridade</label>
                  <select 
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-red-500 outline-none font-medium appearance-none"
                    value={newCase.priority} onChange={e => setNewCase({...newCase, priority: e.target.value as any})}
                  >
                    <option>Baixa</option>
                    <option>Média</option>
                    <option>Alta</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-red-600 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-red-600/20 active:scale-95 transition-all mt-4">
                Criar Processo
              </button>
            </form>
          </motion.div>
        </div>
      )}
      {selectedCase && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 space-y-6 shadow-2xl"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Detalhes do Processo</h3>
              <button onClick={() => setSelectedCase(null)} className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full text-slate-500"><X size={20} /></button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl">
                  <Scale size={32} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Número do Processo</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white">{selectedCase.caseNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Trabalhador</p>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedCase.workerName}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Empresa</p>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedCase.companyName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                  <span className="inline-block bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-black uppercase px-2 py-1 rounded-lg tracking-widest">
                    {selectedCase.status}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Prioridade</p>
                  <span className={cn(
                    "inline-block text-[10px] font-black uppercase px-2 py-1 rounded-lg tracking-widest",
                    selectedCase.priority === 'Alta' ? "bg-red-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  )}>
                    {selectedCase.priority}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Próxima Audiência</p>
                <p className="font-bold text-slate-900 dark:text-white">{formatDate(selectedCase.hearingDate)}</p>
              </div>

              {isAdmin && (
                <button 
                  onClick={() => {
                    setCaseToDelete(selectedCase!);
                    setShowDeleteModal(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 text-red-500 font-bold text-sm py-4 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-colors"
                >
                  <Trash2 size={18} />
                  Excluir Processo
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Legal;
