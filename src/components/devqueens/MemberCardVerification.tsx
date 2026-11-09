import { useState, type FormEvent } from "react";
import { ArrowRight, BadgeCheck, Search, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import DevQueensLogo from "./DevQueensLogo";

type PublicProfile = {
  name: string;
  memberId: string;
  joinedAt: string;
};

type PublicCertificate = {
  _id: string;
  certificateId: string;
  issuedAt: string;
  courseId?: { title?: string };
};

function SampleMemberCard() {
  const qrPattern = [
    "1110101101",
    "1011100101",
    "1110101111",
    "0001010010",
    "1101110101",
    "0100101110",
    "1111010011",
    "1000111100",
    "1110101011",
    "1011110111",
  ];

  return (
    <figure className="mx-auto w-full max-w-[500px]">
      <div className="relative overflow-hidden rounded-[1.5rem] bg-[#28213f] p-5 text-white shadow-2xl shadow-[#34295d]/20 sm:p-7">
        <div aria-hidden="true" className="absolute -right-14 -top-20 h-56 w-56 rounded-full border-[34px] border-white/[.06]" />
        <div aria-hidden="true" className="absolute -bottom-28 left-[42%] h-56 w-56 rounded-full bg-[#51447e]/60 blur-2xl" />
        <div className="relative">
          <div className="flex items-center justify-between gap-3 border-b border-white/15 pb-4">
            <div className="flex items-center gap-2">
              <DevQueensLogo variant="footer" className="h-10 w-10 rounded-full object-cover" />
              <div>
                <p className="font-display text-sm font-bold tracking-wide">DEVQUEENS</p>
                <p className="mt-0.5 text-[9px] uppercase tracking-[.13em] text-white/55">An initiative by IshConnect</p>
              </div>
            </div>
            <span className="rounded-full border border-[#f4c744]/40 bg-[#f4c744]/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.13em] text-[#f4c744]">Sample card</span>
          </div>

          <div className="mt-5 grid grid-cols-[1fr_auto] items-center gap-3 sm:gap-5">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <svg
                viewBox="0 0 80 80"
                role="img"
                aria-label="Cute illustrated avatar for sample member Amanda"
                className="h-14 w-14 shrink-0 rounded-2xl sm:h-[4.5rem] sm:w-[4.5rem]"
              >
                <rect width="80" height="80" rx="20" fill="#F5B09A" />
                <path d="M13 78c2-13 12-21 27-21s25 8 27 21H13Z" fill="#51447E" />
                <path d="M25 35c0-16 7-25 19-25 14 0 22 10 22 25v15H25V35Z" fill="#34295D" />
                <path d="M29 36c0-12 5-18 15-18s15 6 15 18v12c0 11-7 18-15 18s-15-7-15-18V36Z" fill="#C77D69" />
                <path d="M27 37c2-12 8-20 18-20 7 0 12 3 16 9-6 2-11 0-15-2-3 6-10 10-19 13Z" fill="#34295D" />
                <path d="M34 41h3m12 0h3" stroke="#34295D" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M39 52c3 3 7 3 10 0" stroke="#8D4C43" strokeWidth="2" strokeLinecap="round" />
                <circle cx="27" cy="31" r="3" fill="#F4C744" />
                <circle cx="61" cy="34" r="3" fill="#F4C744" />
              </svg>
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-[.17em] text-white/50">Member</p>
                <p className="mt-1 truncate font-display text-xl font-bold tracking-tight sm:text-2xl">Amanda</p>
                <p className="mt-1 text-xs text-white/65">Technology learner</p>
              </div>
            </div>
            <div aria-hidden="true" className="relative grid h-[76px] w-[76px] grid-cols-10 grid-rows-10 gap-[2px] rounded-lg bg-white p-2 sm:h-[88px] sm:w-[88px]">
              {qrPattern.flatMap((row, rowIndex) => row.split("").map((cell, columnIndex) => (
                <span key={`${rowIndex}-${columnIndex}`} className={cell === "1" ? "rounded-[1px] bg-[#34295d]" : "bg-transparent"} />
              )))}
              <span className="absolute inset-x-1 top-1/2 -translate-y-1/2 bg-white/95 py-1 text-center font-mono text-[8px] font-bold tracking-[.12em] text-[#e5684f]">SAMPLE</span>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-white/15 pt-4">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[.15em] text-white/45">Member ID</p>
              <p className="mt-1 font-mono text-xs font-semibold tracking-[.1em] text-white/90">DQ-2026-XXXXXXXX</p>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#a9c5ad]/15 px-2.5 py-1.5 text-[9px] font-semibold text-[#c4e1c8]">
              <ShieldCheck size={12} /> Example only
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-xs leading-5 text-[#77717d]">Sample preview only. Amanda and this placeholder ID are not a real member record or scannable card.</figcaption>
    </figure>
  );
}

export default function MemberCardVerification() {
  const [memberId, setMemberId] = useState("");
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [certificates, setCertificates] = useState<PublicCertificate[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const verify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedId = memberId.trim().toUpperCase();
    if (!/^DQ-\d{4}-[A-F0-9]{8}$/.test(normalizedId)) {
      setProfile(null);
      setCertificates([]);
      setError("Enter a member ID in the format DQ-YYYY-XXXXXXXX.");
      return;
    }

    setBusy(true);
    setError("");
    setProfile(null);
    setCertificates([]);
    try {
      const result = await api<{ profile: PublicProfile; certificates: PublicCertificate[] }>(`/profiles/${encodeURIComponent(normalizedId)}`);
      setProfile(result.profile);
      setCertificates(result.certificates);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Member card could not be verified.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="verify-member" className="bg-[#f3ede5] py-16 sm:py-20">
      <div className="section-container">
        <div>
          <div className="mb-8 max-w-2xl">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[.18em] text-[#e5684f]">Member verification</p>
            <h2 className="font-display text-3xl font-bold leading-tight tracking-[-.04em] text-[#28213f] sm:text-4xl">Is this a DevQueens member card?</h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-[#77717d]">Enter the member ID shown on a DevQueens card. Only active members with a public profile can be verified here.</p>
          </div>

          <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.05fr] lg:gap-10">
            <SampleMemberCard />
            <div className="rounded-2xl border border-[#e8dfd5] bg-white p-5 shadow-sm sm:p-7">
            <form onSubmit={verify} className="flex flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="member-card-id">Member ID</label>
              <input
                id="member-card-id"
                value={memberId}
                onChange={(event) => setMemberId(event.target.value)}
                placeholder="DQ-2026-1A2B3C4D"
                autoComplete="off"
                maxLength={17}
                aria-describedby={error ? "member-card-error" : "member-card-hint"}
                className="min-h-12 min-w-0 flex-1 rounded-xl border border-[#e8dfd5] bg-[#fbf9f5] px-4 font-mono text-sm uppercase text-[#34295d] outline-none transition placeholder:font-sans placeholder:normal-case placeholder:text-[#aaa2ad] focus:border-[#8b7dab] focus:ring-2 focus:ring-[#8b7dab]/15"
              />
              <button type="submit" disabled={busy} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#34295d] px-5 text-sm font-semibold text-white transition hover:bg-[#493b7d] disabled:cursor-wait disabled:opacity-65">
                <Search size={16} /> {busy ? "Checking…" : "Verify card"}
              </button>
            </form>
            {!error && !profile && <p id="member-card-hint" className="mt-3 text-xs text-[#8a8290]">Member IDs look like DQ-2026-1A2B3C4D.</p>}
            {error && <p id="member-card-error" role="alert" className="mt-3 text-sm text-[#a1463c]">{error}</p>}
            {profile && (
              <div role="status" className="mt-5 rounded-xl border border-[#d7e8d8] bg-[#f4faf4] p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-[#398151]"><ShieldCheck size={22} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.13em] text-[#398151]"><BadgeCheck size={13} /> Verified active member</p>
                    <h3 className="mt-1 font-display text-lg font-bold text-[#34295d]">{profile.name}</h3>
                    <p className="mt-0.5 font-mono text-xs text-[#77717d]">{profile.memberId}</p>
                    <p className="mt-2 text-xs text-[#77717d]">Member since {new Date(profile.joinedAt).toLocaleDateString("en", { month: "long", year: "numeric" })}</p>
                    <Link to={`/members/${encodeURIComponent(profile.memberId)}`} className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#51447e]">View public member card <ArrowRight size={13} /></Link>
                  </div>
                </div>
                {certificates.length > 0 && <div className="mt-4 border-t border-[#d7e8d8] pt-3">
                  <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#687c6b]">Verified course completions</p>
                  <ul className="mt-2 space-y-2">
                    {certificates.map((certificate) => <li key={certificate._id} className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#514a53]">
                      <span>{certificate.courseId?.title ?? "Completed course"}</span>
                      <Link to={`/verify/${encodeURIComponent(certificate.certificateId)}`} className="font-semibold text-[#398151] underline underline-offset-2">Verify certificate</Link>
                    </li>)}
                  </ul>
                </div>}
                {certificates.length === 0 && <p className="mt-3 border-t border-[#d7e8d8] pt-3 text-xs text-[#687c6b]">No public course certificates are listed on this member profile yet.</p>}
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
