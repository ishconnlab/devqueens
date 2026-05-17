import { Linkedin, MessageCircle, Globe, ArrowUp } from "lucide-react";
import DevQueensLogo, { IshConnectLink } from "./DevQueensLogo";

const socialLinks = [
  { icon: Linkedin, href: "https://www.linkedin.com/company/devqueens", label: "LinkedIn" },
  { icon: MessageCircle, href: "https://chat.whatsapp.com/BIyl1UovWjzLwcGw6vtcUJ", label: "WhatsApp" },
  { icon: Globe, href: "https://ishconnect.rw", label: "ISHConnect" },
];

const quickLinks = [
  { label: "Learning Paths", href: "#paths" },
  { label: "Resources", href: "#resources" },
  { label: "Community", href: "#community" },
  { label: "Opportunities", href: "#opportunities" },
];

export default function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="bg-[hsl(var(--foreground))] text-[hsl(var(--background))]">
      <div className="section-container py-14 md:py-18">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-4">
              <DevQueensLogo variant="footer" />
              <div>
                <span className="font-display text-sm font-semibold">DevQueens</span>
                <p className="text-[10px] text-[hsl(var(--background)/0.4)]">An Initiative by <IshConnectLink className="hover:opacity-60 transition-opacity text-inherit">ISHConnect</IshConnectLink></p>
              </div>
            </div>
            <p className="text-sm text-[hsl(var(--background)/0.5)] max-w-sm leading-relaxed">
              A free learning ecosystem empowering African women to build careers in technology through structured education, mentorship, and community.
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
                  <a href={link.href} className="text-sm text-[hsl(var(--background)/0.5)] hover:text-[hsl(var(--background))] transition-colors duration-300">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <p className="text-xs text-[hsl(var(--background)/0.4)] uppercase tracking-[0.1em] font-medium mb-4">Powered By</p>
            <div className="flex items-center gap-3 p-4 border border-[hsl(var(--background)/0.1)]">
              <div className="w-8 h-8 bg-[hsl(var(--background))] flex items-center justify-center">
                <span className="text-[9px] font-bold text-[hsl(var(--foreground))]">IS</span>
              </div>
              <div>
                <IshConnectLink className="text-sm font-semibold hover:opacity-60 transition-opacity">ISHConnect</IshConnectLink>
                <p className="text-[10px] text-[hsl(var(--background)/0.4)]">Innovation Ecosystem</p>
              </div>
            </div>
            <button onClick={scrollToTop} className="mt-4 flex items-center gap-1.5 text-xs text-[hsl(var(--background)/0.4)] hover:text-[hsl(var(--background))] transition-colors duration-300">
              Back to top <ArrowUp size={11} />
            </button>
          </div>
        </div>

        <div className="divider mt-10 mb-6 bg-[hsl(var(--background)/0.1)]" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-[hsl(var(--background)/0.35)]">&copy; {new Date().getFullYear()} DevQueens. An initiative by <IshConnectLink className="hover:opacity-60 transition-opacity text-inherit">IshConnect</IshConnectLink>.</p>
          <IshConnectLink className="text-xs text-[hsl(var(--background)/0.35)] hover:text-[hsl(var(--background))] transition-colors duration-300">
            Made by IshConnect
          </IshConnectLink>
        </div>
      </div>
    </footer>
  );
}
