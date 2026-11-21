import type { infer as Infer } from "zod";
import type { profileSchema } from "./validation.js";

type ProfilePatch = Infer<typeof profileSchema>;

export function profileUpdateFields(data: ProfilePatch) {
  const updates: Record<string, unknown> = {};
  if (data.name !== undefined) updates.name = data.name;
  for (const [field, value] of Object.entries(data.profile ?? {})) {
    updates[`profile.${field}`] = value;
  }
  return updates;
}
