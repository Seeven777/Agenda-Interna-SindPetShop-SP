import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
export function formatDate(dateString) {
    if (!dateString)
        return '';
    return new Date(dateString).toLocaleDateString('pt-BR', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}
export function formatTime(dateString) {
    if (!dateString)
        return '';
    return new Date(dateString).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
    });
}
export function getRelativeTime(dateString) {
    if (!dateString)
        return '';
    return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ptBR
    });
}
