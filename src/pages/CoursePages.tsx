import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Circle, Clock3, ExternalLink, LockKeyhole } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { EmptyState, PageHeading } from "@/components/platform/PlatformShell";
import CommunityJoinButton from "@/components/devqueens/CommunityJoinButton";

type Question = { _id: string; prompt: string; type: "multiple-choice" | "true-false" | "practical"; options: string[]; practicalInstructions?: string; marks: number };
type Lesson = { _id: string; title: string; content: string; exercise: string; resources: { title: string; url: string }[] };
type Course = {
  _id: string; title: string; slug: string; description: string; level: string; duration: string;
  coverImage: string; completionRequirementPercent: number;
  modules: { _id: string; title: string; lessons: Lesson[] }[];
  assessment: { passingScore: number; attemptLimit: number; timeLimitMinutes: number; questions: Question[] };
};
type Enrollment = { _id: string; progress: number; completedLessonIds: string[]; courseId: Course };

function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([api<{ courses: Course[] }>("/courses"), api<{ enrollments: Enrollment[] }>("/enrollments")])
      .then(([courseResult, enrollmentResult]) => {
        setCourses(courseResult.courses);
        setEnrollments(enrollmentResult.enrollments);
      })
      .catch((cause) => setError(cause.message));
  }, []);
  return { courses, enrollments, error };
}

function CourseCard({ course, enrollment }: { course: Course; enrollment?: Enrollment }) {
  return (
    <Link to={`/portal/courses/${course.slug}`} className="group overflow-hidden rounded-xl border border-orange-100 bg-white transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-lg">
      <div className="flex aspect-[2/1] items-center justify-center bg-[#fff0df]">
        {course.coverImage ? <img src={course.coverImage} alt="" className="h-full w-full object-cover" /> : <BookOpen size={34} className="text-orange-500" />}
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-orange-800">{course.level}</span>
          {course.duration && <span className="flex items-center gap-1 text-xs text-stone-400"><Clock3 size={12} />{course.duration}</span>}
        </div>
        <h3 className="mt-3 font-display text-lg font-bold text-stone-900 group-hover:text-orange-800">{course.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-500">{course.description}</p>
        {enrollment && <div className="mt-4"><div className="mb-1.5 flex justify-between text-xs text-stone-500"><span>Your progress</span><span>{enrollment.progress}%</span></div><div className="h-1.5 rounded-full bg-orange-50"><div className="h-full rounded-full bg-orange-500" style={{ width: `${enrollment.progress}%` }} /></div></div>}
      </div>
    </Link>
  );
}

export function CourseCatalog() {
  const { courses, enrollments, error } = useCourses();
  const courseById = useMemo(() => new Map(enrollments.map((entry) => [entry.courseId._id, entry])), [enrollments]);
  return (
    <>
      <PageHeading eyebrow="Learning library" title="Find your next skill" description="Explore structured, practical courses made to help you grow your confidence and your craft." />
      {error ? <p role="alert" className="notice-error">{error}</p> : courses.length === 0 ? <EmptyState title="Courses are on their way" message="Published learning paths will appear here as soon as they are available." /> : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{courses.map((course) => <CourseCard key={course._id} course={course} enrollment={courseById.get(course._id)} />)}</div>
      )}
    </>
  );
}

export function LearningHome() {
  const { user } = useAuth();
  const { courses, enrollments, error } = useCourses();
  const enrolledIds = new Set(enrollments.map((entry) => entry.courseId?._id));
  const recommendations = courses.filter((course) => !enrolledIds.has(course._id)).slice(0, 3);
  return (
    <>
      <PageHeading eyebrow="Your learning space" title={`Welcome, ${user?.name?.split(" ")[0] ?? "learner"}`} description="A little progress, consistently, can take you somewhere remarkable." action={<Link to="/portal/profile" className="btn-outline-brand">Complete your profile <ArrowRight size={15} /></Link>} />
      {error && <p role="alert" className="notice-error mb-6">{error}</p>}
      <section className="mb-10 flex flex-col gap-4 rounded-2xl border border-orange-100 bg-gradient-to-r from-[#fff7ed] to-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="section-eyebrow">Learn together</p>
          <h2 className="mt-1 font-display text-xl font-bold">Find your DevQueens community</h2>
          <p className="mt-1 text-sm text-stone-600">Connect with other learners and keep up with community conversations.</p>
        </div>
        <CommunityJoinButton className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#34295d] px-5 text-sm font-semibold text-white transition hover:bg-[#493b7d]">
          Join community <ArrowRight size={16} />
        </CommunityJoinButton>
      </section>
      <section className="mb-10">
        <div className="mb-4 flex items-end justify-between"><div><p className="section-eyebrow">Keep your momentum</p><h2 className="mt-1 font-display text-xl font-bold">Your courses</h2></div><Link to="/portal/courses" className="text-sm font-semibold text-orange-700 hover:text-orange-900">Browse courses <ArrowRight size={14} className="inline" /></Link></div>
        {enrollments.length ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{enrollments.map((entry) => <CourseCard key={entry._id} course={entry.courseId} enrollment={entry} />)}</div> : <EmptyState title="Your learning journey starts here" message="Browse the course library and enroll in a learning path that excites you." action={<Link to="/portal/courses" className="btn-brand">Explore courses</Link>} />}
      </section>
      {recommendations.length > 0 && <section><div className="mb-4"><p className="section-eyebrow">Made for you</p><h2 className="mt-1 font-display text-xl font-bold">Explore something new</h2></div><div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{recommendations.map((course) => <CourseCard key={course._id} course={course} />)}</div></section>}
    </>
  );
}

export function CourseWorkspace() {
  const { slug = "" } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [assessment, setAssessment] = useState<Course["assessment"] | null>(null);
  const [attemptId, setAttemptId] = useState("");
  const [assessmentDeadline, setAssessmentDeadline] = useState<Date | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ status: string; score: number; totalMarks: number; certificate?: { certificateId: string } } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [exerciseResponses, setExerciseResponses] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    try {
      const [courseResult, enrollmentResult] = await Promise.all([
        api<{ course: Course }>(`/courses/${slug}`),
        api<{ enrollments: Enrollment[] }>("/enrollments"),
      ]);
      setCourse(courseResult.course);
      const current = enrollmentResult.enrollments.find((entry) => entry.courseId._id === courseResult.course._id) ?? null;
      setEnrollment(current);
      if (current) {
        const results = await api<{ attempts: { status: string; score: number; totalMarks: number }[]; certificate: { certificateId: string } | null }>(`/courses/${courseResult.course._id}/assessment-results`);
        const latest = results.attempts[0];
        if (latest) setResult({ ...latest, certificate: results.certificate ?? undefined });
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Course details could not be loaded.");
    }
  }, [slug]);
  useEffect(() => { void load(); }, [load]);

  const markComplete = async (lesson: Lesson) => {
    if (!course) return false;
    setBusy(true); setError("");
    try {
      const response = await api<{ enrollment: Enrollment }>(`/courses/${course._id}/lessons/${lesson._id}/complete`, {
        method: "POST",
        body: { exerciseResponse: exerciseResponses[lesson._id] ?? "" },
      });
      setEnrollment(response.enrollment);
      return true;
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Lesson progress could not be saved."); return false; }
    finally { setBusy(false); }
  };
  const enroll = async () => {
    if (!course) return;
    setBusy(true); setError("");
    try {
      await api(`/courses/${course._id}/enroll`, { method: "POST" });
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Enrollment could not be completed."); }
    finally { setBusy(false); }
  };
  const startAssessment = async () => {
    if (!course) return;
    setBusy(true); setError("");
    try {
      const response = await api<{ attemptId: string; startedAt: string; assessment: Course["assessment"] }>(`/courses/${course._id}/assessment/start`, { method: "POST" });
      setAttemptId(response.attemptId);
      setAssessmentDeadline(new Date(new Date(response.startedAt).getTime() + response.assessment.timeLimitMinutes * 60_000));
      setAssessment(response.assessment);
      setResult(null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Assessment could not be started."); }
    finally { setBusy(false); }
  };
  useEffect(() => {
    if (!assessment || !assessmentDeadline) return;
    const updateTime = () => setRemainingSeconds(Math.max(0, Math.ceil((assessmentDeadline.getTime() - Date.now()) / 1000)));
    updateTime();
    const timer = window.setInterval(updateTime, 1000);
    return () => window.clearInterval(timer);
  }, [assessment, assessmentDeadline]);
  if (!user) return <Navigate to="/login" replace />;
  const submitAssessment = async () => {
    if (!course || !assessment) return;
    setBusy(true); setError("");
    try {
      const response = await api<{ attempt: { status: string; score: number; totalMarks: number }; certificate?: { certificateId: string } }>(
        `/courses/${course._id}/assessment/${attemptId}/submit`,
        { method: "POST", body: { answers: Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer })) } },
      );
      setResult({ ...response.attempt, certificate: response.certificate });
      setAssessment(null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Assessment could not be submitted."); }
    finally { setBusy(false); }
  };

  if (error && !course) return <div><button onClick={() => navigate(-1)} className="mb-5 text-sm text-stone-500"><ArrowLeft size={14} className="mr-1 inline" /> Back</button><EmptyState title="Course unavailable" message={error} /></div>;
  if (!course) return <p className="text-sm text-stone-500">Loading course…</p>;
  const allLessons = course.modules.flatMap((module) => module.lessons);
  const completionPercent = enrollment?.progress ?? 0;
  const requiredComplete = completionPercent >= course.completionRequirementPercent;

  return (
    <div>
      <Link to="/portal/courses" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-orange-700"><ArrowLeft size={15} /> Course library</Link>
      <div className="mb-8 grid gap-6 rounded-2xl border border-orange-100 bg-white p-6 md:grid-cols-[1fr_260px] md:items-center md:p-8">
        <div><p className="section-eyebrow">{course.level} learning path</p><h1 className="mt-2 font-display text-3xl font-bold tracking-tight">{course.title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">{course.description}</p>
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-stone-500"><span className="rounded-full bg-orange-50 px-3 py-1.5">{course.modules.length} modules</span><span className="rounded-full bg-orange-50 px-3 py-1.5">{allLessons.length} lessons</span>{course.duration && <span className="rounded-full bg-orange-50 px-3 py-1.5">{course.duration}</span>}</div>
        </div>
        {!enrollment ? <button disabled={busy} onClick={enroll} className="btn-brand">{busy ? "Enrolling…" : "Enroll in course"} <ArrowRight size={15} /></button> : <div className="rounded-xl bg-[#fff7ed] p-4"><div className="flex justify-between text-sm font-semibold"><span>Your progress</span><span className="text-orange-800">{completionPercent}%</span></div><div className="mt-2 h-2 rounded-full bg-orange-100"><div className="h-full rounded-full bg-orange-500" style={{ width: `${completionPercent}%` }} /></div><p className="mt-2 text-xs text-stone-500">Complete {course.completionRequirementPercent}% of lessons to unlock your final assessment.</p></div>}
      </div>
      {error && <p role="alert" className="notice-error mb-5">{error}</p>}
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-5">
          {course.modules.map((module, index) => <div key={module._id} className="rounded-xl border border-orange-100 bg-white p-5 md:p-6">
            <p className="section-eyebrow">Module {String(index + 1).padStart(2, "0")}</p><h2 className="mt-1 font-display text-lg font-bold">{module.title}</h2>
            <div className="mt-4 divide-y divide-stone-100">{module.lessons.map((lesson, lessonIndex) => {
              const isComplete = enrollment?.completedLessonIds.includes(lesson._id) ?? false;
              return <div key={lesson._id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <button onClick={() => setActiveLesson(lesson)} className="flex items-center gap-3 text-left">
                  {isComplete ? <CheckCircle2 size={17} className="shrink-0 text-emerald-600" /> : <Circle size={17} className="shrink-0 text-stone-300" />}
                  <span><span className="block text-sm font-medium text-stone-800">{lessonIndex + 1}. {lesson.title}</span><span className="text-xs text-stone-400">{lesson.content ? `${Math.max(1, Math.ceil(lesson.content.length / 900))} min read` : "Lesson"}</span></span>
                </button>
                {enrollment && !isComplete && <button disabled={busy} onClick={() => lesson.exercise ? setActiveLesson(lesson) : void markComplete(lesson)} className="text-xs font-semibold text-orange-700 hover:text-orange-900">Complete lesson</button>}
              </div>;
            })}</div>
          </div>)}
        </section>
        <aside className="h-fit rounded-xl border border-orange-100 bg-white p-5 md:p-6">
          <p className="section-eyebrow">Final assessment</p><h2 className="mt-1 font-display text-lg font-bold">Show what you know</h2>
          <p className="mt-2 text-sm leading-6 text-stone-500">Pass with {course.assessment.passingScore}% or higher. You have {course.assessment.attemptLimit} attempts, with {course.assessment.timeLimitMinutes} minutes per attempt.</p>
          {!enrollment && <p className="mt-4 flex items-center gap-2 rounded-lg bg-stone-50 p-3 text-xs text-stone-500"><LockKeyhole size={15} /> Enroll to begin learning.</p>}
          {enrollment && !requiredComplete && <p className="mt-4 flex items-center gap-2 rounded-lg bg-stone-50 p-3 text-xs text-stone-500"><LockKeyhole size={15} /> Complete the required lessons to unlock the assessment.</p>}
          {enrollment && requiredComplete && !assessment && (!result || result.status === "failed") && <button disabled={busy} onClick={() => void startAssessment()} className="btn-brand mt-5 w-full">{busy ? "Preparing…" : result ? "Try another attempt" : "Start assessment"} <ArrowRight size={15} /></button>}
          {result && <div className={`mt-4 rounded-lg p-4 ${result.status === "passed" ? "bg-emerald-50 text-emerald-900" : result.status === "pending-review" ? "bg-amber-50 text-amber-900" : "bg-red-50 text-red-900"}`}>
            <p className="font-semibold">{result.status === "passed" ? "Assessment passed" : result.status === "pending-review" ? "Submitted for review" : "Not passed yet"}</p>
            <p className="mt-1 text-sm">Score: {Math.round(result.score / result.totalMarks * 100)}%</p>
            {result.certificate && <a className="mt-3 inline-block text-sm font-semibold underline" href={`/portal/certificates`}>View your certificate</a>}
          </div>}
        </aside>
      </div>
      {activeLesson && <div className="fixed inset-0 z-40 flex items-end justify-center bg-stone-950/40 p-0 md:items-center md:p-6" role="dialog" aria-modal="true" aria-labelledby="lesson-title" onClick={(event) => { if (event.target === event.currentTarget) setActiveLesson(null); }}>
        <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white p-6 md:rounded-2xl md:p-8">
          <p className="section-eyebrow">Course lesson</p><h2 id="lesson-title" className="mt-2 font-display text-2xl font-bold">{activeLesson.title}</h2>
          <div className="mt-5 whitespace-pre-wrap text-sm leading-7 text-stone-700">{activeLesson.content || "Your instructor will add lesson content soon."}</div>
          {activeLesson.exercise && <div className="mt-6 rounded-xl bg-[#fff7ed] p-5"><p className="text-xs font-bold uppercase tracking-wider text-orange-700">Practice exercise</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-stone-700">{activeLesson.exercise}</p>{enrollment && !enrollment.completedLessonIds.includes(activeLesson._id) && <label className="form-label mt-4">Your exercise response<textarea required value={exerciseResponses[activeLesson._id] ?? ""} onChange={(event) => setExerciseResponses({ ...exerciseResponses, [activeLesson._id]: event.target.value })} className="form-input min-h-24" maxLength={10000} placeholder="Share your work or a link to your project…" /></label>}</div>}
          {activeLesson.resources.length > 0 && <div className="mt-6"><h3 className="font-semibold">Learning resources</h3><div className="mt-2 space-y-2">{activeLesson.resources.map((resource) => <a key={resource.url} href={resource.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-orange-700 hover:underline">{resource.title}<ExternalLink size={13} /></a>)}</div></div>}
          <div className="mt-7 flex flex-wrap justify-end gap-3"><button onClick={() => setActiveLesson(null)} className="btn-outline-brand">Close lesson</button>{enrollment && !enrollment.completedLessonIds.includes(activeLesson._id) && <button disabled={busy || Boolean(activeLesson.exercise && !exerciseResponses[activeLesson._id]?.trim())} onClick={async () => { if (await markComplete(activeLesson)) setActiveLesson(null); }} className="btn-brand">Mark as complete <CheckCircle2 size={15} /></button>}</div>
        </div>
      </div>}
      {assessment && <div className="fixed inset-0 z-40 overflow-y-auto bg-[#fffaf5] p-5 md:p-10">
        <div className="mx-auto max-w-3xl"><div className="mb-8 flex items-center justify-between gap-4"><div><p className="section-eyebrow">Final assessment</p><h2 className="font-display text-2xl font-bold">{course.title}</h2></div><div className="flex items-center gap-3"><span role="timer" aria-live="polite" className={`rounded-lg px-3 py-2 text-sm font-bold tabular-nums ${remainingSeconds < 60 ? "bg-red-50 text-red-800" : "bg-orange-50 text-orange-900"}`}>{Math.floor(remainingSeconds / 60)}:{String(remainingSeconds % 60).padStart(2, "0")}</span><button onClick={() => setAssessment(null)} className="btn-outline-brand">Exit</button></div></div>
          <p className="mb-5 rounded-lg bg-orange-50 p-4 text-sm text-orange-900">Submit before the timer reaches zero. Practical responses will be reviewed by the teaching team.</p>
          <div className="space-y-5">{assessment.questions.map((question, index) => <fieldset key={question._id} className="rounded-xl border border-orange-100 bg-white p-5"><legend className="font-semibold text-stone-900">{index + 1}. {question.prompt} <span className="text-xs font-normal text-stone-400">({question.marks} {question.marks === 1 ? "mark" : "marks"})</span></legend>
            {question.type === "practical" ? <div className="mt-3"><p className="text-sm text-stone-500">{question.practicalInstructions}</p><textarea value={answers[question._id] ?? ""} onChange={(event) => setAnswers({ ...answers, [question._id]: event.target.value })} rows={5} className="form-input mt-3" placeholder="Write your response or paste a project link…" /></div> : <div className="mt-3 space-y-2">{(question.type === "true-false" ? ["True", "False"] : question.options).map((option) => <label key={option} className="flex cursor-pointer items-center gap-3 rounded-lg border border-stone-100 p-3 text-sm hover:bg-orange-50"><input type="radio" name={question._id} value={option} checked={answers[question._id] === option} onChange={() => setAnswers({ ...answers, [question._id]: option })} className="accent-orange-600" />{option}</label>)}</div>}
          </fieldset>)}</div>
          <div className="mt-6 flex justify-end"><button disabled={busy} onClick={() => void submitAssessment()} className="btn-brand">{busy ? "Submitting…" : "Submit assessment"} <ArrowRight size={15} /></button></div>
        </div>
      </div>}
    </div>
  );
}
