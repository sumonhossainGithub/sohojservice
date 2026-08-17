import { SignJWT, jwtVerify } from "jose";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "PROFESSIONAL" | "ADMIN";
};

const COOKIE_NAME = "sohoj_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
const DEFAULT_AUTH_SECRET = "cdcc4251ade2ef5d0f28464bd4525059";

function getSecretKey() {
  const secret = process.env.AUTH_SECRET || DEFAULT_AUTH_SECRET;
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(
  token: string
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return {
      id: payload.id as string,
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as SessionUser["role"],
    };
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = COOKIE_NAME;
export const SESSION_MAX_AGE = MAX_AGE_SECONDS;
