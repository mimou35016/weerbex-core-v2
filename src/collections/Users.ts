import {
  APIError,
  type Access,
  type CollectionConfig,
  type FieldAccess,
  type PayloadRequest,
} from "payload"

import type { User } from "@/payload-types"
import {
  canManageTarget,
  countSuperAdminUsers,
  getDefaultRole,
  isActiveUser,
  resolveActor,
  resolveRoleDoc,
  roleHasAnyPermission,
  roleHasPermission,
} from "@/lib/roles"

const readAccess: Access = async ({ req }) => {
  const actor = await resolveActor(req.payload, req.user as User | null)

  if (!actor || !isActiveUser(actor.user)) return false
  if (roleHasAnyPermission(actor.role, "users", ["find", "read"])) return true

  return { id: { equals: actor.user.id } }
}

const createAccess: Access = async ({ req }) => {
  const actor = await resolveActor(req.payload, req.user as User | null)

  return Boolean(
    actor &&
      isActiveUser(actor.user) &&
      roleHasPermission(actor.role, "users", "create")
  )
}

const updateAccess: Access = async ({ req }) => {
  const actor = await resolveActor(req.payload, req.user as User | null)

  if (!actor || !isActiveUser(actor.user)) return false
  if (roleHasPermission(actor.role, "users", "update")) return true

  return { id: { equals: actor.user.id } }
}

const deleteAccess: Access = async ({ req }) => {
  const actor = await resolveActor(req.payload, req.user as User | null)

  return Boolean(
    actor &&
      isActiveUser(actor.user) &&
      roleHasPermission(actor.role, "users", "delete")
  )
}

const adminAccess = async ({
  req,
}: {
  req: PayloadRequest
}): Promise<boolean> => {
  const actor = await resolveActor(req.payload, req.user as User | null)

  if (!actor || !isActiveUser(actor.user)) return false

  return roleHasAnyPermission(actor.role, "users", ["find", "read"])
}

const roleFieldAccess: FieldAccess = async ({ req }) => {
  const actor = await resolveActor(req.payload, req.user as User | null)

  return Boolean(
    actor && isActiveUser(actor.user) && actor.role?.isSuperAdmin
  )
}

const statusFieldAccess: FieldAccess = async ({ req, doc }) => {
  const actor = await resolveActor(req.payload, req.user as User | null)

  if (!actor || !isActiveUser(actor.user)) return false
  if (actor.role?.isSuperAdmin) return true
  if (!roleHasPermission(actor.role, "users", "update")) return false
  if (!doc) return true

  const targetRole = await resolveRoleDoc(req.payload, doc.role)

  if (!targetRole || targetRole.isSuperAdmin) return false

  const actorId = String(actor.user.id)
  const targetId = String((doc as { id?: unknown }).id ?? "")

  if (actorId === targetId) return false

  return (targetRole.priority ?? 0) < (actor.role?.priority ?? 0)
}

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
  },
  auth: true,
  access: {
    admin: adminAccess,
    read: readAccess,
    create: createAccess,
    update: updateAccess,
    delete: deleteAccess,
  },
  hooks: {
    beforeLogin: [
      ({ user }) => {
        if (!isActiveUser(user as User)) {
          throw new APIError(
            "Your account is not active. Please contact an administrator.",
            403,
            null,
            true
          )
        }
      },
    ],
    beforeChange: [
      async ({ data, originalDoc, req }) => {
        const actor = await resolveActor(req.payload, req.user as User | null)

        if (data.role) {
          const resolved = await resolveRoleDoc(req.payload, data.role)
          if (resolved) data.role = resolved.id as never
        }

        // Local API calls from trusted server code run without a user.
        if (!actor) {
          if (!originalDoc && !data.role) {
            const defaultRole = await getDefaultRole(req.payload)
            if (defaultRole) data.role = defaultRole.id as never
          }

          return data
        }

        if (!isActiveUser(actor.user)) {
          throw new APIError("Unauthorized", 403, null, true)
        }

        const actorRole = actor.role
        const isSuperAdmin = Boolean(actorRole?.isSuperAdmin)
        const isSelf = String(actor.user.id) === String(originalDoc?.id ?? "")

        if (!originalDoc) {
          // Non-super admins cannot choose a role on create.
          if (!isSuperAdmin) {
            const defaultRole = await getDefaultRole(req.payload)

            if (defaultRole) {
              data.role = defaultRole.id as never
            } else {
              delete data.role
            }
          }

          return data
        }

        const targetRole = await resolveRoleDoc(req.payload, originalDoc.role)

        if (targetRole?.isSuperAdmin && !isSuperAdmin) {
          throw new APIError(
            "Only a super admin can manage super admin accounts.",
            403,
            null,
            true
          )
        }

        if (!isSuperAdmin) {
          if (!isSelf && !canManageTarget(actorRole, targetRole)) {
            throw new APIError(
              "You cannot modify this account.",
              403,
              null,
              true
            )
          }

          // Role assignment is reserved for super admins.
          delete data.role

          // Users may edit their own profile, but never their own status.
          if (isSelf || !roleHasPermission(actorRole, "users", "update")) {
            delete data.status
          }

          return data
        }

        if (isSelf && data.role) {
          const nextRole = await resolveRoleDoc(req.payload, data.role)

          if (
            !nextRole?.isSuperAdmin &&
            (await countSuperAdminUsers(req.payload)) <= 1
          ) {
            throw new APIError(
              "At least one super admin account is required.",
              400,
              null,
              true
            )
          }
        }

        return data
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        const actor = await resolveActor(req.payload, req.user as User | null)

        // Local API calls from trusted server code run without a user.
        if (!actor) return

        if (!isActiveUser(actor.user)) {
          throw new APIError("Unauthorized", 403, null, true)
        }

        const target = (await req.payload.findByID({
          collection: "users",
          id,
          depth: 0,
          overrideAccess: true,
        })) as User

        if (String(target.id) === String(actor.user.id)) {
          throw new APIError(
            "You cannot delete your own account.",
            403,
            null,
            true
          )
        }

        const targetRole = await resolveRoleDoc(req.payload, target.role)

        if (!canManageTarget(actor.role, targetRole)) {
          throw new APIError(
            "You cannot delete this account.",
            403,
            null,
            true
          )
        }

        if (
          targetRole?.isSuperAdmin &&
          (await countSuperAdminUsers(req.payload)) <= 1
        ) {
          throw new APIError(
            "At least one super admin account is required.",
            400,
            null,
            true
          )
        }
      },
    ],
  },
  fields: [
    {
      name: "name",
      type: "text",
    },
    {
      name: "role",
      type: "relationship",
      relationTo: "roles",
      saveToJWT: false,
      access: {
        create: roleFieldAccess,
        update: roleFieldAccess,
      },
    },
    {
      name: "status",
      type: "select",
      defaultValue: "active",
      saveToJWT: false,
      access: {
        create: statusFieldAccess,
        update: statusFieldAccess,
      },
      options: [
        { label: "Active", value: "active" },
        { label: "Pending", value: "pending" },
        { label: "Suspended", value: "suspended" },
      ],
    },
  ],
}
