import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { useAuth } from '../firebase/auth';
import { User, Shield, ShieldAlert, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
const Users = ({ onBack }) => {
    const { isAdmin } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(null);
    useEffect(() => {
        const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snap) => {
            setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() })));
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'users'));
        return unsubscribe;
    }, []);
    const toggleRole = async (user) => {
        if (!isAdmin || loading)
            return;
        setLoading(user.uid);
        const newRole = user.role === 'admin' ? 'staff' : 'admin';
        try {
            await updateDoc(doc(db, 'users', user.uid), { role: newRole });
        }
        catch (err) {
            handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
        }
        finally {
            setLoading(null);
        }
    };
    return (_jsxs("div", { className: "space-y-6 animate-in fade-in slide-in-from-left-4 duration-500", children: [_jsxs("div", { className: "flex items-center gap-4 px-2", children: [_jsx("button", { onClick: onBack, className: "p-3 bg-white dark:bg-slate-900 rounded-2xl text-slate-500 shadow-sm border border-slate-100 dark:border-slate-800", children: _jsx(ArrowLeft, { size: 20 }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-black text-slate-900 dark:text-white tracking-tight", children: "Equipe" }), _jsx("p", { className: "text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest", children: "Gest\u00E3o de Usu\u00E1rios" })] })] }), _jsx("div", { className: "space-y-3", children: users.map((user) => (_jsxs(motion.div, { layout: true, className: "bg-white dark:bg-slate-900 rounded-[2rem] p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-12 h-12 rounded-2xl overflow-hidden border-2 border-slate-50 dark:border-slate-800", children: user.photoURL ? (_jsx("img", { src: user.photoURL, alt: user.displayName, className: "w-full h-full object-cover", referrerPolicy: "no-referrer" })) : (_jsx("div", { className: "w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400", children: _jsx(User, { size: 24 }) })) }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold text-slate-900 dark:text-white leading-tight", children: user.displayName }), _jsx("p", { className: "text-[10px] text-slate-400 dark:text-slate-600 font-black uppercase tracking-widest mt-1", children: user.email })] })] }), _jsxs("button", { onClick: () => toggleRole(user), disabled: !isAdmin || loading === user.uid, className: cn("flex items-center gap-2 px-4 py-2 rounded-xl transition-all active:scale-95", loading === user.uid && "opacity-50 cursor-wait", user.role === 'admin'
                                ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
                                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"), children: [loading === user.uid ? (_jsx("div", { className: "w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" })) : (user.role === 'admin' ? _jsx(Shield, { size: 14 }) : _jsx(ShieldAlert, { size: 14 })), _jsx("span", { className: "text-[9px] font-black uppercase tracking-widest", children: loading === user.uid ? 'Salvando...' : (user.role === 'admin' ? 'Admin' : 'Staff') })] })] }, user.uid))) })] }));
};
export default Users;
