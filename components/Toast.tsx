"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

let toastId = 0;
const toastListeners: ((toast: Toast) => void)[] = [];

export function showToast(message: string, type: "success" | "error" | "info" = "success") {
  const toast: Toast = { id: toastId++, message, type };
  toastListeners.forEach(listener => listener(toast));
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (toast: Toast) => {
      setToasts(prev => [...prev, toast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, 3000);
    };
    toastListeners.push(listener);
    return () => {
      const index = toastListeners.indexOf(listener);
      if (index > -1) toastListeners.splice(index, 1);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border backdrop-blur-sm animate-slide-up ${
            toast.type === "success"
              ? "bg-green-900/90 border-green-700 text-green-100"
              : toast.type === "error"
              ? "bg-red-900/90 border-red-700 text-red-100"
              : "bg-blue-900/90 border-blue-700 text-blue-100"
          }`}
        >
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm font-medium">{toast.message}</span>
          <button
            onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
            className="ml-2 hover:opacity-70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
