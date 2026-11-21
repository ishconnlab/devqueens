import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, ShieldCheck, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import DevQueensLogo from "@/components/devqueens/DevQueensLogo";
import { updateSeo } from "@/lib/seo";

type RegistrationStatus = {
  adminRegistrationOpen: boolean;
  adminRegistrationRequiresCode: boolean;
  firstAdministrator: boolean;
};

export default function AdminLoginPage() {
  const { user, adminLogin, adminRegister, error: serviceError } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registrationCode, setRegistrationCode] = useState("");
  const [status, setStatus] = useState<RegistrationStatus | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    updateSeo({ title: "Administrator Sign In | DevQueens", description: "Sign in to DevQueens administration.", path: "/admin", noIndex: true });
  }, []);

  useEffect(() => {
    let active = true;
    api<RegistrationStatus>("/auth/registration-status")
      .then((result) => { if (active) setStatus(result); })
      .catch(() => { if (active) setStatus(null); });
    return () => { active = false; };
  }, []);

  if (user) return <Navigate to={user.role === "admin" ? "/admin" : "/portal"} replace />;

  const registrationClosed = status !== null && !status.adminRegistrationOpen;
  const isRegister = mode === "register";

  const switchMode = (next: "login" | "register") => {
    setMode(next);
    setError("");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const session = isRegister
        ? await adminRegister(name, email, password, registrationCode || undefined)
        : await adminLogin(email, password);
      navigate(session.role === "admin" ? "/admin" : "/portal", { replace: true });
    } catch (cause) {
      setError(cause instanceof Error
        ? cause.message
        : isRegister ? "Administrator registration could not be completed." : "Administrator sign in could not be completed.");
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
        <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl bg-[#f2edf8] p-1" role="tablist" aria-label="Administrator access">
          <button
            type="button"
            role="tab"
            aria-selected={!isRegister}
            onClick={() => switchMode("login")}
            className={`min-h-10 rounded-lg text-sm font-semibold transition ${!isRegister ? "bg-white text-[#34295d] shadow-sm" : "text-[#625e6b] hover:text-[#34295d]"}`}
          >
            Sign in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isRegister}
            onClick={() => switchMode("register")}
            className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg text-sm font-semibold transition ${isRegister ? "bg-white text-[#34295d] shadow-sm" : "text-[#625e6b] hover:text-[#34295d]"}`}
          >
            <UserPlus size={14} /> Register
          </button>
        </div>
        <h1 className="mt-5 font-display text-3xl font-bold tracking-tight">{isRegister ? "Register an administrator" : "Admin sign in"}</h1>
        <p className="mt-2 text-sm leading-6 text-stone-500">
          {isRegister
            ? "Create an administrator account to manage the DevQueens platform."
            : "Use your administrator account to manage the DevQueens platform."}
        </p>
        {isRegister && status?.firstAdministrator && !registrationClosed && (
          <p role="status" className="notice-success mt-4">No administrator exists yet. Create the first administrator to get started.</p>
        )}
        {isRegister && registrationClosed ? (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-900">Administrator registration is closed.</p>
            <p className="mt-1 text-sm leading-6 text-amber-800">Sign in with an existing administrator account to manage administrator access in Settings.</p>
            <button type="button" onClick={() => switchMode("login")} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#34295d] px-4 text-sm font-semibold text-white transition hover:bg-[#493b7d]">
              Go to sign in <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            {isRegister && (
              <label className="form-label">Full name
                <input required minLength={2} maxLength={100} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className="form-input" />
              </label>
            )}
            <label className="form-label">Admin email
              <input required type="email" maxLength={254} autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className="form-input" />
            </label>
            <label className="form-label">Password
              <input
                required
                type="password"
                minLength={isRegister ? 10 : undefined}
                maxLength={128}
                pattern={isRegister ? "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{10,128}" : undefined}
                autoComplete={isRegister ? "new-password" : "current-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="form-input"
              />
              {isRegister && <span className="mt-1 block text-xs font-normal text-stone-500">At least 10 characters, including uppercase, lowercase, and a number.</span>}
            </label>
            {isRegister && status?.adminRegistrationRequiresCode && (
              <label className="form-label">Registration code
                <input required maxLength={256} autoComplete="off" value={registrationCode} onChange={(event) => setRegistrationCode(event.target.value)} className="form-input" />
                <span className="mt-1 block text-xs font-normal text-stone-500">Use the invitation code shared by the DevQueens team.</span>
              </label>
            )}
            {(error || serviceError) && <p role="alert" className="notice-error">{error || serviceError}</p>}
            <button disabled={busy} className="group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#34295d] px-5 text-sm font-semibold text-white transition hover:bg-[#493b7d] disabled:cursor-not-allowed disabled:opacity-60">
              {busy ? "Please wait…" : isRegister ? "Create administrator account" : "Sign in to administration"} {!busy && <ArrowRight size={15} />}
            </button>
          </form>
        )}
        <Link to="/" className="mt-6 inline-flex items-center gap-1 border-t border-stone-100 pt-4 text-xs font-semibold text-stone-600 hover:text-[#34295d]"><ArrowLeft size={13} /> Home</Link>
      </section>
    </main>
  );
}
