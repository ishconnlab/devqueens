import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { z } from "zod";
import { ArrowLeft, ArrowRight, BookOpen, Braces, Code2, Sparkles } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import DevQueensLogo from "@/components/devqueens/DevQueensLogo";
import { useAuth } from "@/contexts/AuthContext";
import { updateSeo } from "@/lib/seo";

const ageRanges = [
  { value: "13-15", label: "13–15" },
  { value: "16-17", label: "16–17" },
  { value: "18-24", label: "18–24" },
  { value: "25+", label: "25 or older" },
] as const;

const learningTraits = [
  { label: "Learn", icon: BookOpen },
  { label: "Build", icon: Code2 },
  { label: "Belong", icon: Sparkles },
];

export default function AuthPage({ mode }: { mode: "login" | "register" }) {
  const { user, loading, error: serviceError, login, register } = useAuth();
  const navigate = useNavigate();
  const isRegister = mode === "register";
  useEffect(() => {
    updateSeo({
      title: isRegister ? "Join DevQueens | Create Your Account" : "Sign In | DevQueens",
      description: isRegister ? "Create your DevQueens account and start learning, building projects, and growing with a supportive girls-in-tech community." : "Sign in to your DevQueens learning portal and continue your technology journey.",
      path: isRegister ? "/register" : "/login",
      noIndex: true,
    });
  }, [isRegister]);
  const [registrationStep, setRegistrationStep] = useState(0);
  const authSchema = z.object({
    name: z.string().trim().max(100).optional(),
    email: z.string().trim().email("Enter a valid email address.").max(254),
    password: z.string().min(1, "Enter your password.").max(128),
    country: z.string().trim().max(80).optional(),
    institutionType: z.enum(["school", "other"]).optional(),
    institutionName: z.string().trim().max(120).optional(),
    district: z.string().trim().max(100).optional(),
    ageRange: z.enum(["13-15", "16-17", "18-24", "25+"]).optional(),
  }).superRefine((values, context) => {
    if (!isRegister) return;
    if (!values.name || values.name.length < 2) context.addIssue({ code: "custom", path: ["name"], message: "Enter your full name." });
    if (values.password.length < 10) context.addIssue({ code: "custom", path: ["password"], message: "Use at least 10 characters." });
    if (!/[a-z]/.test(values.password)) context.addIssue({ code: "custom", path: ["password"], message: "Include a lowercase letter." });
    if (!/[A-Z]/.test(values.password)) context.addIssue({ code: "custom", path: ["password"], message: "Include an uppercase letter." });
    if (!/[0-9]/.test(values.password)) context.addIssue({ code: "custom", path: ["password"], message: "Include a number." });
    if (!values.country || values.country.length < 2) context.addIssue({ code: "custom", path: ["country"], message: "Enter your country." });
    if (!values.institutionType) context.addIssue({ code: "custom", path: ["institutionType"], message: "Choose school or other." });
    if (!values.institutionName || values.institutionName.length < 2) context.addIssue({ code: "custom", path: ["institutionName"], message: "Enter your school or organization." });
    if (!values.district || values.district.length < 2) context.addIssue({ code: "custom", path: ["district"], message: "Enter your district." });
    if (!values.ageRange) context.addIssue({ code: "custom", path: ["ageRange"], message: "Choose your age range." });
  });
  type AuthFields = z.infer<typeof authSchema>;
  const { register: field, watch, handleSubmit, setError, trigger, formState: { errors, isSubmitting } } = useForm<AuthFields>({
    resolver: zodResolver(authSchema),
    defaultValues: { institutionType: "school" },
  });
  const institutionType = watch("institutionType") ?? "school";
  if (!loading && user) return <Navigate to={user.role === "admin" ? "/admin" : "/portal"} replace />;

  const submit = handleSubmit(async (values) => {
    try {
      if (isRegister && (!values.name || !values.country || !values.institutionType || !values.institutionName || !values.district || !values.ageRange)) return;
      const session = isRegister
        ? await register(values.name!, values.email, values.password, {
          country: values.country!,
          institutionType: values.institutionType!,
          institutionName: values.institutionName!,
          district: values.district!,
          ageRange: values.ageRange!,
        })
        : await login(values.email, values.password);
      navigate(session.role === "admin" ? "/admin" : "/portal", { replace: true });
    } catch (error) {
      setError("root.serverError", { message: error instanceof Error ? error.message : "Sign-in could not be completed. Please try again." });
    }
  });
  const goToNextStep = async () => {
    const fieldsByStep: (keyof AuthFields)[][] = [
      ["name", "email"],
      ["country", "ageRange", "institutionType", "institutionName", "district"],
    ];
    if (await trigger(fieldsByStep[registrationStep])) setRegistrationStep((step) => step + 1);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fbf7f1] text-[#28213f]">
      <div aria-hidden="true" className="pointer-events-none absolute -right-36 -top-32 h-[34rem] w-[34rem] rounded-full border border-[#e9d8c8]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-10 top-[-5rem] h-[25rem] w-[25rem] rounded-full border border-[#e9d8c8]" />
      <header className="relative z-10 mx-auto flex max-w-[1320px] items-center justify-between px-5 py-3 sm:px-8">
        <Link to="/" className="flex items-center" aria-label="DevQueens home">
          <DevQueensLogo variant="navbar" />
          <span className="ml-2 font-display text-sm font-bold text-[#34295d]">DevQueens</span>
        </Link>
        <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-[#e8dfd5] bg-white/70 px-4 py-2 text-xs font-semibold text-[#514a53] transition hover:border-[#b9acd9] hover:text-[#34295d]">
          <ArrowLeft size={14} /> Back to home
        </Link>
      </header>

      <div className={`relative z-10 mx-auto grid max-w-[1320px] items-center gap-8 px-5 pb-12 pt-5 sm:px-8 lg:grid-cols-[1fr_.95fr] lg:gap-14 ${isRegister ? "lg:items-start lg:pt-8" : "min-h-[calc(100svh-76px)]"}`}>
        <section className={`${isRegister ? "lg:sticky lg:top-16" : ""}`}>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#e9d8c8] bg-white/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.15em] text-[#51447e]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#e5684f]" /> An initiative by IshConnect
          </p>
          <h1 className="max-w-2xl font-display text-4xl font-bold leading-[1.02] tracking-[-.05em] text-[#28213f] sm:text-5xl xl:text-6xl">
            {isRegister ? <>Your ideas<br />belong in tech.</> : <>Good to have<br />you back.</>}
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-[#716a78] sm:text-base">
            {isRegister ? "Start right where you are. Find learning paths, grow practical skills, and connect with a community cheering you on." : "Pick up where you left off. Your learning journey and community are right here."}
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            {learningTraits.map(({ label, icon: Icon }) => <span key={label} className="inline-flex items-center gap-2 rounded-full border border-[#e8dfd5] bg-white/75 px-3 py-2 text-xs font-semibold text-[#51447e]"><Icon size={14} />{label}</span>)}
          </div>
          <div className="relative mt-8 hidden min-h-[205px] max-w-lg overflow-hidden rounded-[1.75rem] bg-[#eee8f5] p-6 sm:block">
            <div aria-hidden="true" className="absolute -right-10 -top-20 h-52 w-52 rounded-full border-[30px] border-white/50" />
            <div className="relative flex h-full flex-col justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#34295d] text-white"><Braces size={21} /></span>
              <div className="mt-8">
                <p className="font-mono text-xs text-[#817791]">const nextStep =</p>
                <p className="mt-1 font-display text-2xl font-bold text-[#34295d]">yours to imagine<span className="text-[#e5684f]">.</span></p>
              </div>
            </div>
          </div>
        </section>

        <section className={`mx-auto w-full max-w-[560px] rounded-[1.75rem] border border-[#e8dfd5] bg-white p-5 shadow-[0_28px_90px_-55px_rgba(52,41,93,.3)] sm:p-8 lg:p-9 ${isRegister ? "lg:max-w-[620px]" : ""}`}>
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#e5684f]">{isRegister ? "Join the community" : "Welcome back"}</p>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#34295d] sm:text-3xl">{isRegister ? "Create your account" : "Sign in to DevQueens"}</h2>
              <p className="mt-2 text-sm leading-6 text-[#77717d]">
                {isRegister ? "A few details to get your learning space ready." : "Continue learning and building your technology journey."}
              </p>
            </div>
            <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f7ddd3] text-[#a34c3b] sm:flex"><Sparkles size={20} /></span>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-4">
            {serviceError && <p role="alert" className="notice-error">{serviceError}</p>}
            {isRegister && <div className="mb-1">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[#716a78]">
                <span>Step {registrationStep + 1} of 3</span>
                <span>{["Your account", "About you", "Secure account"][registrationStep]}</span>
              </div>
              <div className="flex gap-1.5" aria-hidden="true">
                {[0, 1, 2].map((step) => <span key={step} className={`h-1.5 flex-1 rounded-full ${step <= registrationStep ? "bg-[#e5684f]" : "bg-[#eee8e0]"}`} />)}
              </div>
            </div>}
            <div className={isRegister && registrationStep !== 0 ? "hidden" : "flex flex-col gap-4"}>
            {isRegister && <label className="form-label">
              Full name
              <input {...field("name")} autoComplete="name" className="form-input" placeholder="Your name" aria-invalid={Boolean(errors.name)} />
              {errors.name && <span className="field-error">{errors.name.message}</span>}
            </label>}
            <label className="form-label">
              Email address
              <input {...field("email")} type="email" autoComplete="email" className="form-input" placeholder="you@example.com" aria-invalid={Boolean(errors.email)} />
              {errors.email && <span className="field-error">{errors.email.message}</span>}
            </label>
            </div>

            {isRegister && <div className={registrationStep === 1 ? "flex flex-col gap-4" : "hidden"}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="form-label">
                  Country
                  <input {...field("country")} autoComplete="country-name" className="form-input" placeholder="Your country" aria-invalid={Boolean(errors.country)} />
                  {errors.country && <span className="field-error">{errors.country.message}</span>}
                </label>
                <label className="form-label">
                  Age range
                  <select {...field("ageRange")} className="form-input" aria-invalid={Boolean(errors.ageRange)}>
                    <option value="">Choose age range</option>
                    {ageRanges.map((range) => <option key={range.value} value={range.value}>{range.label}</option>)}
                  </select>
                  {errors.ageRange && <span className="field-error">{errors.ageRange.message}</span>}
                </label>
              </div>
              <fieldset className="grid gap-4 rounded-xl border border-[#eee8e0] bg-[#fbf9f5] p-4 sm:grid-cols-2">
                <legend className="px-1 text-[10px] font-bold uppercase tracking-[.12em] text-[#716a78]">School or other organization</legend>
                <label className="form-label">
                  I am part of
                  <select {...field("institutionType")} className="form-input bg-white" aria-invalid={Boolean(errors.institutionType)}>
                    <option value="school">A school</option>
                    <option value="other">Other / not currently in school</option>
                  </select>
                  {errors.institutionType && <span className="field-error">{errors.institutionType.message}</span>}
                </label>
                <label className="form-label">
                  {institutionType === "school" ? "School name" : "Organization or learning community"}
                  <input {...field("institutionName")} autoComplete="organization" className="form-input bg-white" placeholder={institutionType === "school" ? "Your school" : "Name or “Independent learner”"} aria-invalid={Boolean(errors.institutionName)} />
                  {errors.institutionName && <span className="field-error">{errors.institutionName.message}</span>}
                </label>
                <label className="form-label sm:col-span-2">
                  District
                  <input {...field("district")} className="form-input bg-white" placeholder="Your district" aria-invalid={Boolean(errors.district)} />
                  {errors.district && <span className="field-error">{errors.district.message}</span>}
                </label>
              </fieldset>
              <p className="text-[11px] leading-5 text-[#8a8290]">We collect an age range, not your date of birth. These details are for your DevQueens account and are not shown on your public member card.</p>
            </div>}

            <div className={isRegister && registrationStep !== 2 ? "hidden" : "flex flex-col gap-4"}>
            <label className="form-label">
              Password
              <input {...field("password")} type="password" autoComplete={isRegister ? "new-password" : "current-password"} className="form-input" placeholder={isRegister ? "At least 10 characters, including a number" : "Your password"} aria-invalid={Boolean(errors.password)} />
              {errors.password && <span className="field-error">{errors.password.message}</span>}
            </label>
            {errors.root?.serverError && <p role="alert" className="notice-error">{errors.root.serverError.message}</p>}
            {!isRegister && <button disabled={isSubmitting} className="group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#34295d] px-5 text-sm font-semibold text-white transition hover:bg-[#493b7d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#34295d] disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? "Please wait…" : isRegister ? "Create my account" : "Sign in"}
              {!isSubmitting && <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />}
            </button>}
            </div>
            {isRegister && <div className="flex gap-3">
              {registrationStep > 0 && <button type="button" onClick={() => setRegistrationStep((step) => step - 1)} className="min-h-12 flex-1 rounded-xl border border-[#e8dfd5] bg-white px-4 text-sm font-semibold text-[#51447e] transition hover:border-[#b9acd9]">Back</button>}
              {registrationStep < 2
                ? <button type="button" onClick={goToNextStep} className="group inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#34295d] px-5 text-sm font-semibold text-white transition hover:bg-[#493b7d]">
                  Continue <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </button>
                : <button disabled={isSubmitting} className="group inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#34295d] px-5 text-sm font-semibold text-white transition hover:bg-[#493b7d] disabled:cursor-not-allowed disabled:opacity-60">
                  {isSubmitting ? "Please wait…" : "Create my account"}
                  {!isSubmitting && <ArrowRight size={15} />}
                </button>}
            </div>}
          </form>

          <p className="mt-5 text-center text-sm text-[#77717d]">
            {isRegister ? "Already have an account?" : "New to DevQueens?"}{" "}
            <Link to={isRegister ? "/login" : "/register"} className="font-bold text-[#51447e] underline decoration-[#b9acd9] underline-offset-4 hover:text-[#34295d]">
              {isRegister ? "Sign in" : "Join DevQueens"}
            </Link>
          </p>
          <p className="mt-5 border-t border-[#eee8e0] pt-4 text-center text-[11px] leading-5 text-[#96909a]">
            DevQueens — An initiative by IshConnect. Please use this learning community respectfully and responsibly.
          </p>
        </section>
      </div>
    </main>
  );
}
