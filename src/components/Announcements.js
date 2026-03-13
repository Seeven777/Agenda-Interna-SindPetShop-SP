import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { collection, addDoc, query, onSnapshot, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { useAuth } from '../firebase/auth';
import { Plus, X, Megaphone, Trash2, User, Search } from 'lucide-react';
import { cn, getRelativeTime } from '../lib/utils';
import { motion } from 'framer-motion';
import { logActivity } from '../lib/activity';
import ConfirmDeleteModal from './ConfirmDeleteModal';
const Announcements = () => {
    const { profile, isAdmin } = useAuth();
    const [announcements, setAnnouncements] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [annToDelete, setAnnToDelete] = useState(null);
    const [newAnn, setNewAnn] = useState({ title: '', content: '', isUrgent: false });
    useEffect(() => {
        const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snap) => {
            setAnnouncements(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'announcements'));
        return unsubscribe;
    }, []);
    const handleAdd = async (e) => {
        e.preventDefault();
        if (!profile || !isAdmin)
            return;
        try {
            await addDoc(collection(db, 'announcements'), {
                ...newAnn,
                authorId: profile.uid,
                authorName: profile.displayName,
                createdAt: new Date().toISOString(),
            });
            await logActivity(profile.uid, profile.displayName || 'Usuário', 'create', 'announcement', `Postou um comunicado: ${newAnn.title}`);
            setShowAddModal(false);
            setNewAnn({ title: '', content: '', isUrgent: false });
        }
        catch (err) {
            handleFirestoreError(err, OperationType.CREATE, 'announcements');
        }
    };
    const filteredAnnouncements = announcements.filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.content.toLowerCase().includes(searchTerm.toLowerCase()));
    return (_jsxs("div", { className: "space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500", children: [_jsxs("div", { className: "flex justify-between items-center px-2", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-black text-slate-900 dark:text-white tracking-tight", children: "Comunicados" }), _jsx("p", { className: "text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest", children: "Informativos Oficiais" })] }), isAdmin && (_jsx("button", { onClick: () => setShowAddModal(true), className: "bg-indigo-600 text-white p-3 rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-95 transition-transform", children: _jsx(Plus, { size: 24 }) }))] }), _jsx("div", { className: "px-2", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-4 top-1/2 -translate-y-1/2 text-slate-400", size: 18 }), _jsx("input", { type: "text", placeholder: "Buscar comunicados...", className: "w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-white transition-all", value: searchTerm, onChange: e => setSearchTerm(e.target.value) })] }) }), _jsx("div", { className: "space-y-4", children: filteredAnnouncements.length > 0 ? filteredAnnouncements.map((ann) => (_jsxs(motion.div, { layout: true, className: cn("bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden", ann.isUrgent && "border-red-200 dark:border-red-900/50"), children: [ann.isUrgent && (_jsx("div", { className: "absolute top-0 left-0 w-full h-1 bg-red-500" })), _jsxs("div", { className: "flex justify-between items-start mb-4", children: [_jsxs("div", { className: cn("flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", ann.isUrgent ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" : "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"), children: [_jsx(Megaphone, { size: 14 }), _jsx("span", { children: ann.isUrgent ? 'Urgente' : 'Informativo' })] }), _jsx("span", { className: "text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-wider", children: getRelativeTime(ann.createdAt) })] }), _jsx("h3", { className: "text-xl font-black text-slate-900 dark:text-white mb-3 leading-tight tracking-tight", children: ann.title }), _jsx("p", { className: "text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6 font-medium", children: ann.content }), _jsxs("div", { className: "flex items-center justify-between pt-5 border-t border-slate-50 dark:border-slate-800", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700", children: _jsx(User, { size: 14, className: "text-slate-400" }) }), _jsx("span", { className: "text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider", children: ann.authorName })] }), isAdmin && (_jsx("button", { onClick: (e) => {
                                        e.stopPropagation();
                                        setAnnToDelete(ann);
                                        setShowDeleteModal(true);
                                    }, className: "text-slate-300 dark:text-slate-700 hover:text-red-500 transition-colors p-1 -m-1", children: _jsx(Trash2, { size: 18 }) }))] })] }, ann.id))) : (_jsxs("div", { className: "text-center py-12", children: [_jsx(Megaphone, { size: 48, className: "mx-auto text-slate-200 dark:text-slate-800 mb-4" }), _jsx("p", { className: "text-slate-400 dark:text-slate-600 font-medium", children: "Nenhum comunicado recente" })] })) }), _jsx(ConfirmDeleteModal, { isOpen: showDeleteModal, title: annToDelete?.title || '', description: "Este comunicado ser\u00E1 exclu\u00EDdo permanentemente.", onClose: () => {
                    setShowDeleteModal(false);
                    setAnnToDelete(null);
                }, onConfirm: async () => {
                    if (annToDelete && profile) {
                        try {
                            await deleteDoc(doc(db, 'announcements', annToDelete.id));
                            await logActivity(profile.uid, profile.displayName || 'Usuário', 'delete', 'announcement', `Excluiu o comunicado: ${annToDelete.title}`);
                        }
                        catch (err) {
                            handleFirestoreError(err, OperationType.DELETE, `announcements/${annToDelete.id}`);
                        }
                        setShowDeleteModal(false);
                        setAnnToDelete(null);
                    }
                }, type: "announcement" }), showAddModal && (_jsx("div", { className: "fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4", children: _jsxs(motion.div, { initial: { y: 100, opacity: 0 }, animate: { y: 0, opacity: 1 }, className: "bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 space-y-6 shadow-2xl", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h3", { className: "text-2xl font-black text-slate-900 dark:text-white tracking-tight", children: "Novo Comunicado" }), _jsx("button", { onClick: () => setShowAddModal(false), className: "bg-slate-100 dark:bg-slate-800 p-2 rounded-full text-slate-500", children: _jsx(X, { size: 20 }) })] }), _jsxs("form", { onSubmit: handleAdd, className: "space-y-4", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2", children: "T\u00EDtulo" }), _jsx("input", { type: "text", placeholder: "Ex: Reajuste Salarial 2026", required: true, className: "w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 outline-none font-medium", value: newAnn.title, onChange: e => setNewAnn({ ...newAnn, title: e.target.value }) })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2", children: "Conte\u00FAdo" }), _jsx("textarea", { placeholder: "Escreva o comunicado aqui...", required: true, rows: 4, className: "w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 outline-none font-medium", value: newAnn.content, onChange: e => setNewAnn({ ...newAnn, content: e.target.value }) })] }), _jsxs("div", { className: "flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl", children: [_jsx("input", { type: "checkbox", id: "urgent", className: "w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500", checked: newAnn.isUrgent, onChange: e => setNewAnn({ ...newAnn, isUrgent: e.target.checked }) }), _jsx("label", { htmlFor: "urgent", className: "text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest", children: "Marcar como Urgente" })] }), _jsx("button", { type: "submit", className: "w-full bg-indigo-600 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-indigo-600/20 active:scale-95 transition-all mt-4", children: "Publicar Comunicado" })] })] }) }))] }));
};
export default Announcements;
