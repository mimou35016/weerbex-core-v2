import {
  APIError,
  type CollectionConfig,
  type PayloadRequest,
} from "payload"

import type { Role, User } from "@/payload-types"
import {
  getPermissionResource,
  normalizePermissionActions,
  permissionActionIds,
  permissionResources,
  PERMISSIONS_VERSION,
} from "@/lib/permissions"
import {
  countSuperAdminRoles,
  isActiveUser,
  resolveActor,
} from "@/lib/roles"

const readAccess = async ({
  req,
}: {
  req: PayloadRequest
}): Promise<boolean> => {
  const actor = await resolveActor(req.payload, req.user as User | null)

  return Boolean(actor && isActiveUser(actor.user))
}

const superAdminAccess = async ({
  req,
}: {
  req: PayloadRequest
}): Promise<boolean> => {
  const actor = await resolveActor(req.payload, req.user as User | null)

  return Boolean(
    actor && isActiveUser(actor.user) && actor.role?.isSuperAdmin
  )
}

export const Roles: CollectionConfig = {
  slug: "roles",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "isSuperAdmin", "isDefault", "priority"],
  },
  access: {
    admin: superAdminAccess,
    read: readAccess,
    create: superAdminAccess,
    update: superAdminAccess,
    delete: superAdminAccess,
  },
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, req }) => {
        if (Array.isArray(data.permissions)) {
          for (const permission of data.permissions) {
            const resource = getPermissionResource(permission.resource)

            if (!resource) {
              throw new APIError(
                `Unknown permission resource: ${permission.resource}`,
                400,
                null,
                true
              )
            }

            const actions = normalizePermissionActions(permission)
            const invalid = actions.filter(
              (action) => !resource.actions.includes(action)
            )

            if (invalid.length > 0) {
              throw new APIError(
                `Action(s) ${invalid.join(
                  ", "
                )} are not supported by resource ${resource.id}.`,
                400,
                null,
                true
              )
            }
          }
        }

        if (
          originalDoc?.isSuperAdmin &&
          data.isSuperAdmin === false &&
          (await countSuperAdminRoles(req.payload)) <= 1
        ) {
          throw new APIError(
            "At least one super admin role is required.",
            400,
            null,
            true
          )
        }

        return data
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        const role = (await req.payload.findByID({
          collection: "roles",
          id,
          depth: 0,
          overrideAccess: true,
        })) as Role

        if (role.isSuperAdmin && (await countSuperAdminRoles(req.payload)) <= 1) {
          throw new APIError(
            "At least one super admin role is required.",
            400,
            null,
            true
          )
        }

        const assigned = await req.payload.count({
          collection: "users",
          where: { role: { equals: id } },
          overrideAccess: true,
        })

        if (assigned.totalDocs > 0) {
          throw new APIError(
            "This role is assigned to users. Reassign them before deleting it.",
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
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
    },
    {
      name: "description",
      type: "textarea",
    },
    {
      name: "isSuperAdmin",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description:
          "Grants absolute control over roles, permissions and role assignment.",
      },
    },
    {
      name: "isDefault",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description:
          "Assigned to newly registered users when no role is provided.",
      },
    },
    {
      name: "priority",
      type: "number",
      required: true,
      defaultValue: 0,
      admin: {
        description:
          "Higher priority roles can manage lower priority accounts.",
      },
    },
    {
      name: "permissionsVersion",
      type: "number",
      defaultValue: PERMISSIONS_VERSION,
      admin: {
        hidden: true,
        description:
          "Tracks schema migrations for permission grants. Managed automatically.",
      },
    },
    {
      name: "permissions",
      type: "array",
      fields: [
        {
          name: "resource",
          type: "select",
          required: true,
          options: permissionResources.map((resource) => ({
            label: resource.id,
            value: resource.id,
          })),
        },
        {
          name: "actions",
          type: "select",
          hasMany: true,
          options: permissionActionIds.map((action) => ({
            label: action,
            value: action,
          })),
        },
      ],
    },
  ],
}
