import React from 'react';
import { AnimatePresence, motion } from 'motion/react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'primary'
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white w-full max-w-[360px] rounded-[24px] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 pt-8">
              {/* Title & Message */}
              <h3 className="text-[18px] font-medium text-center bg-gradient-to-r from-[#C62828] to-[#1A237E] bg-clip-text text-transparent mb-3">{title}</h3>
              <p className="text-[14px] text-gray-500 font-light text-center leading-relaxed mb-6">
                {message}
              </p>

              {/* Actions */}
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className="w-full h-[44px] rounded-[25px] text-white font-normal text-[15px] transition-opacity hover:opacity-90 active:scale-[0.98] bg-gradient-to-r from-[#C62828] to-[#1A237E]"
                >
                  {confirmText}
                </button>
                <button
                  onClick={onClose}
                  className="w-full h-[44px] rounded-[25px] bg-[#F5F5F5] text-[#333333] text-[14px] font-light transition-opacity hover:opacity-80"
                >
                  {cancelText}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
