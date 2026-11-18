import type { Access, PayloadRequest, Where } from "payload"

import type { User } from "@/payload-types"
import type { PermissionAction } from "@/lib/permissions"
import {
  isActiveUser,
  resolveActor,
  roleHasPermission,
} from "@/lib/roles"

async function actorCan(
  req: PayloadRequest,
  resource: string,
  action: PermissionAction
): Promise<boolean> {
  const actor = await resolveActor(req.payload, req.user as User | null)

  return Boolean(
    actor &&
      isActiveUser(actor.user) &&
      roleHasPermission(actor.role, resource, action)
  )
}

/**
 * Builds a Payload access function from a granular RBAC grant. The actor and
 * its role are re-read from the database on every request so permission edits
 * apply immediately.
 */
export function permissionAccess(
  resource: string,
  action: PermissionAction
): Access {
  return async ({ req }: { req: PayloadRequest }) =>
    actorCan(req, resource, action)
}

/**
 * Read access for public-facing collections. Anonymous visitors only ever see
 * published documents; signed-in users are checked against the live grant.
 */
export function publishedReadAccess(
  resource: string,
  publishedField = "published"
): Access {
  return async ({ req }: { req: PayloadRequest }) => {
    if (!req.user) {
      return { [publishedField]: { equals: true } } as Where
    }

    return actorCan(req, resource, "read")
  }
}

/**
 * Admin panel visibility. Payload only allows a boolean result here, so it is
 * kept separate from the general-purpose `permissionAccess` helper.
 */
export function adminAccess(resource: string) {
  return async ({ req }: { req: PayloadRequest }): Promise<boolean> =>
    actorCan(req, resource, "read")
}
