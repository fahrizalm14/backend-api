export const APP_ROLES = ['admin', 'member'] as const;

export type AppRole = (typeof APP_ROLES)[number];

export function isAppRole(value: unknown): value is AppRole {
  return typeof value === 'string' && APP_ROLES.includes(value as AppRole);
}

export function mapDbRoleToAppRole(role: string): AppRole {
  return role.toLowerCase() === 'admin' ? 'admin' : 'member';
}
