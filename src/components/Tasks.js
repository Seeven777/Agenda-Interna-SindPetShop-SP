import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { collection, addDoc, query, onSnapshot, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { useAuth } from '../firebase/auth';
import { Plus, X, Clock, Trash2, Check, CheckSquare, Search, MessageCircle } from 'lucide-react';
import { formatDate, cn, getRelativeTime } from '../lib/utils';
import { motion } from 'framer-motion';
import { logActivity } from '../lib/activity';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { uploadFile } from '../lib/uploadFile';
import { serverTimestamp } from 'firebase/firestore';
const Tasks = () => {
    const { profile, isAdmin } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [filter, setFilter] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [showCommentsModal, setShowCommentsModal] = useState(false);
    const [taskForComments, setTaskForComments] = useState(null);
    const [comments, setComments] = useState([]);
    const [newCommentContent, setNewCommentContent] = useState('');
    const [newCommentFile, setNewCommentFile] = useState(null);
    const [uploadingComment, setUploadingComment] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        priority: 'Média',
        status: 'Pendente',
        deadline: new Date().toISOString(),
    });
    useEffect(() => {
        const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snap) => {
            setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'tasks'));
        return unsubscribe;
    }, []);
    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!profile)
            return;
        try {
            await addDoc(collection(db, 'tasks'), {
                ...newTask,
                responsibleUserId: profile.uid,
                createdAt: new Date().toISOString(),
                createdBy: profile.uid,
            });
            await logActivity(profile.uid, profile.displayName || 'Usuário', 'create', 'task', `Criou a tarefa: ${newTask.title}`);
            setShowAddModal(false);
            setNewTask({ title: '', description: '', priority: 'Média', status: 'Pendente' });
        }
        catch (err) {
            handleFirestoreError(err, OperationType.CREATE, 'tasks');
        }
    };
    const toggleStatus = async (task) => {
        if (!profile)
            return;
        try {
            const newStatus = task.status === 'Concluído' ? 'Pendente' : 'Concluído';
            await updateDoc(doc(db, 'tasks', task.id), {
                status: newStatus,
                updatedAt: new Date().toISOString(),
                updatedBy: profile.uid,
            });
            await logActivity(profile.uid, profile.displayName || 'Usuário', 'update', 'task', `${newStatus === 'Concluído' ? 'Concluiu' : 'Reabriu'} a tarefa: ${task.title}`);
        }
        catch (err) {
            handleFirestoreError(err, OperationType.UPDATE, `tasks/${task.id}`);
        }
    };
    useEffect(() => {
        let unsubscribe;
        if (taskForComments) {
            const q = query(collection(db, 'tasks', taskForComments.id, 'comments'), orderBy('createdAt', 'desc'));
            unsubscribe = onSnapshot(q, (snap) => {
                setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            });
        }
        return () => {
            if (unsubscribe)
                unsubscribe();
        };
    }, [taskForComments]);
    const filteredTasks = tasks.filter(t => {
        const matchesFilter = filter === 'Todos' || t.status === filter;
        const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });
    const completedCount = tasks.filter(t => t.status === 'Concluído').length;
    const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;
    return (_jsxs("div", { className: "space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500", children: [_jsxs("div", { className: "flex justify-between items-center px-2", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-black text-slate-900 dark:text-white tracking-tight", children: "Tarefas" }), _jsx("p", { className: "text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest", children: "Minhas Atividades" })] }), _jsx("button", { onClick: () => setShowAddModal(true), className: "bg-emerald-600 text-white p-3 rounded-2xl shadow-xl shadow-emerald-600/20 active:scale-95 transition-transform", children: _jsx(Plus, { size: 24 }) })] }), _jsx("div", { className: "px-2", children: _jsxs("div", { className: "bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm", children: [_jsxs("div", { className: "flex justify-between items-end mb-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1", children: "Progresso Geral" }), _jsxs("h3", { className: "text-2xl font-black text-slate-900 dark:text-white tracking-tighter", children: [completedCount, " de ", tasks.length, " conclu\u00EDdas"] })] }), _jsxs("span", { className: "text-sm font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full", children: [Math.round(progress), "%"] })] }), _jsx("div", { className: "h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden", children: _jsx(motion.div, { initial: { width: 0 }, animate: { width: `${progress}%` }, className: "h-full bg-emerald-500 rounded-full" }) })] }) }), _jsx("div", { className: "px-2", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-4 top-1/2 -translate-y-1/2 text-slate-400", size: 18 }), _jsx("input", { type: "text", placeholder: "Buscar tarefas...", className: "w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm dark:text-white transition-all", value: searchTerm, onChange: e => setSearchTerm(e.target.value) })] }) }), _jsx("div", { className: "flex gap-2 px-2 overflow-x-auto pb-2 no-scrollbar", children: ['Todos', 'Pendente', 'Concluído'].map((f) => (_jsx("button", { onClick: () => setFilter(f), className: cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap", filter === f
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                        : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800"), children: f }, f))) }), _jsx("div", { className: "space-y-4", children: filteredTasks.length > 0 ? filteredTasks.map((task) => (_jsxs(motion.div, { layout: true, className: cn("bg-white dark:bg-slate-900 rounded-[2rem] p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4 transition-all", task.status === 'Concluído' ? "opacity-60 grayscale-[0.5]" : ""), children: [_jsx("button", { onClick: () => toggleStatus(task), className: cn("w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all", task.status === 'Concluído' ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-200 dark:border-slate-700"), children: task.status === 'Concluído' && _jsx(Check, { size: 16, strokeWidth: 3 }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: cn("font-bold text-slate-900 dark:text-white transition-all", task.status === 'Concluído' ? "line-through text-slate-400" : ""), children: task.title }), _jsxs("div", { className: "flex items-center gap-3 mt-1", children: [_jsx("span", { className: cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest", task.priority === 'Alta' ? "bg-red-100 text-red-600 dark:bg-red-900/30" :
                                                task.priority === 'Média' ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30" :
                                                    "bg-blue-100 text-blue-600 dark:bg-blue-900/30"), children: task.priority }), _jsxs("span", { className: "text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-wider flex items-center gap-1", children: [_jsx(Clock, { size: 12 }), formatDate(task.deadline)] })] }), _jsxs("div", { className: "flex items-center gap-4 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-[10px] text-slate-500 dark:text-slate-400", children: [_jsxs("span", { children: ["Criado por ", task.createdBy, " \u2022 ", getRelativeTime(task.createdAt)] }), task.updatedAt && (_jsxs("span", { className: "text-emerald-600 dark:text-emerald-400", children: ["Atualizado h\u00E1 ", getRelativeTime(task.updatedAt)] }))] })] }), isAdmin && (_jsx("button", { onClick: (e) => {
                                e.stopPropagation();
                                setTaskToDelete(task);
                                setShowDeleteModal(true);
                            }, className: "text-slate-300 dark:text-slate-700 hover:text-red-500 transition-colors p-2 -m-1", children: _jsx(Trash2, { size: 18 }) })), _jsx("button", { onClick: (e) => {
                                e.stopPropagation();
                                setTaskForComments(task);
                                setShowCommentsModal(true);
                            }, className: "text-slate-300 dark:text-slate-700 hover:text-blue-500 transition-colors p-2 -m-1", children: _jsx(MessageCircle, { size: 18 }) })] }, task.id))) : (_jsxs("div", { className: "text-center py-12", children: [_jsx(CheckSquare, { size: 48, className: "mx-auto text-slate-200 dark:text-slate-800 mb-4" }), _jsx("p", { className: "text-slate-400 dark:text-slate-600 font-medium", children: "Nenhuma tarefa pendente" })] })) }), _jsx(ConfirmDeleteModal, { isOpen: showDeleteModal, title: taskToDelete?.title || '', description: "Esta tarefa ser\u00E1 exclu\u00EDda permanentemente, incluindo coment\u00E1rios e anexos.", onClose: () => {
                    setShowDeleteModal(false);
                    setTaskToDelete(null);
                }, onConfirm: async () => {
                    if (taskToDelete && profile) {
                        try {
                            await deleteDoc(doc(db, 'tasks', taskToDelete.id));
                            await logActivity(profile.uid, profile.displayName || 'Usuário', 'delete', 'task', `Excluiu a tarefa: ${taskToDelete.title}`);
                        }
                        catch (err) {
                            handleFirestoreError(err, OperationType.DELETE, `tasks/${taskToDelete.id}`);
                        }
                        setShowDeleteModal(false);
                        setTaskToDelete(null);
                    }
                }, type: "task" }), showCommentsModal && taskForComments && (_jsx("div", { className: "fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4", children: _jsxs(motion.div, { initial: { y: 100, opacity: 0 }, animate: { y: 0, opacity: 1 }, className: "bg-white dark:bg-slate-900 w-full max-w-lg max-h-[80vh] rounded-[2.5rem] p-6 shadow-2xl overflow-y-auto", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsxs("h3", { className: "text-2xl font-black text-slate-900 dark:text-white tracking-tight", children: ["Coment\u00E1rios - ", taskForComments.title] }), _jsx("button", { onClick: () => {
                                        setShowCommentsModal(false);
                                        setTaskForComments(null);
                                        setComments([]);
                                        setNewCommentContent('');
                                        setNewCommentFile(null);
                                    }, className: "bg-slate-100 dark:bg-slate-800 p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors", children: _jsx(X, { size: 20 }) })] }), _jsx("div", { className: "space-y-4 mb-6 max-h-96 overflow-y-auto", children: comments.length === 0 ? (_jsx("p", { className: "text-slate-400 dark:text-slate-600 text-center py-8 font-medium", children: "Nenhum coment\u00E1rio ainda" })) : (comments.map((comment) => (_jsx("div", { className: "bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl", children: _jsxs("div", { className: "flex items-start gap-3 mb-2", children: [_jsx("div", { className: "w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center", children: _jsx("span", { className: "text-xs font-black text-slate-500", children: comment.authorName[0]?.toUpperCase() }) }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-bold text-slate-900 dark:text-white text-sm mb-1", children: comment.authorName }), _jsx("p", { className: "text-slate-600 dark:text-slate-300 leading-relaxed", children: comment.content }), comment.attachments && comment.attachments.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-2 mt-2", children: comment.attachments.map((url, i) => (_jsxs("a", { href: url, target: "_blank", rel: "noopener noreferrer", className: "text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 px-3 py-1 rounded-full font-bold hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors", children: ["\uD83D\uDCCE Anexo ", i + 1] }, i))) })), _jsx("p", { className: "text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-bold uppercase tracking-wider", children: getRelativeTime(comment.createdAt) })] })] }) }, comment.id)))) }), _jsxs("form", { onSubmit: async (e) => {
                                e.preventDefault();
                                if (!profile || !taskForComments || !newCommentContent.trim())
                                    return;
                                setUploadingComment(true);
                                try {
                                    let atts = [];
                                    if (newCommentFile) {
                                        const path = `comments/tasks/${taskForComments.id}/${Date.now()}-${newCommentFile.name}`;
                                        const url = await uploadFile(newCommentFile, path);
                                        atts = [url];
                                    }
                                    await addDoc(collection(db, 'tasks', taskForComments.id, 'comments'), {
                                        content: newCommentContent,
                                        authorId: profile.uid,
                                        authorName: profile.displayName || 'Usuário',
                                        createdAt: serverTimestamp(),
                                        attachments: atts,
                                    });
                                    await updateDoc(doc(db, 'tasks', taskForComments.id), {
                                        updatedAt: serverTimestamp(),
                                        updatedBy: profile.uid,
                                    });
                                    await logActivity(profile.uid, profile.displayName || 'Usuário', 'comment', 'task', `Adicionou comentário na tarefa: ${taskForComments.title}`);
                                    setNewCommentContent('');
                                    setNewCommentFile(null);
                                }
                                catch (err) {
                                    handleFirestoreError(err, OperationType.CREATE, `tasks/${taskForComments.id}/comments`);
                                }
                                setUploadingComment(false);
                            }, className: "space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700", children: [_jsx("textarea", { placeholder: "Adicionar coment\u00E1rio...", className: "w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none min-h-[80px] text-sm dark:text-white", value: newCommentContent, onChange: (e) => setNewCommentContent(e.target.value), disabled: uploadingComment }), _jsxs("div", { className: "flex gap-3 pt-2", children: [_jsx("input", { type: "file", onChange: (e) => setNewCommentFile(e.target.files?.[0] || null), className: "flex-1 text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-slate-50 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-300 hover:file:bg-slate-100 dark:hover:file:bg-slate-700 transition-all cursor-pointer", disabled: uploadingComment }), _jsx("button", { type: "submit", disabled: !newCommentContent.trim() || uploadingComment, className: "flex-0 bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none", children: uploadingComment ? 'Enviando...' : 'Comentar' })] })] })] }) })), showAddModal && (_jsx("div", { className: "fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4", children: _jsxs(motion.div, { initial: { y: 100, opacity: 0 }, animate: { y: 0, opacity: 1 }, className: "bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 space-y-6 shadow-2xl", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h3", { className: "text-2xl font-black text-slate-900 dark:text-white tracking-tight", children: "Nova Tarefa" }), _jsx("button", { onClick: () => setShowAddModal(false), className: "bg-slate-100 dark:bg-slate-800 p-2 rounded-full text-slate-500", children: _jsx(X, { size: 20 }) })] }), _jsxs("form", { onSubmit: handleAddTask, className: "space-y-4", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2", children: "T\u00EDtulo da Tarefa" }), _jsx("input", { type: "text", placeholder: "Ex: Preparar ata da assembleia", required: true, className: "w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 outline-none font-medium", value: newTask.title, onChange: e => setNewTask({ ...newTask, title: e.target.value }) })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2", children: "Descri\u00E7\u00E3o" }), _jsx("textarea", { placeholder: "Detalhes da tarefa...", className: "w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 outline-none font-medium min-h-[80px]", value: newTask.description, onChange: e => setNewTask({ ...newTask, description: e.target.value }) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2", children: "Prazo" }), _jsx("input", { type: "date", required: true, className: "w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 outline-none font-medium", value: newTask.deadline?.split('T')[0], onChange: e => setNewTask({ ...newTask, deadline: new Date(e.target.value).toISOString() }) })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2", children: "Prioridade" }), _jsxs("select", { className: "w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 outline-none font-medium appearance-none", value: newTask.priority, onChange: e => setNewTask({ ...newTask, priority: e.target.value }), children: [_jsx("option", { children: "Baixa" }), _jsx("option", { children: "M\u00E9dia" }), _jsx("option", { children: "Alta" })] })] })] }), _jsx("button", { type: "submit", className: "w-full bg-emerald-600 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-emerald-600/20 active:scale-95 transition-all mt-4", children: "Criar Tarefa" })] })] }) }))] }));
};
export default Tasks;
