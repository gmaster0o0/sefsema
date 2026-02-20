export const permissions = ["user:read", "user:write", "admin:manage"] as const;

export type Permission = (typeof permissions)[number];

export const roles = ["admin", "moderator", "user"] as const;

export type Role = (typeof roles)[number];

const rolePermissions: Record<Role, Permission[]> = {
  admin: ["user:read", "user:write", "admin:manage"],
  moderator: ["user:read"],
  user: ["user:read"],
};

export function roleHasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role].includes(permission);
}
