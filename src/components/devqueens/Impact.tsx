import { useEffect, useRef, useState } from "react";
import { FadeInView } from "./TextReveal";

const stats = [
  { value: 2400, label: "Community Members", suffix: "+" },
  { value: 18, label: "Countries Reached", suffix: "" },
  { value: 120, label: "Projects Built", suffix: "+" },
  { value: 45, label: "Mentors Active", suffix: "+" },
];

const testimonials = [
  {
    quote: "The support, mentorship, and opportunities I've gained have shaped my journey as a full-stack developer and co-founder.",
    name: "TETA Angel Bless",
    role: "Full-stack Developer & Co-founder",
  },
  {
    quote: "Building the right mindset is just as important as learning to code. The mentorship focus is exactly what young women need.",
    name: "Peace Ingabire",
    role: "Student, Rwanda Coding Academy",
  },
  {
    quote: "Resilience and the right mindset matter as much as technical skills. I'm honored to help young women build their paths in tech.",
    name: "Umugwaneza Aline",
    role: "Founder at ByteFlow Ltd",
  },
];

function AnimatedNumber({ target, suffix = "", delay = 0 }: { target: number; suffix?: string; delay?: number }) {
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let start: number, frame: number;
    const animate = (t: number) => {
      if (!start) start = t;
      const elapsed = t - start;
      const progress = Math.min(1, elapsed / 2000);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * target));
      if (progress < 1) frame = requestAnimationFrame(animate);
      else setCount(target);
    };
    const timeout = setTimeout(() => { frame = requestAnimationFrame(animate); }, delay);
    return () => { clearTimeout(timeout); if (frame) cancelAnimationFrame(frame); };
  }, [visible, target, delay]);

  return (
    <div ref={ref} className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-[hsl(var(--foreground))] tabular-nums leading-none">
      {count.toLocaleString()}{suffix}
    </div>
  );
}

export default function Impact() {
  return (
    <section id="impact" className="section-padding bg-[hsl(var(--card))]">
      <div className="section-container">
        <div className="max-w-2xl">
          <FadeInView>
            <p className="label-sm mb-4">Impact</p>
            <h2 className="heading-lg text-[hsl(var(--foreground))]">
              Our Community<br />
              <span className="text-[hsl(var(--primary))]">by the Numbers</span>
            </h2>
          </FadeInView>
        </div>

        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, i) => (
            <FadeInView key={stat.label} delay={i * 0.08}>
              <div>
                <AnimatedNumber target={stat.value} suffix={stat.suffix} delay={i * 100} />
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">{stat.label}</p>
              </div>
            </FadeInView>
          ))}
        </div>

        <div className="mt-24">
          <FadeInView>
            <p className="label-sm mb-4">Testimonials</p>
            <h3 className="heading-md text-[hsl(var(--foreground))]">
              Voices from the Community
            </h3>
          </FadeInView>

          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <FadeInView key={t.name} delay={i * 0.1}>
                <blockquote className="p-8 border border-[hsl(var(--border))] bg-[hsl(var(--background))] h-full flex flex-col">
                  <p className="body-md flex-1 leading-relaxed">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <footer className="mt-6 pt-6 border-t border-[hsl(var(--border))]">
                    <cite className="not-italic">
                      <p className="text-sm font-semibold text-[hsl(var(--foreground))]">{t.name}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{t.role}</p>
                    </cite>
                  </footer>
                </blockquote>
              </FadeInView>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
