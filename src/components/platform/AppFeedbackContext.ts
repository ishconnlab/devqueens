import { createContext, useContext } from "react";

export type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
};

export type ToastVariant = "success" | "error";

type AppFeedbackValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  notify: (message: string, variant?: ToastVariant) => void;
};

export const AppFeedbackContext = createContext<AppFeedbackValue | null>(null);

export function useAppFeedback() {
  const feedback = useContext(AppFeedbackContext);
  if (!feedback) throw new Error("useAppFeedback must be used within AppFeedbackProvider.");
  return feedback;
}
