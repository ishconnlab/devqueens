import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { AppFeedbackContext, type ConfirmOptions, type ToastVariant } from "./AppFeedbackContext";

type ToastMessage = {
  id: number;
  message: string;
  variant: ToastVariant;
};

export function AppFeedbackProvider({ children }: { children: ReactNode }) {
  const [confirmation, setConfirmation] = useState<ConfirmOptions | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const resolveConfirmation = useRef<((accepted: boolean) => void) | null>(null);
  const nextToastId = useRef(0);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  const confirm = useCallback((options: ConfirmOptions) => new Promise<boolean>((resolve) => {
    resolveConfirmation.current?.(false);
    resolveConfirmation.current = resolve;
    setConfirmation(options);
  }), []);

  const settleConfirmation = useCallback((accepted: boolean) => {
    const resolve = resolveConfirmation.current;
    resolveConfirmation.current = null;
    setConfirmation(null);
    resolve?.(accepted);
  }, []);

  const notify = useCallback((message: string, variant: ToastVariant = "success") => {
    nextToastId.current += 1;
    setToast({ id: nextToastId.current, message, variant });
  }, []);

  useEffect(() => {
    if (!confirmation) return;
    confirmButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") settleConfirmation(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [confirmation, settleConfirmation]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => {
      setToast((current) => current?.id === toast.id ? null : current);
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => () => resolveConfirmation.current?.(false), []);

  return (
    <AppFeedbackContext.Provider value={{ confirm, notify }}>
      {children}
      {toast && (
        <div
          role={toast.variant === "error" ? "alert" : "status"}
          aria-live={toast.variant === "error" ? "assertive" : "polite"}
          className={`fixed bottom-5 right-5 z-[70] flex max-w-sm items-start gap-3 rounded-xl border bg-white px-4 py-3 text-sm shadow-lg ${toast.variant === "error" ? "border-red-200 text-red-800" : "border-emerald-200 text-emerald-900"}`}
        >
          <span className="flex-1">{toast.message}</span>
          <button type="button" onClick={() => setToast(null)} aria-label="Dismiss notification" className="rounded p-0.5 opacity-70 hover:bg-black/5 hover:opacity-100">
            <X size={16} />
          </button>
        </div>
      )}
      {confirmation && (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-[#211b2b]/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) settleConfirmation(false);
          }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="app-confirm-title" aria-describedby="app-confirm-message" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 id="app-confirm-title" className="font-display text-xl font-bold text-[#29213F]">{confirmation.title}</h2>
            <p id="app-confirm-message" className="mt-3 whitespace-pre-line text-sm leading-6 text-[#625e6b]">{confirmation.message}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => settleConfirmation(false)} className="btn-outline-brand">Cancel</button>
              <button
                ref={confirmButtonRef}
                type="button"
                onClick={() => settleConfirmation(true)}
                className={confirmation.destructive ? "inline-flex min-h-11 items-center justify-center rounded-lg bg-red-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-800" : "btn-brand"}
              >
                {confirmation.confirmLabel ?? "Confirm"}
              </button>
            </div>
          </section>
        </div>
      )}
    </AppFeedbackContext.Provider>
  );
}
