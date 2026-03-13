import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { collection, addDoc, query, onSnapshot, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { useAuth } from '../firebase/auth';
import { Plus, X, Search, Filter, Scale, Trash2, ChevronRight } from 'lucide-react';
import { formatDate, cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { logActivity } from '../lib/activity';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { showToast } from '../lib/toast';
const Legal = () => {
    const { profile, isAdmin } = useAuth();
    const [cases, setCases] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Todos');
    const [selectedCase, setSelectedCase] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [caseToDelete, setCaseToDelete] = useState(null);
    const [newCase, setNewCase] = useState({
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
            setCases(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'cases'));
        return unsubscribe;
    }, []);
    const handleAddCase = async (e) => {
        e.preventDefault();
        const mockProfile = profile || { uid: 'dev', displayName: 'Dev Admin' };
        try {
            await addDoc(collection(db, 'cases'), {
                ...newCase,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            showToast('Processo criado com sucesso!');
            await logActivity(mockProfile.uid, mockProfile.displayName || 'Usuário', 'create', 'case', `Criou o processo: ${newCase.caseNumber}`);
            setShowAddModal(false);
            setNewCase({ caseNumber: '', companyName: '', workerName: '', status: 'Novo', priority: 'Média' });
        }
        catch (err) {
            showToast('Erro ao criar processo', 'error');
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
    const handleDeleteCase = async () => {
        if (!caseToDelete || !profile)
            return;
        try {
            await deleteDoc(doc(db, 'cases', caseToDelete.id));
            showToast('Processo excluído com sucesso!');
            await logActivity(profile.uid, profile.displayName || 'Admin', 'delete', 'case', `Excluiu: ${caseToDelete.caseNumber}`);
        }
        catch (err) {
            showToast('Erro ao excluir processo', 'error');
            handleFirestoreError(err, OperationType.DELETE, `cases/${caseToDelete.id}`);
        }
        setShowDeleteModal(false);
        setCaseToDelete(null);
    };
    return (_jsxs("div", { className: "space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500", children: [_jsxs("div", { className: "flex justify-between items-center px-2", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-black text-slate-900 dark:text-white tracking-tight", children: "Jur\u00EDdico" }), _jsx("p", { className: "text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest", children: "Gest\u00E3o de Processos" })] }), _jsx("button", { onClick: () => setShowAddModal(true), className: "bg-red-600 text-white p-3 rounded-2xl shadow-xl shadow-red-600/20 active:scale-95 transition-transform", children: _jsx(Plus, { size: 24 }) })] }), _jsxs("div", { className: "flex gap-3 px-2", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { className: "absolute left-4 top-1/2 -translate-y-1/2 text-slate-400", size: 18 }), _jsx("input", { type: "text", placeholder: "Buscar processos...", className: "w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-red-500 outline-none text-sm dark:text-white transition-all", value: searchTerm, onChange: e => setSearchTerm(e.target.value) })] }), _jsxs("div", { className: "relative group", children: [_jsxs("select", { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), className: "appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3 pr-10 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-400 outline-none focus:ring-2 focus:ring-red-500", children: [_jsx("option", { children: "Todos" }), _jsx("option", { children: "Novo" }), _jsx("option", { children: "Em Andamento" }), _jsx("option", { children: "Audi\u00EAncia Marcada" }), _jsx("option", { children: "Conclu\u00EDdo" })] }), _jsx(Filter, { size: 16, className: "absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" })] })] }), _jsx("div", { className: "space-y-4", children: filteredCases.length > 0 ? filteredCases.map((c) => (_jsxs(motion.div, { layout: true, onClick: () => setSelectedCase(c), className: "bg-white dark:bg-slate-900 rounded-[2rem] p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between group active:scale-[0.98] transition-transform cursor-pointer", children: [_jsxs("div", { className: "flex items-center gap-5", children: [_jsxs("div", { className: cn("p-4 rounded-2xl transition-colors shadow-inner relative", c.status === 'Audiência Marcada' ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"), children: [_jsx(Scale, { size: 28 }), c.priority === 'Alta' && (_jsx("div", { className: "absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" }))] }), _jsxs("div", { children: [_jsx("h3", { className: "font-black text-slate-900 dark:text-white text-lg leading-tight", children: c.workerName }), _jsx("p", { className: "text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 uppercase tracking-wider", children: c.companyName }), _jsxs("div", { className: "flex items-center gap-3 mt-3", children: [_jsx("span", { className: cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest", c.status === 'Audiência Marcada' ? "bg-red-100 text-red-600 dark:bg-red-900/30" :
                                                        c.status === 'Concluído' ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30" :
                                                            "bg-slate-100 text-slate-600 dark:bg-slate-800"), children: c.status }), _jsx("span", { className: cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest", c.priority === 'Alta' ? "bg-red-500 text-white" :
                                                        c.priority === 'Média' ? "bg-orange-500 text-white" :
                                                            "bg-blue-500 text-white"), children: c.priority }), _jsxs("span", { className: "text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest", children: ["#", c.caseNumber] })] })] })] }), _jsx(ChevronRight, { className: "text-slate-300 dark:text-slate-700 group-hover:translate-x-1 transition-transform" })] }, c.id))) : (_jsxs("div", { className: "text-center py-12", children: [_jsx(Search, { size: 48, className: "mx-auto text-slate-200 dark:text-slate-800 mb-4" }), _jsx("p", { className: "text-slate-400 dark:text-slate-600 font-medium", children: "Nenhum processo encontrado" })] })) }), showAddModal && (_jsx("div", { className: "fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[9999] flex items-end sm:items-center justify-center p-4", children: _jsxs(motion.div, { initial: { y: 100, opacity: 0 }, animate: { y: 0, opacity: 1 }, className: "bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h3", { className: "text-2xl font-black text-slate-900 dark:text-white tracking-tight", children: "Novo Processo" }), _jsx("button", { onClick: () => setShowAddModal(false), className: "bg-slate-100 dark:bg-slate-800 p-2 rounded-full text-slate-500", children: _jsx(X, { size: 20 }) })] }), _jsxs("form", { onSubmit: handleAddCase, className: "space-y-4", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2", children: "N\u00FAmero do Processo" }), _jsx("input", { type: "text", placeholder: "0000000-00.2026.5.00.0000", required: true, className: "w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-red-500 outline-none font-medium", value: newCase.caseNumber, onChange: e => setNewCase({ ...newCase, caseNumber: e.target.value }) })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2", children: "Nome do Trabalhador" }), _jsx("input", { type: "text", placeholder: "Nome Completo", required: true, className: "w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-red-500 outline-none font-medium", value: newCase.workerName, onChange: e => setNewCase({ ...newCase, workerName: e.target.value }) })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2", children: "Empresa / Reclamada" }), _jsx("input", { type: "text", placeholder: "Raz\u00E3o Social", required: true, className: "w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-red-500 outline-none font-medium", value: newCase.companyName, onChange: e => setNewCase({ ...newCase, companyName: e.target.value }) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2", children: "Data Audi\u00EAncia" }), _jsx("input", { type: "date", className: "w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-red-500 outline-none font-medium", value: newCase.hearingDate?.split('T')[0], onChange: e => setNewCase({ ...newCase, hearingDate: new Date(e.target.value).toISOString() }) })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2", children: "Prioridade" }), _jsxs("select", { className: "w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-red-500 outline-none font-medium appearance-none", value: newCase.priority, onChange: e => setNewCase({ ...newCase, priority: e.target.value }), children: [_jsx("option", { children: "Baixa" }), _jsx("option", { children: "M\u00E9dia" }), _jsx("option", { children: "Alta" })] })] })] }), _jsx("button", { type: "submit", className: "w-full bg-red-600 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-red-600/20 active:scale-95 transition-all mt-4", children: "Criar Processo" })] })] }) })), selectedCase && (_jsx("div", { className: "fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[9999] flex items-end sm:items-center justify-center p-4", children: _jsxs(motion.div, { initial: { y: 100, opacity: 0 }, animate: { y: 0, opacity: 1 }, className: "bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 space-y-6 shadow-2xl", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h3", { className: "text-2xl font-black text-slate-900 dark:text-white tracking-tight", children: "Detalhes do Processo" }), _jsx("button", { onClick: () => setSelectedCase(null), className: "bg-slate-100 dark:bg-slate-800 p-2 rounded-full text-slate-500", children: _jsx(X, { size: 20 }) })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl", children: [_jsx("div", { className: "p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl", children: _jsx(Scale, { size: 32 }) }), _jsxs("div", { children: [_jsx("p", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest", children: "N\u00FAmero do Processo" }), _jsx("p", { className: "text-lg font-black text-slate-900 dark:text-white", children: selectedCase.caseNumber })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "p-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl", children: [_jsx("p", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1", children: "Trabalhador" }), _jsx("p", { className: "font-bold text-slate-900 dark:text-white", children: selectedCase.workerName })] }), _jsxs("div", { className: "p-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl", children: [_jsx("p", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1", children: "Empresa" }), _jsx("p", { className: "font-bold text-slate-900 dark:text-white", children: selectedCase.companyName })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "p-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl", children: [_jsx("p", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1", children: "Status" }), _jsx("span", { className: "inline-block bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-black uppercase px-2 py-1 rounded-lg tracking-widest", children: selectedCase.status })] }), _jsxs("div", { className: "p-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl", children: [_jsx("p", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1", children: "Prioridade" }), _jsx("span", { className: cn("inline-block text-[10px] font-black uppercase px-2 py-1 rounded-lg tracking-widest", selectedCase.priority === 'Alta' ? "bg-red-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"), children: selectedCase.priority })] })] }), _jsxs("div", { className: "p-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl", children: [_jsx("p", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1", children: "Pr\u00F3xima Audi\u00EAncia" }), _jsx("p", { className: "font-bold text-slate-900 dark:text-white", children: formatDate(selectedCase.hearingDate) })] }), isAdmin && (_jsxs("button", { onClick: () => {
                                        setCaseToDelete(selectedCase);
                                        setShowDeleteModal(true);
                                    }, className: "w-full flex items-center justify-center gap-2 text-red-500 font-bold text-sm py-4 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-colors", children: [_jsx(Trash2, { size: 18 }), "Excluir Processo"] }))] })] }) })), _jsx(ConfirmDeleteModal, { isOpen: showDeleteModal, title: caseToDelete?.caseNumber || caseToDelete?.workerName || '', description: "Processo e anexos exclu\u00EDdos permanentemente.", onClose: () => setShowDeleteModal(false), onConfirm: handleDeleteCase, type: "case" })] }));
};
export default Legal;
