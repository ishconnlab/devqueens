import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import DevQueensLogo from "@/components/devqueens/DevQueensLogo";
import { updateSeo } from "@/lib/seo";

export default function AdminLoginPage() {
  const { user, adminLogin, error: serviceError } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    updateSeo({ title: "Administrator Sign In | DevQueens", description: "Sign in to DevQueens administration.", path: "/admin", noIndex: true });
  }, []);

  if (user) return <Navigate to={user.role === "admin" ? "/admin" : "/portal"} replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const session = await adminLogin(email, password);
      navigate(session.role === "admin" ? "/admin" : "/portal", { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Administrator sign in could not be completed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#fbf7f1] px-5 py-10 text-[#28213f]">
      <section className="w-full max-w-md rounded-2xl border border-[#e9d8c8] bg-white p-6 shadow-sm sm:p-8">
        <Link to="/" className="mb-8 inline-flex items-center gap-2" aria-label="DevQueens home">
          <DevQueensLogo variant="navbar" />
          <span className="font-display text-sm font-bold text-[#34295d]">DevQueens</span>
        </Link>
        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#f2edf8] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.15em] text-[#51447e]">
          <ShieldCheck size={13} /> Administrator access
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight">Admin sign in</h1>
        <p className="mt-2 text-sm leading-6 text-stone-500">Use your administrator account to manage the DevQueens platform.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="form-label">Admin email
            <input required type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className="form-input" />
          </label>
          <label className="form-label">Password
            <input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="form-input" />
          </label>
          {(error || serviceError) && <p role="alert" className="notice-error">{error || serviceError}</p>}
          <button disabled={busy} className="group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#34295d] px-5 text-sm font-semibold text-white transition hover:bg-[#493b7d] disabled:cursor-not-allowed disabled:opacity-60">
            {busy ? "Please wait…" : "Sign in to administration"} {!busy && <ArrowRight size={15} />}
          </button>
        </form>
        <Link to="/" className="mt-6 inline-flex items-center gap-1 border-t border-stone-100 pt-4 text-xs font-semibold text-stone-600 hover:text-[#34295d]"><ArrowLeft size={13} /> Home</Link>
      </section>
    </main>
  );
}
