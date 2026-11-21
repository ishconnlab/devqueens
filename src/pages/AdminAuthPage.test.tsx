import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockApi } = vi.hoisted(() => ({ mockApi: vi.fn() }));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    adminLogin: vi.fn(),
    adminRegister: vi.fn(),
    error: "",
  }),
}));

vi.mock("@/lib/api", () => ({ api: mockApi }));
vi.mock("@/lib/seo", () => ({ updateSeo: vi.fn() }));

import AdminLoginPage from "./AdminAuthPage";

describe("AdminLoginPage", () => {
  beforeEach(() => {
    mockApi.mockReset();
  });

  it("opens registration from the registration URL and requires the invite code", async () => {
    mockApi.mockResolvedValue({
      adminRegistrationOpen: true,
      adminRegistrationRequiresCode: true,
      firstAdministrator: true,
    });

    render(
      <MemoryRouter initialEntries={["/admin?mode=register"]}>
        <AdminLoginPage />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: "Register an administrator" })).toBeInTheDocument();
    expect(await screen.findByRole("textbox", { name: /Registration code/ })).toHaveAttribute("minlength", "32");
  });

  it("keeps registration closed when availability cannot be checked", async () => {
    mockApi.mockRejectedValue(new Error("API unavailable"));

    render(
      <MemoryRouter initialEntries={["/admin?mode=register"]}>
        <AdminLoginPage />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("alert")).toHaveTextContent("Could not check administrator registration availability");
    expect(screen.queryByLabelText("Registration code")).not.toBeInTheDocument();
  });

  it("explains how to bootstrap when no administrator or invitation code is configured", async () => {
    mockApi.mockResolvedValue({
      adminRegistrationOpen: false,
      adminRegistrationRequiresCode: false,
      firstAdministrator: true,
    });

    render(
      <MemoryRouter initialEntries={["/admin?mode=register"]}>
        <AdminLoginPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText(/Configure a 32-character ADMIN_REGISTRATION_CODE/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Registration code/)).not.toBeInTheDocument();
  });
});
