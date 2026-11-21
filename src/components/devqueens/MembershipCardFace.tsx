import { useEffect, useState } from "react";
import { formatMembershipDate, membershipCardCircuitPaths, type MembershipCardMember, type MembershipCardSettings } from "@/lib/membershipCard";

function BrandLogo({ settings }: { settings: MembershipCardSettings }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [settings.logoUrl]);

  return (
    <span
      aria-hidden="true"
      className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 p-0.5 shadow-sm sm:h-11 sm:w-11"
      style={{ backgroundColor: settings.secondaryColor, borderColor: settings.accentColor }}
    >
      {settings.logoUrl && !failed ? (
        <img
          src={settings.logoUrl}
          alt=""
          onError={() => setFailed(true)}
          className="h-full w-full rounded-full object-contain"
        />
      ) : (
        <span className="font-display text-[10px] font-bold" style={{ color: settings.highlightColor }}>DQ</span>
      )}
    </span>
  );
}

export default function MembershipCardFace({
  member,
  settings,
  qrDataUrl,
}: {
  member: MembershipCardMember;
  settings: MembershipCardSettings;
  qrDataUrl: string;
}) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const photoUrl = member.profile?.photoUrl;
  const role = member.profile?.bio?.trim()
    || member.profile?.interests?.slice(0, 3).join(" · ")
    || settings.defaultMemberRole;
  const statusLabel = member.status === "active"
    ? "ACTIVE MEMBER"
    : member.status === "suspended"
      ? "SUSPENDED MEMBER"
      : "STATUS UNAVAILABLE";

  useEffect(() => setPhotoFailed(false), [photoUrl]);

  return (
    <article
      aria-label={`${settings.organizationName} membership card for ${member.name}`}
      className="membership-card-face relative mx-auto aspect-[1.585/1] w-full overflow-hidden text-white shadow-xl shadow-[#29213F]/15"
      style={{ backgroundColor: settings.backgroundColor, borderRadius: 0 }}
    >
      <svg aria-hidden="true" viewBox="0 0 1200 757" className="pointer-events-none absolute inset-0 z-0 h-full w-full">
        {membershipCardCircuitPaths.map((points, index) => (
          <g key={index}>
            <polyline
              points={points.map(([x, y]) => `${x},${y}`).join(" ")}
              fill="none"
              stroke={settings.accentColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity=".2"
            />
            {points.slice(1, -1).map(([cx, cy]) => (
              <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3" fill={settings.highlightColor} opacity=".38" />
            ))}
          </g>
        ))}
      </svg>
      <div className="relative z-10 grid h-full grid-rows-[auto_auto_minmax(0,1fr)_auto] gap-1.5 p-2.5 pl-3.5 sm:gap-2 sm:p-4 sm:pl-5 md:gap-2.5 md:p-5 md:pl-6">
        <header className="flex min-w-0 items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <BrandLogo settings={settings} />
            <div className="min-w-0">
              <p className="truncate font-display text-[10px] font-bold tracking-wide sm:text-sm">{settings.organizationName}</p>
              <p className="truncate text-[7px] leading-tight sm:text-[9px]" style={{ color: settings.accentColor }}>{settings.brandSubtitle}</p>
            </div>
          </div>
          <span
            className="shrink-0 rounded-full border px-1.5 py-1 text-[6px] font-bold tracking-[.08em] sm:px-2 sm:text-[8px]"
            style={{ borderColor: settings.accentColor, color: member.status === "active" ? settings.highlightColor : settings.accentColor }}
          >
            {statusLabel}
          </span>
        </header>

        <div className="min-w-0 border-l-2 pl-2" style={{ borderColor: settings.accentColor }}>
          <p className="truncate text-[8px] font-bold tracking-[.08em] sm:text-[11px]" style={{ color: settings.highlightColor }}>{settings.slogan}</p>
          <p className="truncate text-[7px] leading-tight sm:text-[9px]" style={{ color: settings.accentColor }}>{settings.supportingDescription}</p>
        </div>

        <div className="grid min-h-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:gap-3">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            {photoUrl && !photoFailed ? (
              <img
                src={photoUrl}
                alt={`${member.name} profile`}
                onError={() => setPhotoFailed(true)}
                className="h-10 w-10 shrink-0 rounded-lg object-cover sm:h-14 sm:w-14 md:h-[4.25rem] md:w-[4.25rem]"
              />
            ) : (
              <div
                role="img"
                aria-label={`${member.name} initials`}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-display text-base font-bold sm:h-14 sm:w-14 sm:text-xl md:h-[4.25rem] md:w-[4.25rem]"
                style={{ backgroundColor: settings.secondaryColor, color: settings.highlightColor }}
              >
                {member.name.trim().slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-[7px] font-semibold uppercase tracking-[.1em]" style={{ color: settings.accentColor }}>{settings.memberCategoryLabel}</p>
              <h2 className="truncate font-display text-sm font-bold tracking-tight sm:text-xl md:text-2xl">{member.name}</h2>
              <p className="line-clamp-2 text-[7px] leading-tight sm:text-[10px]" style={{ color: settings.accentColor }} title={role}>{role}</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-0.5">
            {qrDataUrl ? (
              <div className="rounded-md bg-white p-1 sm:rounded-lg sm:p-1.5">
                <img src={qrDataUrl} alt={`QR code for ${member.name}'s profile`} className="h-11 w-11 sm:h-16 sm:w-16 md:h-[4.75rem] md:w-[4.75rem]" />
              </div>
            ) : (
              <div className="grid h-11 w-11 place-items-center rounded-md bg-white p-1 text-center text-[6px] font-semibold text-[#29213F] sm:h-16 sm:w-16 sm:text-[8px]">
                QR unavailable
              </div>
            )}
            <p className="max-w-20 truncate text-[6px] font-semibold tracking-[.05em] sm:max-w-24 sm:text-[7px]" style={{ color: settings.accentColor }}>{settings.qrCaption}</p>
          </div>
        </div>

        <footer className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 border-t border-white/15 pt-1.5 sm:pt-2">
          <div className="grid min-w-0 grid-cols-2 gap-2 sm:gap-4">
            <div className="min-w-0">
              <p className="text-[6px] font-semibold uppercase tracking-[.08em]" style={{ color: settings.accentColor }}>Member ID</p>
              <p className="truncate font-mono text-[7px] font-semibold sm:text-[9px]">{member.memberId || "Unavailable"}</p>
            </div>
            <div className="min-w-0">
              <p className="text-[6px] font-semibold uppercase tracking-[.08em]" style={{ color: settings.accentColor }}>Member since</p>
              <p className="truncate text-[7px] font-semibold sm:text-[9px]">{formatMembershipDate(member.joinedAt)}</p>
            </div>
          </div>
          <p className="line-clamp-2 max-w-20 text-right text-[6px] leading-tight sm:max-w-32 sm:text-[8px]" style={{ color: settings.accentColor }}>{settings.footerMessage}</p>
        </footer>
      </div>
    </article>
  );
}
