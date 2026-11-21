import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import { Download, ExternalLink, ImageUp, Share2, ShieldCheck, Award, ArrowRight } from "lucide-react";
import QRCode from "qrcode";
import { api, apiUrl } from "@/lib/api";
import { useAuth, type SessionUser } from "@/contexts/AuthContext";
import { EmptyState, PageHeading, PlatformShell } from "@/components/platform/PlatformShell";
import MembershipCardFace, { membershipCardCircuitPaths } from "@/components/devqueens/MembershipCardFace";
import { CourseCatalog, CourseWorkspace, LearningHome } from "@/pages/CoursePages";
import { AnalyticsPage, CommunityPage } from "@/pages/SocialPages";
import { MemberInboxPage } from "@/pages/InboxPages";
import PageLoader from "@/components/devqueens/PageLoader";
import { updateSeo } from "@/lib/seo";
import { formatMembershipDate, type MembershipCardSettings } from "@/lib/membershipCard";

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
  const [settings, setSettings] = useState<MembershipCardSettings | null>(null);
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let active = true;
    api<{ profileUrl: string; cardSettings: MembershipCardSettings }>("/member-card")
      .then(async (result) => {
        const qrDataUrl = await QRCode.toDataURL(result.profileUrl, {
          errorCorrectionLevel: "M",
          margin: 2,
          width: 320,
          color: { dark: "#29213F", light: "#FFFFFF" },
        });
        if (active) {
          setProfileUrl(result.profileUrl);
          setSettings(result.cardSettings);
          setQr(qrDataUrl);
        }
      })
      .catch((cause) => {
        if (active) setError(cause instanceof Error ? cause.message : "The membership card could not be loaded.");
      });
    return () => { active = false; };
  }, []);

  const drawCard = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) throw new Error("The card canvas is unavailable.");
    if (!qr || !settings) throw new Error("The card is not ready to download yet.");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Your browser could not prepare the membership card image.");
    canvas.width = 2400;
    canvas.height = 1514;
    ctx.scale(2, 2);
    const roundRect = (x: number, y: number, width: number, height: number, radius: number) => {
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, radius);
    };
    const fitText = (value: string, maxWidth: number) => {
      let text = value;
      while (text.length > 1 && ctx.measureText(text).width > maxWidth) {
        text = `${text.slice(0, -2)}…`;
      }
      return text;
    };
    const drawInitials = (x: number, y: number, width: number, height: number, initials: string) => {
      ctx.fillStyle = settings.secondaryColor;
      ctx.fillRect(x, y, width, height);
      ctx.fillStyle = settings.highlightColor;
      ctx.font = "bold 64px Arial";
      ctx.textAlign = "center";
      ctx.fillText(initials, x + width / 2, y + height / 2 + 22);
      ctx.textAlign = "left";
    };
    const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Card image could not be loaded."));
      image.src = src;
    });
    const drawImageContain = (image: HTMLImageElement, x: number, y: number, width: number, height: number) => {
      const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
      const drawWidth = image.naturalWidth * scale;
      const drawHeight = image.naturalHeight * scale;
      ctx.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
    };
    const drawImageCover = (image: HTMLImageElement, x: number, y: number, width: number, height: number) => {
      const targetRatio = width / height;
      const imageRatio = image.naturalWidth / image.naturalHeight;
      const sourceWidth = imageRatio > targetRatio ? image.naturalHeight * targetRatio : image.naturalWidth;
      const sourceHeight = imageRatio > targetRatio ? image.naturalHeight : image.naturalWidth / targetRatio;
      const sourceX = (image.naturalWidth - sourceWidth) / 2;
      const sourceY = (image.naturalHeight - sourceHeight) / 2;
      ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
    };

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(0, 0, 1200, 757, 45);
    ctx.clip();
    ctx.fillStyle = settings.backgroundColor;
    ctx.fillRect(0, 0, 1200, 757);
    ctx.fillStyle = settings.accentColor;
    ctx.fillRect(0, 0, 10, 757);

    ctx.save();
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = settings.accentColor;
    ctx.globalAlpha = 0.2;
    for (const points of membershipCardCircuitPaths) {
      ctx.beginPath();
      points.forEach(([x, y], index) => index === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
      ctx.stroke();
    }
    ctx.fillStyle = settings.highlightColor;
    ctx.globalAlpha = 0.38;
    for (const points of membershipCardCircuitPaths) {
      for (const [x, y] of points.slice(1, -1)) {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    const drawLogoFallback = () => {
      ctx.beginPath();
      ctx.arc(92, 63, 28, 0, Math.PI * 2);
      ctx.fillStyle = settings.secondaryColor;
      ctx.fill();
      ctx.strokeStyle = settings.accentColor;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = settings.highlightColor;
      ctx.font = "bold 20px Arial";
      ctx.textAlign = "center";
      ctx.fillText("DQ", 92, 70);
      ctx.textAlign = "left";
    };

    const drawLogoImage = async (image: HTMLImageElement) => {
      ctx.beginPath();
      ctx.arc(92, 63, 28, 0, Math.PI * 2);
      ctx.fillStyle = settings.secondaryColor;
      ctx.fill();
      ctx.strokeStyle = settings.accentColor;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.save();
      ctx.beginPath();
      ctx.arc(92, 63, 24, 0, Math.PI * 2);
      ctx.clip();
      drawImageContain(image, 68, 39, 48, 48);
      ctx.restore();
    };

    if (settings.logoUrl) {
      try {
        await drawLogoImage(await loadImage(settings.logoUrl));
      } catch {
        drawLogoFallback();
      }
    } else {
      drawLogoFallback();
    }

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 34px Arial";
    ctx.fillText(fitText(settings.organizationName, 700), 136, 66);
    ctx.fillStyle = settings.accentColor;
    ctx.font = "17px Arial";
    ctx.fillText(fitText(settings.brandSubtitle, 700), 136, 94);

    roundRect(924, 45, 212, 42, 21);
    ctx.fillStyle = settings.secondaryColor;
    ctx.fill();
    ctx.strokeStyle = settings.accentColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = user.status === "active" ? settings.highlightColor : settings.accentColor;
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    const statusText = user.status === "active" ? "ACTIVE MEMBER" : user.status === "suspended" ? "SUSPENDED MEMBER" : "STATUS UNAVAILABLE";
    ctx.fillText(fitText(statusText, 188), 1030, 72);
    ctx.textAlign = "left";

    ctx.fillStyle = settings.highlightColor;
    ctx.font = "bold 23px Arial";
    ctx.fillText(fitText(settings.slogan, 1060), 64, 150);
    ctx.fillStyle = settings.accentColor;
    ctx.font = "17px Arial";
    ctx.fillText(fitText(settings.supportingDescription, 1060), 64, 178);

    roundRect(64, 220, 150, 150, 28);
    ctx.save();
    ctx.clip();
    if (user.profile?.photoUrl) {
      try {
        drawImageCover(await loadImage(user.profile.photoUrl), 64, 220, 150, 150);
      } catch {
        drawInitials(64, 220, 150, 150, user.name.trim().slice(0, 1).toUpperCase());
      }
    } else {
      drawInitials(64, 220, 150, 150, user.name.trim().slice(0, 1).toUpperCase());
    }
    ctx.restore();
    ctx.fillStyle = settings.accentColor;
    ctx.font = "bold 15px Arial";
    ctx.fillText(fitText(settings.memberCategoryLabel.toUpperCase(), 620), 252, 240);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 43px Arial";
    ctx.fillText(fitText(user.name, 620), 252, 292);
    const role = user.profile?.bio?.trim()
      || user.profile?.interests?.slice(0, 3).join(" · ")
      || settings.defaultMemberRole;
    ctx.fillStyle = settings.accentColor;
    ctx.font = "20px Arial";
    ctx.fillText(fitText(role, 620), 252, 328);

    const qrImage = await loadImage(qr);
    roundRect(936, 214, 208, 208, 16);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.drawImage(qrImage, 952, 230, 176, 176);
    ctx.fillStyle = settings.accentColor;
    ctx.font = "bold 13px Arial";
    ctx.textAlign = "center";
    ctx.fillText(fitText(settings.qrCaption, 210), 1040, 446);
    ctx.textAlign = "left";

    ctx.strokeStyle = settings.secondaryColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(64, 500);
    ctx.lineTo(1136, 500);
    ctx.stroke();
    ctx.fillStyle = settings.accentColor;
    ctx.font = "bold 13px Arial";
    ctx.fillText("MEMBER ID", 64, 550);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 23px monospace";
    ctx.fillText(fitText(user.memberId ?? "Unavailable", 280), 64, 584);
    ctx.fillStyle = settings.accentColor;
    ctx.font = "bold 13px Arial";
    ctx.fillText("MEMBER SINCE", 390, 550);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "20px Arial";
    ctx.fillText(formatMembershipDate(user.joinedAt), 390, 584);
    ctx.fillStyle = settings.accentColor;
    ctx.font = "15px Arial";
    ctx.textAlign = "right";
    ctx.fillText(fitText(settings.footerMessage, 360), 1136, 584);
    ctx.textAlign = "left";
    ctx.restore();
  }, [qr, settings, user]);

  useEffect(() => {
    if (qr && settings) void drawCard().catch((cause) => setError(cause instanceof Error ? cause.message : "Card preview could not be prepared."));
  }, [qr, settings, drawCard]);

  const downloadPng = async () => {
    setError("");
    try {
      await drawCard();
      const canvas = canvasRef.current;
      if (!canvas) throw new Error("The card canvas is unavailable.");
      const anchor = document.createElement("a");
      anchor.download = `devqueens-${user.memberId ?? "member"}-membership.png`;
      anchor.href = canvas.toDataURL("image/png");
      anchor.click();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The membership card image could not be downloaded.");
    }
  };

  const share = async () => {
    const shareData = { title: `${user.name} · DevQueens`, text: "Connect with me on DevQueens.", url: profileUrl };
    if (navigator.share) await navigator.share(shareData);
    else if (navigator.clipboard) { await navigator.clipboard.writeText(profileUrl); setError("Profile link copied to clipboard."); }
  };

  return (
    <>
      <PageHeading eyebrow="Your digital identity" title="Membership card" description="A shareable identity card for your DevQueens community membership." />
      {error && <p role="alert" className="notice-error mb-4">{error}</p>}
      {profileUrl && settings ? <div id="membership-card-print" className="max-w-3xl rounded-2xl border border-orange-100 bg-white p-3 sm:p-4 md:p-6">
        <MembershipCardFace member={user} settings={settings} qrDataUrl={qr} />
        <canvas ref={canvasRef} className="hidden" />
        <div id="membership-card-actions" className="mt-5 flex flex-wrap gap-2">
          <button disabled={!qr} onClick={() => void downloadPng()} className="btn-brand disabled:opacity-60"><Download size={15} /> Download card PNG</button>
          <button onClick={() => window.print()} className="btn-outline-brand">Print / save card-size PDF</button>
          <button onClick={() => void share()} className="btn-outline-brand"><Share2 size={15} /> Share</button>
          <a target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent(`Connect with me on DevQueens: ${profileUrl}`)}`} className="btn-outline-brand">WhatsApp</a>
          <a target="_blank" rel="noreferrer" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`} className="btn-outline-brand">LinkedIn</a>
        </div>
        <p className="mt-3 text-xs text-stone-400">{profileUrl} · Print / save PDF is formatted to standard CR80 ID-card size (85.6 x 54 mm). For physical printing, use Actual size / 100% scale. The PNG is a high-resolution digital copy.</p>
      </div> : null}
      {!profileUrl && !error && <p role="status" className="text-sm text-stone-500">Preparing your card…</p>}
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
