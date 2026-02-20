"use server";

import { z } from "zod";

import { createSession, destroySession, hashPassword, verifyPassword } from "../lib/auth";
import { memoryUserRepo } from "../lib/store";

export type AuthState = {
  ok: boolean;
  message: string;
};

const registerSchema = z
  .object({
    username: z.string().min(3).max(30),
    email: z.email(),
    password: z.string().min(8).max(128),
    confirmPassword: z.string().min(8).max(128),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(128),
});

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function registerAction(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const candidate = {
    username: getString(formData, "username"),
    email: getString(formData, "email").toLowerCase(),
    password: getString(formData, "password"),
    confirmPassword: getString(formData, "confirmPassword"),
  };

  const parsed = registerSchema.safeParse(candidate);
  if (!parsed.success) {
    return { ok: false, message: "Invalid input. Check username, email, password." };
  }

  const existingEmail = await memoryUserRepo.findByEmail(parsed.data.email);
  if (existingEmail) {
    return { ok: false, message: "Email already registered." };
  }

  const existingUsername = await memoryUserRepo.findByUsername(parsed.data.username);
  if (existingUsername) {
    return { ok: false, message: "Username already taken." };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await memoryUserRepo.createUser({
    username: parsed.data.username,
    email: parsed.data.email,
    role: "user",
    passwordHash,
  });

  await createSession(user.id);
  return { ok: true, message: "Registration complete. Session created." };
}

export async function loginAction(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const candidate = {
    email: getString(formData, "email").toLowerCase(),
    password: getString(formData, "password"),
  };

  const parsed = loginSchema.safeParse(candidate);
  if (!parsed.success) {
    return { ok: false, message: "Invalid login input." };
  }

  const user = await memoryUserRepo.findByEmail(parsed.data.email);
  if (!user) {
    return { ok: false, message: "Invalid email or password." };
  }

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) {
    return { ok: false, message: "Invalid email or password." };
  }

  await createSession(user.id);
  return { ok: true, message: "Signed in." };
}

export async function logoutAction(): Promise<void> {
  await destroySession();
}
