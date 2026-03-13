export const showToast = (message, type = 'success') => {
    // Simple native toast polyfill
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.className = `fixed top-4 right-4 p-4 rounded-2xl shadow-2xl z-50 font-bold text-sm min-w-[300px] transform translate-x-full animate-in slide-in-from-right fade-in duration-300 ${type === 'success' ? 'bg-emerald-500 text-white shadow-emerald-500/25' : 'bg-red-500 text-white shadow-red-500/25'}`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.remove('slide-in-from-right');
        toast.classList.add('slide-out-to-right');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
};
