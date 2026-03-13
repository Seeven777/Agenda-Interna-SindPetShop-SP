import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, onSnapshot, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { useAuth } from '../firebase/auth';
import { Task } from '../types';
import { Plus, X, CheckCircle2, Circle, Clock, AlertTriangle, Trash2, Check, CheckSquare, Search, MessageCircle } from 'lucide-react';
import { formatDate, cn, getRelativeTime } from '../lib/utils';
import { motion } from 'framer-motion';
import { logActivity } from '../lib/activity';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { Comment } from '../types';
import { uploadFile } from '../lib/uploadFile';
import { serverTimestamp } from 'firebase/firestore';

const Tasks: React.FC = () => {
  const { profile, isAdmin } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<'Todos' | 'Pendente' | 'Concluído'>('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [taskForComments, setTaskForComments] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [newCommentFile, setNewCommentFile] = useState<File | null>(null);
  const [uploadingComment, setUploadingComment] = useState(false);
  
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'Média',
    status: 'Pendente',
    deadline: new Date().toISOString(),
  });

  useEffect(() => {
    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() } as Task)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'tasks'));
    return unsubscribe;
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      await addDoc(collection(db, 'tasks'), {
        ...newTask,
        responsibleUserId: profile.uid,
        createdAt: new Date().toISOString(),
        createdBy: profile.uid,
      });

      await logActivity(
        profile.uid,
        profile.displayName || 'Usuário',
        'create',
        'task',
        `Criou a tarefa: ${newTask.title}`
      );

      setShowAddModal(false);
      setNewTask({ title: '', description: '', priority: 'Média', status: 'Pendente' });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'tasks');
    }
  };

  const toggleStatus = async (task: Task) => {
    if (!profile) return;
    try {
      const newStatus = task.status === 'Concluído' ? 'Pendente' : 'Concluído';
      await updateDoc(doc(db, 'tasks', task.id!), { 
        status: newStatus,
        updatedAt: new Date().toISOString(),
        updatedBy: profile.uid,
      });
      
      await logActivity(
        profile.uid,
        profile.displayName || 'Usuário',
        'update',
        'task',
        `${newStatus === 'Concluído' ? 'Concluiu' : 'Reabriu'} a tarefa: ${task.title}`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `tasks/${task.id}`);
    }
  };

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    if (taskForComments) {
      const q = query(
        collection(db, 'tasks', taskForComments.id!, 'comments'),
        orderBy('createdAt', 'desc')
      );
      unsubscribe = onSnapshot(q, (snap) => {
        setComments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Comment)));
      });
    }
    return () => {
      if (unsubscribe) unsubscribe();
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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center px-2">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Tarefas</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest">Minhas Atividades</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-600 text-white p-3 rounded-2xl shadow-xl shadow-emerald-600/20 active:scale-95 transition-transform"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="px-2">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Progresso Geral</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{completedCount} de {tasks.length} concluídas</h3>
            </div>
            <span className="text-sm font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full">{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-emerald-500 rounded-full"
            />
          </div>
        </div>
      </div>

      <div className="px-2">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" placeholder="Buscar tarefas..." 
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm dark:text-white transition-all"
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2 px-2 overflow-x-auto pb-2 no-scrollbar">
        {['Todos', 'Pendente', 'Concluído'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
              filter === f 
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" 
                : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredTasks.length > 0 ? filteredTasks.map((task) => (
          <motion.div 
            layout
            key={task.id} 
            className={cn(
              "bg-white dark:bg-slate-900 rounded-[2rem] p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4 transition-all",
              task.status === 'Concluído' ? "opacity-60 grayscale-[0.5]" : ""
            )}
          >
            <button 
              onClick={() => toggleStatus(task)}
              className={cn(
                "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                task.status === 'Concluído' ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-200 dark:border-slate-700"
              )}
            >
              {task.status === 'Concluído' && <Check size={16} strokeWidth={3} />}
            </button>
            <div className="flex-1">
              <h3 className={cn(
                "font-bold text-slate-900 dark:text-white transition-all",
                task.status === 'Concluído' ? "line-through text-slate-400" : ""
              )}>
                {task.title}
              </h3>
              <div className="flex items-center gap-3 mt-1">
                <span className={cn(
                  "text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest",
                  task.priority === 'Alta' ? "bg-red-100 text-red-600 dark:bg-red-900/30" :
                  task.priority === 'Média' ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30" :
                  "bg-blue-100 text-blue-600 dark:bg-blue-900/30"
                )}>
                  {task.priority}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Clock size={12} />
                  {formatDate(task.deadline)}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-[10px] text-slate-500 dark:text-slate-400">
                <span>
                  Criado por {task.createdBy} • {getRelativeTime(task.createdAt)}
                </span>
                {task.updatedAt && (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Atualizado há {getRelativeTime(task.updatedAt)}
                  </span>
                )}
              </div>
            </div>
            {isAdmin && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setTaskToDelete(task);
                  setShowDeleteModal(true);
                }}
                className="text-slate-300 dark:text-slate-700 hover:text-red-500 transition-colors p-2 -m-1"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setTaskForComments(task);
                setShowCommentsModal(true);
              }}
              className="text-slate-300 dark:text-slate-700 hover:text-blue-500 transition-colors p-2 -m-1"
            >
              <MessageCircle size={18} />
            </button>
          </motion.div>
        )) : (
          <div className="text-center py-12">
            <CheckSquare size={48} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" />
            <p className="text-slate-400 dark:text-slate-600 font-medium">Nenhuma tarefa pendente</p>
          </div>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        title={taskToDelete?.title || ''}
        description="Esta tarefa será excluída permanentemente, incluindo comentários e anexos."
        onClose={() => {
          setShowDeleteModal(false);
          setTaskToDelete(null);
        }}
        onConfirm={async () => {
          if (taskToDelete && profile) {
            try {
              await deleteDoc(doc(db, 'tasks', taskToDelete.id!));
              await logActivity(
                profile.uid,
                profile.displayName || 'Usuário',
                'delete',
                'task',
                `Excluiu a tarefa: ${taskToDelete.title}`
              );
            } catch (err) {
              handleFirestoreError(err, OperationType.DELETE, `tasks/${taskToDelete.id}`);
            }
            setShowDeleteModal(false);
            setTaskToDelete(null);
          }
        }}
        type="task"
      />

      {showCommentsModal && taskForComments && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white dark:bg-slate-900 w-full max-w-lg max-h-[80vh] rounded-[2.5rem] p-6 shadow-2xl overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Comentários - {taskForComments.title}
              </h3>
              <button 
                onClick={() => {
                  setShowCommentsModal(false);
                  setTaskForComments(null);
                  setComments([]);
                  setNewCommentContent('');
                  setNewCommentFile(null);
                }}
                className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-slate-400 dark:text-slate-600 text-center py-8 font-medium">Nenhum comentário ainda</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                        <span className="text-xs font-black text-slate-500">{comment.authorName[0]?.toUpperCase()}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 dark:text-white text-sm mb-1">{comment.authorName}</p>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{comment.content}</p>
                        {comment.attachments && comment.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {comment.attachments.map((url, i) => (
                              <a
                                key={i}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 px-3 py-1 rounded-full font-bold hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                              >
                                📎 Anexo {i + 1}
                              </a>
                            ))}
                          </div>
                        )}
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-bold uppercase tracking-wider">
                          {getRelativeTime(comment.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                if (!profile || !taskForComments || !newCommentContent.trim()) return;
                setUploadingComment(true);
                try {
                  let atts: string[] = [];
                  if (newCommentFile) {
                    const path = `comments/tasks/${taskForComments.id}/${Date.now()}-${newCommentFile.name}`;
                    const url = await uploadFile(newCommentFile, path);
                    atts = [url];
                  }
                  await addDoc(collection(db, 'tasks', taskForComments.id!, 'comments'), {
                    content: newCommentContent,
                    authorId: profile.uid,
                    authorName: profile.displayName || 'Usuário',
                    createdAt: serverTimestamp(),
                    attachments: atts,
                  });
                  await updateDoc(doc(db, 'tasks', taskForComments.id!), {
                    updatedAt: serverTimestamp(),
                    updatedBy: profile.uid,
                  });
                  await logActivity(
                    profile.uid,
                    profile.displayName || 'Usuário',
                    'comment',
                    'task',
                    `Adicionou comentário na tarefa: ${taskForComments.title}`
                  );
                  setNewCommentContent('');
                  setNewCommentFile(null);
                } catch (err) {
                  handleFirestoreError(err, OperationType.CREATE, `tasks/${taskForComments.id}/comments`);
                }
                setUploadingComment(false);
              }}
              className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700"
            >
              <textarea
                placeholder="Adicionar comentário..."
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none min-h-[80px] text-sm dark:text-white"
                value={newCommentContent}
                onChange={(e) => setNewCommentContent(e.target.value)}
                disabled={uploadingComment}
              />
              <div className="flex gap-3 pt-2">
                <input
                  type="file"
                  onChange={(e) => setNewCommentFile(e.target.files?.[0] || null)}
                  className="flex-1 text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-slate-50 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-300 hover:file:bg-slate-100 dark:hover:file:bg-slate-700 transition-all cursor-pointer"
                  disabled={uploadingComment}
                />
                <button
                  type="submit"
                  disabled={!newCommentContent.trim() || uploadingComment}
                  className="flex-0 bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {uploadingComment ? 'Enviando...' : 'Comentar'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}


      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 space-y-6 shadow-2xl"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Nova Tarefa</h3>
              <button onClick={() => setShowAddModal(false)} className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full text-slate-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Título da Tarefa</label>
                <input 
                  type="text" placeholder="Ex: Preparar ata da assembleia" required
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                  value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Descrição</label>
                <textarea 
                  placeholder="Detalhes da tarefa..."
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 outline-none font-medium min-h-[80px]"
                  value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Prazo</label>
                  <input 
                    type="date" required
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                    value={newTask.deadline?.split('T')[0]} onChange={e => setNewTask({...newTask, deadline: new Date(e.target.value).toISOString()})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Prioridade</label>
                  <select 
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 outline-none font-medium appearance-none"
                    value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value as any})}
                  >
                    <option>Baixa</option>
                    <option>Média</option>
                    <option>Alta</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-emerald-600 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-emerald-600/20 active:scale-95 transition-all mt-4">
                Criar Tarefa
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
