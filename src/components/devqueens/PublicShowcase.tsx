import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, BadgeCheck, BookOpenCheck, Images, Quote, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { FadeInView } from "./TextReveal";
import MemberCardVerification from "./MemberCardVerification";

type PublicEntry = {
  _id: string;
  data: {
    title?: string;
    name?: string;
    description?: string;
    bio?: string;
    photoUrl?: string;
    imageUrl?: string;
    role?: string;
    category?: string;
    certificateUrl?: string;
    altText?: string;
    url?: string;
    quote?: string;
    memberId?: string;
    badges?: string[];
  };
};

type ShowcaseData = {
  alumni: PublicEntry[];
  achiever: PublicEntry[];
  gallery: PublicEntry[];
  testimonial: PublicEntry[];
};

const emptyShowcase: ShowcaseData = { alumni: [], achiever: [], gallery: [], testimonial: [] };

export default function PublicShowcase() {
  const [content, setContent] = useState<ShowcaseData>(emptyShowcase);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const kinds = ["alumni", "achiever", "gallery", "testimonial"] as const;
    Promise.all(kinds.map(async (kind) => [kind, (await api<{ items: PublicEntry[] }>(`/content/${kind}`)).items] as const))
      .then((entries) => { if (active) setContent(Object.fromEntries(entries) as ShowcaseData); })
      .catch((cause: unknown) => {
        console.error("Could not load published DevQueens member stories:", cause);
        if (active) setError(cause instanceof Error ? cause.message : "Member stories could not be loaded.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const stories = [
    ...content.achiever.map((entry) => ({ entry, label: entry.data.category ?? "Learning milestone", icon: BookOpenCheck })),
    ...content.alumni.map((entry) => ({ entry, label: entry.data.role ?? "DevQueens alumna", icon: Sparkles })),
  ];

  return (
    <>
      <section id="stories" className="overflow-hidden bg-white py-20 sm:py-28">
        <div className="section-container">
          <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-end">
            <FadeInView>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[.18em] text-[#e5684f]">Made possible by learning</p>
              <h2 className="max-w-xl font-display text-4xl font-bold leading-[1.04] tracking-[-.045em] text-[#28213f] sm:text-5xl">Real stories. Real learning journeys.</h2>
            </FadeInView>
            <FadeInView delay={0.08}>
              <p className="max-w-xl text-sm leading-7 text-[#77717d]">
                A look at the people, progress, and projects in our community. Member stories and achievements are shared by DevQueens administrators—with certificate and member-card verification available when a learner chooses to make their profile public.
              </p>
            </FadeInView>
          </div>

          {error && <p role="status" className="mt-8 rounded-xl border border-[#efd3ca] bg-[#fff8f5] px-5 py-4 text-sm text-[#9b493e]">Published stories could not be loaded right now. Member-card verification is still available below.</p>}

          {!error && loading ? (
            <p role="status" className="mt-10 text-sm text-[#77717d]">Loading community stories…</p>
          ) : !error && stories.length === 0 ? (
            <div className="mt-10 grid gap-5 rounded-[1.75rem] border border-dashed border-[#d9cdbf] bg-[#fbf9f5] px-6 py-8 sm:grid-cols-[auto_1fr] sm:items-center sm:px-9">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#eee8f5] text-[#51447e]"><Sparkles size={24} /></div>
              <div>
                <h3 className="font-display text-lg font-bold text-[#34295d]">Learner stories are on their way</h3>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-[#77717d]">When learners complete training and share their journeys, DevQueens administrators can publish their stories and achievements here. We only feature real community contributions.</p>
              </div>
            </div>
          ) : stories.length > 0 ? (
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {stories.slice(0, 4).map(({ entry, label, icon: Icon }, index) => {
                const title = entry.data.title ?? entry.data.name ?? "DevQueens member story";
                const description = entry.data.bio ?? entry.data.description;
                return (
                  <FadeInView key={entry._id} delay={index * 0.06}>
                    <article className={`group h-full overflow-hidden rounded-[1.5rem] border border-[#eee8e0] bg-[#fbf9f5] ${index === 0 ? "md:row-span-2" : ""}`}>
                      {entry.data.imageUrl || entry.data.photoUrl ? (
                        <img src={entry.data.imageUrl ?? entry.data.photoUrl} alt={entry.data.altText ?? `${title}, a DevQueens community story`} loading="lazy" onError={(event) => { event.currentTarget.hidden = true; }} className={`w-full object-cover transition duration-500 group-hover:scale-[1.015] ${index === 0 ? "aspect-[1.55/1] md:aspect-[1.35/1]" : "aspect-[2.1/1]"}`} />
                      ) : (
                        <div className={`relative flex items-center justify-between overflow-hidden bg-[#eee8f5] p-6 ${index === 0 ? "min-h-44 sm:min-h-56" : "min-h-36"}`}>
                          <span className="relative z-10 rounded-full bg-white/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.12em] text-[#51447e]">DevQueens · {label}</span>
                          <div aria-hidden="true" className="absolute -right-7 -top-14 h-44 w-44 rounded-full border-[28px] border-white/55" />
                          <Icon size={28} className="relative z-10 text-[#51447e]" />
                        </div>
                      )}
                      <div className="p-5 sm:p-6">
                        <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#e5684f]">{label}</p>
                        <h3 className="mt-2 font-display text-xl font-bold tracking-tight text-[#34295d]">{title}</h3>
                        {description && <p className="mt-2 text-sm leading-6 text-[#77717d]">{description}</p>}
                        {entry.data.quote && <blockquote className="mt-4 flex gap-2 text-sm italic leading-6 text-[#625e6b]"><Quote size={15} className="mt-1 shrink-0 text-[#9b8cb9]" />{entry.data.quote}</blockquote>}
                        {entry.data.badges?.length ? <div className="mt-4 flex flex-wrap gap-1.5">{entry.data.badges.map((badge) => <span key={badge} className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-[#51447e]">{badge}</span>)}</div> : null}
                        {(entry.data.memberId || entry.data.certificateUrl || entry.data.url) && (
                          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-[#e8dfd5] pt-4">
                            {entry.data.memberId && <Link to={`/members/${encodeURIComponent(entry.data.memberId)}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#51447e]">Member card & achievements <BadgeCheck size={14} /></Link>}
                            {entry.data.certificateUrl && <a href={entry.data.certificateUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-[#e5684f]">View certificate <ArrowUpRight size={13} /></a>}
                            {entry.data.url && <a href={entry.data.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-[#716a78]">Read more <ArrowUpRight size={13} /></a>}
                          </div>
                        )}
                      </div>
                    </article>
                  </FadeInView>
                );
              })}
            </div>
          ) : null}

          {content.gallery.length > 0 && (
            <div className="mt-14">
              <div className="mb-6 flex items-end justify-between gap-4">
                <div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#e5684f]">From the community</p><h3 className="mt-2 font-display text-2xl font-bold text-[#34295d]">A few moments along the way</h3></div>
                <Images size={20} className="mb-1 text-[#9b8cb9]" />
              </div>
              <div className="grid auto-rows-[145px] grid-cols-2 gap-3 sm:auto-rows-[190px] sm:grid-cols-4">
                {content.gallery.slice(0, 4).map((entry, index) => (
                  <article key={entry._id} className={`group relative overflow-hidden rounded-2xl bg-[#eee8f5] ${index === 0 ? "col-span-2 row-span-2" : index === 3 ? "col-span-2 sm:col-span-1" : ""}`}>
                    {entry.data.imageUrl ? <img src={entry.data.imageUrl} alt={entry.data.altText ?? entry.data.title ?? "DevQueens community moment"} loading="lazy" onError={(event) => { event.currentTarget.hidden = true; }} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="grid h-full place-items-center text-[#51447e]"><Images size={25} /></div>}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#211a36]/80 to-transparent px-4 pb-4 pt-12 text-white">
                      <p className="font-display text-sm font-bold">{entry.data.title ?? "Community moment"}</p>
                      {entry.data.description && <p className="mt-1 line-clamp-2 text-xs text-white/75">{entry.data.description}</p>}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {content.testimonial.length > 0 && (
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {content.testimonial.slice(0, 2).map((entry) => (
                <article key={entry._id} className="rounded-2xl bg-[#f7f3fa] p-6 sm:p-8">
                  <Quote size={20} className="text-[#8b7dab]" />
                  <blockquote className="mt-4 font-display text-lg font-medium leading-7 text-[#34295d]">{entry.data.quote ?? entry.data.description}</blockquote>
                  <p className="mt-5 text-xs font-semibold text-[#716a78]">{entry.data.name}{entry.data.role ? ` · ${entry.data.role}` : ""}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
      <MemberCardVerification />
    </>
  );
}
