import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownRight, ArrowRight, BookOpen, BriefcaseBusiness, Code2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { FadeInView } from "./TextReveal";

const paths = [
  {
    id: "beginner",
    icon: BookOpen,
    title: "Beginner Path",
    subtitle: "Start from wherever you are.",
    description: "Get comfortable with computers, the web, digital tools, and your first steps in code. No experience needed.",
    skills: ["Computer basics", "Digital literacy", "Introduction to coding", "HTML & CSS", "JavaScript basics", "Git & GitHub", "UI/UX basics"],
    color: "#f4c744",
    number: "01",
  },
  {
    id: "intermediate",
    icon: Code2,
    title: "Intermediate Path",
    subtitle: "Turn ideas into applications.",
    description: "Build on your foundation with modern development tools, frameworks, APIs, and databases.",
    skills: ["React", "Next.js", "TypeScript", "Node.js", "APIs & REST", "Databases", "Figma", "Tailwind CSS"],
    color: "#f5b09a",
    number: "02",
  },
  {
    id: "advanced",
    icon: Sparkles,
    title: "Advanced Path",
    subtitle: "Go deeper and find your focus.",
    description: "Explore advanced areas of technology, from AI and data to cloud infrastructure and security.",
    skills: ["AI & machine learning", "Cybersecurity", "Cloud computing", "DevOps", "Data structures", "Mobile development", "System design"],
    color: "#b9acd9",
    number: "03",
  },
  {
    id: "career",
    icon: BriefcaseBusiness,
    title: "Career & Professional Growth",
    subtitle: "Take your skills into the world.",
    description: "Prepare to share your work, pursue opportunities, and keep growing in the technology community.",
    skills: ["Portfolio creation", "CV & resume", "Interview preparation", "Open source", "Freelancing", "Remote work", "Personal branding"],
    color: "#a9c5ad",
    number: "04",
  },
] as const;

function PathIllustration({ pathId }: { pathId: "beginner" | "intermediate" | "advanced" | "career" }) {
  const illustrations = {
    beginner: {
      label: "A laptop showing a simple web browser and digital tools",
      art: <><rect x="69" y="24" width="182" height="106" rx="9" fill="#34295D" /><rect x="78" y="33" width="164" height="88" rx="4" fill="#FFF" /><path d="M78 44h164" stroke="#DED6E7" /><circle cx="87" cy="39" r="2" fill="#E5684F" /><circle cx="94" cy="39" r="2" fill="#F4C744" /><circle cx="101" cy="39" r="2" fill="#88AD91" /><rect x="91" y="54" width="56" height="55" rx="4" fill="#EEE8F5" /><path d="M100 67h38M100 76h30M100 85h34M100 94h22" stroke="#9482BE" strokeWidth="3" strokeLinecap="round" /><rect x="156" y="55" width="72" height="8" rx="4" fill="#F4C744" /><rect x="156" y="70" width="58" height="5" rx="2.5" fill="#DED6E7" /><rect x="156" y="81" width="65" height="5" rx="2.5" fill="#DED6E7" /><rect x="156" y="92" width="47" height="5" rx="2.5" fill="#DED6E7" /><path d="m45 138 37-8h154l38 8c5 1 4 8-2 8H47c-6 0-7-7-2-8Z" fill="#51447E" /><path d="M122 139h77" stroke="#B9ACD9" strokeWidth="2" strokeLinecap="round" /><rect x="38" y="56" width="18" height="18" rx="5" fill="#F4C744" /><path d="M44 65h6m-3-3v6" stroke="#735600" strokeWidth="1.5" strokeLinecap="round" /></>,
    },
    intermediate: {
      label: "A code editor and browser preview for building web applications",
      art: <><rect x="53" y="23" width="214" height="128" rx="10" fill="#34295D" /><path d="M53 45h214" stroke="#766A91" /><circle cx="66" cy="34" r="3" fill="#E5684F" /><circle cx="77" cy="34" r="3" fill="#F4C744" /><circle cx="88" cy="34" r="3" fill="#88AD91" /><rect x="66" y="56" width="94" height="82" rx="5" fill="#211A36" /><text x="77" y="75" fill="#F4C744" fontSize="10" fontFamily="monospace">const page =</text><text x="77" y="91" fill="#F5B09A" fontSize="10" fontFamily="monospace">{"<main>"}</text><path d="M80 100h54M80 109h43M80 118h48" stroke="#B9ACD9" strokeWidth="3" strokeLinecap="round" /><rect x="168" y="56" width="87" height="82" rx="5" fill="#FFF" /><rect x="177" y="65" width="69" height="31" rx="3" fill="#EEE8F5" /><circle cx="211" cy="78" r="8" fill="#F5B09A" /><rect x="178" y="103" width="57" height="5" rx="2.5" fill="#51447E" /><rect x="178" y="114" width="47" height="4" rx="2" fill="#DED6E7" /><rect x="178" y="123" width="53" height="4" rx="2" fill="#DED6E7" /></>,
    },
    advanced: {
      label: "A data dashboard with a machine-learning network visualization",
      art: <><rect x="58" y="24" width="203" height="127" rx="10" fill="#34295D" /><rect x="68" y="34" width="183" height="107" rx="5" fill="#FFF" /><path d="M68 50h183" stroke="#E8DFD5" /><rect x="79" y="40" width="35" height="4" rx="2" fill="#B9ACD9" /><rect x="79" y="61" width="81" height="69" rx="5" fill="#F7F4FA" /><path d="M90 119v-12l13-10 12 4 15-22 17-7" stroke="#51447E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /><circle cx="90" cy="107" r="3" fill="#F4C744" /><circle cx="103" cy="97" r="3" fill="#F4C744" /><circle cx="115" cy="101" r="3" fill="#F4C744" /><circle cx="130" cy="79" r="3" fill="#E5684F" /><circle cx="147" cy="72" r="3" fill="#E5684F" /><rect x="169" y="62" width="70" height="31" rx="5" fill="#EEE8F5" /><circle cx="186" cy="77" r="5" fill="#51447E" /><circle cx="218" cy="77" r="5" fill="#E5684F" /><path d="m191 77 19-9m-19 9 19 9" stroke="#B9ACD9" strokeWidth="2" /><circle cx="210" cy="68" r="4" fill="#F4C744" /><circle cx="210" cy="86" r="4" fill="#F4C744" /><rect x="169" y="101" width="70" height="29" rx="5" fill="#F7F4FA" /><path d="M179 121v-7m11 7v-12m11 12v-17m11 17v-10m11 10v-15" stroke="#9482BE" strokeWidth="5" strokeLinecap="round" /></>,
    },
    career: {
      label: "A project portfolio and a verified course completion certificate",
      art: <><rect x="57" y="30" width="146" height="106" rx="9" fill="#34295D" /><rect x="67" y="40" width="126" height="86" rx="5" fill="#FFF" /><rect x="77" y="50" width="106" height="34" rx="4" fill="#EEE8F5" /><rect x="85" y="58" width="34" height="19" rx="3" fill="#F5B09A" /><rect x="125" y="59" width="47" height="4" rx="2" fill="#51447E" /><rect x="125" y="68" width="38" height="3" rx="1.5" fill="#B9ACD9" /><rect x="78" y="92" width="100" height="4" rx="2" fill="#DED6E7" /><rect x="78" y="102" width="75" height="4" rx="2" fill="#DED6E7" /><path d="m100 139 30-7 30 7c4 1 3 6-1 6h-58c-4 0-5-5-1-6Z" fill="#51447E" /><rect x="171" y="71" width="91" height="69" rx="7" fill="#F4C744" transform="rotate(-8 171 71)" /><rect x="181" y="79" width="74" height="55" rx="4" fill="#FFF" transform="rotate(-8 181 79)" /><circle cx="214" cy="97" r="11" fill="#E5684F" /><path d="m209 97 4 4 7-8" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="m197 116 37-5m-35 11 26-4" stroke="#B9ACD9" strokeWidth="3" strokeLinecap="round" /></>,
    },
  } as const;
  const illustration = illustrations[pathId];

  return (
    <figure className="relative mx-auto w-full max-w-[330px]">
      <svg viewBox="0 0 320 180" role="img" aria-label={illustration.label} className="h-auto w-full">
        <ellipse cx="160" cy="156" rx="126" ry="10" fill="#34295D" fillOpacity=".08" />
        {illustration.art}
      </svg>
      <figcaption className="sr-only">{illustration.label}</figcaption>
    </figure>
  );
}

export default function LearningPaths() {
  const [activePath, setActivePath] = useState<(typeof paths)[number]["id"]>(paths[0].id);
  const reduceMotion = useReducedMotion();
  const active = paths.find((path) => path.id === activePath) ?? paths[0];

  return (
    <section id="paths" className="overflow-hidden bg-[#34295d] py-20 text-white sm:py-28">
      <div className="section-container">
        <FadeInView>
          <div className="grid gap-8 md:grid-cols-[.8fr_1.2fr] md:items-end">
            <div>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[.18em] text-[#f4c744]">Your learning journey</p>
              <h2 className="max-w-lg font-display text-4xl font-bold leading-[1.04] tracking-[-.04em] sm:text-5xl">
                A path that grows with you.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-white/65 sm:text-base">
              Start with the fundamentals, explore what interests you, and keep building. Choose a stage to see the skills included in each of DevQueens’ existing learning paths.
            </p>
          </div>
        </FadeInView>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
          <div className="relative grid content-start gap-3">
            <div aria-hidden="true" className="absolute bottom-8 left-[1.35rem] top-8 w-px bg-white/15" />
            {paths.map((path, index) => {
              const isActive = activePath === path.id;
              return (
                <FadeInView key={path.id} delay={index * 0.06}>
                  <button
                    type="button"
                    aria-expanded={isActive}
                    aria-controls="learning-path-detail"
                    onClick={() => setActivePath(path.id)}
                    className={`group relative flex min-h-[112px] w-full items-center gap-4 rounded-2xl border p-4 text-left transition duration-300 sm:p-5 lg:max-w-[460px] ${isActive ? "border-white/30 bg-white/10 shadow-xl shadow-black/10" : "border-transparent hover:border-white/15 hover:bg-white/[.04]"}`}
                  >
                    <span className="relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-[#34295d] shadow-sm transition group-hover:-rotate-3" style={{ backgroundColor: path.color }}>
                      <path.icon size={21} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-white/45">
                        <span>{path.number}</span><span className="h-px w-5 bg-white/20" /><span>Learning path</span>
                      </span>
                      <span className="mt-1 block font-display text-base font-bold text-white sm:text-lg">{path.title}</span>
                      <span className="mt-1 block text-xs text-white/55">{path.subtitle}</span>
                    </span>
                    <ArrowDownRight size={17} className={`shrink-0 transition ${isActive ? "rotate-[-45deg] text-[#f4c744]" : "text-white/35 group-hover:translate-x-0.5 group-hover:translate-y-0.5"}`} />
                  </button>
                </FadeInView>
              );
            })}
          </div>

          <motion.div
            id="learning-path-detail"
            key={active.id}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.25 }}
            className="relative min-h-[470px] overflow-hidden rounded-[1.75rem] bg-[#f8f2e9] p-6 text-[#34295d] sm:p-9"
          >
            <div className="relative flex h-full flex-col">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-[#766a91]">Path {active.number}</span>
                <active.icon size={22} style={{ color: active.color === "#f4c744" ? "#bc8c00" : active.color }} />
              </div>
              <div className="my-4 rounded-2xl bg-white/65 px-3 py-1">
                <PathIllustration pathId={active.id} />
              </div>
              <h3 className="mt-8 max-w-md font-display text-3xl font-bold leading-tight tracking-[-.04em] sm:text-4xl">{active.subtitle}</h3>
              <p className="mt-3 max-w-md text-sm leading-6 text-[#6d6678]">{active.description}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {active.skills.map((skill) => (
                  <span key={skill} className="rounded-full border border-[#ded6e7] bg-white/70 px-3 py-1.5 text-xs font-medium text-[#50466d]">{skill}</span>
                ))}
              </div>
              <Link to="/register" className="group mt-auto inline-flex w-fit items-center gap-2 pt-8 text-sm font-bold text-[#34295d]">
                Begin your journey <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
