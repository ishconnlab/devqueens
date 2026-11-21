import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MembershipCardMember, MembershipCardSettings } from "@/lib/membershipCard";
import MembershipCardSettingsPage from "./MembershipCardSettingsPage";

const { mockApi } = vi.hoisted(() => ({ mockApi: vi.fn() }));
vi.mock("@/lib/api", () => ({ api: mockApi }));
vi.mock("qrcode", () => ({
  default: { toDataURL: vi.fn().mockResolvedValue("data:image/png;base64,qr") },
}));

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

const member: MembershipCardMember & { _id: string; profileUrl: string } = {
  _id: "member-1",
  name: "Amina N.",
  memberId: "DQ-2024-00000001",
  joinedAt: "2024-06-15T12:00:00.000Z",
  status: "active",
  profile: { bio: "Web developer" },
  profileUrl: "https://devqueens.example/members/DQ-2024-00000001",
};

describe("MembershipCardSettingsPage", () => {
  beforeEach(() => {
    mockApi.mockImplementation(async (path: string, options?: { method?: string; body?: MembershipCardSettings }) => {
      if (path === "/admin/membership-card-settings" && options?.method === "PUT") {
        return { settings: options.body };
      }
      if (path === "/admin/membership-card-settings") return { settings };
      if (path === "/admin/members") return { members: [member] };
      throw new Error(`Unexpected API request: ${path}`);
    });
  });

  it("previews a real member and saves only shared branding settings", async () => {
    render(<MembershipCardSettingsPage />);

    expect(await screen.findByRole("heading", { name: "Membership Card Settings" })).toBeInTheDocument();
    expect(await screen.findByRole("article", { name: "DEVQUEENS membership card for Amina N." })).toBeInTheDocument();
    expect(screen.getByText("DQ-2024-00000001")).toBeInTheDocument();

    fireEvent.change(screen.getByRole("textbox", { name: "Main slogan" }), {
      target: { value: "LEARN. CREATE. LEAD." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() => expect(mockApi).toHaveBeenCalledWith(
      "/admin/membership-card-settings",
      { method: "PUT", body: { ...settings, slogan: "LEARN. CREATE. LEAD." } },
    ));
    expect(screen.getByText("DQ-2024-00000001")).toBeInTheDocument();
  });
});
