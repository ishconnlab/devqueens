import { ArrowRight, Code2, Heart, MessageCircle, UsersRound } from "lucide-react";
import { FadeInView } from "./TextReveal";
import CommunityJoinButton from "./CommunityJoinButton";

const moments = [
  { icon: Code2, number: "01", title: "Try something new", text: "Take a first step into a field you have always wondered about.", color: "bg-[#f4c744]" },
  { icon: UsersRound, number: "02", title: "Learn with others", text: "Share questions, encouragement, and ideas with the community.", color: "bg-[#e9dff5]" },
  { icon: Heart, number: "03", title: "Keep your momentum", text: "Build confidence one small, consistent step at a time.", color: "bg-[#f7ddd3]" },
];

export default function Community() {
  return (
    <section id="community" className="bg-white py-20 sm:py-28">
      <div className="section-container">
        <div className="grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-end">
          <FadeInView>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[.18em] text-[#e5684f]">Learning in community</p>
            <h2 className="max-w-lg font-display text-4xl font-bold leading-[1.04] tracking-[-.045em] text-[#28213f] sm:text-5xl">There’s more than one way to grow.</h2>
          </FadeInView>
          <FadeInView delay={0.1}>
            <p className="max-w-xl text-base leading-7 text-[#625e6b]">
              Learning feels different when you can share the questions, ideas, and small wins along the way. DevQueens brings learning paths and community together so you can keep exploring at your own pace.
            </p>
          </FadeInView>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {moments.map((item, index) => (
            <FadeInView key={item.number} delay={index * 0.07}>
              <article className="group h-full rounded-2xl border border-[#eee8e0] bg-[#fbf9f5] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#d8cce8] hover:shadow-xl hover:shadow-[#34295d]/[.06] sm:p-7">
                <div className="flex items-center justify-between">
                  <span className={`grid h-11 w-11 place-items-center rounded-2xl text-[#34295d] ${item.color}`}><item.icon size={19} /></span>
                  <span className="font-mono text-xs text-[#aaa2ad]">{item.number}</span>
                </div>
                <h3 className="mt-8 font-display text-xl font-bold tracking-tight text-[#34295d]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#77717d]">{item.text}</p>
              </article>
            </FadeInView>
          ))}
        </div>

        <FadeInView delay={0.18}>
          <div className="relative mt-6 overflow-hidden rounded-[1.75rem] bg-[#f3ede5] p-6 sm:p-9 lg:p-10">
            <div aria-hidden="true" className="absolute -right-20 -top-32 h-72 w-72 rounded-full border-[42px] border-[#e9dff5]" />
            <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
              <div className="max-w-xl">
                <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#766a91]"><MessageCircle size={14} /> Stay connected</p>
                <h3 className="mt-3 font-display text-2xl font-bold tracking-tight text-[#34295d] sm:text-3xl">Bring your questions. Find your people.</h3>
                <p className="mt-2 text-sm leading-6 text-[#77717d]">Join the DevQueens WhatsApp community to connect with other learners and keep up with conversations.</p>
              </div>
              <CommunityJoinButton className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#34295d] px-6 text-sm font-semibold text-white transition hover:bg-[#493b7d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#34295d]">
                Join the community <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </CommunityJoinButton>
            </div>
          </div>
        </FadeInView>
      </div>
    </section>
  );
}
