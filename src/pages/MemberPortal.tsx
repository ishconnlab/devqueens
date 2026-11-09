import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import { Download, ExternalLink, ImageUp, Share2, ShieldCheck, Award, ArrowRight } from "lucide-react";
import QRCode from "qrcode";
import { api, apiUrl } from "@/lib/api";
import { useAuth, type SessionUser } from "@/contexts/AuthContext";
import { EmptyState, PageHeading, PlatformShell } from "@/components/platform/PlatformShell";
import { CourseCatalog, CourseWorkspace, LearningHome } from "@/pages/CoursePages";
import { AnalyticsPage, CommunityPage } from "@/pages/SocialPages";
import { MemberInboxPage } from "@/pages/InboxPages";
import PageLoader from "@/components/devqueens/PageLoader";
import { updateSeo } from "@/lib/seo";

type CertificateRecord = { _id: string; certificateId: string; issuedAt: string; courseId: { title: string; slug: string } };

function ProfilePage() {
  const { user, refresh } = useAuth();
  const [values, setValues] = useState<{
    name: string; bio: string; country: string; interests: string; visibility: "public" | "private";
    linkedin: string; github: string; portfolio: string;
  }>({
    name: user?.name ?? "",
    bio: user?.profile?.bio ?? "",
    country: user?.profile?.country ?? "",
    interests: user?.profile?.interests?.join(", ") ?? "",
    visibility: user?.profile?.visibility ?? "public",
    linkedin: user?.profile?.linkedin ?? "",
    github: user?.profile?.github ?? "",
    portfolio: user?.profile?.portfolio ?? "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    setValues({
      name: user.name,
      bio: user.profile?.bio ?? "",
      country: user.profile?.country ?? "",
      interests: user.profile?.interests?.join(", ") ?? "",
      visibility: user.profile?.visibility ?? "public",
      linkedin: user.profile?.linkedin ?? "",
      github: user.profile?.github ?? "",
      portfolio: user.profile?.portfolio ?? "",
    });
  }, [user]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setMessage(""); setError("");
    try {
      await api("/me", { method: "PATCH", body: {
        name: values.name,
        profile: {
          bio: values.bio,
          country: values.country,
          interests: values.interests.split(",").map((item) => item.trim()).filter(Boolean),
          visibility: values.visibility,
          linkedin: values.linkedin,
          github: values.github,
          portfolio: values.portfolio,
        },
      } });
      await refresh();
      setMessage("Your profile is up to date.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Your profile could not be saved."); }
    finally { setSaving(false); }
  };

  const uploadPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Choose an image file."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Choose an image smaller than 5 MB."); return; }
    setUploading(true); setMessage(""); setError("");
    const body = new FormData(); body.append("photo", file);
    try { await api("/me/photo", { method: "POST", body }); await refresh(); setMessage("Profile photo updated."); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "The photo could not be uploaded."); }
    finally { setUploading(false); event.target.value = ""; }
  };

  return (
    <>
      <PageHeading eyebrow="Your digital identity" title="Profile settings" description="Share a little about yourself, your interests, and the work you want to do." />
      {message && <p role="status" className="notice-success mb-5">{message}</p>}
      {error && <p role="alert" className="notice-error mb-5">{error}</p>}
      <form onSubmit={save} className="max-w-3xl space-y-6">
        <section className="flex flex-wrap items-center gap-5 rounded-xl border border-orange-100 bg-white p-5">
          {user?.profile?.photoUrl ? <img src={user.profile.photoUrl} alt="Your profile" className="h-20 w-20 rounded-full object-cover" /> : <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 font-display text-2xl font-bold text-orange-800">{user?.name?.slice(0, 1)}</div>}
          <div className="flex-1"><h2 className="font-semibold">Profile photograph</h2><p className="mt-1 text-xs text-stone-500">Square photos work best. Maximum 5 MB.</p><input ref={fileInput} type="file" accept="image/*" onChange={uploadPhoto} className="sr-only" aria-label="Upload profile photo" /><button type="button" disabled={uploading} onClick={() => fileInput.current?.click()} className="btn-outline-brand mt-3">{uploading ? "Uploading…" : "Change photo"} <ImageUp size={15} /></button></div>
        </section>
        <section className="grid gap-5 rounded-xl border border-orange-100 bg-white p-5 md:grid-cols-2">
          <label className="form-label md:col-span-2">Full name<input required value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} className="form-input" maxLength={100} /></label>
          <label className="form-label md:col-span-2">Short introduction<textarea value={values.bio} onChange={(e) => setValues({ ...values, bio: e.target.value })} className="form-input min-h-28" maxLength={500} placeholder="What are you learning or building?" /></label>
          <label className="form-label">Country<input value={values.country} onChange={(e) => setValues({ ...values, country: e.target.value })} className="form-input" maxLength={80} /></label>
          <label className="form-label">Interests <span className="font-normal text-stone-400">Separate with commas</span><input value={values.interests} onChange={(e) => setValues({ ...values, interests: e.target.value })} className="form-input" placeholder="Web development, AI, design" /></label>
          <label className="form-label">LinkedIn URL<input type="url" value={values.linkedin} onChange={(e) => setValues({ ...values, linkedin: e.target.value })} className="form-input" placeholder="https://" /></label>
          <label className="form-label">GitHub URL<input type="url" value={values.github} onChange={(e) => setValues({ ...values, github: e.target.value })} className="form-input" placeholder="https://" /></label>
          <label className="form-label">Portfolio URL<input type="url" value={values.portfolio} onChange={(e) => setValues({ ...values, portfolio: e.target.value })} className="form-input" placeholder="https://" /></label>
          <label className="form-label">Public profile<select value={values.visibility} onChange={(e) => setValues({ ...values, visibility: e.target.value === "private" ? "private" : "public" })} className="form-input"><option value="public">Visible to everyone</option><option value="private">Private</option></select><span className="font-normal text-stone-400">A public profile may show your name, photo, interests, and earned certificates.</span></label>
        </section>
        <div className="flex flex-wrap gap-3">
          <button disabled={saving} className="btn-brand">{saving ? "Saving…" : "Save profile"} <ArrowRight size={15} /></button>
          {user?.memberId && values.visibility === "public" && <Link to={`/members/${user.memberId}`} className="btn-outline-brand">Share your public profile <ExternalLink size={14} /></Link>}
        </div>
      </form>
    </>
  );
}

function CertificatePage() {
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api<{ certificates: CertificateRecord[] }>("/certificates")
      .then((result) => setCertificates(result.certificates))
      .catch((cause) => setError(cause.message))
      .finally(() => setLoading(false));
  }, []);

  const download = async (id: string) => {
    setError("");
    try {
      const response = await fetch(apiUrl(`/certificates/${id}/pdf`), { credentials: "include" });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Certificate PDF could not be downloaded.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a"); link.href = url; link.download = `${id}.pdf`; link.click();
      URL.revokeObjectURL(url);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Certificate PDF could not be downloaded."); }
  };

  return (
    <>
      <PageHeading eyebrow="Your milestones" title="Certificates" description="Official course certificates issued by the DevQueens learning initiative at IshConnect." />
      {error && <p role="alert" className="notice-error mb-5">{error}</p>}
      {loading ? <p className="text-sm text-stone-500">Loading certificates…</p> : certificates.length ? <div className="grid gap-4 md:grid-cols-2">{certificates.map((certificate) => <article key={certificate._id} className="flex items-start gap-4 rounded-xl border border-orange-100 bg-white p-5"><div className="rounded-lg bg-orange-100 p-3 text-orange-700"><Award size={21} /></div><div className="min-w-0 flex-1"><h2 className="font-display font-bold">{certificate.courseId?.title ?? "Completed course"}</h2><p className="mt-1 text-xs text-stone-500">Issued {new Date(certificate.issuedAt).toLocaleDateString()} · {certificate.certificateId}</p><div className="mt-4 flex flex-wrap gap-3"><button onClick={() => void download(certificate.certificateId)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-700 hover:text-orange-900"><Download size={15} /> Download PDF</button><Link to={`/verify/${certificate.certificateId}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-orange-700">Verify <ExternalLink size={14} /></Link></div></div></article>)}</div> : <EmptyState title="Your first certificate is waiting" message="Finish a course and pass its final assessment. Your official, verifiable certificate will show up here." action={<Link to="/portal/courses" className="btn-brand">Explore courses</Link>} />}
    </>
  );
}

function MembershipCardPage({ user }: { user: SessionUser }) {
  const [profileUrl, setProfileUrl] = useState("");
  const [qr, setQr] = useState("");
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    api<{ profileUrl: string }>("/member-card").then(async (result) => {
      setProfileUrl(result.profileUrl);
      setQr(await QRCode.toDataURL(result.profileUrl, { margin: 1, width: 220, color: { dark: "#292524", light: "#ffffff" } }));
    }).catch((cause) => setError(cause.message));
  }, []);

  const drawCard = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !qr) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = 1200; canvas.height = 720;
    ctx.fillStyle = "#fff7ed"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f97316"; ctx.fillRect(0, 0, 20, canvas.height);
    ctx.fillStyle = "#292524"; ctx.font = "bold 30px Arial"; ctx.fillText("DEVQUEENS", 80, 95);
    ctx.fillStyle = "#c2410c"; ctx.font = "18px Arial"; ctx.fillText("AN INITIATIVE BY ISHCONNECT", 80, 130);
    const photo = user.profile?.photoUrl;
    if (photo) {
      try {
        const image = new Image(); image.crossOrigin = "anonymous"; image.src = photo;
        await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error("Profile image could not be loaded.")); });
        ctx.save(); ctx.beginPath(); ctx.arc(170, 335, 92, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(image, 78, 243, 184, 184); ctx.restore();
      } catch { ctx.fillStyle = "#fed7aa"; ctx.beginPath(); ctx.arc(170, 335, 92, 0, Math.PI * 2); ctx.fill(); }
    } else {
      ctx.fillStyle = "#fed7aa"; ctx.beginPath(); ctx.arc(170, 335, 92, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#9a3412"; ctx.font = "bold 72px Arial"; ctx.textAlign = "center"; ctx.fillText(user.name.slice(0, 1).toUpperCase(), 170, 360); ctx.textAlign = "left";
    }
    ctx.fillStyle = "#292524"; ctx.font = "bold 42px Arial"; ctx.fillText(user.name, 310, 295);
    ctx.fillStyle = "#78716c"; ctx.font = "24px Arial"; ctx.fillText(user.profile?.interests?.slice(0, 3).join(" · ") || "Technology learner", 310, 345);
    ctx.fillStyle = "#c2410c"; ctx.font = "bold 18px Arial"; ctx.fillText("MEMBER ID", 310, 420);
    ctx.fillStyle = "#292524"; ctx.font = "24px Arial"; ctx.fillText(user.memberId ?? "", 310, 455);
    ctx.fillStyle = "#c2410c"; ctx.font = "bold 18px Arial"; ctx.fillText("MEMBERSHIP STATUS", 310, 520);
    ctx.fillStyle = "#292524"; ctx.font = "24px Arial"; ctx.fillText("ACTIVE MEMBER", 310, 555);
    if (user.joinedAt) { ctx.fillStyle = "#78716c"; ctx.font = "18px Arial"; ctx.fillText(`MEMBER SINCE ${new Date(user.joinedAt).toLocaleDateString("en", { month: "long", year: "numeric" })}`, 310, 605); }
    const qrImage = new Image(); qrImage.src = qr;
    await new Promise<void>((resolve) => { qrImage.onload = () => resolve(); });
    ctx.drawImage(qrImage, 900, 410, 210, 210);
    ctx.fillStyle = "#78716c"; ctx.font = "16px Arial"; ctx.textAlign = "center"; ctx.fillText("Scan to view profile", 1005, 644); ctx.textAlign = "left";
  }, [qr, user]);

  useEffect(() => { if (qr) void drawCard(); }, [qr, drawCard]);

  const downloadPng = async () => {
    await drawCard();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const anchor = document.createElement("a"); anchor.download = `devqueens-${user.memberId}-membership.png`; anchor.href = canvas.toDataURL("image/png"); anchor.click();
  };

  const share = async () => {
    const shareData = { title: `${user.name} · DevQueens`, text: "Connect with me on DevQueens.", url: profileUrl };
    if (navigator.share) await navigator.share(shareData);
    else if (navigator.clipboard) { await navigator.clipboard.writeText(profileUrl); setError("Profile link copied to clipboard."); }
  };

  return (
    <>
      <PageHeading eyebrow="Your digital identity" title="Membership card" description="A shareable identity card for your DevQueens community membership." />
      {error && <p role="status" className="notice-error mb-4">{error}</p>}
      {profileUrl && <div id="membership-card-print" className="max-w-3xl rounded-2xl border border-orange-100 bg-white p-5 md:p-8">
        <div className="overflow-hidden rounded-xl border border-orange-100 bg-[#fff7ed]">
          <div className="h-2 bg-orange-500" />
          <div className="grid gap-5 p-6 sm:grid-cols-[100px_1fr_100px] sm:items-center md:gap-8 md:p-8">
            {user.profile?.photoUrl ? <img src={user.profile.photoUrl} alt={user.name} className="h-24 w-24 rounded-full object-cover" /> : <div className="flex h-24 w-24 items-center justify-center rounded-full bg-orange-200 font-display text-3xl font-bold text-orange-900">{user.name.slice(0, 1)}</div>}
            <div><p className="text-xs font-bold tracking-widest text-orange-800">DEVQUEENS · ISHCONNECT</p><h2 className="mt-2 font-display text-2xl font-bold">{user.name}</h2><p className="mt-1 text-sm text-stone-600">{user.profile?.interests?.slice(0, 3).join(" · ") || "Technology learner"}</p><p className="mt-4 text-xs text-stone-500">Member ID <strong className="ml-1 text-stone-800">{user.memberId}</strong></p><p className="mt-1 text-xs text-stone-500">Active member · Since {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString("en", { month: "short", year: "numeric" }) : "2026"}</p></div>
            {qr && <img src={qr} alt="QR code linking to your public profile" className="h-24 w-24 rounded bg-white p-1" />}
          </div>
          <div className="border-t border-orange-100 px-6 py-3 text-xs text-stone-500 md:px-8">{profileUrl}</div>
        </div>
        <canvas ref={canvasRef} className="hidden" />
        <div id="membership-card-actions" className="mt-5 flex flex-wrap gap-2">
          <button onClick={() => void downloadPng()} className="btn-brand"><Download size={15} /> Download card PNG</button>
          <button onClick={() => window.print()} className="btn-outline-brand">Print / save PDF</button>
          <button onClick={() => void share()} className="btn-outline-brand"><Share2 size={15} /> Share</button>
          <a target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent(`Connect with me on DevQueens: ${profileUrl}`)}`} className="btn-outline-brand">WhatsApp</a>
          <a target="_blank" rel="noreferrer" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`} className="btn-outline-brand">LinkedIn</a>
        </div>
        <p className="mt-3 text-xs text-stone-400">The PNG is sized for social profiles. “Print / save PDF” opens your browser's print dialogue for a PDF copy.</p>
      </div>}
      {!profileUrl && !error && <p className="text-sm text-stone-500">Preparing your card…</p>}
    </>
  );
}

export default function MemberPortal() {
  const { user, loading, error } = useAuth();
  useEffect(() => { updateSeo({ title: "Learning Portal | DevQueens", description: "Your private DevQueens learning space.", noIndex: true }); }, []);
  if (loading) return <PageLoader label="Opening your learning space" />;
  if (error) return <div className="grid min-h-screen place-items-center p-5"><div className="max-w-md rounded-xl border border-red-100 bg-white p-6 text-center"><h1 className="font-display text-xl font-bold">Learning service unavailable</h1><p role="alert" className="mt-2 text-sm text-stone-500">{error}</p><button onClick={() => window.location.reload()} className="btn-brand mt-5">Try again</button></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/admin" replace />;
  return <PlatformShell><Routes>
    <Route index element={<LearningHome />} />
    <Route path="community" element={<CommunityPage />} />
    <Route path="analytics" element={<AnalyticsPage />} />
    <Route path="inbox" element={<MemberInboxPage />} />
    <Route path="courses" element={<CourseCatalog />} />
    <Route path="courses/:slug" element={<CourseWorkspace />} />
    <Route path="profile" element={<ProfilePage />} />
    <Route path="certificates" element={<CertificatePage />} />
    <Route path="card" element={<MembershipCardPage user={user} />} />
    <Route path="*" element={<EmptyState title="Page not found" message="That learning portal page could not be found." action={<Link to="/portal" className="btn-brand">Back to learning</Link>} />} />
  </Routes></PlatformShell>;
}
