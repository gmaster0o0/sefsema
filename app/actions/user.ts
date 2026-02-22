"use server";

import { z } from "zod";

import { getCurrentUser, hashPassword, verifyPassword } from "../lib/auth";
import { userRepo } from "../lib/store";

export type UserActionState = {
  ok: boolean;
  message: string;
};

const updateProfileSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  email: z.email().optional(),
  avatarUrl: z.string().nullable().optional(),
});

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function updateProfileAction(_prevState: UserActionState, formData: FormData): Promise<UserActionState> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { ok: false, message: "Not authenticated." };
  }

  const candidate = {
    username: getString(formData, "username") || undefined,
    email: getString(formData, "email") || undefined,
    avatarUrl: getString(formData, "avatarUrl") || null,
  };

  const parsed = updateProfileSchema.safeParse(candidate);
  if (!parsed.success) {
    return { ok: false, message: "Invalid input. Check username, email, and avatar URL." };
  }

  const updates: Partial<{ username: string; email: string; avatarUrl: string | null }> = {};
  if (parsed.data.username) updates.username = parsed.data.username;
  if (parsed.data.email) updates.email = parsed.data.email.toLowerCase();
  if (parsed.data.avatarUrl !== undefined) updates.avatarUrl = parsed.data.avatarUrl;

  const updated = await userRepo.updateUser(currentUser.id, updates);
  if (!updated) {
    return { ok: false, message: "Failed to update profile." };
  }

  return { ok: true, message: "Profile updated successfully." };
}

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8).max(128),
    newPassword: z.string().min(8).max(128),
    confirmPassword: z.string().min(8).max(128),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export async function changePasswordAction(_prevState: UserActionState, formData: FormData): Promise<UserActionState> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { ok: false, message: "Not authenticated." };
  }

  const candidate = {
    currentPassword: getString(formData, "currentPassword"),
    newPassword: getString(formData, "newPassword"),
    confirmPassword: getString(formData, "confirmPassword"),
  };

  const parsed = changePasswordSchema.safeParse(candidate);
  if (!parsed.success) {
    return { ok: false, message: "Invalid input. Check password requirements (minimum 8 characters)." };
  }

  // Get full user with passwordHash
  const user = await userRepo.getById(currentUser.id);
  if (!user) {
    return { ok: false, message: "User not found." };
  }

  // Verify current password
  const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!valid) {
    return { ok: false, message: "Current password is incorrect." };
  }

  // Check if new password is different from current
  if (parsed.data.currentPassword === parsed.data.newPassword) {
    return { ok: false, message: "New password must be different from current password." };
  }

  // Hash and update password
  const passwordHash = await hashPassword(parsed.data.newPassword);
  const updated = await userRepo.updateUser(currentUser.id, { passwordHash });
  if (!updated) {
    return { ok: false, message: "Failed to update password." };
  }

  return { ok: true, message: "Password changed successfully." };
}
