import { ArrowUpRight, Compass, Lightbulb, UsersRound } from "lucide-react";
import { FadeInView } from "./TextReveal";
import { IshConnectLink } from "./DevQueensLogo";

const principles = [
  { icon: Compass, title: "Begin where you are", text: "No tech background required. Curiosity is a good place to start." },
  { icon: Lightbulb, title: "Learn by making", text: "Explore practical skills and turn what you learn into things you can share." },
  { icon: UsersRound, title: "Grow together", text: "Find a welcoming space to learn, ask questions, and connect with others." },
];

export default function About() {
  return (
    <section id="about" className="overflow-hidden bg-[#fbf7f1] py-20 sm:py-28">
      <div className="section-container">
        <div className="grid items-center gap-12 lg:grid-cols-[.95fr_1.05fr] lg:gap-20">
          <FadeInView className="relative">
            <div className="relative mx-auto max-w-[500px] overflow-hidden rounded-[2rem] bg-[#eee8f5] p-6 sm:p-9">
              <div aria-hidden="true" className="absolute -left-16 -top-20 h-56 w-56 rounded-full bg-[#f4c744]/60" />
              <div aria-hidden="true" className="absolute -bottom-16 -right-10 h-48 w-48 rounded-full bg-[#e8a18e]/60" />
              <div className="relative rounded-[1.4rem] bg-[#34295d] p-5 text-white shadow-2xl shadow-[#34295d]/20 sm:p-7">
                <div className="flex items-center justify-between border-b border-white/15 pb-4">
                  <span className="font-display text-sm font-bold tracking-tight">a thought becomes a thing</span>
                  <span className="rounded-full bg-white/10 px-2.5 py-1 font-mono text-[10px] text-[#f4c744]">~/devqueens</span>
                </div>
                <div className="space-y-3 py-8 font-mono text-xs leading-6 sm:text-sm">
                  <p><span className="text-[#f4c744]">const</span> curiosity = <span className="text-[#f5b09a]">"start here"</span>;</p>
                  <p><span className="text-[#f4c744]">while</span> (learning) {"{"}</p>
                  <p className="pl-5 text-white/75">trySomethingNew();</p>
                  <p className="pl-5 text-white/75">buildWithOthers();</p>
                  <p>{"}"}</p>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white/10 p-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[.15em] text-white/50">Your next line</p>
                    <p className="mt-1 font-display text-sm font-semibold">is yours to write.</p>
                  </div>
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-[#f4c744] text-[#34295d]"><ArrowUpRight size={17} /></span>
                </div>
              </div>
              <p className="relative mt-5 text-center text-xs font-medium text-[#51447e]">A learning community by DevQueens</p>
            </div>
          </FadeInView>

          <div>
            <FadeInView>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[.18em] text-[#e5684f]">About DevQueens</p>
              <h2 className="max-w-xl font-display text-4xl font-bold leading-[1.04] tracking-[-.045em] text-[#28213f] sm:text-5xl">
                Technology is for the curious.
              </h2>
              <p className="mt-6 max-w-xl text-base leading-7 text-[#625e6b]">
                DevQueens is a girls-focused technology learning and community initiative by IshConnect. It welcomes beginners, students, and aspiring technology professionals to explore digital skills and discover what they can create.
              </p>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[#77717d]">
                From first steps with computers and the web to exploring development, design, and emerging fields, make your learning journey your own.
              </p>
            </FadeInView>
            <div className="mt-8 space-y-3">
              {principles.map((item, index) => (
                <FadeInView key={item.title} delay={index * 0.06}>
                  <div className="flex gap-4 border-t border-[#e6ddd3] py-4">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-[#e5684f] shadow-sm"><item.icon size={17} /></span>
                    <div>
                      <h3 className="font-display text-sm font-bold text-[#34295d]">{item.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-[#77717d]">{item.text}</p>
                    </div>
                  </div>
                </FadeInView>
              ))}
            </div>
            <p className="mt-5 text-xs text-[#8b8490]">DevQueens — An initiative by <IshConnectLink className="font-semibold text-[#51447e] underline decoration-[#e5684f]/50 underline-offset-4">IshConnect</IshConnectLink>.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
