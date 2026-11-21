import DevQueensLogo from "@/components/devqueens/DevQueensLogo";

export default function PageLoader({ label = "Loading your next chapter" }: { label?: string }) {
  return (
    <main className="dq-loading-screen" role="status" aria-live="polite">
      <div className="dq-loader-orbit dq-loader-orbit-one" aria-hidden="true" />
      <div className="dq-loader-orbit dq-loader-orbit-two" aria-hidden="true" />
      <div className="dq-loader-card">
        <span className="dq-loader-mark"><DevQueensLogo variant="navbar" /></span>
        <span className="dq-loader-spark dq-loader-spark-one" aria-hidden="true">✦</span>
        <span className="dq-loader-spark dq-loader-spark-two" aria-hidden="true">✧</span>
        <p className="mt-5 font-display text-2xl font-bold tracking-tight text-[#34295d]">DevQueens</p>
        <p className="mt-2 text-sm text-[#716a78]">{label}</p>
        <div className="dq-loader-track" aria-hidden="true"><span /></div>
        <span className="sr-only">Please wait</span>
      </div>
    </main>
  );
}
