import type { PayloadRequest } from "payload"

import type { User } from "@/payload-types"
import type { PermissionAction } from "./permissions"
import {
  isActiveUser,
  resolveActor,
  roleHasAnyPermission,
  roleHasPermission,
} from "./roles"

type AccessArgs = { req: PayloadRequest }

/**
 * Read access for operational globals. Anonymous API reads are denied so
 * secrets such as SMTP passwords or storage keys can never leak through the
 * public REST/GraphQL surface.
 */
export function globalReadAccess(
  resource: string,
  actions: readonly PermissionAction[] = ["find", "read"]
) {
  return async ({ req }: AccessArgs): Promise<boolean> => {
    const actor = await resolveActor(req.payload, req.user as User | null)

    if (!actor || !isActiveUser(actor.user)) return false

    return roleHasAnyPermission(actor.role, resource, actions)
  }
}

/** Update access for operational globals, scoped to a single resource. */
export function globalUpdateAccess(
  resource: string,
  action: PermissionAction = "update"
) {
  return async ({ req }: AccessArgs): Promise<boolean> => {
    const actor = await resolveActor(req.payload, req.user as User | null)

    if (!actor || !isActiveUser(actor.user)) return false

    return roleHasPermission(actor.role, resource, action)
  }
}
