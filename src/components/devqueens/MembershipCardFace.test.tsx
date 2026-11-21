import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MembershipCardFace from "./MembershipCardFace";
import type { MembershipCardMember, MembershipCardSettings } from "@/lib/membershipCard";

const member: MembershipCardMember = {
  name: "Amina N.",
  memberId: "DQ-2024-00000001",
  joinedAt: "2024-06-15T12:00:00.000Z",
  status: "active",
  profile: { bio: "Web developer and technology mentor" },
};

const settings: MembershipCardSettings = {
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
  logoUrl: "",
  qrCaption: "SCAN TO VIEW PROFILE",
};

describe("MembershipCardFace", () => {
  it("renders editable branding alongside the member's dynamic identity and QR code", () => {
    const qrDataUrl = "data:image/png;base64,qr";
    render(<MembershipCardFace member={member} settings={settings} qrDataUrl={qrDataUrl} />);

    const card = screen.getByRole("article", { name: "DEVQUEENS membership card for Amina N." });
    expect(card).toHaveStyle({ backgroundColor: "#29213F" });
    expect(screen.getByText("LEARN. BUILD. LEAD.")).toBeInTheDocument();
    expect(screen.getByText("Empowering girls through technology, skills and innovation.")).toBeInTheDocument();
    expect(screen.getByText("Web developer and technology mentor")).toBeInTheDocument();
    expect(screen.getByText("DQ-2024-00000001")).toBeInTheDocument();
    expect(screen.getByText("June 2024")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "QR code for Amina N.'s profile" })).toHaveAttribute("src", qrDataUrl);
  });

  it("keeps unavailable member status explicit and provides an initials fallback", () => {
    render(<MembershipCardFace member={{ name: "Amina N." }} settings={settings} qrDataUrl="" />);

    expect(screen.getByText("STATUS UNAVAILABLE")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Amina N. initials" })).toHaveTextContent("A");
    expect(screen.getByText("QR unavailable")).toBeInTheDocument();
  });
});
