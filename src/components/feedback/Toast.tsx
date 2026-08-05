/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useState, type PropsWithChildren } from 'react';
type Kind = 'success' | 'error'; interface Item { id: number; message: string; kind: Kind; } interface Value { show(message: string, kind?: Kind): void; }
const Context = createContext<Value | null>(null);
export function ToastProvider({ children }: PropsWithChildren) { const [items, setItems] = useState<Item[]>([]); const show = useCallback((message: string, kind: Kind = 'success') => { const id = Date.now(); setItems((all) => [...all, { id, message, kind }]); window.setTimeout(() => setItems((all) => all.filter((item) => item.id !== id)), 4000); }, []); return <Context.Provider value={{ show }}>{children}<div className="fixed bottom-4 right-4 z-[70] space-y-2" aria-live="polite">{items.map((item) => <div key={item.id} className={item.kind === 'error' ? 'rounded-lg bg-destructive px-4 py-3 text-sm text-destructive-foreground shadow-lg' : 'rounded-lg bg-card px-4 py-3 text-sm shadow-lg ring-1 ring-border'}>{item.message}</div>)}</div></Context.Provider>; }
export { Context as toastContext };
