import { ArrowUp, Globe, Linkedin, Mail, MessageCircle } from "lucide-react";
import { useLocation } from "react-router-dom";
import DevQueensLogo, { IshConnectLink } from "./DevQueensLogo";
import CommunityJoinButton from "./CommunityJoinButton";

const socialLinks = [
  { icon: Linkedin, href: "https://www.linkedin.com/company/devqueens", label: "LinkedIn" },
  { icon: Globe, href: "https://ishconnect.rw", label: "ISHConnect" },
];

const quickLinks = [
  { label: "About DevQueens", href: "#about" },
  { label: "Learning Paths", href: "#paths" },
  { label: "Courses", href: "#courses" },
  { label: "Learner stories & gallery", href: "#stories" },
  { label: "Verify a member card", href: "#verify-member" },
  { label: "Community", href: "#community" },
];

export default function Footer() {
  const { pathname } = useLocation();
  const sectionHref = (href: string) => pathname === "/" ? href : `/${href}`;
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });

  return (
    <footer className="bg-[#28213f] text-[#fbf7f1]">
      <div className="section-container py-14 md:py-18">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-4">
              <DevQueensLogo variant="footer" />
            </div>
            <p className="text-sm text-[hsl(var(--background)/0.5)] max-w-sm leading-relaxed">
              A welcoming place for girls to explore technology, grow their skills, and connect through learning.
            </p>
            <div className="flex gap-3 mt-6">
              {socialLinks.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="w-8 h-8 border border-[hsl(var(--background)/0.15)] flex items-center justify-center text-[hsl(var(--background)/0.4)] hover:text-[hsl(var(--background))] hover:border-[hsl(var(--background)/0.3)] transition-all duration-300" aria-label={s.label}>
                  <s.icon size={13} />
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-3">
            <p className="text-xs text-[hsl(var(--background)/0.4)] uppercase tracking-[0.1em] font-medium mb-4">Quick Links</p>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a href={sectionHref(link.href)} className="text-sm text-[hsl(var(--background)/0.5)] hover:text-[hsl(var(--background))] transition-colors duration-300">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <p className="text-xs text-[hsl(var(--background)/0.4)] uppercase tracking-[0.1em] font-medium mb-4">Say hello</p>
            <p className="max-w-xs text-sm leading-6 text-white/55">Questions about learning with DevQueens? Join the community or connect with IshConnect.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <CommunityJoinButton className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-white/80 transition hover:border-white/40 hover:text-white">
                <MessageCircle size={13} /> Community
              </CommunityJoinButton>
              <IshConnectLink className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-white/80 transition hover:border-white/40 hover:text-white">
                <Mail size={13} /> IshConnect
              </IshConnectLink>
            </div>
            <button onClick={scrollToTop} className="mt-4 flex items-center gap-1.5 text-xs text-[hsl(var(--background)/0.4)] hover:text-[hsl(var(--background))] transition-colors duration-300">
              Back to top <ArrowUp size={11} />
            </button>
          </div>
        </div>

        <div className="divider mt-10 mb-6 bg-[hsl(var(--background)/0.1)]" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-[hsl(var(--background)/0.35)]">&copy; {new Date().getFullYear()} DevQueens — An initiative by IshConnect.</p>
          <IshConnectLink className="text-xs text-[hsl(var(--background)/0.35)] hover:text-[hsl(var(--background))] transition-colors duration-300">Visit IshConnect <ArrowUp size={11} className="ml-1 inline rotate-45" /></IshConnectLink>
        </div>
      </div>
    </footer>
  );
}
