import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight, Braces, Code2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { FadeInView } from "./TextReveal";

function LearningIllustration() {
  return (
    <div className="relative mx-auto aspect-[0.94] w-full max-w-[540px]" role="img" aria-label="Illustration of girls learning to code together">
      <div className="absolute inset-[8%_7%_8%_9%] rounded-[48%_48%_40%_40%] bg-[#f7c7b5]" />
      <div className="absolute right-[5%] top-[13%] grid h-16 w-16 place-items-center rounded-2xl bg-[#2d2559] text-white shadow-xl shadow-[#2d2559]/20">
        <Braces size={26} />
      </div>
      <div className="absolute left-[3%] top-[35%] grid h-12 w-12 place-items-center rounded-full bg-[#f4c744] text-[#2d2559] shadow-lg">
        <Sparkles size={20} />
      </div>
      <div className="absolute bottom-[13%] right-[3%] grid h-14 w-14 place-items-center rounded-2xl bg-white text-[#e5684f] shadow-lg">
        <Code2 size={24} />
      </div>

      <svg viewBox="0 0 520 560" className="absolute inset-0 h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="260" cy="493" rx="174" ry="25" fill="#D99D8E" fillOpacity=".42" />
        <path d="M92 427c18-42 45-65 88-65 39 0 68 19 88 55v65H92v-55Z" fill="#F4C744" />
        <path d="M91 421c13-34 25-64 19-89-5-23-1-45 18-56 17-11 38-7 52 4 22 17 20 48 10 72-13 30-7 52 2 75l-100-6Z" fill="#34295D" />
        <path d="M123 281c6-40 41-67 78-59 27 6 46 30 44 58-2 27-26 48-56 49-41 1-72-18-66-48Z" fill="#7B493E" />
        <path d="M181 291c13 3 21 15 18 27l-5 24c-2 11-13 18-24 16l-22-5c-10-2-16-12-14-22l6-26c2-11 13-18 24-16l17 2Z" fill="#C77D69" />
        <path d="M134 300c11-21 25-27 44-27 17 0 27-8 31-20 23 14 35 44 28 70l-15 5c1-21-9-33-23-36-14-3-31 6-46 17-9 7-17 11-26 10l7-19Z" fill="#34295D" />
        <path d="M227 389c25-25 55-38 90-38 51 0 78 31 92 77v55H220v-36c0-22 2-43 7-58Z" fill="#6355A4" />
        <path d="M262 391c-10-32-14-61-27-82-14-22-8-50 13-64 20-13 44-7 57 9 17 20 12 49 1 73-10 23-5 47 5 73l-49-9Z" fill="#3A2D65" />
        <path d="M270 260c8-39 44-62 80-50 27 9 42 35 37 63-5 27-31 44-60 42-40-4-70-25-57-55Z" fill="#A8604D" />
        <path d="M323 281c12 5 18 18 13 29l-9 22c-4 10-16 15-26 11l-21-9c-10-4-14-15-10-25l10-25c4-10 16-15 26-11l17 8Z" fill="#D89078" />
        <path d="M274 274c14-19 29-23 48-19 17 4 28-2 34-13 20 18 27 49 16 73l-16 1c5-20-3-34-16-40-14-6-32 0-48 8-10 5-19 7-27 5l9-15Z" fill="#3A2D65" />
        <path d="M152 423h239l-22 78H173l-21-78Z" fill="#272044" />
        <path d="M168 434h205l-14 52H183l-15-52Z" fill="#F7F1E9" />
        <path d="m248 453 12-10 12 10-12 10-12-10Z" fill="#E5684F" />
        <path d="M224 473h58" stroke="#D7CFC4" strokeWidth="4" strokeLinecap="round" />
        <circle cx="345" cy="454" r="5" fill="#F4C744" />
        <path d="M260 110v28m-14-14h28" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".8" />
        <circle cx="260" cy="124" r="22" stroke="#fff" strokeOpacity=".6" strokeWidth="1.5" />
        <path d="m116 173 7 11 13 2-9 9 2 13-13-6-12 6 2-13-10-9 14-2 6-11Z" fill="#F4C744" />
      </svg>

      <motion.div
        className="absolute bottom-[3%] left-[0%] rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-xl shadow-[#34295d]/10 backdrop-blur"
        animate={useReducedMotion() ? undefined : { y: [0, -7, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[.15em] text-stone-500">A place to</p>
        <p className="mt-1 font-display text-sm font-bold text-[#2d2559]">learn · build · belong</p>
      </motion.div>
    </div>
  );
}

export default function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden bg-[#fbf7f1] pb-14 pt-28 sm:pt-32 lg:min-h-[calc(100svh-1rem)] lg:pb-20 lg:pt-28">
      <div aria-hidden="true" className="pointer-events-none absolute -right-36 top-12 -z-10 h-[34rem] w-[34rem] rounded-full border border-[#e9d8c8] sm:right-[-8rem]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 top-32 -z-10 h-[25rem] w-[25rem] rounded-full border border-[#e9d8c8]" />
      <div className="section-container grid items-center gap-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-4">
        <div className="relative z-10 py-6 lg:py-12">
          <FadeInView delay={0.05}>
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#e9d8c8] bg-white/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[.14em] text-[#51447e]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#e5684f]" />
              An initiative by IshConnect
            </p>
          </FadeInView>
          <FadeInView delay={0.12}>
            <h1 className="max-w-[740px] font-display text-[clamp(3.2rem,7.2vw,6.6rem)] font-bold leading-[.94] tracking-[-.065em] text-[#28213f]">
              Make room
              <br />
              for your <span className="relative whitespace-nowrap text-[#e5684f]">ideas<span aria-hidden="true" className="absolute -bottom-2 left-0 -z-10 h-3 w-full -rotate-2 rounded-full bg-[#f4c744]/70" /></span>
              <br />
              in tech.
            </h1>
          </FadeInView>
          <FadeInView delay={0.22}>
            <p className="mt-7 max-w-[490px] text-base leading-7 text-[#625e6b] sm:text-lg sm:leading-8">
              Curious about technology? Start right where you are. Learn new skills, make things that matter, and grow alongside a community cheering you on.
            </p>
          </FadeInView>
          <FadeInView delay={0.3}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#paths" className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#34295d] px-6 text-sm font-semibold text-white transition hover:bg-[#493b7d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#34295d]">
                Explore learning paths <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </a>
              <Link to="/register" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d9cdbf] bg-white/60 px-6 text-sm font-semibold text-[#34295d] transition hover:border-[#34295d] hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#34295d]">
                Join DevQueens
              </Link>
            </div>
          </FadeInView>
          <FadeInView delay={0.38}>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[#e8dfd5] pt-5 text-xs font-medium text-[#716a78]">
              <span className="inline-flex items-center gap-2"><span className="grid h-6 w-6 place-items-center rounded-full bg-[#f4c744]/40 text-[#34295d]">01</span>Start as a beginner</span>
              <span className="inline-flex items-center gap-2"><span className="grid h-6 w-6 place-items-center rounded-full bg-[#e9dff5] text-[#34295d]">02</span>Learn by doing</span>
              <span className="inline-flex items-center gap-2"><span className="grid h-6 w-6 place-items-center rounded-full bg-[#f7ddd3] text-[#34295d]">03</span>Find your people</span>
            </div>
          </FadeInView>
        </div>
        <FadeInView delay={0.2} direction="none" className="relative mx-auto w-full max-w-[560px] lg:max-w-none">
          <LearningIllustration />
        </FadeInView>
      </div>
      <motion.a
        href="#about"
        aria-label="Scroll to learn about DevQueens"
        className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-[10px] font-semibold uppercase tracking-[.2em] text-[#817a88] lg:flex"
        animate={reduceMotion ? undefined : { y: [0, 5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        Discover <ArrowDown size={13} />
      </motion.a>
    </section>
  );
}
