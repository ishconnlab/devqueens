import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config, isProduction } from "./config.js";
import { User } from "./models.js";

export interface AuthenticatedRequest extends Request {
  user?: { id: string; role: "member" | "admin"; status: "active" | "suspended" };
}

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
  path: "/api",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export function setAuthCookie(res: Response, user: { id: string; role: string }) {
  const token = jwt.sign({ sub: user.id, role: user.role }, config.JWT_SECRET, { expiresIn: "7d" });
  res.cookie("dq_session", token, cookieOptions);
}

export function clearAuthCookie(res: Response) {
  res.clearCookie("dq_session", { ...cookieOptions, maxAge: undefined });
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.dq_session;
  if (!token) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }
  try {
    const payload = jwt.verify(token, config.JWT_SECRET) as jwt.JwtPayload;
    const user = await User.findById(payload.sub).select("role status");
    if (!user || user.status !== "active") {
      clearAuthCookie(res);
      res.status(401).json({ error: "Your session is no longer active." });
      return;
    }
    req.user = { id: user.id, role: user.role, status: user.status };
    next();
  } catch {
    clearAuthCookie(res);
    res.status(401).json({ error: "Your session has expired. Please sign in again." });
  }
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== "admin") {
    res.status(403).json({ error: "Administrator access is required." });
    return;
  }
  next();
}
