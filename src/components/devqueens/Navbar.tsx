import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DevQueensLogo from "./DevQueensLogo";

const navLinks = [
  { label: "Paths", href: "#paths" },
  { label: "Resources", href: "#resources" },
  { label: "Community", href: "#community" },
  { label: "Opportunities", href: "#opportunities" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-[hsl(var(--background))]/95 backdrop-blur-sm border-b border-[hsl(var(--border))]" : "bg-transparent"
      }`}
    >
      <div className="section-container flex items-center justify-between h-16 md:h-20">
        <a href="#" className="flex items-center gap-3" aria-label="DevQueens home">
          <DevQueensLogo variant="navbar" />
          <span className="font-display text-sm font-semibold tracking-tight text-[hsl(var(--foreground))] hidden sm:block">
            DevQueens
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors duration-300"
            >
              {link.label}
            </a>
          ))}
          <a
            href="https://chat.whatsapp.com/BIyl1UovWjzLwcGw6vtcUJ"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-xs px-5 py-2.5"
          >
            Join Free
          </a>
        </nav>

        <button onClick={() => setOpen(!open)} className="md:hidden w-8 h-8 flex flex-col items-center justify-center gap-1.5" aria-label="Toggle menu">
          <motion.span animate={open ? { rotate: 45, y: 4 } : {}} className="block w-5 h-px bg-[hsl(var(--foreground))]" />
          <motion.span animate={open ? { opacity: 0 } : {}} className="block w-5 h-px bg-[hsl(var(--foreground))]" />
          <motion.span animate={open ? { rotate: -45, y: -4 } : {}} className="block w-5 h-px bg-[hsl(var(--foreground))]" />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden bg-[hsl(var(--background))] border-t border-[hsl(var(--border))]"
          >
            <div className="section-container py-6 flex flex-col gap-2">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} onClick={() => setOpen(false)} className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] py-2 transition-colors">
                  {link.label}
                </a>
              ))}
              <div className="divider my-2" />
              <a href="https://chat.whatsapp.com/BIyl1UovWjzLwcGw6vtcUJ" target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className="btn-primary text-xs text-center mt-2">
                Join DevQueens Free
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
