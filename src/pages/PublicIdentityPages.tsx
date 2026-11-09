/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Award, BadgeCheck, ExternalLink, ShieldCheck, Users, Heart, MessageCircle, Share2 } from "lucide-react";
import DevQueensLogo from "@/components/devqueens/DevQueensLogo";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { updateSeo } from "@/lib/seo";

export function PublicMemberPage() {
  const { memberId = "" } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [following, setFollowing] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!profile) return;
    const description = profile.profile?.bio || `Explore ${profile.name}'s public DevQueens profile, technology interests, community work, and verified learning achievements.`;
    updateSeo({ title: `${profile.name} | DevQueens Member`, description: description.slice(0, 155), path: `/members/${encodeURIComponent(memberId)}` });
  }, [memberId, profile]);
  useEffect(() => {
    api<{ profile: any; certificates: any[] }>(`/profiles/${memberId}`)
      .then((result) => { setProfile(result.profile); setCertificates(result.certificates); })
      .catch((cause) => setError(cause.message));
  }, [memberId]);
  useEffect(() => {
    if (!user || user.memberId === memberId) return;
    api<{ memberIds: string[] }>("/social/following")
      .then((result) => setFollowing(result.memberIds.includes(memberId)))
      .catch(() => setFollowing(false));
  }, [memberId, user]);
  const followMember = async () => {
    if (!user) { window.location.assign("/login"); return; }
    try {
      await api(`/social/members/${memberId}/follow`, { method: following ? "DELETE" : "POST" });
      setFollowing(!following);
      setProfile((current: any) => current ? { ...current, followers: current.followers + (following ? -1 : 1) } : current);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update your follow.");
    }
  };
  const shareProfile = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: `${profile.name} on DevQueens`, url });
      else { await navigator.clipboard.writeText(url); window.alert("Profile link copied."); }
    } catch (cause) {
      if (cause instanceof Error && cause.name !== "AbortError") setError("Could not share this profile.");
    }
  };
  return <main className="min-h-screen bg-[#fffaf5]">
    <header className="border-b border-orange-100 bg-white"><div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5"><Link to="/" className="flex items-center gap-2"><DevQueensLogo variant="navbar" /><span className="font-display font-bold">DevQueens</span></Link><span className="text-xs font-medium text-stone-500">An initiative by IshConnect</span></div></header>
    <div className="mx-auto max-w-3xl px-5 py-12 md:py-16">
      {error ? <div className="rounded-2xl border border-orange-100 bg-white p-8 text-center"><h1 className="font-display text-2xl font-bold">Profile unavailable</h1><p className="mt-2 text-sm text-stone-500">{error}</p><Link to="/" className="btn-outline-brand mt-5">Back to DevQueens</Link></div> : !profile ? <p className="text-sm text-stone-500">Loading member profile…</p> : <>
        <div className="rounded-2xl border border-orange-100 bg-white p-7 md:p-9">
          <div className="flex flex-wrap items-center gap-5">
            {profile.profile?.photoUrl ? <img src={profile.profile.photoUrl} alt={profile.name} className="h-24 w-24 rounded-full object-cover" /> : <div className="grid h-24 w-24 place-items-center rounded-full bg-orange-100 font-display text-3xl font-bold text-orange-800">{profile.name.slice(0, 1)}</div>}
            <div className="min-w-[220px] flex-1"><p className="text-xs font-bold uppercase tracking-widest text-orange-700">DevQueens member</p><h1 className="mt-2 font-display text-3xl font-bold">{profile.name}</h1><p className="mt-1 text-sm text-stone-500">{profile.profile?.country} {profile.profile?.country && "·"} Member since {new Date(profile.joinedAt).toLocaleDateString("en", { month: "long", year: "numeric" })}</p></div>
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800"><BadgeCheck size={14} /> Verified member</span>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-orange-100 pt-5">
            <span className="inline-flex items-center gap-1.5 text-sm text-stone-600"><Users size={16} /> <strong>{profile.followers ?? 0}</strong> followers</span>
            <span className="text-sm text-stone-400">{profile.following ?? 0} following</span>
            {user?.memberId !== memberId && <button type="button" onClick={() => void followMember()} className={following ? "btn-outline-brand" : "btn-brand"}>{following ? "Following" : "Follow"}</button>}
            <button type="button" onClick={() => void shareProfile()} className="btn-outline-brand"><Share2 size={15} /> Share profile</button>
          </div>
          {profile.profile?.bio && <p className="mt-7 max-w-2xl whitespace-pre-wrap text-sm leading-7 text-stone-700">{profile.profile.bio}</p>}
          {profile.profile?.interests?.length > 0 && <div className="mt-6"><p className="text-xs font-bold uppercase tracking-wider text-stone-400">Professional interests</p><div className="mt-3 flex flex-wrap gap-2">{profile.profile.interests.map((interest: string) => <span key={interest} className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-900">{interest}</span>)}</div></div>}
          <div className="mt-6 flex flex-wrap gap-4">{[["linkedin", "LinkedIn"], ["github", "GitHub"], ["portfolio", "Portfolio"]].filter(([key]) => profile.profile?.[key]).map(([key, label]) => <a key={key} href={profile.profile[key]} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-orange-700 hover:underline">{label}<ExternalLink size={13} /></a>)}</div>
        </div>
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-3"><h2 className="font-display text-xl font-bold">Community posts</h2><span className="text-xs text-stone-500">{profile.posts?.length ?? 0} shared</span></div>
          {profile.posts?.length ? <div className="space-y-4">{profile.posts.map((post: any) => <article key={post._id} className="rounded-2xl border border-orange-100 bg-white p-5">
            <p className="text-xs text-stone-400">{new Date(post.createdAt).toLocaleString()}</p>
            {post.text && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-stone-700">{post.text}</p>}
            {post.imageUrl && <img src={post.imageUrl} alt={`Image shared by ${profile.name}`} loading="lazy" className="mt-3 max-h-[34rem] w-full rounded-xl bg-orange-50 object-contain" />}
            <div className="mt-4 flex items-center gap-4 border-t border-orange-50 pt-3 text-xs text-stone-500"><span className="inline-flex items-center gap-1.5"><Heart size={15} /> {post.likesCount} likes</span><span className="inline-flex items-center gap-1.5"><MessageCircle size={15} /> {post.comments.length} comments</span></div>
            {post.comments.map((comment: any, index: number) => <p key={comment._id ?? index} className="mt-2 rounded-lg bg-[#fffaf5] px-3 py-2 text-sm"><strong className="mr-1 text-orange-800">{comment.authorId?.name}</strong>{comment.text}</p>)}
          </article>)}</div> : <div className="rounded-xl border border-orange-100 bg-white p-5 text-sm text-stone-500">No community posts have been shared yet.</div>}
        </section>
        <section className="mt-8"><div className="mb-4 flex items-center gap-2"><Award size={19} className="text-orange-700" /><h2 className="font-display text-xl font-bold">Verified achievements</h2></div>
          {certificates.length ? <div className="space-y-3">{certificates.map((certificate) => <article key={certificate._id} className="flex items-center gap-4 rounded-xl border border-orange-100 bg-white p-5"><div className="rounded-lg bg-orange-100 p-3 text-orange-800"><ShieldCheck size={20} /></div><div className="flex-1"><h3 className="font-semibold">{certificate.courseId?.title}</h3><p className="mt-1 text-xs text-stone-500">Completed {new Date(certificate.issuedAt).toLocaleDateString()} · {certificate.certificateId}</p></div><Link to={`/verify/${certificate.certificateId}`} className="text-xs font-semibold text-orange-700 hover:underline">Verify</Link></article>)}</div> : <div className="rounded-xl border border-orange-100 bg-white p-5 text-sm text-stone-500">No public certificates have been shared yet.</div>}
        </section>
      </>}
    </div>
  </main>;
}

export function CertificateVerificationPage() {
  const { certificateId = "" } = useParams();
  const [certificate, setCertificate] = useState<any>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    updateSeo({
      title: "Certificate Verification | DevQueens",
      description: "Verify a DevQueens learning certificate issued by IshConnect.",
      path: `/verify/${encodeURIComponent(certificateId)}`,
      noIndex: true,
    });
  }, [certificateId]);
  useEffect(() => {
    api<{ valid: boolean; certificate: any }>(`/certificates/verify/${certificateId}`)
      .then((result) => setCertificate(result.certificate))
      .catch((cause) => setError(cause.message));
  }, [certificateId]);
  return <main className="min-h-screen bg-[#fff7ed] px-5 py-12">
    <div className="mx-auto max-w-2xl rounded-2xl border border-orange-100 bg-white p-7 text-center shadow-[0_20px_70px_-45px_rgba(124,45,18,.3)] md:p-10">
      <Link to="/" className="mx-auto flex w-fit items-center gap-2"><DevQueensLogo variant="navbar" /><span className="font-display font-bold">DevQueens</span></Link>
      <div className={`mx-auto mt-8 grid h-14 w-14 place-items-center rounded-full ${certificate && !certificate.revokedAt ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{certificate && !certificate.revokedAt ? <ShieldCheck size={26} /> : <BadgeCheck size={26} />}</div>
      <p className="mt-5 text-xs font-bold uppercase tracking-[.16em] text-orange-700">IshConnect certificate verification</p>
      <h1 className="mt-2 font-display text-3xl font-bold">{error ? "Certificate not verified" : certificate ? certificate.revokedAt ? "Certificate revoked" : "Certificate verified" : "Checking certificate…"}</h1>
      {error && <p role="alert" className="mt-3 text-sm text-stone-500">{error}</p>}
      {certificate && <div className="mt-6 rounded-xl bg-[#fffaf5] p-5 text-left"><p className="text-xs uppercase tracking-wider text-stone-400">Recipient</p><p className="mt-1 font-semibold">{certificate.recipient}</p><p className="mt-4 text-xs uppercase tracking-wider text-stone-400">Course</p><p className="mt-1 font-semibold">{certificate.course}</p><p className="mt-4 text-xs uppercase tracking-wider text-stone-400">Certificate ID</p><p className="mt-1 font-mono text-sm">{certificate.certificateId}</p><p className="mt-4 text-xs uppercase tracking-wider text-stone-400">Date issued</p><p className="mt-1 text-sm">{new Date(certificate.issuedAt).toLocaleDateString("en", { dateStyle: "long" })}</p>{certificate.revokedAt && <p className="mt-4 text-sm font-semibold text-red-700">Revoked on {new Date(certificate.revokedAt).toLocaleDateString()}</p>}</div>}
      <Link to="/" className="btn-outline-brand mt-7"><ArrowLeft size={14} /> Back to DevQueens</Link>
    </div>
  </main>;
}
