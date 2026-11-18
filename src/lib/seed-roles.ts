import type { Payload } from "payload"

import type { Role } from "@/payload-types"
import {
  getPermissionResource,
  normalizePermissionActions,
  permissionResources,
  PERMISSIONS_VERSION,
  type PermissionAction,
  type PermissionResourceId,
  type RolePermission,
} from "./permissions"

type Grants = Record<string, PermissionAction[]>

type SeedRole = {
  slug: string
  name: string
  description: string
  isSuperAdmin: boolean
  isDefault: boolean
  priority: number
  permissions: RolePermission[]
}

const view: PermissionAction[] = ["find", "read"]
const manage: PermissionAction[] = ["find", "read", "update"]
const crud: PermissionAction[] = [
  "find",
  "read",
  "create",
  "update",
  "delete",
]
const crudExport: PermissionAction[] = [...crud, "export"]

function buildPermissions(grants: Grants): RolePermission[] {
  return permissionResources
    .map((resource) => ({
      resource: resource.id,
      actions: resource.actions.filter((action) =>
        (grants[resource.id] ?? []).includes(action)
      ),
    }))
    .filter((permission) => permission.actions.length > 0)
}

function grant(ids: string[], actions: PermissionAction[]): Grants {
  return Object.fromEntries(ids.map((id) => [id, actions]))
}

function allActions(): Grants {
  return Object.fromEntries(
    permissionResources.map((resource) => [resource.id, [...resource.actions]])
  )
}

function merge(...parts: Grants[]): Grants {
  return Object.assign({}, ...parts)
}

const coreResources = permissionResources
  .filter((resource) => resource.group === "core")
  .map((resource) => resource.id)

const settingsResources = permissionResources
  .filter((resource) => resource.group === "settings")
  .map((resource) => resource.id)

const appResources = permissionResources
  .filter((resource) => resource.group === "apps")
  .map((resource) => resource.id)

/**
 * Initial role documents. These are only used to bootstrap an empty database;
 * after that every role, grant and priority is managed through Payload.
 */
const DEFAULT_ROLES: SeedRole[] = [
  {
    slug: "super_admin",
    name: "Super Admin",
    description: "Absolute control over roles, permissions and accounts.",
    isSuperAdmin: true,
    isDefault: false,
    priority: 100,
    permissions: buildPermissions(allActions()),
  },
  {
    slug: "admin",
    name: "Admin",
    description: "Manages users, audit logs, settings and most applications.",
    isSuperAdmin: false,
    isDefault: false,
    priority: 80,
    permissions: buildPermissions(
      merge(
        grant(
          coreResources.filter((id) => id !== "roles"),
          crudExport
        ),
        grant(settingsResources, manage),
        grant(
          appResources.filter((id) => id !== "integrations"),
          crudExport
        ),
        grant(["media"], crud)
      )
    ),
  },
  {
    slug: "manager",
    name: "Manager",
    description: "Works with CRM and reporting applications.",
    isSuperAdmin: false,
    isDefault: false,
    priority: 50,
    permissions: buildPermissions(
      merge(
        grant(["settings"], view),
        grant(["appsHub"], view),
        grant(["crm", "reports"], crudExport)
      )
    ),
  },
  {
    slug: "user",
    name: "User",
    description: "Default role for newly registered accounts.",
    isSuperAdmin: false,
    isDefault: true,
    priority: 10,
    permissions: buildPermissions(
      merge(
        grant(["settings", "appsHub"], view),
        grant(["reports"], view)
      )
    ),
  },
]

type RawDocument = Record<string, unknown>

type RawCollection = {
  find: (query: Record<string, unknown>) => {
    toArray: () => Promise<RawDocument[]>
  }
  updateOne: (
    filter: Record<string, unknown>,
    update: Record<string, unknown>
  ) => Promise<unknown>
}

type MongoAdapter = {
  collections?: Record<string, { collection?: RawCollection }>
}

/**
 * Migrates legacy `users.role` string values (the old select field) to
 * references to the new dynamic roles collection. Idempotent.
 */
async function migrateLegacyUserRoles(payload: Payload): Promise<void> {
  try {
    const db = payload.db as unknown as MongoAdapter
    const rolesCollection = db.collections?.roles?.collection
    const usersCollection = db.collections?.users?.collection

    if (!rolesCollection || !usersCollection) return

    const rawRoles = await rolesCollection.find({}).toArray()
    const roleIdBySlug = new Map<string, unknown>()

    for (const role of rawRoles) {
      if (typeof role.slug === "string") {
        roleIdBySlug.set(role.slug, role._id)
      }
    }

    const defaultRoleId = roleIdBySlug.get("user")
    const rawUsers = await usersCollection.find({}).toArray()

    for (const user of rawUsers) {
      const role = user.role

      if (typeof role === "string" && roleIdBySlug.has(role)) {
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: { role: roleIdBySlug.get(role) } }
        )
      } else if (!role && defaultRoleId) {
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: { role: defaultRoleId } }
        )
      }
    }
  } catch (error) {
    payload.logger.error({
      msg: "Failed to migrate legacy user roles to the roles collection.",
      err: error,
    })
  }
}

type RawPermission = {
  resource?: unknown
  actions?: unknown
  read?: unknown
  write?: unknown
  delete?: unknown
}

/**
 * Resources that did not exist when the previous boolean permission schema was
 * written. They are granted once during the migration, based on the role's
 * existing `settings`/`users` grants, and can then be edited freely.
 */
const lateResourceIds: PermissionResourceId[] = [
  "seo",
  "security",
  "localization",
  "notifications",
  "storage",
  "media",
]

function buildLateResourceDefaults(
  existing: Map<PermissionResourceId, PermissionAction[]>,
  isSuperAdmin: boolean
): Map<PermissionResourceId, PermissionAction[]> {
  const defaults = new Map<PermissionResourceId, PermissionAction[]>()
  const settingsActions = existing.get("settings") ?? []
  const userActions = existing.get("users") ?? []
  const managesUsers =
    userActions.includes("create") &&
    userActions.includes("update") &&
    userActions.includes("delete")

  for (const id of lateResourceIds) {
    if (existing.has(id)) continue

    const resource = getPermissionResource(id)
    if (!resource) continue

    let actions: PermissionAction[]

    if (isSuperAdmin) {
      actions = [...resource.actions]
    } else if (id === "media") {
      actions = managesUsers
        ? resource.actions.filter((action) =>
            ["find", "read", "create", "update", "delete"].includes(action)
          )
        : []
    } else {
      actions = resource.actions.filter((action) =>
        settingsActions.includes(action)
      )
    }

    if (actions.length > 0) defaults.set(id, actions)
  }

  return defaults
}

/**
 * Converts role grants stored with the previous `read`/`write`/`delete`
 * booleans into the granular action arrays used by the current schema, and
 * grants one-time defaults for resources added in later versions. Idempotent:
 * roles already on the current permissions version are left untouched.
 */
async function migrateRolePermissions(payload: Payload): Promise<void> {
  try {
    const db = payload.db as unknown as MongoAdapter
    const rolesCollection = db.collections?.roles?.collection

    if (!rolesCollection) return

    const rawRoles = await rolesCollection.find({}).toArray()

    for (const raw of rawRoles) {
      const rawPermissions = Array.isArray(raw.permissions)
        ? (raw.permissions as RawPermission[])
        : []
      const version =
        typeof raw.permissionsVersion === "number"
          ? raw.permissionsVersion
          : 1

      const hasLegacyShape = rawPermissions.some(
        (permission) =>
          !Array.isArray(permission.actions) ||
          "read" in permission ||
          "write" in permission ||
          "delete" in permission
      )

      if (!hasLegacyShape && version >= PERMISSIONS_VERSION) continue

      const existing = new Map<PermissionResourceId, PermissionAction[]>()

      for (const permission of rawPermissions) {
        const resource = getPermissionResource(String(permission.resource))
        if (!resource) continue

        const actions = normalizePermissionActions({
          resource: resource.id,
          actions: Array.isArray(permission.actions)
            ? (permission.actions as (string | null)[])
            : null,
          read: Boolean(permission.read),
          write: Boolean(permission.write),
          delete: Boolean(permission.delete),
        }).filter((action) => resource.actions.includes(action))

        if (actions.length > 0) existing.set(resource.id, actions)
      }

      const defaults = buildLateResourceDefaults(
        existing,
        Boolean(raw.isSuperAdmin)
      )

      for (const [resource, actions] of defaults) {
        existing.set(resource, actions)
      }

      const migrated = permissionResources
        .map((resource) => ({
          resource: resource.id,
          actions: existing.get(resource.id) ?? [],
        }))
        .filter((permission) => permission.actions.length > 0)

      await payload.update({
        collection: "roles",
        id: String(raw._id),
        data: {
          permissions: migrated,
          permissionsVersion: PERMISSIONS_VERSION,
        },
        depth: 0,
        overrideAccess: true,
      })
    }
  } catch (error) {
    payload.logger.error({
      msg: "Failed to migrate legacy role permissions to granular actions.",
      err: error,
    })
  }
}

/**
 * Ensures the default roles exist and migrates legacy user role values and
 * legacy permission grants. Existing role documents are never overwritten, so
 * permission edits made in the dashboard survive restarts.
 */
export async function seedRoles(payload: Payload): Promise<void> {
  const existing = await payload.find({
    collection: "roles",
    limit: 200,
    depth: 0,
    overrideAccess: true,
  })

  const bySlug = new Map<string, Role>(
    existing.docs.map((role) => [role.slug, role])
  )

  for (const seed of DEFAULT_ROLES) {
    if (bySlug.has(seed.slug)) continue

    const created = (await payload.create({
      collection: "roles",
      data: seed,
      depth: 0,
      overrideAccess: true,
    })) as Role

    bySlug.set(created.slug, created)
  }

  await migrateRolePermissions(payload)
  await migrateLegacyUserRoles(payload)
}
