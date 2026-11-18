import type { Role, User } from "@/payload-types"
import type { RolePermission } from "./permissions"
import { normalizeRolePermissions } from "./roles"

export type UserStatus = "active" | "suspended" | "pending"

export type DashboardUser = {
  id: string
  name: string
  email: string
  /** Dynamic role slug resolved from the Payload `roles` collection. */
  role: string
  roleId: string | null
  roleName: string
  rolePriority: number
  isSuperAdmin: boolean
  permissions: RolePermission[]
  status: UserStatus
  joined: string
}

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export function toDashboardUser(user: User): DashboardUser {
  const roleRef = user.role
  const role =
    roleRef && typeof roleRef === "object" ? (roleRef as Role) : null
  const roleId = role
    ? String(role.id)
    : typeof roleRef === "string"
      ? roleRef
      : null

  return {
    id: String(user.id),
    name: user.name?.trim() || user.email,
    email: user.email,
    role: role?.slug ?? "user",
    roleId,
    roleName: role?.name ?? "User",
    rolePriority: role?.priority ?? 0,
    isSuperAdmin: Boolean(role?.isSuperAdmin),
    permissions: normalizeRolePermissions(role),
    status: (user.status as UserStatus | null | undefined) ?? "active",
    joined: user.createdAt,
  }
}
