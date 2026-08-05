import { useContext } from 'react';
import { toastContext } from '@/components/feedback/Toast';
export function useToast() { const value = useContext(toastContext); if (!value) throw new Error('ToastProvider is required.'); return value; }
