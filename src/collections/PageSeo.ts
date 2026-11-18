import type { CollectionConfig, PayloadRequest } from "payload"

import type { User } from "@/payload-types"
import {
  isActiveUser,
  resolveActor,
  roleHasPermission,
} from "@/lib/roles"

function normalizePath(value: unknown): string {
  if (typeof value !== "string") return "/"

  const trimmed = value.trim()

  if (!trimmed) return "/"

  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`
  const withoutTrailingSlash =
    withLeadingSlash.length > 1
      ? withLeadingSlash.replace(/\/+$/, "")
      : withLeadingSlash

  return withoutTrailingSlash || "/"
}

const createAccess = async ({
  req,
}: {
  req: PayloadRequest
}): Promise<boolean> => {
  const actor = await resolveActor(req.payload, req.user as User | null)

  return Boolean(
    actor &&
      isActiveUser(actor.user) &&
      roleHasPermission(actor.role, "seo", "create")
  )
}

const updateAccess = async ({
  req,
}: {
  req: PayloadRequest
}): Promise<boolean> => {
  const actor = await resolveActor(req.payload, req.user as User | null)

  return Boolean(
    actor &&
      isActiveUser(actor.user) &&
      roleHasPermission(actor.role, "seo", "update")
  )
}

const deleteAccess = async ({
  req,
}: {
  req: PayloadRequest
}): Promise<boolean> => {
  const actor = await resolveActor(req.payload, req.user as User | null)

  return Boolean(
    actor &&
      isActiveUser(actor.user) &&
      roleHasPermission(actor.role, "seo", "delete")
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
      roleHasPermission(actor.role, "seo", "read")
  )
}

/**
 * Per-route SEO overrides. Each document represents one public path, while the
 * textual fields are localized so every locale can have its own metadata.
 */
export const PageSeo: CollectionConfig = {
  slug: "page-seo",
  labels: {
    singular: "Page SEO",
    plural: "Page SEO",
  },
  admin: {
    group: "Settings",
    useAsTitle: "path",
    defaultColumns: ["path", "label", "noIndex", "includeInSitemap"],
    description:
      "Override titles, descriptions and social images for specific routes and locales.",
  },
  access: {
    admin: adminAccess,
    read: () => true,
    create: createAccess,
    update: updateAccess,
    delete: deleteAccess,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data

        return {
          ...data,
          path: normalizePath(data.path),
        }
      },
    ],
  },
  fields: [
    {
      name: "path",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        description:
          "Public route without the locale prefix, for example /login or /dashboard/settings.",
      },
    },
    {
      name: "label",
      type: "text",
      admin: {
        description: "Internal name shown in the dashboard list.",
      },
    },
    {
      name: "title",
      type: "text",
      localized: true,
    },
    {
      name: "description",
      type: "textarea",
      localized: true,
    },
    {
      name: "keywords",
      type: "text",
      localized: true,
    },
    {
      name: "canonicalUrl",
      type: "text",
      localized: true,
      admin: {
        description: "Absolute canonical URL for this route and locale.",
      },
    },
    {
      name: "ogImage",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "noIndex",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description: "Exclude this route from search engine indexes.",
      },
    },
    {
      name: "includeInSitemap",
      type: "checkbox",
      defaultValue: true,
    },
    {
      name: "changeFrequency",
      type: "select",
      defaultValue: "weekly",
      options: [
        { label: "Always", value: "always" },
        { label: "Hourly", value: "hourly" },
        { label: "Daily", value: "daily" },
        { label: "Weekly", value: "weekly" },
        { label: "Monthly", value: "monthly" },
        { label: "Yearly", value: "yearly" },
        { label: "Never", value: "never" },
      ],
    },
    {
      name: "priority",
      type: "number",
      defaultValue: 0.5,
      min: 0,
      max: 1,
      admin: {
        step: 0.1,
      },
    },
  ],
}
