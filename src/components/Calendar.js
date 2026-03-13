import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { collection, addDoc, query, onSnapshot, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { useAuth } from '../firebase/auth';
import { Plus, X, MapPin, Clock, Trash2, Calendar as CalendarIcon, Search } from 'lucide-react';
import { formatDate, cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { logActivity } from '../lib/activity';
import ConfirmDeleteModal from './ConfirmDeleteModal';
const Calendar = () => {
    const { profile, isAdmin } = useAuth();
    const [events, setEvents] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);
    const [newEvent, setNewEvent] = useState({
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
            setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'events'));
        return unsubscribe;
    }, []);
    const handleAddEvent = async (e) => {
        e.preventDefault();
        if (!profile)
            return;
        try {
            const docRef = await addDoc(collection(db, 'events'), {
                ...newEvent,
                responsibleUserId: profile.uid,
                createdAt: new Date().toISOString(),
                createdBy: profile.uid,
            });
            await logActivity(profile.uid, profile.displayName || 'Usuário', 'create', 'event', `Criou o evento: ${newEvent.title}`);
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
        }
        catch (err) {
            handleFirestoreError(err, OperationType.CREATE, 'events');
        }
    };
    // handleDelete removed - now handled in modal onConfirm
    const filteredEvents = events.filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.location.toLowerCase().includes(searchTerm.toLowerCase()));
    return (_jsxs("div", { className: "space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500", children: [_jsxs("div", { className: "flex justify-between items-center px-2", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-black text-slate-900 dark:text-white tracking-tight", children: "Agenda" }), _jsx("p", { className: "text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest", children: "Compromissos do Sindicato" })] }), _jsx("button", { onClick: () => setShowAddModal(true), className: "bg-blue-600 text-white p-3 rounded-2xl shadow-xl shadow-blue-600/20 active:scale-95 transition-transform", children: _jsx(Plus, { size: 24 }) })] }), _jsx("div", { className: "px-2", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-4 top-1/2 -translate-y-1/2 text-slate-400", size: 18 }), _jsx("input", { type: "text", placeholder: "Buscar eventos...", className: "w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-white transition-all", value: searchTerm, onChange: e => setSearchTerm(e.target.value) })] }) }), _jsx("div", { className: "space-y-4", children: filteredEvents.length > 0 ? filteredEvents.map((event) => (_jsxs(motion.div, { layout: true, className: "bg-white dark:bg-slate-900 rounded-[2rem] p-5 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group", children: [_jsxs("div", { className: "flex justify-between items-start mb-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: cn("text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-widest", event.category === 'Jurídico' ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" :
                                                event.category === 'Atividades Sindicais' ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" :
                                                    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"), children: event.category }), _jsx("span", { className: cn("text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-widest", event.status === 'Concluído' ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" :
                                                event.status === 'Cancelado' ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" :
                                                    "bg-blue-50 text-blue-600 dark:bg-blue-900/10 dark:text-blue-500"), children: event.status })] }), isAdmin && (_jsx("button", { onClick: (e) => {
                                        e.stopPropagation();
                                        setEventToDelete(event);
                                        setShowDeleteModal(true);
                                    }, className: "text-slate-300 dark:text-slate-700 hover:text-red-500 transition-colors p-1 -m-1", children: _jsx(Trash2, { size: 18 }) }))] }), _jsx("h3", { className: "text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight", children: event.title }), _jsx("p", { className: "text-sm text-slate-500 dark:text-slate-400 mb-5 font-medium line-clamp-2", children: event.description }), _jsxs("div", { className: "flex flex-wrap gap-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Clock, { size: 14, className: "text-blue-500" }), _jsxs("span", { children: [formatDate(event.date), " \u00E0s ", event.time] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(MapPin, { size: 14, className: "text-blue-500" }), _jsx("span", { className: "truncate max-w-[150px]", children: event.location || 'Sem local definido' })] })] })] }, event.id))) : (_jsxs("div", { className: "text-center py-12", children: [_jsx(CalendarIcon, { size: 48, className: "mx-auto text-slate-200 dark:text-slate-800 mb-4" }), _jsx("p", { className: "text-slate-400 dark:text-slate-600 font-medium", children: "Nenhum evento agendado" })] })) }), _jsx(ConfirmDeleteModal, { isOpen: showDeleteModal, title: eventToDelete?.title || '', description: "Este evento ser\u00E1 exclu\u00EDdo permanentemente.", onClose: () => {
                    setShowDeleteModal(false);
                    setEventToDelete(null);
                }, onConfirm: async () => {
                    if (eventToDelete && profile) {
                        try {
                            await deleteDoc(doc(db, 'events', eventToDelete.id));
                            await logActivity(profile.uid, profile.displayName || 'Usuário', 'delete', 'event', `Excluiu o evento: ${eventToDelete.title}`);
                        }
                        catch (err) {
                            handleFirestoreError(err, OperationType.DELETE, `events/${eventToDelete.id}`);
                        }
                        setShowDeleteModal(false);
                        setEventToDelete(null);
                    }
                }, type: "event" }), showAddModal && (_jsx("div", { className: "fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4", children: _jsxs(motion.div, { initial: { y: 100, opacity: 0 }, animate: { y: 0, opacity: 1 }, className: "bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 space-y-6 shadow-2xl", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h3", { className: "text-2xl font-black text-slate-900 dark:text-white tracking-tight", children: "Novo Evento" }), _jsx("button", { onClick: () => setShowAddModal(false), className: "bg-slate-100 dark:bg-slate-800 p-2 rounded-full text-slate-500", children: _jsx(X, { size: 20 }) })] }), _jsxs("form", { onSubmit: handleAddEvent, className: "space-y-4", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2", children: "T\u00EDtulo" }), _jsx("input", { type: "text", placeholder: "Ex: Assembleia Geral", required: true, className: "w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none font-medium", value: newEvent.title, onChange: e => setNewEvent({ ...newEvent, title: e.target.value }) })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2", children: "Descri\u00E7\u00E3o" }), _jsx("textarea", { placeholder: "Detalhes do evento...", className: "w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none font-medium min-h-[100px]", value: newEvent.description, onChange: e => setNewEvent({ ...newEvent, description: e.target.value }) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2", children: "Data" }), _jsx("input", { type: "date", required: true, className: "w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none font-medium", value: newEvent.date, onChange: e => setNewEvent({ ...newEvent, date: e.target.value }) })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2", children: "Hora" }), _jsx("input", { type: "time", required: true, className: "w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none font-medium", value: newEvent.time, onChange: e => setNewEvent({ ...newEvent, time: e.target.value }) })] })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2", children: "Local" }), _jsx("input", { type: "text", placeholder: "Ex: Sede do Sindicato", className: "w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none font-medium", value: newEvent.location, onChange: e => setNewEvent({ ...newEvent, location: e.target.value }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2", children: "Categoria" }), _jsx("div", { className: "flex flex-wrap gap-2", children: ['Atividades Sindicais', 'Jurídico', 'Administrativo', 'Fiscalização', 'Eventos'].map((cat) => (_jsx("button", { type: "button", onClick: () => setNewEvent({ ...newEvent, category: cat }), className: cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", newEvent.category === cat
                                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"), children: cat }, cat))) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2", children: "Status" }), _jsx("div", { className: "flex flex-wrap gap-2", children: ['Agendado', 'Concluído', 'Cancelado'].map((st) => (_jsx("button", { type: "button", onClick: () => setNewEvent({ ...newEvent, status: st }), className: cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", newEvent.status === st
                                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                                                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"), children: st }, st))) })] }), _jsx("button", { type: "submit", className: "w-full bg-blue-600 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-blue-600/20 active:scale-95 transition-all mt-4", children: "Salvar Evento" })] })] }) }))] }));
};
export default Calendar;
