import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dhamma-secret-key-change-in-production";

export interface JWTPayload {
  userId: string;
  idPassportNumber: string;
  role: string;
  name: string;
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function getUserFromCookie(cookieHeader: string | null): JWTPayload | null {
  if (!cookieHeader) return null;
  const tokenCookie = cookieHeader.split(";").find((c) => c.trim().startsWith("dhamma_token="));
  if (!tokenCookie) return null;
  const token = tokenCookie.split("=")[1];
  return verifyToken(token);
}
