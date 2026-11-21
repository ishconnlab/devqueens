import { PlatformSettings } from "./models.js";
import { membershipCardSettingsSchema } from "./validation.js";

export const membershipCardSettingsKey = "membershipCard";

export const defaultMembershipCardSettings = membershipCardSettingsSchema.parse({
  organizationName: "DEVQUEENS",
  brandSubtitle: "An Initiative by IshConnect",
  slogan: "LEARN. BUILD. LEAD.",
  supportingDescription: "Empowering girls through technology, skills and innovation.",
  backgroundColor: "#29213F",
  secondaryColor: "#514477",
  accentColor: "#8B7BB8",
  highlightColor: "#F5C842",
  memberCategoryLabel: "DevQueens member",
  defaultMemberRole: "Technology learner",
  footerMessage: "IshConnect · DevQueens",
  logoUrl: "/devqueenslogo.png",
  qrCaption: "SCAN TO VIEW PROFILE",
});

export type MembershipCardSettings = typeof defaultMembershipCardSettings;

export async function getMembershipCardSettings(): Promise<MembershipCardSettings> {
  const record = await PlatformSettings.findOne({ key: membershipCardSettingsKey }).select("value").lean();
  if (!record) return { ...defaultMembershipCardSettings };
  const parsed = membershipCardSettingsSchema.safeParse(record.value);
  if (!parsed.success) throw new Error("Stored membership card settings are invalid. Reset them from Membership Card Settings.");
  return parsed.data;
}
