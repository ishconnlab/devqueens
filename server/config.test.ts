import { describe, expect, it } from "vitest";
import { configSchema, requireAdminPassword } from "./config.js";

describe("administrator seed configuration", () => {
  it("allows a short seed-only password without preventing API configuration from loading", () => {
    expect(configSchema.parse({ ADMIN_PASSWORD: "short" }).ADMIN_PASSWORD).toBe("short");
  });

  it("requires a strong password when running seed or reset commands", () => {
    expect(() => requireAdminPassword("short")).toThrow("ADMIN_PASSWORD must be at least 12 characters.");
    expect(requireAdminPassword("SecurePassword123")).toBe("SecurePassword123");
  });
});
