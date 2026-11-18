import type { Access, CollectionConfig } from "payload"

import type { User } from "@/payload-types"
import {
  isActiveUser,
  resolveActor,
  roleHasAnyPermission,
  roleHasPermission,
} from "@/lib/roles"

const readAccess: Access = async ({ req }) => {
  const actor = await resolveActor(req.payload, req.user as User | null)

  if (!actor || !isActiveUser(actor.user)) return false

  return roleHasAnyPermission(actor.role, "settings", ["find", "read"])
}

const manageAccess: Access = async ({ req }) => {
  const actor = await resolveActor(req.payload, req.user as User | null)

  return Boolean(
    actor &&
      isActiveUser(actor.user) &&
      roleHasPermission(actor.role, "settings", "update")
  )
}

/**
 * Workspace API tokens. Only the SHA-256 hash of a token is persisted; the
 * plaintext secret is returned exactly once when it is generated.
 */
export const ApiTokens: CollectionConfig = {
  slug: "api-tokens",
  labels: {
    singular: "API token",
    plural: "API tokens",
  },
  admin: {
    group: "Settings",
    useAsTitle: "name",
    defaultColumns: ["name", "prefix", "lastUsedAt", "createdAt"],
    description:
      "Machine credentials used by external services to call the platform API.",
  },
  access: {
    read: readAccess,
    create: manageAccess,
    update: manageAccess,
    delete: manageAccess,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      index: true,
    },
    {
      name: "prefix",
      type: "text",
      required: true,
      index: true,
      admin: {
        description: "Short, non-secret identifier shown in the dashboard.",
      },
    },
    {
      name: "tokenHash",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        hidden: true,
      },
      access: {
        // Never expose the hash through REST/GraphQL or the admin UI. Local
        // API calls that verify a token pass `overrideAccess: true`.
        read: () => false,
      },
    },
    {
      name: "lastUsedAt",
      type: "date",
      admin: {
        readOnly: true,
      },
    },
    {
      name: "createdBy",
      type: "relationship",
      relationTo: "users",
      admin: {
        readOnly: true,
      },
    },
  ],
}
