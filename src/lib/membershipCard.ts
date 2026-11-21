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

export function formatMembershipDate(joinedAt?: string) {
  if (!joinedAt) return "Unavailable";
  const date = new Date(joinedAt);
  if (Number.isNaN(date.getTime())) return "Unavailable";
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(date);
}
