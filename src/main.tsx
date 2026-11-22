import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AppFeedbackProvider } from "@/components/platform/AppFeedback";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <AppFeedbackProvider>
    <App />
  </AppFeedbackProvider>,
);
