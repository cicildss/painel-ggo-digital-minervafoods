import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode; theme?: 'light' | 'dark' }> = ({
  children,
  theme = 'light'
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const isDark = theme === 'dark';

  const showToast = useCallback((message: string, type: ToastType = 'success', duration = 3500) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Floating Toasts Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col space-y-2 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => {
          let Icon = CheckCircle2;
          let iconColor = 'text-emerald-500';
          let borderStyle = isDark
            ? 'bg-[#18222f] border-emerald-500/40 text-slate-100 shadow-emerald-950/40'
            : 'bg-white border-emerald-200 text-slate-800 shadow-emerald-500/10';

          if (toast.type === 'error') {
            Icon = AlertCircle;
            iconColor = 'text-rose-500';
            borderStyle = isDark
              ? 'bg-[#18222f] border-rose-500/40 text-slate-100 shadow-rose-950/40'
              : 'bg-white border-rose-200 text-slate-800 shadow-rose-500/10';
          } else if (toast.type === 'warning') {
            Icon = AlertTriangle;
            iconColor = 'text-amber-500';
            borderStyle = isDark
              ? 'bg-[#18222f] border-amber-500/40 text-slate-100 shadow-amber-950/40'
              : 'bg-white border-amber-200 text-slate-800 shadow-amber-500/10';
          } else if (toast.type === 'info') {
            Icon = Info;
            iconColor = 'text-blue-500';
            borderStyle = isDark
              ? 'bg-[#18222f] border-blue-500/40 text-slate-100 shadow-blue-950/40'
              : 'bg-white border-blue-200 text-slate-800 shadow-blue-500/10';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto p-3.5 rounded-xl border shadow-xl flex items-center justify-between space-x-3 text-xs animate-slide-up transition-all ${borderStyle}`}
            >
              <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} />
                <span className="font-semibold leading-snug">{toast.message}</span>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de um ToastProvider');
  }
  return context;
};
