export interface MembershipCardSettings {
  organizationName: string;
  brandSubtitle: string;
  slogan: string;
  supportingDescription: string;
  backgroundColor: string;
  secondaryColor: string;
  accentColor: string;
  highlightColor: string;
  memberCategoryLabel: string;
  defaultMemberRole: string;
  footerMessage: string;
  logoUrl: string;
  qrCaption: string;
}

export interface MembershipCardMember {
  name: string;
  memberId?: string;
  joinedAt?: string;
  status?: "active" | "suspended";
  profile?: {
    bio?: string;
    photoUrl?: string;
    interests?: string[];
  };
}

export const MEMBERSHIP_CARD_COLORS = [
  { value: "#29213F", label: "Deep aubergine purple" },
  { value: "#514477", label: "Muted purple" },
  { value: "#8B7BB8", label: "Lavender" },
  { value: "#F5C842", label: "Gold" },
  { value: "#FFFFFF", label: "White" },
] as const;

export const membershipCardCircuitPaths = [
  [[0, 120], [18, 120], [38, 140], [70, 140], [88, 158]],
  [[0, 360], [22, 360], [42, 380], [72, 380], [94, 402]],
  [[0, 618], [18, 618], [40, 640], [70, 640], [90, 660]],
  [[930, 0], [930, 26], [978, 26], [1002, 2]],
  [[1030, 0], [1030, 16], [1080, 16], [1100, 36], [1150, 36], [1186, 0]],
  [[1200, 80], [1168, 80], [1148, 60], [1115, 60], [1096, 42]],
  [[1200, 138], [1176, 138], [1150, 112], [1150, 76]],
  [[0, 610], [34, 610], [60, 636], [120, 636], [142, 658]],
  [[0, 690], [44, 690], [68, 714], [132, 714], [155, 737]],
  [[78, 757], [78, 729], [98, 708], [98, 670], [126, 642]],
  [[0, 558], [18, 558], [36, 576], [56, 576]],
] as const;

export function formatMembershipDate(joinedAt?: string) {
  if (!joinedAt) return "Unavailable";
  const date = new Date(joinedAt);
  if (Number.isNaN(date.getTime())) return "Unavailable";
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(date);
}
