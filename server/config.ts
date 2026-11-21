import "dotenv/config";
import { z } from "zod";

const optionalString = z.preprocess((value) => value === "" ? undefined : value, z.string().optional());
export const configSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  MONGODB_URI: z.string().default("mongodb://127.0.0.1:27017/devqueens"),
  JWT_SECRET: z.string().min(32).default("development-only-change-this-secret-32"),
  CLIENT_ORIGIN: z.string().url().default("https://devqueens.ishconnect.rw"),
  APP_URL: z.string().url().default("https://devqueens.ishconnect.rw"),
  CLOUDINARY_CLOUD_NAME: optionalString,
  CLOUDINARY_API_KEY: optionalString,
  CLOUDINARY_API_SECRET: optionalString,
  CERTIFICATE_SIGNER_NAME: z.string().default("IshConnect Programme Director"),
  CERTIFICATE_SIGNER_TITLE: z.string().default("Authorized Signatory, IshConnect"),
  ADMIN_EMAIL: z.preprocess((value) => value === "" ? undefined : value, z.string().email().optional()),
  ADMIN_PASSWORD: optionalString,
  ADMIN_REGISTRATION_CODE: optionalString,
});

export const config = configSchema.parse(process.env);
export const isProduction = config.NODE_ENV === "production";

export function requireAdminPassword(password = config.ADMIN_PASSWORD) {
  if (!password) {
    throw new Error("Set ADMIN_PASSWORD before running the administrator seed or password-reset command.");
  }
  if (password.length < 12) {
    throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
  }
  return password;
}

if (isProduction && !process.env.MONGODB_URI?.trim()) {
  throw new Error("MONGODB_URI is required in production. Set it in the Render service Environment settings to a reachable MongoDB connection string.");
}

if (isProduction && config.JWT_SECRET.startsWith("development-only")) {
  throw new Error("JWT_SECRET must be set to a secure random value in production.");
}
