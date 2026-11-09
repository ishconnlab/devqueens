import { ArrowUpRight, BriefcaseBusiness, FileUser, GitPullRequest, Presentation } from "lucide-react";
import { Link } from "react-router-dom";
import { FadeInView } from "./TextReveal";

const nextSteps = [
  { icon: Presentation, title: "Show what you can do", detail: "Build a portfolio around projects you’ve worked on." },
  { icon: FileUser, title: "Tell your story", detail: "Practice shaping your CV and professional profile." },
  { icon: GitPullRequest, title: "Contribute with others", detail: "Explore open-source work and collaborative tools." },
  { icon: BriefcaseBusiness, title: "Prepare for what’s next", detail: "Build confidence for interviews and new opportunities." },
];

export default function Opportunities() {
  return (
    <section id="opportunities" className="bg-[#fbf7f1] py-20 sm:py-28">
      <div className="section-container">
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
          <FadeInView>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[.18em] text-[#e5684f]">Beyond the lessons</p>
            <h2 className="max-w-md font-display text-4xl font-bold leading-[1.04] tracking-[-.045em] text-[#28213f] sm:text-5xl">Skills are a beginning.</h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-[#77717d]">
              The Career & Professional Growth path includes practical ways to prepare for your next step. These are skills to build, not promised jobs or placements.
            </p>
            <Link to="/#paths" className="group mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#51447e]">
              Explore the learning paths <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </FadeInView>
          <div className="grid gap-3 sm:grid-cols-2">
            {nextSteps.map((step, index) => (
              <FadeInView key={step.title} delay={index * 0.06}>
                <article className="h-full rounded-2xl border border-[#e8dfd5] bg-white p-5 sm:p-6">
                  <step.icon size={20} className="text-[#e5684f]" />
                  <h3 className="mt-5 font-display text-base font-bold text-[#34295d]">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#77717d]">{step.detail}</p>
                </article>
              </FadeInView>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
