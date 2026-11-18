import type { Access, CollectionConfig } from "payload"

import type { User } from "@/payload-types"
import { auditStatuses } from "@/lib/audit-types"
import {
  isActiveUser,
  resolveActor,
  roleHasAnyPermission,
} from "@/lib/roles"

const readAccess: Access = async ({ req }) => {
  const actor = await resolveActor(req.payload, req.user as User | null)

  if (!actor || !isActiveUser(actor.user)) return false

  return roleHasAnyPermission(actor.role, "audit", ["find", "read"])
}

/**
 * Audit entries are append-only. Creation always happens through the internal
 * Local API with `overrideAccess`, so the public REST/GraphQL API can never
 * forge an entry. Only super admins may prune the trail.
 */
const superAdminAccess: Access = async ({ req }) => {
  const actor = await resolveActor(req.payload, req.user as User | null)

  return Boolean(
    actor && isActiveUser(actor.user) && actor.role?.isSuperAdmin
  )
}

export const AuditLogs: CollectionConfig = {
  slug: "audit-logs",
  labels: {
    singular: "Audit log",
    plural: "Audit logs",
  },
  admin: {
    group: "System",
    useAsTitle: "action",
    defaultColumns: ["action", "actorName", "target", "status", "createdAt"],
    description:
      "Append-only trail of security and configuration events. Entries are written automatically by the platform.",
  },
  access: {
    read: readAccess,
    create: () => false,
    update: () => false,
    delete: superAdminAccess,
  },
  fields: [
    {
      name: "action",
      type: "text",
      required: true,
      index: true,
      admin: {
        description: "Machine-readable event key (e.g. login, userCreated).",
      },
    },
    {
      name: "actor",
      type: "relationship",
      relationTo: "users",
      admin: {
        description: "Account that triggered the event, when available.",
      },
    },
    {
      name: "actorName",
      type: "text",
      admin: {
        description:
          "Denormalized actor name so the entry survives account deletion.",
      },
    },
    {
      name: "target",
      type: "text",
    },
    {
      name: "ip",
      type: "text",
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "success",
      options: auditStatuses.map((status) => ({
        label: status,
        value: status,
      })),
    },
    {
      name: "metadata",
      type: "json",
    },
  ],
}
