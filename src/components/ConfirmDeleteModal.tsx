import React from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  onClose: () => void;
  onConfirm: () => void;
  type?: 'task' | 'announcement' | 'event' | 'case';
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title,
  description,
  onClose,
  onConfirm,
  type = 'task'
}) => {
  if (!isOpen) return null;

  const getTypeLabel = () => {
    switch (type) {
      case 'task': return 'tarefa';
      case 'announcement': return 'comunicado';
      case 'event': return 'evento';
      case 'case': return 'processo';
      default: return 'item';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <motion.div 
        initial={{ y: 100, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 100, opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-2xl text-red-600 dark:text-red-400 shadow-lg">
              <AlertTriangle size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Confirmar Exclusão</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                {getTypeLabel()} "{title}"
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="bg-slate-100 dark:bg-slate-800 p-2 rounded-2xl text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Description */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-200/50 dark:border-slate-700/50">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
            {description || `Esta ação excluirá permanentemente o ${getTypeLabel()} selecionado. Esta operação não pode ser desfeita.`}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-black py-4 px-6 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-red-600/20 hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Trash2 size={18} />
            Excluir
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ConfirmDeleteModal;

