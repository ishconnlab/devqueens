import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { ImagePlus, MessageCircle, Send, Megaphone, Users, Smile, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth, type SessionUser } from "@/contexts/AuthContext";
import { PageHeading } from "@/components/platform/PlatformShell";

type ChatPerson = { id?: string; _id?: string; name: string; role?: "member" | "admin"; memberId?: string; profile?: SessionUser["profile"]; email?: string };
type ChatMessage = {
  _id: string;
  text: string;
  imageUrl: string;
  broadcast?: boolean;
  senderId: ChatPerson;
  createdAt: string;
};
type ChatThread = {
  id: string;
  member: ChatPerson;
  lastMessageAt: string;
  lastMessageText: string;
};

const emojis = ["😊", "🎉", "💜", "👏", "✨", "❤️", "🙌", "🚀"];

function Avatar({ person }: { person?: ChatPerson }) {
  return person?.profile?.photoUrl
    ? <img src={person.profile.photoUrl} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
    : <div aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f7ddd3] font-bold text-[#51447e]">{person?.name?.slice(0, 1) ?? "D"}</div>;
}

function MessageList({ messages, currentUserId, emptyText }: { messages: ChatMessage[]; currentUserId?: string; emptyText: string }) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);
  if (!messages.length) return <div className="grid min-h-56 place-items-center px-5 text-center text-sm text-[#8a8290]">{emptyText}</div>;
  return <div className="space-y-4 p-4 sm:p-5">
    {messages.map((message) => {
      const mine = String(message.senderId?._id ?? message.senderId?.id) === currentUserId;
      return <div key={message._id} className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}>
        {!mine && <Avatar person={message.senderId} />}
        <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${mine ? "rounded-br-md bg-[#34295d] text-white" : "rounded-bl-md bg-[#f5f0f9] text-[#34295d]"}`}>
          {!mine && <p className="mb-1 text-[11px] font-bold text-[#e5684f]">{message.senderId?.name ?? "DevQueens admin"}</p>}
          {message.text && <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.text}</p>}
          {message.imageUrl && <a href={message.imageUrl} target="_blank" rel="noreferrer"><img src={message.imageUrl} alt="Image attachment" loading="lazy" className="mt-2 max-h-80 rounded-xl object-contain" /></a>}
          <p className={`mt-1 text-right text-[10px] ${mine ? "text-white/60" : "text-[#8a8290]"}`}>{new Date(message.createdAt).toLocaleString()}</p>
        </div>
        {mine && <Avatar person={message.senderId} />}
      </div>;
    })}
    <div ref={endRef} />
  </div>;
}

function ChatComposer({ onSend, placeholder = "Write a message…" }: { onSend: (text: string, image: File | null) => Promise<void>; placeholder?: string }) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!text.trim() && !image) { setError("Write a message or attach an image."); return; }
    setBusy(true); setError("");
    try {
      await onSend(text, image);
      setText(""); setImage(null); setShowEmojis(false);
      if (inputRef.current) inputRef.current.value = "";
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The message could not be sent.");
    } finally { setBusy(false); }
  };
  return <form onSubmit={submit} className="border-t border-[#eee8e0] bg-white p-3 sm:p-4">
    {image && <div className="mb-2 flex items-center justify-between rounded-lg bg-[#fbf9f5] px-3 py-2 text-xs text-[#625e6b]"><span className="truncate">{image.name}</span><button type="button" onClick={() => { setImage(null); if (inputRef.current) inputRef.current.value = ""; }} className="ml-3 font-semibold text-[#51447e]">Remove</button></div>}
    {showEmojis && <div className="mb-2 flex flex-wrap gap-1 rounded-xl bg-[#fbf9f5] p-2" aria-label="Choose an emoji">{emojis.map((emoji) => <button key={emoji} type="button" onClick={() => setText((current) => `${current}${emoji}`)} className="rounded-lg p-2 text-xl hover:bg-white" aria-label={`Add ${emoji}`}>{emoji}</button>)}</div>}
    <label htmlFor="chat-message" className="sr-only">Message</label>
    <textarea id="chat-message" value={text} onChange={(event) => setText(event.target.value)} maxLength={2000} rows={2} placeholder={placeholder} className="form-input min-h-16 w-full resize-y" />
    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-1">
        <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          if (file && (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024)) { setError("Choose an image smaller than 5 MB."); event.target.value = ""; return; }
          setError(""); setImage(file);
        }} />
        <button type="button" onClick={() => inputRef.current?.click()} aria-label="Attach image" className="rounded-lg p-2 text-[#51447e] hover:bg-[#eee8f5]"><ImagePlus size={18} /></button>
        <button type="button" onClick={() => setShowEmojis((visible) => !visible)} aria-label="Choose emoji" aria-expanded={showEmojis} className="rounded-lg p-2 text-[#51447e] hover:bg-[#eee8f5]"><Smile size={18} /></button>
        <span className="ml-1 text-[10px] text-[#96909a]">Images up to 5 MB</span>
      </div>
      <button type="submit" disabled={busy} className="btn-brand min-h-10 disabled:opacity-60">{busy ? "Sending…" : "Send"} <Send size={14} /></button>
    </div>
    {error && <p role="alert" className="mt-2 text-xs text-red-700">{error}</p>}
  </form>;
}

async function sendForm(path: string, text: string, image: File | null) {
  const body = new FormData();
  body.append("text", text);
  if (image) body.append("image", image);
  await api(path, { method: "POST", body });
}

export function MemberInboxPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [broadcasts, setBroadcasts] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    const result = await api<{ messages: ChatMessage[]; broadcasts: ChatMessage[] }>("/messages/inbox");
    setMessages(result.messages); setBroadcasts(result.broadcasts);
  }, []);
  useEffect(() => {
    let active = true;
    const load = async () => {
      try { await refresh(); if (active) setError(""); }
      catch (cause) { if (active) setError(cause instanceof Error ? cause.message : "Your inbox could not be loaded."); }
      finally { if (active) setLoading(false); }
    };
    void load();
    const timer = window.setInterval(() => { void load(); }, 2500);
    return () => { active = false; window.clearInterval(timer); };
  }, [refresh]);

  const send = async (text: string, image: File | null) => {
    await sendForm("/messages/admin", text, image);
    await refresh();
  };

  return <>
    <PageHeading eyebrow="Messages" title="Your inbox" description="Message the DevQueens team, get help, and see updates from the administrators." />
    {error && <p role="alert" className="notice-error mb-4">{error}</p>}
    <div className="grid overflow-hidden rounded-2xl border border-[#e8dfd5] bg-white shadow-sm lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="flex min-h-[65vh] flex-col border-b border-[#e8dfd5] lg:border-b-0 lg:border-r">
        <header className="flex items-center gap-3 border-b border-[#eee8e0] p-4"><div className="grid h-10 w-10 place-items-center rounded-full bg-[#eee8f5] text-[#51447e]"><MessageCircle size={19} /></div><div><h2 className="font-semibold text-[#34295d]">DevQueens team</h2><p className="text-xs text-[#8a8290]">Replies appear here automatically</p></div></header>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading ? <p className="p-8 text-center text-sm text-[#77717d]">Loading messages…</p> : <MessageList messages={messages} currentUserId={user?.id} emptyText="Start a conversation with the DevQueens team. A team member will reply in this inbox." />}
        </div>
        <ChatComposer onSend={send} placeholder="Ask a question or share an update…" />
      </section>
      <aside className="bg-[#fbf9f5] p-4 sm:p-5">
        <div className="flex items-center gap-2"><Megaphone size={18} className="text-[#e5684f]" /><h2 className="font-display text-lg font-bold text-[#34295d]">Team updates</h2></div>
        <p className="mt-1 text-xs leading-5 text-[#8a8290]">Announcements shared with all members.</p>
        <div className="mt-4 max-h-[58vh] space-y-3 overflow-y-auto">
          {broadcasts.length ? broadcasts.map((message) => <article key={message._id} className="rounded-xl border border-[#e8dfd5] bg-white p-3">
            <p className="text-[11px] font-semibold text-[#e5684f]">{message.senderId?.name ?? "DevQueens admin"}</p>
            {message.text && <p className="mt-1 whitespace-pre-wrap text-sm leading-5 text-[#514a53]">{message.text}</p>}
            {message.imageUrl && <img src={message.imageUrl} alt="Team update attachment" loading="lazy" className="mt-2 max-h-48 w-full rounded-lg object-contain" />}
            <p className="mt-2 text-[10px] text-[#96909a]">{new Date(message.createdAt).toLocaleString()}</p>
          </article>) : <p className="rounded-xl border border-dashed border-[#d6cce2] p-4 text-sm text-[#8a8290]">No team updates yet.</p>}
        </div>
        <p className="mt-4 flex items-center gap-2 text-xs text-[#8a8290]"><Users size={14} /> Your messages are private to you and the admin team.</p>
      </aside>
    </div>
  </>;
}

export function AdminInboxPage() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [broadcasts, setBroadcasts] = useState<ChatMessage[]>([]);
  const [mode, setMode] = useState<"messages" | "broadcast">("messages");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshThreads = useCallback(async () => {
    const result = await api<{ threads: ChatThread[] }>("/admin/inbox");
    setThreads(result.threads);
    if (!selectedId && result.threads[0]) setSelectedId(result.threads[0].id);
  }, [selectedId]);

  const refreshSelected = useCallback(async () => {
    if (!selectedId || mode !== "messages") return;
    const result = await api<{ messages: ChatMessage[] }>(`/admin/inbox/${selectedId}`);
    setMessages(result.messages);
  }, [selectedId, mode]);

  const refreshBroadcasts = useCallback(async () => {
    const result = await api<{ messages: ChatMessage[] }>("/admin/inbox/broadcasts");
    setBroadcasts(result.messages);
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        await Promise.all([refreshThreads(), refreshBroadcasts()]);
        if (active) setError("");
      } catch (cause) { if (active) setError(cause instanceof Error ? cause.message : "Admin inbox could not be loaded."); }
      finally { if (active) setLoading(false); }
    };
    void load();
    const timer = window.setInterval(() => { void load(); }, 3000);
    return () => { active = false; window.clearInterval(timer); };
  }, [refreshThreads, refreshBroadcasts]);

  useEffect(() => {
    let active = true;
    if (!selectedId || mode !== "messages") { setMessages([]); return; }
    const load = async () => {
      try {
        const result = await api<{ messages: ChatMessage[] }>(`/admin/inbox/${selectedId}`);
        if (active) setMessages(result.messages);
      } catch (cause) { if (active) setError(cause instanceof Error ? cause.message : "Conversation could not be loaded."); }
    };
    void load();
    const timer = window.setInterval(() => { void load(); }, 2500);
    return () => { active = false; window.clearInterval(timer); };
  }, [selectedId, mode]);

  const send = async (text: string, image: File | null) => {
    if (mode === "broadcast") {
      await sendForm("/admin/inbox/broadcasts", text, image);
      await refreshBroadcasts();
    } else {
      if (!selectedId) throw new Error("Choose a member conversation first.");
      await sendForm(`/admin/inbox/${selectedId}/messages`, text, image);
      await refreshSelected();
      await refreshThreads();
    }
  };

  const selectedThread = threads.find((thread) => thread.id === selectedId);

  return <>
    <PageHeading eyebrow="Community support" title="Message inbox" description="Reply to member conversations or share an update with the whole community." />
    {error && <p role="alert" className="notice-error mb-4">{error}</p>}
    <div className="mb-4 flex flex-wrap gap-2">
      <button type="button" onClick={() => setMode("messages")} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${mode === "messages" ? "bg-[#34295d] text-white" : "border border-[#e8dfd5] bg-white text-[#51447e]"}`}><MessageCircle size={15} /> Member messages</button>
      <button type="button" onClick={() => setMode("broadcast")} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${mode === "broadcast" ? "bg-[#34295d] text-white" : "border border-[#e8dfd5] bg-white text-[#51447e]"}`}><Megaphone size={15} /> Message all members</button>
    </div>
    {mode === "broadcast" ? <section className="grid min-h-[60vh] overflow-hidden rounded-2xl border border-[#e8dfd5] bg-white shadow-sm lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex flex-col border-b border-[#e8dfd5] lg:border-b-0 lg:border-r">
        <header className="border-b border-[#eee8e0] p-4"><h2 className="font-semibold text-[#34295d]">Community-wide message</h2><p className="mt-1 text-xs text-[#8a8290]">This update is delivered to every member’s inbox.</p></header>
        <div className="flex-1 overflow-y-auto"><MessageList messages={broadcasts} emptyText="No community-wide messages yet." /></div>
        <ChatComposer onSend={send} placeholder="Write an update for all members…" />
      </div>
      <aside className="bg-[#fbf9f5] p-5"><div className="flex items-center gap-2 text-[#51447e]"><Users size={18} /><h3 className="font-semibold">All members</h3></div><p className="mt-2 text-sm leading-6 text-[#716a78]">Your message will be added to each member’s inbox. Members can reply to start a private conversation with the admin team.</p></aside>
    </section> : <section className="grid min-h-[60vh] overflow-hidden rounded-2xl border border-[#e8dfd5] bg-white shadow-sm md:grid-cols-[280px_minmax(0,1fr)]">
      <aside className={`${selectedId ? "hidden md:block" : "block"} border-b border-[#e8dfd5] md:border-b-0 md:border-r`}>
        <header className="border-b border-[#eee8e0] p-4"><h2 className="font-semibold text-[#34295d]">Conversations</h2><p className="mt-1 text-xs text-[#8a8290]">Members start a chat from their inbox.</p></header>
        <div className="max-h-[55vh] overflow-y-auto md:max-h-[65vh]">
          {loading ? <p className="p-4 text-sm text-[#8a8290]">Loading conversations…</p> : threads.map((thread) => <button type="button" key={thread.id} onClick={() => setSelectedId(thread.id)} className={`flex w-full items-center gap-3 border-b border-[#f0ebe5] p-3 text-left hover:bg-[#fbf9f5] ${selectedId === thread.id ? "bg-[#f5f0f9]" : ""}`}>
            <Avatar person={thread.member} />
            <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-[#34295d]">{thread.member.name}</span><span className="block truncate text-xs text-[#8a8290]">{thread.lastMessageText || "Conversation started"}</span></span>
            <span className="text-[10px] text-[#96909a]">{new Date(thread.lastMessageAt).toLocaleDateString()}</span>
          </button>)}
          {!loading && !threads.length && <p className="p-5 text-sm leading-6 text-[#8a8290]">Member conversations will appear here after a member sends the first message.</p>}
        </div>
      </aside>
      <div className={`${selectedId ? "flex" : "hidden md:flex"} min-w-0 flex-col`}>
        {selectedThread ? <>
          <header className="flex items-center gap-3 border-b border-[#eee8e0] p-4">
            <button type="button" className="rounded-lg p-2 text-[#51447e] hover:bg-[#eee8f5] md:hidden" onClick={() => setSelectedId("")} aria-label="Back to conversations"><ArrowLeft size={18} /></button>
            <Avatar person={selectedThread.member} />
            <div className="min-w-0"><h2 className="truncate font-semibold text-[#34295d]">{selectedThread.member.name}</h2><p className="text-xs text-[#8a8290]">{selectedThread.member.email}</p></div>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto"><MessageList messages={messages} emptyText="No messages in this conversation yet." /></div>
          <ChatComposer onSend={send} placeholder={`Reply to ${selectedThread.member.name}…`} />
        </> : <div className="grid flex-1 place-items-center p-8 text-center text-sm text-[#8a8290]">Choose a conversation to reply.</div>}
      </div>
    </section>}
  </>;
}
