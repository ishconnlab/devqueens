import "dotenv/config";
import { z } from "zod";

const optionalString = z.preprocess((value) => value === "" ? undefined : value, z.string().optional());
const configSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  MONGODB_URI: z.string().default("mongodb://127.0.0.1:27017/devqueens"),
  JWT_SECRET: z.string().min(32).default("development-only-change-this-secret-32"),
  CLIENT_ORIGIN: z.string().url().default("http://localhost:8080"),
  APP_URL: z.string().url().default("http://localhost:8080"),
  CLOUDINARY_CLOUD_NAME: optionalString,
  CLOUDINARY_API_KEY: optionalString,
  CLOUDINARY_API_SECRET: optionalString,
  CERTIFICATE_SIGNER_NAME: z.string().default("IshConnect Programme Director"),
  CERTIFICATE_SIGNER_TITLE: z.string().default("Authorized Signatory, IshConnect"),
  ADMIN_EMAIL: z.preprocess((value) => value === "" ? undefined : value, z.string().email().optional()),
  ADMIN_PASSWORD: z.preprocess((value) => value === "" ? undefined : value, z.string().min(12).optional()),
});

export const config = configSchema.parse(process.env);
export const isProduction = config.NODE_ENV === "production";

if (isProduction && config.JWT_SECRET.startsWith("development-only")) {
  throw new Error("JWT_SECRET must be set to a secure random value in production.");
}
