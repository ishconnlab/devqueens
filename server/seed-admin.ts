import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { config } from "./config.js";
import { User } from "./models.js";

async function seedAdmin() {
  if (!config.ADMIN_EMAIL || !config.ADMIN_PASSWORD) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD to create the initial administrator.");
  }
  await mongoose.connect(config.MONGODB_URI);
  const email = config.ADMIN_EMAIL.toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== "admin") throw new Error("ADMIN_EMAIL belongs to a non-administrator account.");
    console.info("The configured administrator already exists; no changes were made.");
    return;
  }
  await User.create({
    name: "DevQueens Administrator",
    email,
    passwordHash: await bcrypt.hash(config.ADMIN_PASSWORD, 12),
    role: "admin",
    status: "active",
  });
  console.info(`Administrator created for ${email}.`);
}

seedAdmin().catch((error) => {
  console.error("Failed to seed administrator:", error);
  process.exitCode = 1;
}).finally(async () => {
  await mongoose.disconnect();
});
