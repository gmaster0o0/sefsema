import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

import { sessionStore, toPublicUser, userRepo } from "./store";

const SESSION_COOKIE = "session";
const REFRESH_COOKIE = "refresh";

// Access token short TTL (15 minutes)
const ACCESS_TTL_MS = 1000 * 60 * 15;
// Refresh token TTL (7 days)
const REFRESH_TTL_MS = 1000 * 60 * 60 * 24 * 7;
// Remember-me refresh TTL (30 days)
const REMEMBER_REFRESH_TTL_MS = 1000 * 60 * 60 * 24 * 30;

export type SessionUser = ReturnType<typeof toPublicUser>;

function parseHash(hash: string): { salt: string; derivedKey: string } | null {
  const parts = hash.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") {
    return null;
  }

  return {
    salt: parts[1],
    derivedKey: parts[2],
  };
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${derivedKey}`;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const parsed = parseHash(hash);
  if (!parsed) {
    return false;
  }

  const derivedKey = scryptSync(password, parsed.salt, 64).toString("hex");
  const a = Buffer.from(parsed.derivedKey, "hex");
  const b = Buffer.from(derivedKey, "hex");
  if (a.length !== b.length) {
    return false;
  }

  return timingSafeEqual(a, b);
}

export async function createSession(userId: string, remember: boolean = false): Promise<void> {
  // Create short-lived access token and long-lived refresh token
  const accessToken = await sessionStore.create(userId, ACCESS_TTL_MS, "access", false);
  const refreshTtl = remember ? REMEMBER_REFRESH_TTL_MS : REFRESH_TTL_MS;
  const refreshToken = await sessionStore.create(userId, refreshTtl, "refresh", remember);

  const store = await cookies();
  store.set(SESSION_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: ACCESS_TTL_MS / 1000,
    path: "/",
  });
  store.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: refreshTtl / 1000,
    path: "/",
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const refresh = store.get(REFRESH_COOKIE)?.value;
  if (token) {
    await sessionStore.delete(token);
  }
  if (refresh) {
    await sessionStore.delete(refresh);
  }
  store.delete(SESSION_COOKIE);
  store.delete(REFRESH_COOKIE);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const session = await sessionStore.get(token);

  if (!session) {
    return null;
  }

  const user = await userRepo.getById(session.userId);

  if (!user) {
    return null;
  }

  return toPublicUser(user);
}

// Rotate refresh token and issue a new access token (and refresh token).
export async function refreshSession(): Promise<boolean> {
  const store = await cookies();
  const refresh = store.get(REFRESH_COOKIE)?.value;
  if (!refresh) return false;

  const session = await sessionStore.get(refresh);
  if (!session) return false;

  // determine refresh TTL based on remembered flag on stored session
  const refreshTtl = session.remember ? REMEMBER_REFRESH_TTL_MS : REFRESH_TTL_MS;

  // create new tokens and delete old refresh token (rotation)
  const accessToken = await sessionStore.create(session.userId, ACCESS_TTL_MS, "access", false);
  const newRefresh = await sessionStore.create(session.userId, refreshTtl, "refresh", !!session.remember);
  await sessionStore.delete(refresh);

  store.set(SESSION_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: ACCESS_TTL_MS / 1000,
    path: "/",
  });

  store.set(REFRESH_COOKIE, newRefresh, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: REFRESH_TTL_MS / 1000,
    path: "/",
  });

  return true;
}
