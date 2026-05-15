import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";

interface Toast {
  id: string;
  title: string;
  message: string;
  type?: "success" | "error" | "info";
}

const ToastContext = createContext<{ showToast: (toast: Omit<Toast, "id">) => void } | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const value = useMemo(
    () => ({
      showToast: (toast: Omit<Toast, "id">) => {
        const id = crypto.randomUUID();
        setToasts((items) => [{ id, ...toast }, ...items].slice(0, 3));
        window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 4500);
      },
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] w-[min(360px,calc(100vw-2rem))] space-y-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
            >
              <div className="flex gap-3">
                <CheckCircle2 className={`mt-0.5 size-5 ${toast.type === "error" ? "text-rose-600" : "text-emerald-600"}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-950">{toast.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{toast.message}</p>
                </div>
                <button className="text-slate-400 hover:text-slate-700" onClick={() => setToasts((items) => items.filter((item) => item.id !== toast.id))}>
                  <X className="size-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast must be used within ToastProvider");
  return value;
}
