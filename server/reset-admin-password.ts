import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { config, requireAdminPassword } from "./config.js";
import { User } from "./models.js";

async function resetAdminPassword() {
  if (!config.ADMIN_EMAIL) throw new Error("Set ADMIN_EMAIL to reset the administrator password.");
  const password = requireAdminPassword();

  await mongoose.connect(config.MONGODB_URI);
  const email = config.ADMIN_EMAIL.toLowerCase();
  const user = await User.findOne({ email }).select("+passwordHash");

  if (!user) {
    throw new Error("No account exists for ADMIN_EMAIL.");
  }
  if (user.role !== "admin") {
    throw new Error("ADMIN_EMAIL belongs to a non-administrator account.");
  }

  user.passwordHash = await bcrypt.hash(password, 12);
  await user.save();
  console.info(`Administrator password reset for ${email}.`);
}

resetAdminPassword().catch((error) => {
  console.error("Failed to reset administrator password:", error);
  process.exitCode = 1;
}).finally(async () => {
  await mongoose.disconnect();
});
