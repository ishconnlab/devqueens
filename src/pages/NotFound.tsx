import { useEffect } from "react";
import { ArrowRight, Home, Search } from "lucide-react";
import { Link } from "react-router-dom";
import DevQueensLogo from "@/components/devqueens/DevQueensLogo";
import { updateSeo } from "@/lib/seo";

function DiscoveryIllustration() {
  return (
    <svg viewBox="0 0 520 420" role="img" aria-labelledby="lost-title lost-description" className="w-full max-w-[520px]">
      <title id="lost-title">A creative path to your next discovery</title>
      <desc id="lost-description">An illustrated code window and winding path lead to a bright star.</desc>
      <defs>
        <linearGradient id="path-fill" x1="0" x2="1" y1="1" y2="0">
          <stop offset="0" stopColor="#e5684f" />
          <stop offset="1" stopColor="#f4c744" />
        </linearGradient>
      </defs>
      <circle cx="270" cy="210" r="172" fill="#eee8f5" />
      <circle cx="270" cy="210" r="132" fill="#fffaf5" />
      <circle cx="423" cy="102" r="30" fill="#f7ddd3" />
      <circle cx="112" cy="294" r="20" fill="#d9efe8" />
      <rect x="83" y="74" width="270" height="198" rx="24" fill="#34295d" />
      <path d="M83 100a26 26 0 0 1 26-26h218a26 26 0 0 1 26 26v14H83V100Z" fill="#493b7d" />
      <circle cx="105" cy="95" r="4" fill="#f4c744" />
      <circle cx="121" cy="95" r="4" fill="#f5b09a" />
      <circle cx="137" cy="95" r="4" fill="#9bcfbc" />
      <path d="m122 149-17 13 17 13m28-26 17 13-17 13m41 4 24-37" fill="none" stroke="#f4c744" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="106" y="211" width="105" height="7" rx="3.5" fill="#b9acd9" opacity=".8" />
      <rect x="106" y="228" width="157" height="7" rx="3.5" fill="#b9acd9" opacity=".45" />
      <path d="M284 182c62 2 75 40 48 69-24 26-17 53 24 61 39 8 56 26 53 55" fill="none" stroke="#fffaf5" strokeWidth="28" strokeLinecap="round" />
      <path d="M284 182c62 2 75 40 48 69-24 26-17 53 24 61 39 8 56 26 53 55" fill="none" stroke="url(#path-fill)" strokeWidth="7" strokeLinecap="round" />
      <circle cx="409" cy="368" r="12" fill="#34295d" />
      <path d="m409 336 7 22-7 10-7-10 7-22Zm-23 32 19 3 4 8-12 1-11-12Zm46 0-19 3-4 8 12 1 11-12Z" fill="#f4c744" />
      <path d="m400 84 7 15 16 2-12 11 3 16-14-8-14 8 3-16-12-11 16-2 7-15Z" fill="#e5684f" />
      <path d="M361 147h25m-12-12v25M82 325h34m-17-17v34" stroke="#51447e" strokeWidth="3" strokeLinecap="round" opacity=".45" />
    </svg>
  );
}

export default function NotFound() {
  useEffect(() => {
    updateSeo({
      title: "Page Not Found | DevQueens",
      description: "We couldn't find that page. Explore DevQueens learning paths, community stories, and opportunities.",
      noIndex: true,
    });
  }, []);

  return (
    <main className="relative flex min-h-screen items-center overflow-hidden bg-[#fbf7f1] px-5 py-12 text-[#28213f] sm:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute -right-36 -top-40 h-[34rem] w-[34rem] rounded-full border border-[#e9d8c8]" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 -left-36 h-[34rem] w-[34rem] rounded-full border border-[#e9d8c8]" />
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[.9fr_1.1fr] lg:gap-12">
        <section className="order-1 text-center lg:order-1 lg:text-left">
          <Link to="/" className="mx-auto flex w-fit items-center gap-2 lg:mx-0" aria-label="DevQueens home">
            <DevQueensLogo variant="navbar" className="h-10 w-10 rounded-full object-cover" />
            <span className="font-display text-sm font-bold text-[#34295d]">DevQueens</span>
          </Link>
          <p className="mt-10 inline-flex items-center gap-2 rounded-full border border-[#e9d8c8] bg-white/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.15em] text-[#51447e]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#e5684f]" /> A little detour
          </p>
          <p className="mt-5 font-display text-7xl font-bold leading-none tracking-[-.08em] text-[#e5684f] sm:text-8xl">404<span className="text-[#34295d]">.</span></p>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-[#28213f] sm:text-4xl">This page isn’t in our orbit.</h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#716a78] lg:mx-0">
            The link may have changed, but your next step is still out there. Head home or find a new learning path to explore.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3 lg:justify-start">
            <Link to="/" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#34295d] px-5 text-sm font-semibold text-white transition hover:bg-[#493b7d]">
              <Home size={16} /> Back to home
            </Link>
            <Link to="/#courses" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#d8cce8] bg-white px-5 text-sm font-semibold text-[#51447e] transition hover:bg-[#f7f4fa]">
              <Search size={16} /> Explore learning paths <ArrowRight size={14} />
            </Link>
          </div>
          <p className="mt-8 text-xs text-[#96909a]">Learn something new. Build something brilliant. Belong.</p>
        </section>
        <div className="order-2 mx-auto w-full max-w-[320px] sm:max-w-[380px] lg:order-2 lg:max-w-none">
          <DiscoveryIllustration />
        </div>
      </div>
    </main>
  );
}
