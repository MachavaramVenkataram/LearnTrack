"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextType {
  showToast: (title: string, description?: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (title: string, description?: string, type: ToastType = "success") => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, title, description, type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none p-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto p-3.5 rounded-2xl border shadow-elevated bg-white flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200",
              toast.type === "success" && "border-emerald-200",
              toast.type === "error" && "border-rose-200",
              toast.type === "info" && "border-blue-200"
            )}
          >
            <div
              className={cn(
                "w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                toast.type === "success" && "bg-emerald-50 text-emerald-600",
                toast.type === "error" && "bg-rose-50 text-rose-600",
                toast.type === "info" && "bg-blue-50 text-blue-600"
              )}
            >
              {toast.type === "success" && <CheckCircle2 className="w-4 h-4" />}
              {toast.type === "error" && <AlertCircle className="w-4 h-4" />}
              {toast.type === "info" && <Info className="w-4 h-4" />}
            </div>

            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-semibold text-slate-900 leading-tight">
                {toast.title}
              </h5>
              {toast.description && (
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                  {toast.description}
                </p>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
