import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import { Download, ExternalLink, ImageUp, Share2, ShieldCheck, Award, ArrowRight } from "lucide-react";
import QRCode from "qrcode";
import { api, apiUrl } from "@/lib/api";
import { useAuth, type SessionUser } from "@/contexts/AuthContext";
import { EmptyState, PageHeading, PlatformShell } from "@/components/platform/PlatformShell";
import DevQueensLogo from "@/components/devqueens/DevQueensLogo";
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
    canvas.width = 2400;
    canvas.height = 1514;
    ctx.scale(2, 2);
    const roundRect = (x: number, y: number, width: number, height: number, radius: number) => {
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, radius);
    };

    ctx.fillStyle = "#28213f";
    ctx.fillRect(0, 0, 1200, 757);
    const glow = ctx.createRadialGradient(940, 80, 5, 940, 80, 430);
    glow.addColorStop(0, "rgba(81, 68, 126, .72)");
    glow.addColorStop(1, "rgba(40, 33, 63, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(500, 0, 700, 500);
    ctx.strokeStyle = "rgba(255,255,255,.07)";
    ctx.lineWidth = 34;
    ctx.beginPath();
    ctx.arc(1080, 30, 190, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#f4c744";
    ctx.fillRect(0, 0, 14, 757);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px Arial";
    ctx.fillText("DEVQUEENS", 64, 76);
    ctx.fillStyle = "rgba(255,255,255,.58)";
    ctx.font = "16px Arial";
    ctx.fillText("AN INITIATIVE BY ISHCONNECT", 64, 105);
    roundRect(915, 48, 220, 42, 21);
    ctx.fillStyle = "rgba(244,199,68,.12)";
    ctx.fill();
    ctx.strokeStyle = "rgba(244,199,68,.5)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#f4c744";
    ctx.font = "bold 15px Arial";
    ctx.textAlign = "center";
    ctx.fillText("ACTIVE MEMBER", 1025, 75);
    ctx.textAlign = "left";

    roundRect(64, 165, 170, 170, 34);
    ctx.save();
    ctx.clip();
    const photo = user.profile?.photoUrl;
    if (photo) {
      try {
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.src = photo;
        await new Promise<void>((resolve, reject) => {
          image.onload = () => resolve();
          image.onerror = () => reject(new Error("Profile image could not be loaded."));
        });
        ctx.drawImage(image, 64, 165, 170, 170);
      } catch {
        ctx.fillStyle = "#51447e";
        ctx.fillRect(64, 165, 170, 170);
        ctx.fillStyle = "#f4c744";
        ctx.font = "bold 76px Arial";
        ctx.textAlign = "center";
        ctx.fillText(user.name.slice(0, 1).toUpperCase(), 149, 273);
        ctx.textAlign = "left";
      }
    } else {
      ctx.fillStyle = "#51447e";
      ctx.fillRect(64, 165, 170, 170);
      ctx.fillStyle = "#f4c744";
      ctx.font = "bold 76px Arial";
      ctx.textAlign = "center";
      ctx.fillText(user.name.slice(0, 1).toUpperCase(), 149, 273);
      ctx.textAlign = "left";
    }
    ctx.restore();
    ctx.strokeStyle = "rgba(255,255,255,.25)";
    ctx.lineWidth = 2;
    roundRect(64, 165, 170, 170, 34);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,.52)";
    ctx.font = "bold 16px Arial";
    ctx.fillText("DEVQUEENS MEMBER", 280, 203);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 46px Arial";
    const fittedName = user.name.length > 23 ? `${user.name.slice(0, 21)}…` : user.name;
    ctx.fillText(fittedName, 280, 263);
    ctx.fillStyle = "rgba(255,255,255,.7)";
    ctx.font = "23px Arial";
    const interests = user.profile?.interests?.slice(0, 3).join(" · ") || "Technology learner";
    ctx.fillText(interests.length > 48 ? `${interests.slice(0, 45)}…` : interests, 280, 305);

    ctx.strokeStyle = "rgba(255,255,255,.16)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(64, 390);
    ctx.lineTo(1136, 390);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,.5)";
    ctx.font = "bold 15px Arial";
    ctx.fillText("MEMBER ID", 64, 435);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 25px monospace";
    ctx.fillText(user.memberId ?? "", 64, 472);
    ctx.fillStyle = "rgba(255,255,255,.5)";
    ctx.font = "bold 15px Arial";
    ctx.fillText("MEMBER SINCE", 64, 530);
    ctx.fillStyle = "#ffffff";
    ctx.font = "22px Arial";
    ctx.fillText(user.joinedAt ? new Date(user.joinedAt).toLocaleDateString("en", { month: "long", year: "numeric" }) : "2026", 64, 567);

    const qrImage = new Image();
    qrImage.src = qr;
    await new Promise<void>((resolve, reject) => {
      qrImage.onload = () => resolve();
      qrImage.onerror = () => reject(new Error("Profile QR code could not be loaded."));
    });
    roundRect(906, 412, 230, 230, 18);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.drawImage(qrImage, 924, 430, 194, 194);
    ctx.fillStyle = "rgba(255,255,255,.62)";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText("SCAN TO VIEW PROFILE", 1021, 675);
    ctx.textAlign = "left";
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
      {profileUrl && <div id="membership-card-print" className="max-w-3xl rounded-2xl border border-orange-100 bg-white p-4 md:p-6">
        <div className="membership-card-face relative mx-auto flex aspect-[1.585/1] w-full flex-col justify-between overflow-hidden rounded-[1.15rem] border border-white/15 bg-[#28213f] p-3 text-white shadow-xl shadow-[#34295d]/20 sm:rounded-[1.5rem] sm:p-5 md:p-7">
          <div aria-hidden="true" className="absolute -right-14 -top-20 h-56 w-56 rounded-full border-[34px] border-white/[.06]" />
          <div aria-hidden="true" className="absolute -bottom-28 left-[42%] h-56 w-56 rounded-full bg-[#51447e]/60 blur-2xl" />
          <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5 bg-[#f4c744]" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-center justify-between gap-3 border-b border-white/15 pb-2 sm:pb-3">
              <div className="flex items-center gap-2">
                <DevQueensLogo variant="footer" className="h-7 w-7 rounded-full object-cover sm:h-9 sm:w-9" />
                <div>
                  <p className="font-display text-xs font-bold tracking-wide sm:text-sm">DEVQUEENS</p>
                  <p className="mt-0.5 text-[7px] uppercase tracking-[.13em] text-white/55 sm:text-[9px]">An initiative by IshConnect</p>
                </div>
              </div>
              <span className="rounded-full border border-[#f4c744]/40 bg-[#f4c744]/10 px-2 py-1 text-[7px] font-bold uppercase tracking-[.1em] text-[#f4c744] sm:px-2.5 sm:text-[9px] sm:tracking-[.13em]">Active member</span>
            </div>
            <div className="my-2 grid grid-cols-[1fr_auto] items-center gap-2 sm:my-3 sm:gap-5">
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                {user.profile?.photoUrl ? <img src={user.profile.photoUrl} alt={user.name} className="h-12 w-12 shrink-0 rounded-xl object-cover sm:h-16 sm:w-16 sm:rounded-2xl md:h-[4.5rem] md:w-[4.5rem]" /> : <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#51447e] font-display text-xl font-bold text-[#f4c744] sm:h-16 sm:w-16 sm:rounded-2xl sm:text-2xl md:h-[4.5rem] md:w-[4.5rem]">{user.name.slice(0, 1).toUpperCase()}</div>}
                <div className="min-w-0">
                  <p className="text-[7px] font-bold uppercase tracking-[.17em] text-white/50 sm:text-[9px]">DevQueens member</p>
                  <p className="mt-0.5 truncate font-display text-base font-bold tracking-tight sm:mt-1 sm:text-xl md:text-2xl">{user.name}</p>
                  <p className="mt-0.5 truncate text-[9px] text-white/65 sm:mt-1 sm:text-xs">{user.profile?.interests?.slice(0, 3).join(" · ") || "Technology learner"}</p>
                </div>
              </div>
              {qr && <div className="rounded-lg bg-white p-1 shadow-sm sm:rounded-xl sm:p-1.5"><img src={qr} alt="QR code linking to your public profile" className="h-12 w-12 sm:h-[68px] sm:w-[68px] md:h-[88px] md:w-[88px]" /></div>}
            </div>
            <div className="flex flex-wrap items-end justify-between gap-2 border-t border-white/15 pt-2 sm:gap-3 sm:pt-3">
              <div>
                <p className="text-[7px] font-bold uppercase tracking-[.15em] text-white/45 sm:text-[9px]">Member ID</p>
                <p className="mt-0.5 font-mono text-[9px] font-semibold tracking-[.1em] text-white/90 sm:mt-1 sm:text-xs">{user.memberId}</p>
              </div>
              <div className="text-right">
                <p className="text-[7px] font-bold uppercase tracking-[.15em] text-white/45 sm:text-[9px]">Member since</p>
                <p className="mt-0.5 text-[9px] font-semibold text-white/90 sm:mt-1 sm:text-xs">{user.joinedAt ? new Date(user.joinedAt).toLocaleDateString("en", { month: "long", year: "numeric" }) : "2026"}</p>
              </div>
            </div>
          </div>
        </div>
        <canvas ref={canvasRef} className="hidden" />
        <div id="membership-card-actions" className="mt-5 flex flex-wrap gap-2">
          <button onClick={() => void downloadPng()} className="btn-brand"><Download size={15} /> Download card PNG</button>
          <button onClick={() => window.print()} className="btn-outline-brand">Print / save card-size PDF</button>
          <button onClick={() => void share()} className="btn-outline-brand"><Share2 size={15} /> Share</button>
          <a target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent(`Connect with me on DevQueens: ${profileUrl}`)}`} className="btn-outline-brand">WhatsApp</a>
          <a target="_blank" rel="noreferrer" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`} className="btn-outline-brand">LinkedIn</a>
        </div>
        <p className="mt-3 text-xs text-stone-400">{profileUrl} · Print / save PDF is formatted to standard CR80 ID-card size (85.6 x 54 mm). For physical printing, use Actual size / 100% scale. The PNG is a high-resolution digital copy.</p>
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
