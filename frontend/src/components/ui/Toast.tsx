"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Info, Loader2, X } from "lucide-react";
import { useToast, ToastType } from "../../store/useToast";

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="text-success" size={20} />,
  error: <XCircle className="text-danger" size={20} />,
  info: <Info className="text-accent-mdusd" size={20} />,
  loading: <Loader2 className="text-accent-dnr animate-spin" size={20} />,
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="pointer-events-auto bg-bg-secondary border border-white/10 shadow-2xl rounded-2xl p-4 flex gap-3 items-start relative overflow-hidden"
          >
            {/* Background glow */}
            <div className="absolute top-0 left-0 w-1 bg-gradient-to-b from-transparent via-current to-transparent opacity-50 h-full" />
            
            <div className="mt-0.5">{icons[toast.type]}</div>
            <div className="flex flex-col gap-1 pr-6 flex-1">
              {toast.title && <span className="font-medium text-sm text-text-primary">{toast.title}</span>}
              <span className="text-sm text-text-secondary leading-tight">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="absolute right-3 top-3.5 text-text-tertiary hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
