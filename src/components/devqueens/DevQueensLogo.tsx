interface DevQueensLogoProps {
  className?: string;
  variant?: "navbar" | "hero" | "footer" | "about";
}

export default function DevQueensLogo({ className = "", variant = "navbar" }: DevQueensLogoProps) {
  const sizes = {
    navbar: { w: 28, h: 28 },
    hero: { w: 64, h: 64 },
    footer: { w: 32, h: 32 },
    about: { w: 40, h: 40 },
  };
  const { w, h } = sizes[variant];

  const isLight = variant === "footer";

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="DevQueens logo"
    >
      <rect
        width="32"
        height="32"
        rx="2"
        fill={isLight ? "#FFFFFF" : "#000000"}
      />
      <text
        x="16"
        y="21"
        textAnchor="middle"
        fontSize="14"
        fontWeight="700"
        fontFamily="Space Grotesk, sans-serif"
        fill={isLight ? "#000000" : "#FFFFFF"}
        letterSpacing="-0.5"
      >
        DQ
      </text>
    </svg>
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
