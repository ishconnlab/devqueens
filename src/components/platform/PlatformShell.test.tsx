import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "@/contexts/AuthContext";
import { PlatformShell } from "./PlatformShell";

const { mockApi } = vi.hoisted(() => ({ mockApi: vi.fn() }));
vi.mock("@/lib/api", () => ({
  api: mockApi,
  ApiError: class ApiError extends Error {
    constructor(message: string, public readonly status: number) {
      super(message);
    }
  },
}));

describe("PlatformShell sign out", () => {
  let resolveLogout: (() => void) | undefined;

  beforeEach(() => {
    resolveLogout = undefined;
    mockApi.mockImplementation((path: string) => {
      if (path === "/auth/me") {
        return Promise.resolve({
          user: { id: "member-1", name: "Amina N.", email: "amina@example.org", role: "member" },
        });
      }
      if (path === "/auth/logout") {
        return new Promise<void>((resolve) => { resolveLogout = resolve; });
      }
      return Promise.reject(new Error(`Unexpected API request: ${path}`));
    });
  });

  it("returns home immediately while the server logout request is still pending", async () => {
    render(
      <MemoryRouter initialEntries={["/portal"]}>
        <AuthProvider>
          <Routes>
            <Route path="/portal" element={<PlatformShell><p>Private portal</p></PlatformShell>} />
            <Route path="/" element={<p>Home page</p>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Amina N.")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "Sign out" })[0]);

    expect(await screen.findByText("Home page")).toBeInTheDocument();
    expect(mockApi).toHaveBeenCalledWith("/auth/logout", { method: "POST" });
    resolveLogout?.();
  });
});
