import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, BookOpen } from "lucide-react";
import { useRef } from "react";
import { FadeInView } from "./TextReveal";
import DevQueensLogo, { IshConnectLink } from "./DevQueensLogo";

const stats = [
  { value: "2,400+", label: "Community Members" },
  { value: "18", label: "Countries" },
  { value: "45+", label: "Mentors" },
];

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 60]);

  return (
    <section ref={ref} className="relative min-h-[90vh] flex items-center overflow-hidden bg-[hsl(var(--background))]">
      <motion.div style={{ y }} className="absolute inset-0">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-[hsl(var(--secondary))]" />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[hsl(var(--secondary))] to-transparent" />
      </motion.div>

      <div className="relative z-10 section-container w-full pt-24 pb-16">
        <div className="grid lg:grid-cols-12 gap-10 min-h-[70vh] items-center">
          <div className="lg:col-span-7">
            <FadeInView delay={0.1}>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--foreground))]" />
                <span className="label-sm">An Initiative by <IshConnectLink className="hover:opacity-60 transition-opacity">ISHConnect</IshConnectLink></span>
              </div>
            </FadeInView>

            <FadeInView delay={0.15}>
              <h1 className="heading-xl">
                Your Journey into
                <span className="block text-[hsl(var(--muted-foreground))]">Technology Starts Here</span>
              </h1>
            </FadeInView>

            <FadeInView delay={0.25}>
              <p className="body-lg mt-5 max-w-lg">
                A free learning ecosystem for African women. Master coding, AI, cybersecurity, and design — from beginner to professional.
              </p>
            </FadeInView>

            <FadeInView delay={0.35}>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#paths" className="btn-primary">
                  <span className="flex items-center gap-2">
                    <BookOpen size={14} />
                    Start Learning Free
                  </span>
                </a>
                <a href="https://chat.whatsapp.com/BIyl1UovWjzLwcGw6vtcUJ" target="_blank" rel="noopener noreferrer" className="btn-outline">
                  Join Community
                </a>
              </div>
            </FadeInView>

            <FadeInView delay={0.45}>
              <div className="mt-10 flex items-center gap-8">
                {stats.map((s) => (
                  <div key={s.label}>
                    <p className="font-display text-xl font-bold text-[hsl(var(--foreground))]">{s.value}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </FadeInView>
          </div>

          <FadeInView delay={0.5} className="lg:col-span-4 lg:col-start-9 hidden lg:block">
            <div className="aspect-[3/4] bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] flex items-center justify-center">
              <div className="text-center p-8">
                <DevQueensLogo variant="hero" />
                <p className="font-display text-lg font-bold text-[hsl(var(--foreground))]">DevQueens</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 leading-relaxed max-w-[180px] mx-auto">
                  Empowering African women through free tech education
                </p>
                <div className="divider my-4" />
                <div className="flex justify-center gap-2">
                  {["Learn", "Build", "Lead"].map((w) => (
                    <span key={w} className="tag text-[10px]">{w}</span>
                  ))}
                </div>
              </div>
            </div>
          </FadeInView>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="flex flex-col items-center gap-1">
          <span className="text-[9px] text-[hsl(var(--muted-foreground)/0.4)] uppercase tracking-[0.15em] font-medium">Scroll</span>
          <ArrowRight size={10} className="text-[hsl(var(--muted-foreground)/0.4)] rotate-90" />
        </motion.div>
      </div>
    </section>
  );
}
