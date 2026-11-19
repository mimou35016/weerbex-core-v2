/**
 * Central permission catalog for the Strapi-style RBAC engine.
 *
 * Every module/collection in the platform is described here together with the
 * exact actions that can be granted on it. The Payload `roles` collection
 * stores grants as `{ resource, actions[] }` entries, and both the backend
 * access hooks and the dashboard UI resolve permissions from this catalog.
 */

import { qrCardHubPermissionResources } from "@/apps/qr-card-hub/permissions"

/**
 * Current permission grant schema version. Bumped whenever new resources or
 * actions are introduced so existing roles receive one-time defaults without
 * overriding grants the super admin edited afterwards.
 */
export const PERMISSIONS_VERSION = 6

export type PermissionAction =
  | "find"
  | "read"
  | "create"
  | "update"
  | "delete"
  | "export"
  | "publish"
  | "configure"

export const permissionActionIds = [
  "find",
  "read",
  "create",
  "update",
  "delete",
  "export",
  "publish",
  "configure",
] as const

export type PermissionGroup = "core" | "settings" | "apps" | "system"

export const permissionResourceIds = [
  "users",
  "roles",
  "audit",
  "appsHub",
  "docs",
  "settings",
  "seo",
  "security",
  "localization",
  "notifications",
  "storage",
  "media",
  "qrCardHub",
  "qrCodes",
  "digitalCards",
] as const

export type PermissionResourceId = (typeof permissionResourceIds)[number]

export type PermissionResource = {
  id: PermissionResourceId
  /** Key relative to the `Dashboard` namespace. */
  labelKey: string
  group: PermissionGroup
  actions: readonly PermissionAction[]
}

const editable: readonly PermissionAction[] = ["find", "read", "update"]
const crud: readonly PermissionAction[] = [
  "find",
  "read",
  "create",
  "update",
  "delete",
]
const crudExport: readonly PermissionAction[] = [...crud, "export"]

/**
 * The complete resource matrix. New collections or mini-apps only need an
 * entry here (plus translation keys) to become permission-aware everywhere.
 */
export const permissionResources: PermissionResource[] = [
  {
    id: "users",
    labelKey: "roles.resources.users",
    group: "core",
    actions: [...crudExport],
  },
  {
    id: "roles",
    labelKey: "roles.resources.roles",
    group: "core",
    actions: [...crud],
  },
  {
    id: "audit",
    labelKey: "roles.resources.audit",
    group: "core",
    actions: ["find", "read", "export"],
  },
  {
    id: "appsHub",
    labelKey: "roles.resources.appsHub",
    group: "core",
    actions: ["find", "read", "configure"],
  },
  {
    id: "docs",
    labelKey: "roles.resources.docs",
    group: "core",
    actions: ["find", "read"],
  },
  {
    id: "settings",
    labelKey: "roles.resources.settings",
    group: "settings",
    actions: [...editable],
  },
  {
    id: "seo",
    labelKey: "roles.resources.seo",
    group: "settings",
    actions: ["find", "read", "create", "update", "delete", "publish"],
  },
  {
    id: "security",
    labelKey: "roles.resources.security",
    group: "settings",
    actions: [...editable],
  },
  {
    id: "localization",
    labelKey: "roles.resources.localization",
    group: "settings",
    actions: [...editable],
  },
  {
    id: "notifications",
    labelKey: "roles.resources.notifications",
    group: "settings",
    actions: [...editable],
  },
  {
    id: "storage",
    labelKey: "roles.resources.storage",
    group: "settings",
    actions: [...editable],
  },
  {
    id: "media",
    labelKey: "roles.resources.media",
    group: "system",
    actions: [...crud],
  },
  ...qrCardHubPermissionResources,
]

export type RolePermission = {
  resource: PermissionResourceId
  actions: PermissionAction[]
}

/**
 * Loosely typed grant that also understands the previous boolean shape so
 * existing databases can be migrated without losing their grants.
 */
export type PermissionLike = {
  resource: string
  actions?: readonly (string | null)[] | null
  read?: boolean | null
  write?: boolean | null
  delete?: boolean | null
}

export type PermissionSet = Record<
  string,
  Record<PermissionAction, boolean>
>

export function getPermissionResource(
  resource: string
): PermissionResource | undefined {
  return permissionResources.find((entry) => entry.id === resource)
}

export function getResourceActions(
  resource: string
): readonly PermissionAction[] {
  return getPermissionResource(resource)?.actions ?? []
}

export function isPermissionAction(
  value: unknown
): value is PermissionAction {
  return (
    typeof value === "string" &&
    (permissionActionIds as readonly string[]).includes(value)
  )
}

/**
 * Normalizes a stored grant to a unique list of valid actions. Grants saved by
 * the previous boolean schema are converted on the fly:
 * `read` → find + read, `write` → create + update, `delete` → delete.
 */
export function normalizePermissionActions(
  permission: PermissionLike
): PermissionAction[] {
  if (Array.isArray(permission.actions)) {
    return Array.from(
      new Set(
        permission.actions.filter((action): action is PermissionAction =>
          isPermissionAction(action)
        )
      )
    )
  }

  const legacy: PermissionAction[] = []

  if (permission.read) legacy.push("find", "read")
  if (permission.write) legacy.push("create", "update")
  if (permission.delete) legacy.push("delete")

  return Array.from(new Set(legacy))
}

export function emptyPermissionSet(): PermissionSet {
  return Object.fromEntries(
    permissionResources.map((resource) => [
      resource.id,
      Object.fromEntries(
        permissionActionIds.map((action) => [action, false])
      ) as Record<PermissionAction, boolean>,
    ])
  )
}

export function fullPermissionSet(): PermissionSet {
  return Object.fromEntries(
    permissionResources.map((resource) => [
      resource.id,
      Object.fromEntries(
        permissionActionIds.map((action) => [
          action,
          resource.actions.includes(action),
        ])
      ) as Record<PermissionAction, boolean>,
    ])
  )
}

export function toPermissionSet(
  permissions: readonly PermissionLike[] | null | undefined
): PermissionSet {
  const set = emptyPermissionSet()

  for (const permission of permissions ?? []) {
    if (!permission?.resource) continue
    if (!(permission.resource in set)) continue

    const actions = normalizePermissionActions(permission)
    const row = set[permission.resource]

    for (const action of actions) {
      row[action] = true
    }
  }

  return set
}

/**
 * Serializes the UI matrix back into the stored grant shape, dropping empty
 * resources and actions the resource does not support.
 */
export function toRolePermissions(matrix: PermissionSet): RolePermission[] {
  return permissionResources
    .map((resource) => ({
      resource: resource.id,
      actions: resource.actions.filter(
        (action) => matrix[resource.id]?.[action]
      ),
    }))
    .filter((permission) => permission.actions.length > 0)
}

export function hasRolePermission(
  permissions: readonly PermissionLike[] | null | undefined,
  resource: string,
  action: PermissionAction
): boolean {
  const permission = (permissions ?? []).find(
    (entry) => entry.resource === resource
  )

  if (!permission) return false

  return normalizePermissionActions(permission).includes(action)
}

/**
 * Super admin roles carry the absolute flag and bypass individual grants.
 * Every other check is resolved from the role's live permission list.
 */
export function hasPermission(
  user:
    | {
        isSuperAdmin?: boolean | null
        permissions?: readonly PermissionLike[] | null
      }
    | null
    | undefined,
  resource: string,
  action: PermissionAction
): boolean {
  if (!user) return false
  if (user.isSuperAdmin) return true

  return hasRolePermission(user.permissions, resource, action)
}

export function hasAnyPermission(
  user:
    | {
        isSuperAdmin?: boolean | null
        permissions?: readonly PermissionLike[] | null
      }
    | null
    | undefined,
  resource: string,
  actions: readonly PermissionAction[]
): boolean {
  if (!user) return false
  if (user.isSuperAdmin) return true

  return actions.some((action) =>
    hasRolePermission(user.permissions, resource, action)
  )
}
