import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] px-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="text-center max-w-sm"
      >
        <div className="w-14 h-14 bg-[hsl(var(--foreground))] flex items-center justify-center mx-auto mb-6">
          <span className="text-base font-bold text-[hsl(var(--background))]">404</span>
        </div>
        <h1 className="heading-lg text-[hsl(var(--foreground))] mb-3">Page Not Found</h1>
        <p className="body-lg mb-8">This page doesn't exist. Let's get you back on track.</p>
        <a href="/" className="btn-primary">
          <span className="flex items-center gap-2">
            <ArrowLeft size={14} />
            Return Home
          </span>
        </a>
      </motion.div>
    </div>
  );
}
