import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

import { memorySessionStore, toPublicUser, userRepo } from "./store";

const SESSION_COOKIE = "session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

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

export async function createSession(userId: string): Promise<void> {
  const token = memorySessionStore.create(userId, SESSION_TTL_MS);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: SESSION_TTL_MS / 1000,
    path: "/",
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    memorySessionStore.delete(token);
  }
  store.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const session = memorySessionStore.get(token);

  if (!session) {
    return null;
  }

  const user = await userRepo.getById(session.userId);

  if (!user) {
    return null;
  }

  return toPublicUser(user);
}
