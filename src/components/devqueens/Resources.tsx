import { ArrowUpRight, CalendarDays, GraduationCap, Sparkles } from "lucide-react";
import { FadeInView } from "./TextReveal";

export default function Resources() {
  return (
    <section id="advanced-ai" className="overflow-hidden bg-[#34295d] py-20 text-white sm:py-24">
      <div className="section-container">
        <FadeInView className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#41366d] p-6 sm:p-10 lg:p-14">
          <div aria-hidden="true" className="absolute -right-14 -top-32 h-80 w-80 rounded-full border-[48px] border-white/[.06]" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-[#f4c744]"><Sparkles size={14} /> IshConnect QuickLink</p>
              <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-[-.04em] sm:text-4xl">Join a bootcamp or live training.</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/65">
                QuickLink is IshConnect’s sign-in portal for bootcamps, instructor-led training classes, e-classes, and other organized programs. Use it when you’re taking part in one of these programs; DevQueens courses and self-paced learning stay here in the DevQueens portal.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs font-medium text-white/80">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2"><GraduationCap size={14} className="text-[#f4c744]" /> Bootcamps & e-classes</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2"><CalendarDays size={14} className="text-[#f5b09a]" /> Scheduled training</span>
              </div>
            </div>
            <a href="https://quicklink.ishconnect.rw/login" target="_blank" rel="noopener noreferrer" className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#f4c744] px-6 text-sm font-bold text-[#34295d] transition hover:bg-[#ffda69] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f4c744]">
              Open QuickLink <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </FadeInView>
      </div>
    </section>
  );
}
