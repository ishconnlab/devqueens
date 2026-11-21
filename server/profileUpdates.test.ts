import { describe, expect, it } from "vitest";
import { profileUpdateFields } from "./profileUpdates.js";
import { profileSchema } from "./validation.js";

describe("profile updates", () => {
  it("updates only submitted profile fields so an existing photo remains unchanged", () => {
    const data = profileSchema.parse({
      name: "Amina N.",
      profile: { bio: "Learning web development", interests: ["Web development"] },
    });

    expect(profileUpdateFields(data)).toEqual({
      name: "Amina N.",
      "profile.bio": "Learning web development",
      "profile.interests": ["Web development"],
    });
  });
});
