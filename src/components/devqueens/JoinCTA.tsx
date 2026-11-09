import { ArrowRight, Sparkles } from "lucide-react";
import { FadeInView } from "./TextReveal";
import CommunityJoinButton from "./CommunityJoinButton";

export default function JoinCTA() {
  return (
    <section className="bg-white px-4 pb-20 sm:px-6 sm:pb-28">
      <FadeInView>
        <div className="section-container">
          <div className="relative overflow-hidden rounded-[2rem] bg-[#f4c744] px-6 py-12 sm:px-10 sm:py-16 lg:px-16">
            <div aria-hidden="true" className="absolute -right-20 -top-32 h-80 w-80 rounded-full border-[44px] border-white/30" />
            <div aria-hidden="true" className="absolute bottom-[-8rem] right-[22%] h-56 w-56 rounded-full bg-[#f5b09a]/75" />
            <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
              <div className="max-w-2xl">
                <p className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.15em] text-[#735600]"><Sparkles size={13} /> Your next chapter</p>
                <h2 className="mt-5 font-display text-4xl font-bold leading-[1.02] tracking-[-.05em] text-[#28213f] sm:text-5xl lg:text-6xl">There’s a place for you here.</h2>
                <p className="mt-4 max-w-lg text-sm leading-6 text-[#514a53] sm:text-base">Bring your curiosity. We’ll meet you at the beginning, wherever that is.</p>
              </div>
              <CommunityJoinButton className="group inline-flex min-h-12 items-center justify-center gap-3 self-end rounded-full bg-[#34295d] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#493b7d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#34295d]">
                Join the community <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </CommunityJoinButton>
            </div>
          </div>
        </div>
      </FadeInView>
    </section>
  );
}
