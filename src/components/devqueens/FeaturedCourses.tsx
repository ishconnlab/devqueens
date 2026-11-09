import { useEffect, useState } from "react";
import { ArrowUpRight, BarChart3, BookOpen, BrainCircuit, Clock3, Code2, LayoutGrid, ShieldCheck, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { FadeInView } from "./TextReveal";

type PublicCourse = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  level: string;
  duration: string;
  coverImage: string;
  modules: { title: string; lessons: { _id: string }[] }[];
};

const accents = [
  { base: "bg-[#eee8f5]", ink: "text-[#51447e]", mark: "bg-[#b9acd9]" },
  { base: "bg-[#fae8df]", ink: "text-[#a34c3b]", mark: "bg-[#f5b09a]" },
  { base: "bg-[#f8f0d7]", ink: "text-[#735600]", mark: "bg-[#f4c744]" },
];

function CourseArtwork({ course }: { course: PublicCourse }) {
  const [imageFailed, setImageFailed] = useState(false);
  const courseText = [course.title, course.description, ...course.modules.map((module) => module.title)].join(" ");
  const subject = /\b(cybersecurity|cyber security|encryption|network security)\b/i.test(courseText)
    ? "security"
    : /\b(artificial intelligence|machine learning|\bai\b|neural network)\b/i.test(courseText)
      ? "ai"
      : /\b(data science|data analytics|analytics|dataset)\b/i.test(courseText)
        ? "data"
        : /\b(mobile|android|ios|smartphone|app development)\b/i.test(courseText)
          ? "mobile"
          : /\b(ui\/ux|ux design|ui design|figma|interface design)\b/i.test(courseText)
            ? "design"
            : /\b(web|html|css|javascript|react|frontend)\b/i.test(courseText)
              ? "web"
              : "code";

  if (course.coverImage && !imageFailed) {
    return <img src={course.coverImage} alt={`${course.title} course cover`} loading="lazy" onError={() => setImageFailed(true)} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />;
  }

  const art = {
    security: { label: "A cybersecurity shield protecting a connected digital network", icon: ShieldCheck, card: "bg-[#eee8f5]", chip: "bg-[#d8cce8]", ink: "text-[#51447e]", detail: "SECURE · PROTECT · VERIFY" },
    ai: { label: "A machine-learning neural network connecting data nodes", icon: BrainCircuit, card: "bg-[#f7f0db]", chip: "bg-[#f4c744]", ink: "text-[#735600]", detail: "DATA · MODEL · LEARN" },
    data: { label: "A data analytics dashboard with a bar chart and trend line", icon: BarChart3, card: "bg-[#eaf2eb]", chip: "bg-[#a9c5ad]", ink: "text-[#456b4b]", detail: "EXPLORE · ANALYZE · SHARE" },
    mobile: { label: "A smartphone displaying a mobile application interface", icon: Smartphone, card: "bg-[#fae8df]", chip: "bg-[#f5b09a]", ink: "text-[#a34c3b]", detail: "DESIGN · BUILD · TEST" },
    design: { label: "A UI design board showing interface panels and a prototype", icon: LayoutGrid, card: "bg-[#eee8f5]", chip: "bg-[#b9acd9]", ink: "text-[#51447e]", detail: "WIREFRAME · PROTOTYPE · REFINE" },
    web: { label: "A web browser mockup with code and a responsive page preview", icon: Code2, card: "bg-[#fae8df]", chip: "bg-[#f5b09a]", ink: "text-[#a34c3b]", detail: "HTML · CSS · JAVASCRIPT" },
    code: { label: "A laptop showing a code editor and software project", icon: Code2, card: "bg-[#eee8f5]", chip: "bg-[#b9acd9]", ink: "text-[#51447e]", detail: "WRITE · RUN · IMPROVE" },
  }[subject];
  const Icon = art.icon;

  return (
    <div role="img" aria-label={art.label} className={`relative flex h-full w-full items-center justify-center overflow-hidden ${art.card}`}>
      <div aria-hidden="true" className="absolute -right-8 -top-14 h-48 w-48 rounded-full border-[28px] border-white/50" />
      {subject === "mobile" ? (
        <div aria-hidden="true" className="relative h-[72%] max-h-40 min-h-28 aspect-[.56] rounded-[1.2rem] border-[5px] border-[#34295d] bg-white p-2 shadow-lg">
          <div className="mx-auto mb-2 h-1 w-8 rounded-full bg-[#d8cce8]" />
          <div className={`grid h-1/3 place-items-center rounded-lg ${art.chip} ${art.ink}`}><Icon size={20} /></div>
          <div className="mt-2 space-y-1.5"><div className="h-1.5 w-4/5 rounded bg-[#d8cce8]" /><div className="h-1.5 w-full rounded bg-[#eee8f5]" /><div className="h-1.5 w-3/5 rounded bg-[#eee8f5]" /></div>
          <div className="mt-2 h-4 rounded-full bg-[#34295d]" />
        </div>
      ) : (
        <div aria-hidden="true" className="relative flex h-[68%] max-h-40 min-h-28 w-[72%] max-w-[250px] items-center gap-3 rounded-xl border-[5px] border-[#34295d] bg-white p-3 shadow-lg">
          <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${art.chip} ${art.ink}`}><Icon size={25} /></div>
          {subject === "ai" ? (
            <svg viewBox="0 0 124 90" className="h-full min-w-0 flex-1" role="presentation">
              <g stroke="#B9ACD9" strokeWidth="2"><path d="m18 44 31-23m-31 23 31 0m-31 0 31 23m0-46 36 23m-36 0 36-23m-36 23 36 23m0-46 21 23m-21 0 21 23" /></g>
              <g fill="#51447E"><circle cx="18" cy="44" r="6" /><circle cx="49" cy="21" r="6" /><circle cx="49" cy="44" r="6" /><circle cx="49" cy="67" r="6" /><circle cx="85" cy="21" r="6" /><circle cx="85" cy="44" r="6" /><circle cx="85" cy="67" r="6" /></g><circle cx="106" cy="44" r="7" fill="#E5684F" />
            </svg>
          ) : subject === "data" ? (
            <svg viewBox="0 0 124 90" className="h-full min-w-0 flex-1" role="presentation">
              <path d="M12 72V17M12 72h102" stroke="#DED6E7" strokeWidth="2" /><rect x="25" y="46" width="13" height="26" rx="3" fill="#B9ACD9" /><rect x="48" y="32" width="13" height="40" rx="3" fill="#9482BE" /><rect x="71" y="39" width="13" height="33" rx="3" fill="#F5B09A" /><rect x="94" y="20" width="13" height="52" rx="3" fill="#F4C744" /><path d="m25 39 27-16 24 11 27-18" fill="none" stroke="#51447E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : subject === "security" ? (
            <svg viewBox="0 0 124 90" className="h-full min-w-0 flex-1" role="presentation">
              <g fill="none" stroke="#B9ACD9" strokeWidth="2"><path d="M11 20h28m-28 0v48h28m56-48h18v48H95" /><path d="m39 20 24 22m-24 26 24-26m0 0 32-22m-32 22 32 26" /></g><path d="m63 22 19 7v15c0 12-8 20-19 25-11-5-19-13-19-25V29l19-7Z" fill="#EEE8F5" stroke="#51447E" strokeWidth="3" /><path d="m55 44 6 6 11-13" fill="none" stroke="#E5684F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[#e5684f]" /><span className="h-1.5 w-1.5 rounded-full bg-[#f4c744]" /><span className="h-1.5 w-1.5 rounded-full bg-[#a9c5ad]" /></div>
              <div className={`grid h-12 place-items-center rounded ${art.card} ${art.ink}`}><Icon size={23} /></div>
              <div className="space-y-1"><div className={`h-1.5 w-4/5 rounded ${art.chip}`} /><div className="h-1.5 w-full rounded bg-[#eee8f5]" /></div>
            </div>
          )}
        </div>
      )}
      <span className={`absolute bottom-3 right-4 font-mono text-[9px] font-semibold uppercase tracking-[.13em] ${art.ink}`}>{art.detail}</span>
    </div>
  );
}

export default function FeaturedCourses() {
  const [courses, setCourses] = useState<PublicCourse[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api<{ courses: PublicCourse[] }>("/courses")
      .then(({ courses: published }) => {
        if (active) setCourses(published.slice(0, 3));
      })
      .catch((cause: unknown) => {
        console.error("Could not load featured DevQueens courses:", cause);
        if (active) setError("Courses are temporarily unavailable. Please check back soon.");
      });
    return () => { active = false; };
  }, []);

  return (
    <section id="courses" className="bg-[#fbf7f1] py-20 sm:py-28">
      <div className="section-container">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <FadeInView>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[.18em] text-[#e5684f]">Learn by doing</p>
            <h2 className="font-display text-4xl font-bold leading-[1.04] tracking-[-.045em] text-[#28213f] sm:text-5xl">Pick up a new skill.</h2>
            <p className="mt-4 max-w-lg text-sm leading-6 text-[#77717d]">Explore courses published by DevQueens and choose a first project or a next challenge.</p>
          </FadeInView>
          {courses.length > 0 && (
            <Link to="/register" className="group inline-flex items-center gap-2 text-sm font-bold text-[#51447e]">
              Explore your learning space <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          )}
        </div>

        {error ? <p role="status" className="mt-8 rounded-xl border border-[#efd3ca] bg-white px-5 py-4 text-sm text-[#9b493e]">{error}</p> : courses.length > 0 ? (
          <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, index) => {
              const accent = accents[index % accents.length];
              const lessonCount = course.modules.reduce((total, module) => total + module.lessons.length, 0);
              return (
                <FadeInView key={course._id} delay={index * 0.07}>
                  <Link to={`/learn/${course.slug}`} className="group block h-full overflow-hidden rounded-2xl border border-[#eee8e0] bg-white transition duration-300 hover:-translate-y-1 hover:border-[#d8cce8] hover:shadow-xl hover:shadow-[#34295d]/[.07]">
                    <div className={`relative flex aspect-[1.7/1] items-center justify-center overflow-hidden ${accent.base}`}>
                      <CourseArtwork course={course} />
                    </div>
                    <div className="p-5 sm:p-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#eee8f5] px-3 py-1 text-[10px] font-bold uppercase tracking-[.1em] text-[#51447e]">{course.level}</span>
                        <span className="rounded-full bg-[#e7f2e8] px-3 py-1 text-[10px] font-bold uppercase tracking-[.1em] text-[#456b4b]">Published</span>
                        {course.duration && <span className="inline-flex items-center gap-1 text-[11px] text-[#8a8290]"><Clock3 size={12} />{course.duration}</span>}
                      </div>
                      <h3 className="mt-4 font-display text-xl font-bold tracking-tight text-[#34295d]">{course.title}</h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#77717d]">{course.description}</p>
                      {course.modules.length > 0 && <div className="mt-4 flex flex-wrap gap-1.5">{course.modules.slice(0, 3).map((module) => <span key={module.title} className="rounded-md bg-[#f7f4f0] px-2 py-1 text-[10px] font-medium text-[#716a78]">{module.title}</span>)}</div>}
                      <div className="mt-5 flex items-center justify-between border-t border-[#f0ebe6] pt-4">
                        <span className="text-xs text-[#8a8290]">{lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}</span>
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#e5684f]">Explore course <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span>
                      </div>
                    </div>
                  </Link>
                </FadeInView>
              );
            })}
          </div>
        ) : (
          <div className="mt-9 rounded-2xl border border-dashed border-[#d9cdbf] bg-white/65 px-6 py-10 text-center">
            <BookOpen size={23} className="mx-auto text-[#8b7dab]" />
            <p className="mt-3 font-display text-base font-bold text-[#34295d]">Courses are on their way</p>
            <p className="mt-1 text-sm text-[#77717d]">Published courses will appear here when they’re available.</p>
          </div>
        )}
      </div>
    </section>
  );
}
