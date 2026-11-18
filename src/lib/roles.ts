import type { Payload } from "payload"

import type { Role, User } from "@/payload-types"
import {
  hasRolePermission,
  normalizePermissionActions,
  type PermissionAction,
  type PermissionResourceId,
  type RolePermission,
} from "./permissions"

export type RoleOption = {
  id: string
  name: string
  slug: string
  description: string | null
  isSuperAdmin: boolean
  isDefault: boolean
  priority: number
  permissions: RolePermission[]
}

export type ResolvedActor = {
  user: User
  role: Role | null
}

export function normalizeRolePermissions(
  role: Role | null | undefined
): RolePermission[] {
  return (role?.permissions ?? [])
    .map((permission) => ({
      resource: permission.resource as PermissionResourceId,
      actions: normalizePermissionActions(permission),
    }))
    .filter((permission) => permission.actions.length > 0)
}

export function toRoleOption(role: Role): RoleOption {
  return {
    id: String(role.id),
    name: role.name,
    slug: role.slug,
    description: role.description ?? null,
    isSuperAdmin: Boolean(role.isSuperAdmin),
    isDefault: Boolean(role.isDefault),
    priority: role.priority ?? 0,
    permissions: normalizeRolePermissions(role),
  }
}

export function isActiveUser(
  user: Pick<User, "status"> | null | undefined
): boolean {
  return (user?.status ?? "active") === "active"
}

export function roleHasPermission(
  role: Role | null | undefined,
  resource: string,
  action: PermissionAction
): boolean {
  if (!role) return false
  if (role.isSuperAdmin) return true

  return hasRolePermission(role.permissions, resource, action)
}

export function roleHasAnyPermission(
  role: Role | null | undefined,
  resource: string,
  actions: readonly PermissionAction[]
): boolean {
  if (!role) return false
  if (role.isSuperAdmin) return true

  return actions.some((action) =>
    hasRolePermission(role.permissions, resource, action)
  )
}

/**
 * Whether an actor role may manage a target role. Super admins may manage
 * everything. Everyone else may only manage strictly lower priority roles.
 */
export function canManageTarget(
  actorRole: Role | null | undefined,
  targetRole: Role | null | undefined
): boolean {
  if (!actorRole) return false
  if (actorRole.isSuperAdmin) return true
  if (!targetRole) return false
  if (targetRole.isSuperAdmin) return false

  return (targetRole.priority ?? 0) < (actorRole.priority ?? 0)
}

export async function findRoleById(
  payload: Payload,
  id: string | number
): Promise<Role | null> {
  try {
    return (await payload.findByID({
      collection: "roles",
      id: String(id),
      depth: 0,
      overrideAccess: true,
    })) as Role
  } catch {
    return null
  }
}

export async function findRoleBySlug(
  payload: Payload,
  slug: string
): Promise<Role | null> {
  const result = await payload.find({
    collection: "roles",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  return (result.docs[0] as Role | undefined) ?? null
}

export async function getDefaultRole(
  payload: Payload
): Promise<Role | null> {
  const flagged = await payload.find({
    collection: "roles",
    where: { isDefault: { equals: true } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (flagged.docs[0]) return flagged.docs[0] as Role

  const fallback = await payload.find({
    collection: "roles",
    sort: "priority",
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  return (fallback.docs[0] as Role | undefined) ?? null
}

/**
 * Resolves a role reference (populated document, id or legacy slug) to the
 * current role document from the database.
 */
export async function resolveRoleDoc(
  payload: Payload,
  role: unknown
): Promise<Role | null> {
  if (!role) return null
  if (typeof role === "object") return role as Role

  if (typeof role === "string" || typeof role === "number") {
    const byId = await findRoleById(payload, role)
    if (byId) return byId

    if (typeof role === "string") {
      return findRoleBySlug(payload, role)
    }
  }

  return null
}

/**
 * Loads the actor and its role fresh from the database on every call so
 * permission changes apply immediately, without relying on JWT claims.
 */
export async function resolveActor(
  payload: Payload,
  user: User | null | undefined
): Promise<ResolvedActor | null> {
  if (!user) return null

  const fresh = (await payload.findByID({
    collection: "users",
    id: user.id,
    depth: 0,
    overrideAccess: true,
  })) as User

  const role = await resolveRoleDoc(payload, fresh.role)

  return { user: fresh, role }
}

export async function countSuperAdminRoles(payload: Payload): Promise<number> {
  const result = await payload.count({
    collection: "roles",
    where: { isSuperAdmin: { equals: true } },
    overrideAccess: true,
  })

  return result.totalDocs
}

export async function countSuperAdminUsers(payload: Payload): Promise<number> {
  const roles = await payload.find({
    collection: "roles",
    where: { isSuperAdmin: { equals: true } },
    limit: 100,
    depth: 0,
    overrideAccess: true,
  })

  if (roles.docs.length === 0) return 0

  const result = await payload.count({
    collection: "users",
    where: { role: { in: roles.docs.map((role) => role.id) } },
    overrideAccess: true,
  })

  return result.totalDocs
}
