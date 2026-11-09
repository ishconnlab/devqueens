import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import DevQueensLogo from "./DevQueensLogo";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Learning paths", href: "#paths" },
  { label: "Courses", href: "#courses" },
  { label: "Stories", href: "#stories" },
  { label: "Community", href: "#community" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const sectionHref = (href: string) => pathname === "/" ? href : `/${href}`;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-[#e8dfd5] bg-[#fbf7f1]/95 shadow-sm shadow-[#34295d]/[.03] backdrop-blur-md" : "bg-[#fbf7f1]/80 backdrop-blur-sm"
      }`}
    >
      <div className="section-container flex h-16 items-center justify-between md:h-[76px]">
        <a href="/" className="flex items-center" aria-label="DevQueens home">
          <DevQueensLogo variant="navbar" />
          <span className="ml-2 hidden font-display text-sm font-bold tracking-tight text-[#34295d] sm:inline">DevQueens</span>
        </a>

        <nav aria-label="Main navigation" className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={sectionHref(link.href)}
              className="text-xs font-medium text-[#716a78] transition-colors hover:text-[#34295d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#34295d]"
            >
              {link.label}
            </a>
          ))}
          <Link to="/login" className="text-xs font-medium text-[#716a78] transition-colors hover:text-[#34295d]">Sign in</Link>
          <Link to="/register" className="rounded-full bg-[#34295d] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#493b7d]">Join DevQueens</Link>
        </nav>

        <button onClick={() => setOpen(!open)} className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full border border-[#e8dfd5] md:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
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
            className="overflow-hidden border-t border-[#e8dfd5] bg-[#fbf7f1] md:hidden"
          >
            <nav aria-label="Mobile navigation" className="section-container flex flex-col gap-1 py-5">
              {navLinks.map((link) => (
                <a key={link.href} href={sectionHref(link.href)} onClick={() => setOpen(false)} className="rounded-lg py-3 text-sm font-medium text-[#716a78] transition-colors hover:bg-white hover:text-[#34295d]">
                  {link.label}
                </a>
              ))}
              <div className="my-2 h-px bg-[#e8dfd5]" />
              <Link to="/login" onClick={() => setOpen(false)} className="py-2 text-sm text-[#716a78]">
                Sign in
              </Link>
              <Link to="/register" onClick={() => setOpen(false)} className="mt-2 inline-flex min-h-11 items-center justify-center rounded-full bg-[#34295d] px-5 text-sm font-semibold text-white">
                Join DevQueens
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
