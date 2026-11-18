"use server"

import type { Role } from "@/payload-types"
import { getCurrentUser } from "./auth"
import { getPayloadClient } from "./payload"
import {
  hasAnyPermission,
  permissionResources,
  PERMISSIONS_VERSION,
  type PermissionAction,
  type PermissionResourceId,
  type RolePermission,
} from "./permissions"
import { toRoleOption, type RoleOption } from "./roles"
import type { ActionResult } from "./users"

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return "Something went wrong. Please try again."
}

async function requireActiveUser() {
  const user = await getCurrentUser()

  if (!user || user.status !== "active") {
    throw new Error("Unauthorized")
  }

  return user
}

async function listRoles(): Promise<RoleOption[]> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: "roles",
    limit: 200,
    depth: 0,
    sort: "-priority",
    overrideAccess: true,
  })

  return result.docs.map((role) => toRoleOption(role as Role))
}

export async function listRolesAction(): Promise<ActionResult<RoleOption[]>> {
  try {
    const current = await requireActiveUser()

    if (!current.isSuperAdmin) {
      throw new Error("Forbidden: only super admins can manage roles.")
    }

    return { success: true, data: await listRoles() }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

/**
 * Role metadata used by the Users page. Reading the role list is allowed for
 * anyone who can read users; editing is still restricted to super admins.
 */
export async function listRoleOptionsAction(): Promise<
  ActionResult<RoleOption[]>
> {
  try {
    const current = await requireActiveUser()

    if (!hasAnyPermission(current, "users", ["find", "read"])) {
      throw new Error("Forbidden: you do not have permission to view roles.")
    }

    return { success: true, data: await listRoles() }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

type SanitizedPermission = {
  resource: PermissionResourceId
  actions: PermissionAction[]
}

export async function updateRolePermissionsAction(
  roleId: string,
  permissions: RolePermission[]
): Promise<ActionResult<RoleOption>> {
  try {
    const current = await requireActiveUser()

    if (!current.isSuperAdmin) {
      throw new Error("Forbidden: only super admins can manage roles.")
    }

    const sanitized: SanitizedPermission[] = []

    for (const permission of permissions) {
      const resource = permissionResources.find(
        (entry) => entry.id === permission.resource
      )

      if (!resource) continue

      const actions = resource.actions.filter((action) =>
        permission.actions.includes(action)
      )

      if (actions.length > 0) {
        sanitized.push({ resource: resource.id, actions })
      }
    }

    const payload = await getPayloadClient()
    const role = (await payload.update({
      collection: "roles",
      id: roleId,
      data: {
        permissions: sanitized,
        // Mark the grants as current so the one-time migration never
        // re-adds resources the super admin intentionally removed.
        permissionsVersion: PERMISSIONS_VERSION,
      },
      depth: 0,
      overrideAccess: true,
    })) as Role

    return { success: true, data: toRoleOption(role) }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}
