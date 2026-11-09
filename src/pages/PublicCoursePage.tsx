import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, Clock3 } from "lucide-react";
import Navbar from "@/components/devqueens/Navbar";
import Footer from "@/components/devqueens/Footer";
import { api } from "@/lib/api";
import { updateSeo } from "@/lib/seo";

type PublicCourse = {
  title: string;
  description: string;
  level: string;
  duration: string;
  coverImage: string;
  modules: { title: string; lessons: { title: string; content: string; exercise: string }[] }[];
};

export default function PublicCoursePage() {
  const { slug = "" } = useParams();
  const [course, setCourse] = useState<PublicCourse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!course) return;
    updateSeo({
      title: `${course.title} | DevQueens`,
      description: course.description.slice(0, 155),
      path: `/learn/${encodeURIComponent(slug)}`,
      image: course.coverImage || undefined,
    });
  }, [course, slug]);

  useEffect(() => {
    let active = true;
    setCourse(null);
    setError("");
    api<{ course: PublicCourse }>(`/courses/${encodeURIComponent(slug)}`)
      .then(({ course: result }) => { if (active) setCourse(result); })
      .catch((cause: unknown) => {
        console.error("Could not load public DevQueens course:", cause);
        if (active) setError(cause instanceof Error ? cause.message : "Course details could not be loaded.");
      });
    return () => { active = false; };
  }, [slug]);

  return (
    <div className="min-h-screen bg-[#fbf7f1]">
      <Navbar />
      <main className="section-container pb-20 pt-28 sm:pt-36">
        <Link to="/#courses" className="inline-flex items-center gap-2 text-sm font-semibold text-[#716a78] transition hover:text-[#34295d]">
          <ArrowLeft size={15} /> All courses
        </Link>
        {error ? (
          <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-[#e8dfd5] bg-white p-8 text-center">
            <BookOpen size={26} className="mx-auto text-[#8b7dab]" />
            <h1 className="mt-4 font-display text-2xl font-bold text-[#34295d]">Course unavailable</h1>
            <p role="alert" className="mt-2 text-sm text-[#77717d]">{error}</p>
            <Link to="/#courses" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#e5684f]">Browse courses <ArrowRight size={14} /></Link>
          </div>
        ) : !course ? (
          <p role="status" className="py-24 text-center text-sm text-[#77717d]">Loading course details…</p>
        ) : (
          <>
            <section className="mt-8 grid overflow-hidden rounded-[2rem] bg-white shadow-sm md:grid-cols-[1.05fr_.95fr]">
              <div className="flex min-h-[280px] items-center justify-center bg-[#eee8f5] md:min-h-[430px]">
                {course.coverImage ? <img src={course.coverImage} alt={`${course.title} course cover`} onError={(event) => { event.currentTarget.hidden = true; }} className="h-full max-h-[500px] w-full object-cover" /> : <BookOpen size={64} strokeWidth={1.2} className="text-[#51447e]" />}
              </div>
              <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-14">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#eee8f5] px-3 py-1 text-[10px] font-bold uppercase tracking-[.1em] text-[#51447e]">{course.level}</span>
                  {course.duration && <span className="inline-flex items-center gap-1 text-xs text-[#8a8290]"><Clock3 size={13} />{course.duration}</span>}
                </div>
                <h1 className="mt-5 font-display text-4xl font-bold leading-[1.04] tracking-[-.045em] text-[#28213f] sm:text-5xl">{course.title}</h1>
                <p className="mt-5 text-sm leading-7 text-[#716a78]">{course.description}</p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link to="/register" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#34295d] px-6 text-sm font-semibold text-white transition hover:bg-[#493b7d]">
                    Join to start learning <ArrowRight size={15} />
                  </Link>
                  <span className="text-xs text-[#8a8290]">Published course</span>
                </div>
              </div>
            </section>

            <section className="mx-auto mt-14 max-w-4xl">
              <p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#e5684f]">Inside the course</p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#34295d]">What you’ll explore</h2>
              <div className="mt-7 space-y-4">
                {course.modules.map((module, index) => (
                  <article key={`${module.title}-${index}`} className="rounded-2xl border border-[#e8dfd5] bg-white p-5 sm:p-7">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-display text-lg font-bold text-[#34295d]">{module.title}</h3>
                      <span className="text-xs text-[#8a8290]">{module.lessons.length} {module.lessons.length === 1 ? "lesson" : "lessons"}</span>
                    </div>
                    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                      {module.lessons.map((lesson, lessonIndex) => (
                        <li key={`${lesson.title}-${lessonIndex}`} className="flex items-start gap-2 text-sm text-[#716a78]">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e5684f]" />{lesson.title}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
