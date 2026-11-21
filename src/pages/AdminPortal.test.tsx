import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

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
    if (path === "/admin/settings") return { settings: {}, adminAccountCreationUsed: false };
    if (path === "/community-link") return { url: "https://chat.whatsapp.com/example", enabled: true };
    return {};
  }),
}));

import AdminPortal from "./AdminPortal";

describe("AdminPortal", () => {
  it("renders the section matching the admin URL", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/members"]}>
        <Routes>
          <Route path="/admin/*" element={<AdminPortal />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: "Girls & members" })).toBeInTheDocument();
  });

  it("renders settings instead of the overview at /admin/settings", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/settings"]}>
        <Routes>
          <Route path="/admin/*" element={<AdminPortal />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: "Settings" })).toBeInTheDocument();
  });
});
