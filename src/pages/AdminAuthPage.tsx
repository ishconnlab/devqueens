import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import PageLoader from "@/components/devqueens/PageLoader";
import DevQueensLogo from "@/components/devqueens/DevQueensLogo";
import { updateSeo } from "@/lib/seo";

function AdminAuthFrame({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
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
        <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-stone-500">{description}</p>
        {children}
        <div className="mt-6 flex flex-wrap justify-between gap-3 border-t border-stone-100 pt-4 text-xs">
          <Link to="/" className="inline-flex items-center gap-1 font-semibold text-stone-600 hover:text-[#34295d]"><ArrowLeft size={13} /> Home</Link>
          <Link to="/login" className="font-semibold text-[#51447e] underline underline-offset-4 hover:text-[#34295d]">Member sign in</Link>
        </div>
      </section>
    </main>
  );
}

export function AdminLoginPage() {
  const { user, loading, adminLogin, error: serviceError } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    updateSeo({ title: "Administrator Sign In | DevQueens", description: "Sign in to DevQueens administration.", path: "/admin/login", noIndex: true });
  }, []);

  if (loading) return <PageLoader label="Checking administrator session" />;
  if (user) return <Navigate to={user.role === "admin" ? "/admin" : "/portal"} replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await adminLogin(email, password);
      navigate("/admin", { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Administrator sign in could not be completed.");
    } finally {
      setBusy(false);
    }
  };

  return <AdminAuthFrame title="Admin sign in" description="Use your administrator account to manage the DevQueens platform.">
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
  </AdminAuthFrame>;
}

export function AdminRegistrationPage() {
  const { user, loading, error: serviceError } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    updateSeo({ title: "Create Administrator Account | DevQueens", description: "Create an administrator account from the secured admin portal.", path: "/admin/register", noIndex: true });
  }, []);

  if (loading) return <PageLoader label="Checking administrator session" />;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.role !== "admin") return <Navigate to="/portal" replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    try {
      await api("/auth/admin-create", { method: "POST", body: { name, email, password } });
      setName("");
      setEmail("");
      setPassword("");
      setNotice("Administrator account created. The new administrator can now sign in at the admin sign-in page.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The administrator account could not be created.");
    } finally {
      setBusy(false);
    }
  };

  return <AdminAuthFrame title="Create admin account" description="Only signed-in administrators can create another administrator account. Use a unique email and a strong password.">
    <form onSubmit={submit} className="mt-6 space-y-4">
      <label className="form-label">Full name
        <input required minLength={2} maxLength={100} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className="form-input" />
      </label>
      <label className="form-label">Admin email
        <input required type="email" maxLength={254} autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="form-input" />
      </label>
      <label className="form-label">Password
        <input required type="password" minLength={10} maxLength={128} pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{10,128}" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="form-input" aria-describedby="admin-password-help" />
        <span id="admin-password-help" className="mt-1 block text-xs font-normal text-stone-500">At least 10 characters, including an uppercase letter, a lowercase letter, and a number.</span>
      </label>
      {serviceError && <p role="alert" className="notice-error">{serviceError}</p>}
      {error && <p role="alert" className="notice-error">{error}</p>}
      {notice && <p role="status" className="notice-success">{notice}</p>}
      <button disabled={busy} className="group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#34295d] px-5 text-sm font-semibold text-white transition hover:bg-[#493b7d] disabled:cursor-not-allowed disabled:opacity-60">
        {busy ? "Creating account…" : "Create admin account"} {!busy && <ArrowRight size={15} />}
      </button>
    </form>
    <button type="button" onClick={() => navigate("/admin/settings")} className="mt-3 w-full rounded-xl border border-[#e8dfd5] px-4 py-3 text-sm font-semibold text-[#51447e] hover:border-[#b9acd9]">Back to admin settings</button>
  </AdminAuthFrame>;
}
