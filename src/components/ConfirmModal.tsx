import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'אישור',
  cancelLabel = 'ביטול',
  variant = 'danger'
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-surface-container-lowest w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden border border-surface-container-low"
          >
            <div className="p-8 space-y-6">
              <div className="space-y-2 text-center">
                <h3 className="text-2xl font-black text-on-surface tracking-tight">{title}</h3>
                <p className="text-on-surface-variant font-medium leading-relaxed">{message}</p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={cn(
                    "w-full py-4 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-md",
                    variant === 'danger' 
                      ? "bg-secondary text-white hover:bg-secondary/90" 
                      : "bg-primary text-white hover:bg-primary/90"
                  )}
                >
                  {confirmLabel}
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-4 rounded-2xl font-black text-lg text-on-surface-variant hover:bg-surface-container-low transition-all active:scale-95"
                >
                  {cancelLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
