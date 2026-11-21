import { render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ADMIN_NAVIGATION } from "@/lib/adminNavigation";

const expectedHeadings: Record<(typeof ADMIN_NAVIGATION)[number]["content"], string> = {
  overview: "Good morning, team",
  members: "Girls & members",
  inbox: "Message inbox",
  enrollments: "Course enrollments",
  courses: "Courses & lessons",
  assessments: "Assessment reviews",
  certificates: "Certificates",
  team: "Team",
  badge: "Badges",
  alumni: "Alumni",
  achiever: "Top achievers",
  partner: "Partners",
  gallery: "Gallery",
  testimonial: "Testimonials",
  reports: "Reports",
  settings: "Settings",
  "membership-card-settings": "Membership Card Settings",
};

const cardSettings = vi.hoisted(() => ({
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
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "admin-1", name: "DevQueens Admin", email: "admin@example.org", role: "admin" },
    loading: false,
    error: "",
    logout: vi.fn(),
  }),
}));

vi.mock("@/lib/api", () => ({
  api: vi.fn(async (path: string) => {
    if (path === "/admin/members") return { members: [] };
    if (path === "/admin/content/badge") return { items: [] };
    if (path === "/admin/stats") return { stats: { members: 0, activeCourses: 0, enrollments: 0, certificates: 0, pendingAssessments: 0 } };
    if (path === "/admin/enrollments") return { enrollments: [] };
    if (path === "/admin/courses") return { courses: [] };
    if (path === "/admin/assessments") return { attempts: [] };
    if (path === "/admin/certificates") return { certificates: [] };
    if (path === "/admin/reports") return { reports: { monthlyMembers: [], courseEnrollments: [], assessments: [] } };
    if (path === "/admin/inbox") return { threads: [] };
    if (path === "/admin/inbox/broadcasts") return { messages: [] };
    if (path === "/admin/settings") return { settings: {}, adminAccountCreationUsed: false };
    if (path === "/admin/membership-card-settings") return { settings: cardSettings };
    if (path === "/community-link") return { url: "https://chat.whatsapp.com/example", enabled: true };
    if (path.startsWith("/admin/content/")) return { items: [] };
    return {};
  }),
}));

import AdminPortal from "./AdminPortal";

describe("AdminPortal", () => {
  for (const page of ADMIN_NAVIGATION) {
    it(`opens ${page.label} at ${page.href}`, async () => {
      render(
        <MemoryRouter initialEntries={[page.href]}>
          <Routes>
            <Route path="/admin/*" element={<AdminPortal />} />
          </Routes>
        </MemoryRouter>,
      );

      expect(await screen.findByRole("heading", { name: expectedHeadings[page.content] })).toBeInTheDocument();
      expect(screen.queryByRole("heading", { name: "Administration page not found" })).not.toBeInTheDocument();
    });
  }

  it("shows a shortcut for every admin page on the overview", async () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route path="/admin/*" element={<AdminPortal />} />
        </Routes>
      </MemoryRouter>,
    );

    await screen.findByRole("heading", { name: expectedHeadings.overview });
    const heading = screen.getByRole("heading", { name: "Manage the platform" });
    const manageSection = heading.parentElement;
    if (!manageSection) throw new Error("The overview quick-link section was not rendered.");
    const links = within(manageSection).getAllByRole("link");
    expect(links).toHaveLength(ADMIN_NAVIGATION.length - 1);
    for (const page of ADMIN_NAVIGATION.filter(({ content }) => content !== "overview")) {
      expect(links.some((link) => link.getAttribute("href") === page.href)).toBe(true);
    }
  });
});
