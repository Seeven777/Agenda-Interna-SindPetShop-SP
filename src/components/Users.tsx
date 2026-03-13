import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { useAuth } from '../firebase/auth';
import { UserProfile, UserRole } from '../types';
import { User, Shield, ShieldAlert, ChevronRight, ArrowLeft } from 'lucide-react';
import { formatDate, cn } from '../lib/utils';
import { motion } from 'motion/react';

interface UsersProps {
  onBack: () => void;
}

const Users: React.FC<UsersProps> = ({ onBack }) => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);

  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'users'));
    return unsubscribe;
  }, []);

  const toggleRole = async (user: UserProfile) => {
    if (!isAdmin || loading) return;
    setLoading(user.uid);
    const newRole: UserRole = user.role === 'admin' ? 'staff' : 'admin';
    try {
      await updateDoc(doc(db, 'users', user.uid), { role: newRole });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex items-center gap-4 px-2">
        <button 
          onClick={onBack}
          className="p-3 bg-white dark:bg-slate-900 rounded-2xl text-slate-500 shadow-sm border border-slate-100 dark:border-slate-800"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Equipe</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest">Gestão de Usuários</p>
        </div>
      </div>

      <div className="space-y-3">
        {users.map((user) => (
          <motion.div 
            layout
            key={user.uid} 
            className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-slate-50 dark:border-slate-800">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <User size={24} />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{user.displayName}</h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-600 font-black uppercase tracking-widest mt-1">{user.email}</p>
              </div>
            </div>
            
            <button 
              onClick={() => toggleRole(user)}
              disabled={!isAdmin || loading === user.uid}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl transition-all active:scale-95",
                loading === user.uid && "opacity-50 cursor-wait",
                user.role === 'admin' 
                  ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" 
                  : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              )}
            >
              {loading === user.uid ? (
                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                user.role === 'admin' ? <Shield size={14} /> : <ShieldAlert size={14} />
              )}
              <span className="text-[9px] font-black uppercase tracking-widest">
                {loading === user.uid ? 'Salvando...' : (user.role === 'admin' ? 'Admin' : 'Staff')}
              </span>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Users;
