import type {
  Access,
  CollectionConfig,
  PayloadRequest,
} from "payload"

import type { User } from "@/payload-types"
import {
  isActiveUser,
  resolveActor,
  roleHasPermission,
} from "@/lib/roles"

/**
 * Uploaded files back public pages, so anonymous requests keep read access.
 * Authenticated requests are checked against the live `media` permissions.
 */
const readAccess: Access = async ({ req }) => {
  if (!req.user) return true

  const actor = await resolveActor(req.payload, req.user as User)

  return Boolean(
    actor &&
      isActiveUser(actor.user) &&
      roleHasPermission(actor.role, "media", "read")
  )
}

const createAccess: Access = async ({ req }) => {
  const actor = await resolveActor(req.payload, req.user as User | null)

  return Boolean(
    actor &&
      isActiveUser(actor.user) &&
      roleHasPermission(actor.role, "media", "create")
  )
}

const updateAccess: Access = async ({ req }) => {
  const actor = await resolveActor(req.payload, req.user as User | null)

  return Boolean(
    actor &&
      isActiveUser(actor.user) &&
      roleHasPermission(actor.role, "media", "update")
  )
}

const deleteAccess: Access = async ({ req }) => {
  const actor = await resolveActor(req.payload, req.user as User | null)

  return Boolean(
    actor &&
      isActiveUser(actor.user) &&
      roleHasPermission(actor.role, "media", "delete")
  )
}

const adminAccess = async ({
  req,
}: {
  req: PayloadRequest
}): Promise<boolean> => {
  const actor = await resolveActor(req.payload, req.user as User | null)

  return Boolean(
    actor &&
      isActiveUser(actor.user) &&
      roleHasPermission(actor.role, "media", "read")
  )
}

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    admin: adminAccess,
    read: readAccess,
    create: createAccess,
    update: updateAccess,
    delete: deleteAccess,
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
  ],
  upload: true,
}
