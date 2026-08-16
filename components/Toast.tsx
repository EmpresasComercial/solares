import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  title?: string;
  type?: ToastType;
}

interface ToastContextType {
  showToast: (message: string, typeOrOptions?: ToastType | ToastOptions) => void;
}

interface ToastState {
  message: string;
  type: ToastType;
  title: string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const defaultTitles: Record<ToastType, string> = {
  success: 'Successful',
  error: 'Unsuccessful',
  info: 'Aviso',
  warning: 'Aviso',
};

const titleColors: Record<ToastType, string> = {
  success: '#16A34A',
  error: '#FE384F',
  info: '#D97706',
  warning: '#D97706',
};

function cleanToastMessage(msg: string): string {
  if (!msg) return '';
  return msg
    .replace(/SEGURANÇA\s+AliExpress24\b[:\s]*/gi, '')
    .replace(/\bMICROSOFT\b[:\s]*/gi, '')
    .trim();
}

function isErrorMessage(msg: string): boolean {
  const lower = (msg || '').toLowerCase();
  return /bloquead|falh|erro|insuficiente|recusad|negad|inv[aá]lid|incorret|proibid|n[aã]o autorizado|expirad/.test(lower);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback(
    (message: string, typeOrOptions?: ToastType | ToastOptions) => {
      let type: ToastType = 'info';
      let title: string | undefined;

      if (typeof typeOrOptions === 'string') {
        type = typeOrOptions;
      } else if (typeOrOptions) {
        type = typeOrOptions.type ?? 'info';
        title = typeOrOptions.title;
      }

      if (isErrorMessage(message) && type !== 'warning') {
        type = 'error';
      }

      setToast({
        message: cleanToastMessage(message),
        type,
        title: title ?? defaultTitles[type],
      });
    },
    []
  );

  const dismiss = useCallback(() => setToast(null), []);

  const contextValue = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 select-none"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 12 }}
              transition={{ type: 'spring', stiffness: 340, damping: 28 }}
              className="bg-white rounded-[14px] pt-7 px-7 pb-0 w-[72vw] max-w-[300px] min-w-[220px] flex flex-col items-center shadow-[0_20px_60px_rgba(0,0,0,0.18)] overflow-hidden"
            >
              <p
                style={{ color: titleColors[toast.type] || '#1a1a1a' }}
                className="font-sans font-bold text-[17px] text-center mb-1.5 leading-[1.3] p-0"
              >
                {toast.title}
              </p>

              <p className="font-sans font-normal text-[13px] text-[#444444] text-center leading-[1.5] mb-[22px] p-0">
                {toast.message}
              </p>

              <div className="w-[calc(100%+56px)] -ml-7 -mr-7 h-[1px] bg-[#E5E5E5]" />

              <button
                type="button"
                onClick={dismiss}
                className="w-[calc(100%+56px)] -ml-7 -mr-7 py-3 text-center bg-transparent border-none cursor-pointer font-sans font-semibold text-[16px] text-[#007AFF] tracking-wide active:opacity-60 transition-opacity"
              >
                OK
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
