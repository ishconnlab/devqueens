/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { ArrowDownToLine, ArrowRight, BookOpen, Check, ChevronDown, CircleAlert, FileJson2, Plus, Save, ShieldCheck, Trash2, Upload, Users, X } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { EmptyState, PageHeading, PlatformShell } from "@/components/platform/PlatformShell";
import { AdminInboxPage } from "@/pages/InboxPages";
import PageLoader from "@/components/devqueens/PageLoader";
import { updateSeo } from "@/lib/seo";

type CourseForm = {
  title: string; slug: string; description: string; coverImage: string; level: "Beginner" | "Intermediate" | "Advanced";
  duration: string; status: "draft" | "published"; completionRequirementPercent: number;
  modules: { title: string; lessons: { title: string; content: string; exercise: string; resources: { title: string; url: string }[] }[] }[];
  assessment: { passingScore: number; attemptLimit: number; timeLimitMinutes: number; availableFrom: string; availableUntil: string; questions: { prompt: string; type: "multiple-choice" | "true-false" | "practical"; options: string[]; correctAnswer: string; practicalInstructions: string; marks: number }[] };
};

const emptyCourse: CourseForm = {
  title: "", slug: "", description: "", coverImage: "", level: "Beginner", duration: "", status: "draft", completionRequirementPercent: 100,
  modules: [{ title: "Module 1", lessons: [{ title: "Lesson 1", content: "", exercise: "", resources: [] }] }],
  assessment: { passingScore: 70, attemptLimit: 3, timeLimitMinutes: 60, availableFrom: "", availableUntil: "", questions: [{ prompt: "", type: "multiple-choice", options: ["", ""], correctAnswer: "", practicalInstructions: "", marks: 1 }] },
};

function Field({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) {
  return <label className={`form-label ${className}`}>{label}{children}</label>;
}

function AdminOverview() {
  const [stats, setStats] = useState<{ members: number; activeCourses: number; enrollments: number; certificates: number; pendingAssessments: number } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api<{ stats: typeof stats }>("/admin/stats").then((result) => setStats(result.stats)).catch((cause) => setError(cause.message));
  }, []);
  const cards = [
    { label: "Girls in the community", value: stats?.members, icon: Users },
    { label: "Published courses", value: stats?.activeCourses, icon: BookOpen },
    { label: "Course enrollments", value: stats?.enrollments, icon: ArrowRight },
    { label: "Certificates issued", value: stats?.certificates, icon: ShieldCheck },
  ];
  return <>
    <PageHeading eyebrow="IshConnect · DevQueens" title="Good morning, team" description="Here is the latest activity across the learning community." />
    {error && <p role="alert" className="notice-error mb-5">{error}</p>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, icon: Icon }) => <article key={label} className="rounded-xl border border-orange-100 bg-white p-5"><div className="flex items-center justify-between"><p className="text-sm text-stone-500">{label}</p><Icon size={17} className="text-orange-600" /></div><p className="mt-4 font-display text-3xl font-bold">{value ?? "—"}</p><p className="mt-1 text-xs text-stone-400">Live platform data</p></article>)}</div>
    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      <Link to="/admin/assessments" className="flex items-center justify-between rounded-xl border border-orange-200 bg-[#fff4e8] p-5 hover:bg-orange-100"><div><p className="text-xs font-bold uppercase tracking-wider text-orange-800">Needs a review</p><p className="mt-1 font-display text-xl font-bold">{stats?.pendingAssessments ?? "—"} practical assessments</p><p className="mt-1 text-sm text-stone-600">Review submissions and award marks.</p></div><ArrowRight size={20} className="text-orange-700" /></Link>
      <div className="rounded-xl border border-orange-100 bg-white p-5"><p className="text-xs font-bold uppercase tracking-wider text-stone-400">A quick reminder</p><p className="mt-2 font-display text-lg font-bold">Make the next step possible.</p><p className="mt-1 text-sm leading-6 text-stone-500">Keep courses clear, practical and accessible for learners at every stage of their technology journey.</p></div>
    </div>
    <div className="mt-8"><h2 className="mb-4 font-display text-xl font-bold">Manage the platform</h2><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[["Girls & members", "/admin/members"], ["Courses", "/admin/courses"], ["Alumni & achievers", "/admin/alumni"], ["Gallery & stories", "/admin/gallery"]].map(([label, href]) => <Link key={href} to={href} className="rounded-xl border border-orange-100 bg-white p-4 text-sm font-semibold text-stone-700 transition hover:border-orange-300 hover:text-orange-800">{label} <ArrowRight size={14} className="ml-1 inline" /></Link>)}</div></div>
  </>;
}

function MembersManager() {
  const [members, setMembers] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [country, setCountry] = useState(""); const [institutionType, setInstitutionType] = useState<"school" | "other">("school");
  const [institutionName, setInstitutionName] = useState(""); const [district, setDistrict] = useState(""); const [ageRange, setAgeRange] = useState("");
  const [saving, setSaving] = useState(false);
  const load = async () => {
    try {
      const [memberResult, badgeResult] = await Promise.all([
        api<{ members: any[] }>("/admin/members"),
        api<{ items: any[] }>("/admin/content/badge"),
      ]);
      setMembers(memberResult.members); setBadges(badgeResult.items);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Members could not be loaded."); }
  };
  useEffect(() => { void load(); }, []);
  const createMember = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError("");
    try {
      await api("/admin/members", { method: "POST", body: { name, email, password, memberDetails: { country, institutionType, institutionName, district, ageRange } } });
      setName(""); setEmail(""); setPassword(""); setCountry(""); setInstitutionType("school"); setInstitutionName(""); setDistrict(""); setAgeRange("");
      await load();
    }
    catch (cause) { setError(cause instanceof Error ? cause.message : "The member account could not be created."); }
    finally { setSaving(false); }
  };
  const toggleStatus = async (member: any) => {
    try { await api(`/admin/members/${member._id}/status`, { method: "PATCH", body: { status: member.status === "active" ? "suspended" : "active" } }); await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Member status could not be changed."); }
  };
  const toggleBadge = async (member: any, badgeId: string) => {
    const badgeIds = member.badgeIds.includes(badgeId) ? member.badgeIds.filter((id: string) => id !== badgeId) : [...member.badgeIds, badgeId];
    try { await api(`/admin/members/${member._id}/badges`, { method: "PATCH", body: { badgeIds } }); await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Member badges could not be updated."); }
  };
  return <>
    <PageHeading eyebrow="Community administration" title="Girls & members" description="Review member profiles, manage account access, create accounts and recognize achievements." />
    {error && <p role="alert" className="notice-error mb-5">{error}</p>}
    <form onSubmit={createMember} className="mb-7 grid gap-3 rounded-2xl border border-orange-100 bg-white p-5 sm:grid-cols-2 xl:grid-cols-4">
      <Field label="Full name"><input required value={name} onChange={(e) => setName(e.target.value)} className="form-input" /></Field>
      <Field label="Email"><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-input" /></Field>
      <Field label="Country"><input required value={country} onChange={(e) => setCountry(e.target.value)} className="form-input" maxLength={80} /></Field>
      <Field label="Age range"><select required value={ageRange} onChange={(e) => setAgeRange(e.target.value)} className="form-input"><option value="">Choose age range</option><option value="13-15">13–15</option><option value="16-17">16–17</option><option value="18-24">18–24</option><option value="25+">25 or older</option></select></Field>
      <Field label="School or other"><select value={institutionType} onChange={(e) => setInstitutionType(e.target.value === "other" ? "other" : "school")} className="form-input"><option value="school">School</option><option value="other">Other / independent learner</option></select></Field>
      <Field label={institutionType === "school" ? "School name" : "Organization or learning community"}><input required value={institutionName} onChange={(e) => setInstitutionName(e.target.value)} className="form-input" maxLength={120} /></Field>
      <Field label="District"><input required value={district} onChange={(e) => setDistrict(e.target.value)} className="form-input" maxLength={100} /></Field>
      <Field label="Temporary password"><input required type="password" minLength={10} value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" autoComplete="new-password" /></Field>
      <div className="flex items-end"><button disabled={saving} className="btn-brand w-full"><Plus size={15} /> Create member</button></div>
    </form>
    {members.length ? <div className="overflow-x-auto rounded-xl border border-orange-100 bg-white"><table className="w-full min-w-[780px] text-left text-sm"><thead className="bg-[#fff7ed] text-xs uppercase tracking-wide text-stone-500"><tr><th className="p-4">Member</th><th className="p-4">Joined</th><th className="p-4">Badges</th><th className="p-4">Status</th><th className="p-4">Access</th></tr></thead><tbody className="divide-y divide-stone-100">{members.map((member) => <tr key={member._id}><td className="p-4"><p className="font-semibold">{member.name}</p><p className="text-xs text-stone-500">{member.email} · {member.memberId}</p></td><td className="p-4 text-xs text-stone-500">{new Date(member.joinedAt).toLocaleDateString()}</td><td className="p-4"><div className="flex max-w-xs flex-wrap gap-1">{badges.map((badge) => <button key={badge._id} onClick={() => void toggleBadge(member, badge._id)} title={badge.data.title ?? badge.data.name} className={`rounded-full border px-2 py-1 text-[10px] ${member.badgeIds.includes(badge._id) ? "border-orange-500 bg-orange-100 text-orange-900" : "border-stone-200 text-stone-500"}`}>{badge.data.title ?? badge.data.name ?? "Badge"}</button>)}</div></td><td className="p-4"><span className={`rounded-full px-2.5 py-1 text-xs ${member.status === "active" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>{member.status}</span></td><td className="p-4"><button onClick={() => void toggleStatus(member)} className="text-xs font-semibold text-orange-700 hover:underline">{member.status === "active" ? "Suspend" : "Restore"}</button></td></tr>)}</tbody></table></div> : <EmptyState title="No members yet" message="Public registration and administrator-created accounts will appear here." />}
  </>;
}

function EnrollmentsManager() {
  const [members, setMembers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [memberId, setMemberId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    try {
      const [memberResult, courseResult, enrollmentResult] = await Promise.all([
        api<{ members: any[] }>("/admin/members"),
        api<{ courses: any[] }>("/admin/courses"),
        api<{ enrollments: any[] }>("/admin/enrollments"),
      ]);
      setMembers(memberResult.members);
      setCourses(courseResult.courses);
      setEnrollments(enrollmentResult.enrollments);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Enrollment data could not be loaded.");
    }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const addEnrollment = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true); setError(""); setNotice("");
    try {
      await api("/admin/enrollments", { method: "POST", body: { memberId, courseId } });
      setNotice("Member enrolled successfully.");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The member could not be enrolled.");
    } finally { setBusy(false); }
  };
  const removeEnrollment = async (enrollment: any) => {
    if (!window.confirm(`Remove ${enrollment.userId?.name} from ${enrollment.courseId?.title}?`)) return;
    try {
      await api(`/admin/enrollments/${enrollment._id}`, { method: "DELETE" });
      setNotice("Enrollment removed.");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The enrollment could not be removed.");
    }
  };
  const activeCourses = courses.filter((course) => course.status === "published");
  return <>
    <PageHeading eyebrow="Learning programme" title="Course enrollments" description="Review enrollment progress and help active members join a published course." />
    {error && <p role="alert" className="notice-error mb-4">{error}</p>}
    {notice && <p role="status" className="notice-success mb-4">{notice}</p>}
    <form onSubmit={addEnrollment} className="mb-6 grid gap-3 rounded-xl border border-orange-100 bg-white p-5 md:grid-cols-[1fr_1fr_auto] md:items-end">
      <Field label="Active member"><select required value={memberId} onChange={(event) => setMemberId(event.target.value)} className="form-input"><option value="">Select a member</option>{members.filter((member) => member.status === "active").map((member) => <option key={member._id} value={member._id}>{member.name} · {member.memberId}</option>)}</select></Field>
      <Field label="Published course"><select required value={courseId} onChange={(event) => setCourseId(event.target.value)} className="form-input"><option value="">Select a course</option>{activeCourses.map((course) => <option key={course._id} value={course._id}>{course.title}</option>)}</select></Field>
      <button disabled={busy || !members.length || !activeCourses.length} className="btn-brand"><Plus size={15} /> Enroll member</button>
    </form>
    {enrollments.length ? <div className="overflow-x-auto rounded-xl border border-orange-100 bg-white"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-[#fff7ed] text-xs uppercase text-stone-500"><tr><th className="p-4">Member</th><th className="p-4">Course</th><th className="p-4">Progress</th><th className="p-4">Enrolled</th><th className="p-4">Action</th></tr></thead><tbody className="divide-y divide-stone-100">{enrollments.map((enrollment) => <tr key={enrollment._id}><td className="p-4 font-medium">{enrollment.userId?.name}<p className="text-xs font-normal text-stone-500">{enrollment.userId?.email}</p></td><td className="p-4">{enrollment.courseId?.title}</td><td className="p-4"><span className="font-semibold">{enrollment.progress}%</span><div className="mt-1 h-1.5 w-28 rounded-full bg-orange-50"><div className="h-full rounded-full bg-orange-500" style={{ width: `${enrollment.progress}%` }} /></div></td><td className="p-4 text-xs text-stone-500">{new Date(enrollment.enrolledAt).toLocaleDateString()}</td><td className="p-4"><button onClick={() => void removeEnrollment(enrollment)} className="text-xs font-semibold text-red-700 hover:underline">Remove</button></td></tr>)}</tbody></table></div> : <EmptyState title="No course enrollments yet" message="Enroll an active member in a published course to get started." />}
  </>;
}

function CourseManager() {
  const [courses, setCourses] = useState<any[]>([]);
  const [form, setForm] = useState<CourseForm>(emptyCourse);
  const [selectedId, setSelectedId] = useState("");
  const [importText, setImportText] = useState("");
  const [mode, setMode] = useState<"builder" | "import">("builder");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const load = useCallback(async () => {
    try { const result = await api<{ courses: any[] }>("/admin/courses"); setCourses(result.courses); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Courses could not be loaded."); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const updateModule = (moduleIndex: number, patch: Partial<CourseForm["modules"][number]>) => setForm((current) => ({ ...current, modules: current.modules.map((module, index) => index === moduleIndex ? { ...module, ...patch } : module) }));
  const updateLesson = (moduleIndex: number, lessonIndex: number, patch: Partial<CourseForm["modules"][number]["lessons"][number]>) => setForm((current) => ({ ...current, modules: current.modules.map((module, i) => i === moduleIndex ? { ...module, lessons: module.lessons.map((lesson, j) => j === lessonIndex ? { ...lesson, ...patch } : lesson) } : module) }));
  const updateQuestion = (questionIndex: number, patch: Partial<CourseForm["assessment"]["questions"][number]>) => setForm((current) => ({ ...current, assessment: { ...current.assessment, questions: current.assessment.questions.map((question, index) => index === questionIndex ? { ...question, ...patch } : question) } }));

  const saveCourse = async (event?: React.FormEvent | React.MouseEvent) => {
    event?.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const body = mode === "import" ? JSON.parse(importText) : {
        ...form,
        assessment: {
          ...form.assessment,
          availableFrom: form.assessment.availableFrom ? new Date(form.assessment.availableFrom).toISOString() : undefined,
          availableUntil: form.assessment.availableUntil ? new Date(form.assessment.availableUntil).toISOString() : undefined,
        },
      };
      if (mode === "import") await api("/admin/courses/import/preview", { method: "POST", body });
      await api(selectedId && mode === "builder" ? `/admin/courses/${selectedId}` : mode === "import" ? "/admin/courses/import" : "/admin/courses", { method: selectedId && mode === "builder" ? "PUT" : "POST", body });
      setNotice(mode === "import" ? "Validated JSON course imported." : selectedId ? "Course changes saved." : "Course created.");
      setForm(emptyCourse); setSelectedId(""); setImportText(""); setPreview(false); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Course could not be saved."); }
    finally { setBusy(false); }
  };

  const importFile = async (file?: File) => {
    if (!file) return;
    try { setImportText(await file.text()); setMode("import"); setPreview(false); }
    catch { setError("The selected JSON file could not be read."); }
  };

  const previewJson = async () => {
    setError(""); setNotice(""); setBusy(true);
    try {
      const value = JSON.parse(importText);
      const response = await api<{ valid: boolean; preview: CourseForm }>("/admin/courses/import/preview", { method: "POST", body: value });
      setImportText(JSON.stringify(response.preview, null, 2)); setPreview(true); setNotice(`Course “${response.preview.title}” is valid and ready to save.`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "JSON preview failed."); }
    finally { setBusy(false); }
  };

  const editCourse = (course: any) => {
    setForm({
      title: course.title, slug: course.slug, description: course.description, coverImage: course.coverImage ?? "",
      level: course.level, duration: course.duration ?? "", status: course.status,
      completionRequirementPercent: course.completionRequirementPercent,
      modules: course.modules.map((module: any) => ({ title: module.title, lessons: module.lessons.map((lesson: any) => ({ title: lesson.title, content: lesson.content ?? "", exercise: lesson.exercise ?? "", resources: lesson.resources ?? [] })) })),
      assessment: {
        passingScore: course.assessment.passingScore, attemptLimit: course.assessment.attemptLimit, timeLimitMinutes: course.assessment.timeLimitMinutes,
        availableFrom: course.assessment.availableFrom ? new Date(course.assessment.availableFrom).toISOString().slice(0, 16) : "",
        availableUntil: course.assessment.availableUntil ? new Date(course.assessment.availableUntil).toISOString().slice(0, 16) : "",
        questions: course.assessment.questions.map((question: any) => ({ prompt: question.prompt, type: question.type, options: question.options ?? [], correctAnswer: question.correctAnswer ?? "", practicalInstructions: question.practicalInstructions ?? "", marks: question.marks })),
      },
    });
    setSelectedId(course._id); setMode("builder"); setNotice("Editing course. Correct answers are not returned by the API; recreate them before updating an assessment.");
  };
  const deleteCourse = async (course: any) => {
    if (!window.confirm(`Delete “${course.title}”? Existing learning records may no longer be accessible.`)) return;
    try { await api(`/admin/courses/${course._id}`, { method: "DELETE" }); await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Course could not be deleted."); }
  };

  return <>
    <PageHeading eyebrow="Learning programme" title="Courses & lessons" description="Build a complete course, manage lesson content, set learning requirements and publish when it is ready." />
    <div className="mb-5 flex flex-wrap gap-2"><button onClick={() => { setMode("builder"); setSelectedId(""); setForm(emptyCourse); }} className={`btn-outline-brand ${mode === "builder" ? "border-orange-500 bg-orange-50" : ""}`}>Visual course builder</button><button onClick={() => setMode("import")} className={`btn-outline-brand ${mode === "import" ? "border-orange-500 bg-orange-50" : ""}`}><FileJson2 size={15} /> Import JSON</button><label className="btn-outline-brand cursor-pointer"><Upload size={15} /> Choose JSON file<input type="file" accept=".json,application/json" className="sr-only" onChange={(e) => void importFile(e.target.files?.[0])} /></label></div>
    {error && <p role="alert" className="notice-error mb-4">{error}</p>}{notice && <p role="status" className="notice-success mb-4">{notice}</p>}
    {mode === "import" ? <section className="rounded-xl border border-orange-100 bg-white p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-display font-bold">Course JSON import</h2><p className="mt-1 text-xs text-stone-500">A valid course must include at least one module, lesson and assessment question. Preview is validated before save.</p></div><button onClick={() => void previewJson()} disabled={busy || !importText} className="btn-outline-brand">Validate & preview <Check size={15} /></button></div>
      <textarea value={importText} onChange={(e) => { setImportText(e.target.value); setPreview(false); }} className="form-input min-h-[360px] font-mono text-xs leading-5" placeholder={JSON.stringify(emptyCourse, null, 2)} />
      {preview && <pre className="mt-4 max-h-56 overflow-auto rounded-lg bg-[#fff7ed] p-4 text-xs">{importText}</pre>}
      <button onClick={(event) => void saveCourse(event)} disabled={busy || !preview} className="btn-brand mt-4">{busy ? "Importing…" : "Import course"} <ArrowRight size={15} /></button>
    </section> : <form onSubmit={saveCourse} className="space-y-5">
      <section className="grid gap-4 rounded-xl border border-orange-100 bg-white p-5 md:grid-cols-2">
        <Field label="Course name"><input required minLength={3} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") })} className="form-input" maxLength={180} /></Field>
        <Field label="Course URL slug"><input required pattern="[a-z0-9]+(-[a-z0-9]+)*" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="form-input" /></Field>
        <Field label="Description" className="md:col-span-2"><textarea required minLength={20} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="form-input min-h-24" maxLength={3000} /></Field>
        <Field label="Cover image URL"><input type="url" value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} className="form-input" /></Field>
        <Field label="Level"><select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value as CourseForm["level"] })} className="form-input"><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></Field>
        <Field label="Estimated duration"><input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="form-input" placeholder="6 weeks" /></Field>
        <Field label="Publishing status"><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as CourseForm["status"] })} className="form-input"><option value="draft">Draft</option><option value="published">Published</option></select></Field>
        <Field label={`Lesson completion required: ${form.completionRequirementPercent}%`} className="md:col-span-2"><input type="range" min="1" max="100" value={form.completionRequirementPercent} onChange={(e) => setForm({ ...form, completionRequirementPercent: Number(e.target.value) })} className="mt-3 w-full accent-orange-600" /></Field>
      </section>
      <section className="rounded-xl border border-orange-100 bg-white p-5"><div className="mb-4 flex items-center justify-between"><div><p className="section-eyebrow">Course curriculum</p><h2 className="mt-1 font-display text-lg font-bold">Modules and lessons</h2></div><button type="button" onClick={() => setForm({ ...form, modules: [...form.modules, { title: `Module ${form.modules.length + 1}`, lessons: [{ title: "New lesson", content: "", exercise: "", resources: [] }] }] })} className="btn-outline-brand"><Plus size={14} /> Add module</button></div>
        <div className="space-y-4">{form.modules.map((module, moduleIndex) => <div key={moduleIndex} className="rounded-lg border border-stone-100 bg-[#fffdfb] p-4">
          <div className="flex flex-wrap gap-2"><input aria-label="Module title" value={module.title} onChange={(e) => updateModule(moduleIndex, { title: e.target.value })} className="form-input flex-1 font-semibold" /><button type="button" onClick={() => setForm({ ...form, modules: form.modules.filter((_, index) => index !== moduleIndex) })} className="icon-delete" aria-label="Remove module"><Trash2 size={16} /></button></div>
          {module.lessons.map((lesson, lessonIndex) => <div key={lessonIndex} className="mt-3 grid gap-3 rounded-lg bg-white p-3 md:grid-cols-2">
            <input aria-label="Lesson title" value={lesson.title} onChange={(e) => updateLesson(moduleIndex, lessonIndex, { title: e.target.value })} className="form-input" placeholder="Lesson title" />
            <button type="button" onClick={() => updateModule(moduleIndex, { lessons: module.lessons.filter((_, index) => index !== lessonIndex) })} className="justify-self-start text-xs font-medium text-red-700 md:justify-self-end">Remove lesson</button>
            <textarea aria-label="Lesson content" value={lesson.content} onChange={(e) => updateLesson(moduleIndex, lessonIndex, { content: e.target.value })} className="form-input min-h-24 md:col-span-2" placeholder="Lesson content and instructions" />
            <textarea aria-label="Lesson exercise" value={lesson.exercise} onChange={(e) => updateLesson(moduleIndex, lessonIndex, { exercise: e.target.value })} className="form-input min-h-20 md:col-span-2" placeholder="Exercise or practical work (optional)" />
            <div className="md:col-span-2">
              <p className="mb-2 text-xs font-semibold text-stone-600">Learning resources</p>
              {lesson.resources.map((resource, resourceIndex) => <div key={resourceIndex} className="mb-2 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <input aria-label="Resource title" value={resource.title} onChange={(e) => updateLesson(moduleIndex, lessonIndex, { resources: lesson.resources.map((item, index) => index === resourceIndex ? { ...item, title: e.target.value } : item) })} className="form-input" placeholder="Resource title" />
                <input aria-label="Resource URL" type="url" value={resource.url} onChange={(e) => updateLesson(moduleIndex, lessonIndex, { resources: lesson.resources.map((item, index) => index === resourceIndex ? { ...item, url: e.target.value } : item) })} className="form-input" placeholder="https://" />
                <button type="button" onClick={() => updateLesson(moduleIndex, lessonIndex, { resources: lesson.resources.filter((_, index) => index !== resourceIndex) })} className="icon-delete" aria-label="Remove resource"><Trash2 size={14} /></button>
              </div>)}
              <button type="button" onClick={() => updateLesson(moduleIndex, lessonIndex, { resources: [...lesson.resources, { title: "", url: "" }] })} className="text-xs font-semibold text-orange-700">+ Add resource link</button>
            </div>
          </div>)}
          <button type="button" onClick={() => updateModule(moduleIndex, { lessons: [...module.lessons, { title: "", content: "", exercise: "", resources: [] }] })} className="mt-3 text-xs font-semibold text-orange-700 hover:underline"><Plus size={13} className="mr-1 inline" /> Add lesson</button>
        </div>)}</div>
      </section>
      <section className="rounded-xl border border-orange-100 bg-white p-5"><div className="mb-4"><p className="section-eyebrow">Final assessment</p><h2 className="mt-1 font-display text-lg font-bold">Questions and grading rules</h2></div>
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <Field label="Passing score (%)"><input type="number" min="0" max="100" required value={form.assessment.passingScore} onChange={(e) => setForm({ ...form, assessment: { ...form.assessment, passingScore: Number(e.target.value) } })} className="form-input" /></Field>
          <Field label="Attempt limit"><input type="number" min="1" max="20" required value={form.assessment.attemptLimit} onChange={(e) => setForm({ ...form, assessment: { ...form.assessment, attemptLimit: Number(e.target.value) } })} className="form-input" /></Field>
          <Field label="Time limit (minutes)"><input type="number" min="1" max="600" required value={form.assessment.timeLimitMinutes} onChange={(e) => setForm({ ...form, assessment: { ...form.assessment, timeLimitMinutes: Number(e.target.value) } })} className="form-input" /></Field>
          <Field label="Available from (optional)"><input type="datetime-local" value={form.assessment.availableFrom} onChange={(e) => setForm({ ...form, assessment: { ...form.assessment, availableFrom: e.target.value } })} className="form-input" /></Field>
          <Field label="Available until (optional)"><input type="datetime-local" value={form.assessment.availableUntil} onChange={(e) => setForm({ ...form, assessment: { ...form.assessment, availableUntil: e.target.value } })} className="form-input" /></Field>
        </div>
        <div className="space-y-4">{form.assessment.questions.map((question, index) => <div key={index} className="rounded-lg border border-stone-100 p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_180px_100px]"><input required value={question.prompt} onChange={(e) => updateQuestion(index, { prompt: e.target.value })} className="form-input" placeholder={`Question ${index + 1}`} /><select value={question.type} onChange={(e) => updateQuestion(index, { type: e.target.value as CourseForm["assessment"]["questions"][number]["type"] })} className="form-input"><option value="multiple-choice">Multiple choice</option><option value="true-false">True / false</option><option value="practical">Practical · manual grade</option></select><input aria-label="Question marks" type="number" min="1" value={question.marks} onChange={(e) => updateQuestion(index, { marks: Number(e.target.value) })} className="form-input" placeholder="Marks" /></div>
          {question.type === "multiple-choice" && <div className="mt-3 grid gap-2 md:grid-cols-2">{question.options.map((option, optionIndex) => <input key={optionIndex} value={option} onChange={(e) => updateQuestion(index, { options: question.options.map((value, i) => i === optionIndex ? e.target.value : value) })} className="form-input" placeholder={`Answer option ${optionIndex + 1}`} />)}<button type="button" onClick={() => updateQuestion(index, { options: [...question.options, ""] })} className="text-left text-xs font-semibold text-orange-700">+ Add option</button><select value={question.correctAnswer} onChange={(e) => updateQuestion(index, { correctAnswer: e.target.value })} className="form-input"><option value="">Select correct answer</option>{question.options.filter(Boolean).map((option) => <option key={option}>{option}</option>)}</select></div>}
          {question.type === "true-false" && <select value={question.correctAnswer} onChange={(e) => updateQuestion(index, { correctAnswer: e.target.value })} className="form-input mt-3"><option value="">Select correct answer</option><option>True</option><option>False</option></select>}
          {question.type === "practical" && <textarea value={question.practicalInstructions} onChange={(e) => updateQuestion(index, { practicalInstructions: e.target.value })} className="form-input mt-3 min-h-20" placeholder="Practical instructions. Admins will review and award marks." />}
          <button type="button" onClick={() => setForm({ ...form, assessment: { ...form.assessment, questions: form.assessment.questions.filter((_, i) => i !== index) } })} className="mt-3 text-xs font-medium text-red-700">Remove question</button>
        </div>)}</div>
        <button type="button" onClick={() => setForm({ ...form, assessment: { ...form.assessment, questions: [...form.assessment.questions, { prompt: "", type: "multiple-choice", options: ["", ""], correctAnswer: "", practicalInstructions: "", marks: 1 }] } })} className="mt-4 text-sm font-semibold text-orange-700"><Plus size={14} className="mr-1 inline" /> Add assessment question</button>
      </section>
      <button disabled={busy} className="btn-brand"><Save size={15} /> {busy ? "Saving…" : selectedId ? "Save course" : "Create course"}</button>
    </form>}
    <section className="mt-10"><div className="mb-4 flex items-end justify-between"><div><p className="section-eyebrow">Course catalogue</p><h2 className="mt-1 font-display text-xl font-bold">Existing courses</h2></div><button onClick={() => void load()} className="text-sm font-semibold text-orange-700">Refresh</button></div>
      {courses.length ? <div className="space-y-2">{courses.map((course) => <article key={course._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-orange-100 bg-white p-4"><div><h3 className="font-semibold">{course.title}</h3><p className="mt-1 text-xs text-stone-500">{course.level} · {course.modules.length} modules · {course.status}</p></div><div className="flex gap-2"><button onClick={() => editCourse(course)} className="btn-outline-brand">Edit</button><button onClick={() => void deleteCourse(course)} className="icon-delete" aria-label={`Delete ${course.title}`}><Trash2 size={16} /></button></div></article>)}</div> : <EmptyState title="No courses created yet" message="Use the course builder or import a validated JSON file." />}
    </section>
  </>;
}

function AssessmentsManager() {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [courseById, setCourseById] = useState<Map<string, any>>(new Map());
  const [grades, setGrades] = useState<Record<string, Record<string, number>>>({});
  const [error, setError] = useState(""); const [notice, setNotice] = useState("");
  const load = useCallback(async () => {
    try {
      const [result, courses] = await Promise.all([api<{ attempts: any[] }>("/admin/assessments"), api<{ courses: any[] }>("/admin/courses")]);
      setAttempts(result.attempts); setCourseById(new Map(courses.courses.map((course) => [course._id, course])));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Assessments could not be loaded."); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const pending = attempts.filter((attempt) => attempt.status === "pending-review");
  const grade = async (attempt: any) => {
    const course = courseById.get(attempt.courseId._id);
    const practicalAnswers = attempt.answers.filter((answer: any) => answer.pendingReview);
    const values = grades[attempt._id] ?? {};
    if (practicalAnswers.some((answer: any) => values[answer.questionId] === undefined)) { setError("Enter a grade for every practical response before submitting."); return; }
    try {
      const response = await api<{ attempt: any }>(`/admin/assessments/${attempt._id}/grade`, { method: "POST", body: { grades: practicalAnswers.map((answer: any) => ({ questionId: answer.questionId, marks: Number(values[answer.questionId]) })) } });
      setNotice(`Assessment reviewed. Final result: ${response.attempt.status}.`); setError(""); await load();
      void course;
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Assessment could not be graded."); }
  };
  return <>
    <PageHeading eyebrow="Learning quality" title="Assessment reviews" description="Review practical work submitted by learners. Objective questions are graded automatically." />
    {error && <p role="alert" className="notice-error mb-4">{error}</p>}{notice && <p role="status" className="notice-success mb-4">{notice}</p>}
    {attempts.length ? <div className="space-y-4">{attempts.map((attempt) => {
      const course = courseById.get(attempt.courseId?._id);
      const practical = attempt.answers.filter((answer: any) => answer.pendingReview);
      return <article key={attempt._id} className="rounded-xl border border-orange-100 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="section-eyebrow">{attempt.status === "pending-review" ? "Review required" : "Reviewed"}</p><h2 className="mt-1 font-display text-lg font-bold">{attempt.userId?.name} · {attempt.courseId?.title}</h2><p className="mt-1 text-xs text-stone-500">{attempt.userId?.email} · Submitted {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : "—"}</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${attempt.status === "passed" ? "bg-emerald-50 text-emerald-800" : attempt.status === "pending-review" ? "bg-amber-50 text-amber-800" : "bg-stone-100 text-stone-600"}`}>{attempt.status}</span></div>
        <p className="mt-4 text-sm text-stone-600">Objective score: {attempt.score}/{attempt.totalMarks} marks</p>
        {practical.map((answer: any) => {
          const question = course?.assessment.questions.find((item: any) => String(item._id) === answer.questionId);
          return <div key={answer.questionId} className="mt-4 rounded-lg bg-[#fffaf5] p-4"><p className="text-sm font-semibold">{question?.prompt ?? "Practical question"}</p>{question?.practicalInstructions && <p className="mt-1 text-xs text-stone-500">{question.practicalInstructions}</p>}<p className="mt-3 whitespace-pre-wrap rounded bg-white p-3 text-sm text-stone-700">{answer.answer || "No written response provided."}</p><label className="form-label mt-3">Award marks (maximum {question?.marks ?? "—"})<input type="number" min="0" max={question?.marks} value={grades[attempt._id]?.[answer.questionId] ?? ""} onChange={(e) => setGrades({ ...grades, [attempt._id]: { ...grades[attempt._id], [answer.questionId]: Number(e.target.value) } })} className="form-input max-w-[180px]" /></label></div>;
        })}
        {attempt.status === "pending-review" && <button onClick={() => void grade(attempt)} className="btn-brand mt-4"><Check size={15} /> Submit final grade</button>}
      </article>;
    })}</div> : <EmptyState title="No assessment submissions" message="Submitted final assessments will appear here for review." />}
  </>;
}

function CertificatesManager() {
  const [certificates, setCertificates] = useState<any[]>([]); const [error, setError] = useState("");
  const load = () => api<{ certificates: any[] }>("/admin/certificates").then((result) => setCertificates(result.certificates)).catch((cause) => setError(cause.message));
  useEffect(() => { void load(); }, []);
  const revoke = async (certificate: any) => {
    if (!window.confirm(`Revoke certificate ${certificate.certificateId}? Public verification will show it as invalid.`)) return;
    try { await api(`/admin/certificates/${certificate._id}/revoke`, { method: "PATCH" }); await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Certificate could not be revoked."); }
  };
  return <><PageHeading eyebrow="Achievement records" title="Certificates" description="Review, verify and revoke course completion certificates." />{error && <p role="alert" className="notice-error mb-4">{error}</p>}
    {certificates.length ? <div className="overflow-x-auto rounded-xl border border-orange-100 bg-white"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-[#fff7ed] text-xs uppercase text-stone-500"><tr><th className="p-4">Recipient</th><th className="p-4">Course</th><th className="p-4">Certificate</th><th className="p-4">Issued</th><th className="p-4">Status</th></tr></thead><tbody className="divide-y divide-stone-100">{certificates.map((certificate) => <tr key={certificate._id}><td className="p-4">{certificate.userId?.name}<p className="text-xs text-stone-500">{certificate.userId?.email}</p></td><td className="p-4">{certificate.courseId?.title}</td><td className="p-4 font-mono text-xs">{certificate.certificateId}</td><td className="p-4 text-xs">{new Date(certificate.issuedAt).toLocaleDateString()}</td><td className="p-4">{certificate.revokedAt ? <span className="text-red-700">Revoked</span> : <button onClick={() => void revoke(certificate)} className="text-xs font-semibold text-red-700 hover:underline">Revoke</button>}</td></tr>)}</tbody></table></div> : <EmptyState title="No certificates issued" message="Passed assessment results will create certificates eligible for download and public verification." />}
  </>;
}

function ContentManager({ kind }: { kind: string }) {
  const [items, setItems] = useState<any[]>([]); const [selected, setSelected] = useState<any | null>(null);
  const [json, setJson] = useState('{\n  "title": "",\n  "description": ""\n}');
  const [published, setPublished] = useState(true); const [error, setError] = useState(""); const [notice, setNotice] = useState(""); const [busy, setBusy] = useState(false);
  const title = ({ team: "Team", badge: "Badges", alumni: "Alumni", achiever: "Top achievers", partner: "Partners", gallery: "Gallery", testimonial: "Testimonials" } as Record<string, string>)[kind] ?? "Content";
  const load = useCallback(async () => {
    try { const result = await api<{ items: any[] }>(`/admin/content/${kind}`); setItems(result.items); }
    catch (cause) { setError(cause instanceof Error ? cause.message : `${title} could not be loaded.`); }
  }, [kind, title]);
  useEffect(() => { setItems([]); setSelected(null); void load(); }, [load]);
  const edit = (item: any) => { setSelected(item); setJson(JSON.stringify(item.data, null, 2)); setPublished(item.published); };
  const reset = () => { setSelected(null); setJson('{\n  "title": "",\n  "description": ""\n}'); setPublished(true); };
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const data = JSON.parse(json);
      if (!data || Array.isArray(data) || typeof data !== "object") throw new Error("Content data must be a JSON object.");
      const body = { data, published };
      if (selected) await api(`/admin/content/${kind}/${selected._id}`, { method: "PUT", body });
      else await api(`/admin/content/${kind}`, { method: "POST", body });
      setNotice(`${title} record ${selected ? "updated" : "created"}.`); reset(); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : `${title} record could not be saved.`); }
    finally { setBusy(false); }
  };
  const remove = async (item: any) => {
    if (!window.confirm(`Delete “${item.data.title ?? item.data.name ?? title}”?`)) return;
    try { await api(`/admin/content/${kind}/${item._id}`, { method: "DELETE" }); await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Content could not be deleted."); }
  };
  const uploadImage = async (file?: File) => {
    if (!file) return;
    const body = new FormData(); body.append("image", file);
    try {
      const result = await api<{ url: string }>("/admin/upload", { method: "POST", body });
      const data = JSON.parse(json); data.imageUrl = result.url; setJson(JSON.stringify(data, null, 2)); setNotice("Image uploaded. The URL was added to imageUrl.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Image upload failed."); }
  };
  return <>
    <PageHeading eyebrow="Public website content" title={title} description={`Create, edit, publish, and remove ${title.toLowerCase()} displayed on the public DevQueens website.`} />
    {error && <p role="alert" className="notice-error mb-4">{error}</p>}{notice && <p role="status" className="notice-success mb-4">{notice}</p>}
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,.7fr)]">
      <section><div className="mb-3 flex items-center justify-between"><h2 className="font-display text-lg font-bold">Published and draft records</h2><button onClick={() => void load()} className="text-sm font-semibold text-orange-700">Refresh</button></div>
        {items.length ? <div className="space-y-3">{items.map((item) => <article key={item._id} className="flex items-start gap-4 rounded-xl border border-orange-100 bg-white p-4">
          {(item.data.imageUrl || item.data.photoUrl) ? <img src={item.data.imageUrl ?? item.data.photoUrl} alt="" className="h-16 w-16 rounded-lg object-cover" /> : <div className="h-16 w-16 rounded-lg bg-orange-50" />}
          <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h3 className="font-semibold">{item.data.title ?? item.data.name ?? "Untitled record"}</h3><span className={`rounded-full px-2 py-0.5 text-[10px] ${item.published ? "bg-emerald-50 text-emerald-800" : "bg-stone-100 text-stone-500"}`}>{item.published ? "Published" : "Draft"}</span></div><p className="mt-1 line-clamp-2 text-xs text-stone-500">{item.data.description ?? item.data.role ?? item.data.quote ?? ""}</p><div className="mt-3 flex gap-3"><button onClick={() => edit(item)} className="text-xs font-semibold text-orange-700">Edit</button><button onClick={() => void remove(item)} className="text-xs font-semibold text-red-700">Delete</button></div></div>
        </article>)}</div> : <EmptyState title={`No ${title.toLowerCase()} yet`} message="Add the first record using the editor." />}
      </section>
      <form onSubmit={save} className="h-fit rounded-xl border border-orange-100 bg-white p-5">
        <div className="flex items-start justify-between"><div><p className="section-eyebrow">{selected ? "Update record" : "New record"}</p><h2 className="mt-1 font-display text-lg font-bold">{selected ? selected.data.title ?? "Edit content" : `Add ${title.toLowerCase().replace(/s$/, "")}`}</h2></div>{selected && <button type="button" onClick={reset} className="icon-delete" aria-label="Cancel edit"><X size={16} /></button>}</div>
        <p className="mb-3 mt-2 text-xs leading-5 text-stone-500">Edit this record as JSON. Supported fields depend on the content type, for example title, name, role, bio, photoUrl/imageUrl, badges, quote, socialLinks, url, category and date.{(kind === "alumni" || kind === "achiever") && " To link a member card, include memberId (DQ-YYYY-XXXXXXXX) after confirming the member’s profile is public. Add completion details only when verified."}</p>
        <label className="form-label">Image upload<input type="file" accept="image/*" onChange={(e) => void uploadImage(e.target.files?.[0])} className="form-input text-xs" /><span className="font-normal text-stone-400">Cloudinary upload · maximum 5 MB</span></label>
        <label className="form-label mt-4">Record data<textarea required value={json} onChange={(e) => setJson(e.target.value)} className="form-input mt-1 min-h-64 font-mono text-xs leading-5" /></label>
        <label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="accent-orange-600" /> Publish publicly</label>
        <div className="mt-5 flex flex-wrap gap-2"><button disabled={busy} className="btn-brand"><Save size={15} /> {busy ? "Saving…" : selected ? "Save changes" : "Create record"}</button>{selected && <button type="button" onClick={reset} className="btn-outline-brand">Cancel</button>}</div>
      </form>
    </div>
  </>;
}

function ReportsPage() {
  const [reports, setReports] = useState<any | null>(null); const [error, setError] = useState("");
  useEffect(() => { api<{ reports: any }>("/admin/reports").then((result) => setReports(result.reports)).catch((cause) => setError(cause.message)); }, []);
  return <><PageHeading eyebrow="Programme insights" title="Reports" description="Enrollment, course completion and assessment outcomes from live platform data." />{error && <p role="alert" className="notice-error">{error}</p>}
    {reports && <div className="grid gap-6 xl:grid-cols-2"><section className="rounded-xl border border-orange-100 bg-white p-5"><h2 className="font-display font-bold">Member registrations by month</h2>{reports.monthlyMembers.length ? <div className="mt-4 space-y-3">{reports.monthlyMembers.map((row: any) => <div key={row._id}><div className="mb-1 flex justify-between text-xs"><span>{row._id}</span><span>{row.count}</span></div><div className="h-2 rounded-full bg-orange-50"><div className="h-full rounded-full bg-orange-500" style={{ width: `${Math.min(100, row.count * 6)}%` }} /></div></div>)}</div> : <p className="mt-3 text-sm text-stone-500">No member registrations yet.</p>}</section>
      <section className="rounded-xl border border-orange-100 bg-white p-5"><h2 className="font-display font-bold">Course enrollments</h2>{reports.courseEnrollments.length ? <div className="mt-4 space-y-3">{reports.courseEnrollments.map((row: any) => <div key={row._id} className="flex justify-between gap-3 border-b border-stone-100 pb-3 text-sm"><span>{row.course}</span><span className="shrink-0 text-stone-500">{row.enrollments} enrolled · {row.completions} complete</span></div>)}</div> : <p className="mt-3 text-sm text-stone-500">No course enrollments yet.</p>}</section>
      <section className="rounded-xl border border-orange-100 bg-white p-5"><h2 className="font-display font-bold">Assessment outcomes</h2><div className="mt-4 flex flex-wrap gap-3">{reports.assessments.length ? reports.assessments.map((row: any) => <div key={row._id} className="min-w-32 rounded-lg bg-[#fff7ed] p-4"><p className="text-xs capitalize text-stone-500">{row._id}</p><p className="mt-1 font-display text-2xl font-bold">{row.count}</p></div>) : <p className="text-sm text-stone-500">No assessment outcomes yet.</p>}</div></section>
    </div>}
  </>;
}

function SettingsPage() {
  const [text, setText] = useState("{}"); const [error, setError] = useState(""); const [notice, setNotice] = useState("");
  const [communityUrl, setCommunityUrl] = useState("");
  const [communityEnabled, setCommunityEnabled] = useState(true);
  const [communityLoading, setCommunityLoading] = useState(true);
  const [communityBusy, setCommunityBusy] = useState(false);
  const [communityError, setCommunityError] = useState("");
  const [communityNotice, setCommunityNotice] = useState("");
  useEffect(() => {
    api<{ settings: Record<string, unknown> }>("/admin/settings")
      .then((result) => setText(JSON.stringify(result.settings, null, 2)))
      .catch((cause) => setError(cause.message));
    api<{ url: string; enabled: boolean }>("/community-link")
      .then((result) => { setCommunityUrl(result.url); setCommunityEnabled(result.enabled); })
      .catch((cause) => setCommunityError(cause.message))
      .finally(() => setCommunityLoading(false));
  }, []);
  const saveCommunity = async (event: React.FormEvent) => {
    event.preventDefault(); setCommunityError(""); setCommunityNotice(""); setCommunityBusy(true);
    try {
      await api("/admin/community-link", { method: "PUT", body: { url: communityUrl, enabled: communityEnabled } });
      setCommunityNotice("Community button settings saved.");
    } catch (cause) {
      setCommunityError(cause instanceof Error ? cause.message : "Community button settings could not be saved.");
    } finally { setCommunityBusy(false); }
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setError(""); setNotice("");
    try { const value = JSON.parse(text); if (!value || Array.isArray(value) || typeof value !== "object") throw new Error("Settings must be a JSON object."); await api("/admin/settings", { method: "PUT", body: value }); setNotice("Platform settings saved."); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Settings could not be saved."); }
  };
  return <>
    <PageHeading eyebrow="Platform configuration" title="Settings" description="Manage public platform settings. Secrets and infrastructure credentials must be configured through deployment environment variables." />
    <section className="mb-6 max-w-3xl rounded-xl border border-orange-100 bg-white p-5">
      <h2 className="font-display text-lg font-bold text-stone-900">Community invitation</h2>
      <p className="mt-1 text-sm text-stone-500">Update the community invite or hide the Join Community buttons across the landing page and member dashboard.</p>
      {communityError && <p role="alert" className="notice-error mt-4">{communityError}</p>}
      {communityNotice && <p role="status" className="notice-success mt-4">{communityNotice}</p>}
      {communityLoading ? <p className="mt-4 text-sm text-stone-500">Loading community settings…</p> : (
        <form onSubmit={saveCommunity} className="mt-4 space-y-4">
          <label className="form-label">Invitation URL
            <input type="url" required value={communityUrl} onChange={(event) => setCommunityUrl(event.target.value)} className="form-input mt-1" placeholder="https://chat.whatsapp.com/…" />
          </label>
          <label className="flex items-center gap-3 text-sm font-medium text-stone-700">
            <input type="checkbox" checked={communityEnabled} onChange={(event) => setCommunityEnabled(event.target.checked)} className="h-4 w-4 accent-[#34295d]" />
            Show Join Community buttons
          </label>
          <button disabled={communityBusy} className="btn-brand disabled:opacity-60"><Save size={15} /> {communityBusy ? "Saving…" : "Save community settings"}</button>
        </form>
      )}
    </section>
    {error && <p role="alert" className="notice-error mb-4">{error}</p>}{notice && <p role="status" className="notice-success mb-4">{notice}</p>}
    <form onSubmit={save} className="max-w-3xl rounded-xl border border-orange-100 bg-white p-5">
      <label className="form-label">Other platform settings<textarea value={text} onChange={(e) => setText(e.target.value)} className="form-input mt-1 min-h-72 font-mono text-xs" /></label>
      <p className="mt-2 text-xs text-stone-400">Example keys include contactEmail, registrationOpen, publicAnnouncement and socialLinks.</p>
      <button className="btn-brand mt-4"><Save size={15} /> Save settings</button>
    </form>
  </>;
}

function AdminContent() {
  const { section = "" } = useParams();
  const sections: Record<string, string> = {
    "": "overview", members: "members", inbox: "inbox", enrollments: "enrollments", courses: "courses", assessments: "assessments", certificates: "certificates",
    team: "team", badges: "badge", alumni: "alumni", achiever: "achiever", partner: "partner", gallery: "gallery",
    testimonial: "testimonial", reports: "reports", settings: "settings",
  };
  const key = sections[section];
  if (!key) return <EmptyState title="Administration page not found" message="Choose a section from the navigation." action={<Link to="/admin" className="btn-brand">Go to overview</Link>} />;
  if (key === "overview") return <AdminOverview />;
  if (key === "members") return <MembersManager />;
  if (key === "inbox") return <AdminInboxPage />;
  if (key === "enrollments") return <EnrollmentsManager />;
  if (key === "courses") return <CourseManager />;
  if (key === "assessments") return <AssessmentsManager />;
  if (key === "certificates") return <CertificatesManager />;
  if (key === "reports") return <ReportsPage />;
  if (key === "settings") return <SettingsPage />;
  return <ContentManager kind={key} />;
}

export default function AdminPortal() {
  const { user, loading, error } = useAuth();
  useEffect(() => { updateSeo({ title: "Administration | DevQueens", description: "DevQueens platform administration.", noIndex: true }); }, []);
  if (loading) return <PageLoader label="Opening administration" />;
  if (error) return <div className="grid min-h-screen place-items-center p-5"><div className="max-w-md rounded-xl border border-red-100 bg-white p-6 text-center"><h1 className="font-display text-xl font-bold">Administration service unavailable</h1><p role="alert" className="mt-2 text-sm text-stone-500">{error}</p><button onClick={() => window.location.reload()} className="btn-brand mt-5">Try again</button></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/portal" replace />;
  return <PlatformShell admin><Routes><Route path="*" element={<AdminContent />} /></Routes></PlatformShell>;
}
