import type { DashboardRole } from "@/config/dashboard-nav"
import type { User } from "@/payload-types"

export type UserStatus = "active" | "suspended" | "pending"

export type DashboardUser = {
  id: string
  name: string
  email: string
  role: DashboardRole
  status: UserStatus
  joined: string
}

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export function toDashboardUser(user: User): DashboardUser {
  return {
    id: String(user.id),
    name: user.name?.trim() || user.email,
    email: user.email,
    role: (user.role as DashboardRole | null | undefined) ?? "user",
    status: (user.status as UserStatus | null | undefined) ?? "active",
    joined: user.createdAt,
  }
}
