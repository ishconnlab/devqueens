import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { ImagePlus, MessageCircle, Heart, Users, Send, Trash2, ExternalLink, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { EmptyState, PageHeading } from "@/components/platform/PlatformShell";

type SocialPerson = {
  name: string;
  memberId: string;
  profile?: { photoUrl?: string; bio?: string; interests?: string[] };
};

type SocialComment = { _id?: string; text: string; createdAt: string; authorId: SocialPerson };
type SocialPost = {
  _id: string;
  text: string;
  imageUrl: string;
  createdAt: string;
  likesCount: number;
  liked: boolean;
  author: SocialPerson;
  comments: SocialComment[];
};

function Avatar({ person, className = "h-10 w-10" }: { person: SocialPerson; className?: string }) {
  return person.profile?.photoUrl
    ? <img src={person.profile.photoUrl} alt="" className={`${className} rounded-full object-cover`} />
    : <div aria-hidden="true" className={`${className} grid shrink-0 place-items-center rounded-full bg-[#f7ddd3] font-bold text-[#51447e]`}>{person.name.slice(0, 1)}</div>;
}

function SocialPostCard({ post, onRefresh }: { post: SocialPost; onRefresh: () => void }) {
  const { user } = useAuth();
  const [comment, setComment] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const toggleLike = async () => {
    setPending(true); setError("");
    try { await api(`/social/posts/${post._id}/like`, { method: "POST" }); onRefresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not update your like."); }
    finally { setPending(false); }
  };
  const submitComment = async (event: FormEvent) => {
    event.preventDefault();
    if (!comment.trim()) return;
    setPending(true); setError("");
    try { await api(`/social/posts/${post._id}/comments`, { method: "POST", body: { text: comment } }); setComment(""); onRefresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not add your comment."); }
    finally { setPending(false); }
  };
  const deletePost = async () => {
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    setPending(true); setError("");
    try { await api(`/social/posts/${post._id}`, { method: "DELETE" }); onRefresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not delete the post."); }
    finally { setPending(false); }
  };

  return <article className="rounded-2xl border border-[#e8dfd5] bg-white p-5 shadow-sm sm:p-6">
    <header className="flex items-center gap-3">
      <Link to={`/members/${post.author.memberId}`} aria-label={`View ${post.author.name}'s profile`}><Avatar person={post.author} /></Link>
      <div className="min-w-0 flex-1">
        <Link to={`/members/${post.author.memberId}`} className="font-semibold text-[#34295d] hover:underline">{post.author.name}</Link>
        <p className="text-xs text-[#8a8290]">{new Date(post.createdAt).toLocaleString()}</p>
      </div>
      {post.author.memberId === user?.memberId && <button type="button" disabled={pending} onClick={() => void deletePost()} aria-label="Delete post" className="rounded-lg p-2 text-[#8a8290] hover:bg-red-50 hover:text-red-700"><Trash2 size={16} /></button>}
    </header>
    {post.text && <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#514a53]">{post.text}</p>}
    {post.imageUrl && <img src={post.imageUrl} alt={`Image shared by ${post.author.name}`} loading="lazy" className="mt-4 max-h-[34rem] w-full rounded-xl bg-[#fbf7f1] object-contain" />}
    <div className="mt-4 flex items-center gap-4 border-b border-[#f0ebe5] pb-3 text-xs text-[#716a78]">
      <button type="button" disabled={pending} onClick={() => void toggleLike()} aria-pressed={post.liked} className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 ${post.liked ? "text-[#d94d56]" : "hover:bg-[#fbf7f1]"}`}><Heart size={16} fill={post.liked ? "currentColor" : "none"} /> {post.likesCount} {post.likesCount === 1 ? "like" : "likes"}</button>
      <span className="inline-flex items-center gap-1.5"><MessageCircle size={16} /> {post.comments.length} comments</span>
    </div>
    {post.comments.map((item, index) => <div key={item._id ?? `${item.createdAt}-${index}`} className="mt-3 flex items-start gap-2.5">
      <Avatar person={item.authorId} className="h-7 w-7 text-xs" />
      <p className="min-w-0 flex-1 rounded-xl bg-[#fbf9f5] px-3 py-2 text-sm"><strong className="mr-1 text-[#51447e]">{item.authorId.name}</strong>{item.text}</p>
    </div>)}
    <form onSubmit={submitComment} className="mt-4 flex gap-2">
      <label className="sr-only" htmlFor={`comment-${post._id}`}>Write a comment</label>
      <input id={`comment-${post._id}`} value={comment} onChange={(event) => setComment(event.target.value)} maxLength={500} placeholder="Write a supportive comment…" className="form-input min-w-0 flex-1" />
      <button type="submit" disabled={pending || !comment.trim()} aria-label="Send comment" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#34295d] text-white disabled:opacity-50"><Send size={16} /></button>
    </form>
    {error && <p role="alert" className="mt-3 text-xs text-red-700">{error}</p>}
  </article>;
}

export function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [members, setMembers] = useState<(SocialPerson & { followers: number })[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const imageInput = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    const [feed, directory, follows] = await Promise.all([
      api<{ posts: SocialPost[] }>("/social/feed"),
      api<{ members: (SocialPerson & { followers: number })[] }>("/social/members"),
      api<{ memberIds: string[] }>("/social/following"),
    ]);
    setPosts(feed.posts); setMembers(directory.members); setFollowing(follows.memberIds);
  }, []);

  useEffect(() => { void refresh().catch((cause) => setError(cause instanceof Error ? cause.message : "Community posts could not be loaded.")).finally(() => setLoading(false)); }, [refresh]);

  const publish = async (event: FormEvent) => {
    event.preventDefault();
    if (!text.trim() && !image) { setError("Write a message or choose an image."); return; }
    setPosting(true); setError("");
    const body = new FormData();
    body.append("text", text);
    if (image) body.append("image", image);
    try {
      await api("/social/posts", { method: "POST", body });
      setText(""); setImage(null); if (imageInput.current) imageInput.current.value = "";
      await refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Your post could not be published."); }
    finally { setPosting(false); }
  };

  const toggleFollow = async (memberId: string) => {
    const isFollowing = following.includes(memberId);
    setError("");
    try {
      await api(`/social/members/${memberId}/follow`, { method: isFollowing ? "DELETE" : "POST" });
      setFollowing((current) => isFollowing ? current.filter((id) => id !== memberId) : [...current, memberId]);
      await refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not update your follows."); }
  };

  return <>
    <PageHeading eyebrow="DevQueens community" title="Learn, build & belong" description="Share your progress, celebrate each other, and stay connected with women learning technology." />
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="space-y-5">
        <form onSubmit={publish} className="rounded-2xl border border-[#e8dfd5] bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            {user && <Avatar person={{ name: user.name, memberId: user.memberId ?? "", profile: user.profile }} />}
            <label htmlFor="community-post" className="sr-only">Share an update</label>
            <textarea id="community-post" value={text} onChange={(event) => setText(event.target.value)} maxLength={1000} placeholder="What are you learning or building?" className="form-input min-h-24 flex-1 resize-y" />
          </div>
          {image && <div className="mt-3 flex items-center justify-between rounded-lg bg-[#fbf9f5] px-3 py-2 text-xs text-[#625e6b]"><span className="truncate">{image.name}</span><button type="button" onClick={() => { setImage(null); if (imageInput.current) imageInput.current.value = ""; }} className="font-semibold text-[#51447e]">Remove</button></div>}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#f0ebe5] pt-4">
            <div>
              <input ref={imageInput} type="file" accept="image/*" className="sr-only" onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                if (file && (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024)) { setError("Choose an image smaller than 5 MB."); event.target.value = ""; return; }
                setError(""); setImage(file);
              }} />
              <button type="button" onClick={() => imageInput.current?.click()} className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-[#51447e] hover:bg-[#eee8f5]"><ImagePlus size={17} /> Add image</button>
              <span className="ml-1 text-[11px] text-[#96909a]">Up to 5 MB</span>
            </div>
            <button type="submit" disabled={posting} className="btn-brand">{posting ? "Sharing…" : "Share post"} <Send size={15} /></button>
          </div>
          {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
        </form>
        {loading ? <p className="py-8 text-center text-sm text-[#77717d]">Loading community…</p>
          : posts.length ? posts.map((post) => <SocialPostCard key={post._id} post={post} onRefresh={() => { void refresh().catch((cause) => setError(cause.message)); }} />)
            : <EmptyState title="Your community feed is ready" message="Follow a member to see their updates here, or share what you are learning to start a conversation." />}
      </section>
      <aside className="rounded-2xl border border-[#e8dfd5] bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#e5684f]">Discover</p><h2 className="mt-1 font-display text-xl font-bold text-[#34295d]">Members</h2></div>
          <Users size={20} className="text-[#51447e]" />
        </div>
        <div className="space-y-4">
          {members.filter((member) => member.memberId !== user?.memberId).map((member) => <div key={member.memberId} className="flex items-center gap-3">
            <Link to={`/members/${member.memberId}`}><Avatar person={member} className="h-10 w-10" /></Link>
            <div className="min-w-0 flex-1">
              <Link to={`/members/${member.memberId}`} className="block truncate text-sm font-semibold text-[#34295d] hover:underline">{member.name}</Link>
              <p className="text-[11px] text-[#8a8290]">{member.followers} followers</p>
            </div>
            <button type="button" onClick={() => void toggleFollow(member.memberId)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${following.includes(member.memberId) ? "border border-[#e8dfd5] text-[#51447e]" : "bg-[#34295d] text-white"}`}>
              {following.includes(member.memberId) ? "Following" : "Follow"}
            </button>
          </div>)}
          {!members.length && <p className="text-sm text-[#8a8290]">Public member profiles will appear here.</p>}
        </div>
        <Link to="/portal/analytics" className="mt-5 flex items-center justify-between rounded-xl bg-[#f5f0f9] p-3 text-sm font-semibold text-[#51447e] hover:bg-[#eee8f5]">Your community analytics <TrendingUp size={16} /></Link>
        <Link to="/portal/profile" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#8a8290] hover:text-[#51447e]">Manage public profile <ExternalLink size={12} /></Link>
      </aside>
    </div>
  </>;
}

type Analytics = { followers: number; following: number; newFollowersLast30Days: number; posts: number; likesReceived: number; commentsReceived: number };

export function AnalyticsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { api<{ analytics: Analytics }>("/social/analytics").then((result) => setData(result.analytics)).catch((cause) => setError(cause.message)); }, []);

  return <>
    <PageHeading eyebrow="Your community impact" title="Analytics" description="A snapshot of your profile and the conversations your posts are starting." action={user?.memberId ? <Link to={`/members/${user.memberId}`} className="btn-outline-brand">View public profile <ExternalLink size={14} /></Link> : undefined} />
    {error && <p role="alert" className="notice-error mb-5">{error}</p>}
    {!data && !error ? <p className="text-sm text-[#77717d]">Loading your analytics…</p> : data && <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[
          ["Followers", data.followers, `${data.newFollowersLast30Days} new in the last 30 days`, Users],
          ["Following", data.following, "Members in your community circle", Users],
          ["Posts", data.posts, "Updates you have shared", ImagePlus],
          ["Likes received", data.likesReceived, "Appreciation across your posts", Heart],
          ["Comments received", data.commentsReceived, "Community conversations", MessageCircle],
        ].map(([label, value, note, Icon]) => {
          const MetricIcon = Icon as typeof Users;
          return <article key={String(label)} className="rounded-2xl border border-[#e8dfd5] bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm font-semibold text-[#716a78]">{String(label)}</p><MetricIcon size={18} className="text-[#e5684f]" /></div><p className="mt-4 font-display text-4xl font-bold text-[#34295d]">{String(value)}</p><p className="mt-2 text-xs text-[#96909a]">{String(note)}</p></article>;
        })}
      </div>
      <section className="mt-6 rounded-2xl border border-[#e8dfd5] bg-white p-6">
        <h2 className="font-display text-xl font-bold text-[#34295d]">Keep growing your circle</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#716a78]">Share projects, learning milestones, and helpful resources. A complete public profile helps other DevQueens find and connect with you.</p>
        <Link to="/portal/community" className="btn-brand mt-4">Visit the community <Users size={15} /></Link>
      </section>
    </>}
  </>;
}
