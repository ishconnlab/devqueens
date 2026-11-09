import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowUpRight, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import DevQueensLogo from "@/components/devqueens/DevQueensLogo";
import { useAuth } from "@/contexts/AuthContext";

export function PlatformShell({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const links = admin
    ? [
      ["Overview", "/admin"],
      ["Girls", "/admin/members"],
      ["Inbox", "/admin/inbox"],
      ["Enrollments", "/admin/enrollments"],
      ["Courses", "/admin/courses"],
      ["Assessments", "/admin/assessments"],
      ["Certificates", "/admin/certificates"],
      ["Team", "/admin/team"],
      ["Badges", "/admin/badges"],
      ["Alumni", "/admin/alumni"],
      ["Top achievers", "/admin/achiever"],
      ["Partners", "/admin/partner"],
      ["Gallery", "/admin/gallery"],
      ["Testimonials", "/admin/testimonial"],
      ["Reports", "/admin/reports"],
      ["Settings", "/admin/settings"],
    ]
    : [
      ["My learning", "/portal"],
      ["Community", "/portal/community"],
      ["Analytics", "/portal/analytics"],
      ["Inbox", "/portal/inbox"],
      ["Explore courses", "/portal/courses"],
      ["My certificates", "/portal/certificates"],
      ["Membership card", "/portal/card"],
      ["My profile", "/portal/profile"],
    ];

  const signOut = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#fbf7f1] text-[#28213f]">
      <header className="sticky top-0 z-30 border-b border-[#e8dfd5] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-5 md:px-8">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5" aria-label="DevQueens home">
              <DevQueensLogo variant="navbar" />
                  <span className="ml-2 font-display font-bold text-[#34295d]">DevQueens</span>
            </Link>
                <span className="hidden border-l border-[#e8dfd5] pl-6 text-sm font-medium text-[#77717d] md:block">
              {admin ? "IshConnect · Administration" : "Learning portal"}
            </span>
          </div>
          <div className="hidden items-center gap-4 md:flex">
            <span className="text-sm text-[#625e6b]">{user?.name}</span>
            <button onClick={signOut} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#625e6b] transition hover:bg-[#eee8f5] hover:text-[#34295d]">
              <LogOut size={15} /> Sign out
            </button>
          </div>
          <button onClick={() => setMenuOpen((value) => !value)} className="rounded-lg p-2 text-[#51447e] hover:bg-[#eee8f5] md:hidden" aria-label="Toggle navigation" aria-expanded={menuOpen}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>
      <div className="mx-auto flex max-w-[1440px]">
        <aside className={`${menuOpen ? "block" : "hidden"} absolute z-20 min-h-[calc(100vh-68px)] w-64 border-r border-[#e8dfd5] bg-white px-4 py-6 md:relative md:block md:shrink-0`}>
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[.14em] text-[#aaa2ad]">{admin ? "Workspace" : "Your space"}</p>
          <nav className="space-y-1">
            {links.map(([label, href]) => (
              <Link key={href} to={href} onClick={() => setMenuOpen(false)} aria-current={pathname === href ? "page" : undefined} className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition ${pathname === href ? "bg-[#34295d] text-white hover:bg-[#493b7d]" : "text-[#625e6b] hover:bg-[#eee8f5] hover:text-[#34295d]"}`}>
                {label}
                <ArrowUpRight size={14} className={pathname === href ? "text-white/60" : "text-[#b9acd9]"} />
              </Link>
            ))}
          </nav>
          <div className="mt-8 rounded-2xl bg-[#34295d] p-4 text-white">
            <p className="text-xs font-semibold text-[#f4c744]">An initiative by IshConnect</p>
            <p className="mt-1 text-xs leading-relaxed text-white/65">Learn, build and grow with a community that believes in your future.</p>
          </div>
          <button onClick={signOut} className="mt-5 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-[#716a78] hover:bg-[#eee8f5] md:hidden">
            <LogOut size={15} /> Sign out
          </button>
        </aside>
        <main className="min-w-0 flex-1 px-5 py-8 md:px-9 md:py-10">{children}</main>
      </div>
    </div>
  );
}

export function PageHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[.15em] text-orange-700">{eyebrow}</p>}
        <h1 className="font-display text-3xl font-bold tracking-tight text-[#28213f] md:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-[#77717d]">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title, message, action }: { title: string; message: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#b9acd9] bg-white px-6 py-12 text-center">
      <h2 className="font-display text-lg font-semibold text-[#34295d]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#77717d]">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
