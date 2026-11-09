interface DevQueensLogoProps {
  className?: string;
  variant?: "navbar" | "hero" | "footer" | "about";
}

export default function DevQueensLogo({ className = "", variant = "navbar" }: DevQueensLogoProps) {
  const sizes = {
    navbar: { h: 46 },
    hero: { h: 112 },
    footer: { h: 60 },
    about: { h: 60 },
  };
  const { h } = sizes[variant];

  return (
    <img
      src="/devqueenslogo.png"
      width={h}
      height={h}
      className={className}
      aria-label="DevQueens logo"
      alt="DevQueens — Empowering Girls in Tech Across Africa"
    />
  );
}

export function IshConnectLink({ className = "", children }: { className?: string; children?: React.ReactNode }) {
  return (
    <a
      href="https://www.ishconnect.rw"
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children || "ISHConnect"}
    </a>
  );
}
