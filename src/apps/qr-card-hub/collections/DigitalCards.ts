import type { CollectionConfig } from "payload"

import {
  fallbackSlug,
  isValidSlug,
  slugify,
  socialPlatforms,
  text,
} from "../lib/types"
import {
  adminAccess,
  permissionAccess,
  publishedReadAccess,
} from "./access"

/**
 * Digital business cards. A published card is reachable anonymously at
 * `/[locale]/card/[slug]`, which is also what dynamic QR codes encode.
 */
export const DigitalCards: CollectionConfig = {
  slug: "digital-cards",
  labels: {
    singular: "Digital card",
    plural: "Digital cards",
  },
  admin: {
    group: "QR Card Hub",
    useAsTitle: "title",
    defaultColumns: [
      "title",
      "fullName",
      "template",
      "published",
      "updatedAt",
    ],
    description:
      "Shareable digital business cards rendered at their public slug.",
  },
  access: {
    admin: adminAccess("digitalCards"),
    read: publishedReadAccess("digitalCards"),
    create: permissionAccess("digitalCards", "create"),
    update: permissionAccess("digitalCards", "update"),
    delete: permissionAccess("digitalCards", "delete"),
  },
  hooks: {
    beforeValidate: [
      ({ data, originalDoc }) => {
        if (!data) return data

        const provided =
          typeof data.slug === "string" && data.slug.trim().length > 0
            ? data.slug
            : typeof originalDoc?.slug === "string"
              ? originalDoc.slug
              : ""

        if (isValidSlug(provided.trim())) {
          return { ...data, slug: provided.trim() }
        }

        const source =
          text(provided) ||
          text(data.fullName) ||
          text(data.title) ||
          String(Date.now())

        const generated = slugify(source) || fallbackSlug(source)

        return { ...data, slug: generated }
      },
    ],
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      admin: {
        description: "Internal name shown in the dashboard list.",
      },
    },
    {
      name: "slug",
      type: "text",
      unique: true,
      index: true,
      admin: {
        description:
          "Public URL slug. Generated from the name when left blank.",
      },
    },
    {
      name: "fullName",
      type: "text",
      required: true,
    },
    {
      name: "jobTitle",
      type: "text",
    },
    {
      name: "company",
      type: "text",
    },
    {
      name: "bio",
      type: "textarea",
    },
    {
      name: "email",
      type: "email",
    },
    {
      name: "phone",
      type: "text",
    },
    {
      name: "website",
      type: "text",
    },
    {
      name: "address",
      type: "text",
    },
    {
      name: "links",
      type: "array",
      labels: {
        singular: "Link",
        plural: "Custom links",
      },
      maxRows: 20,
      admin: {
        description:
          "Linktree-style buttons shown on the card, in this order. A blank label falls back to the URL.",
      },
      fields: [
        {
          name: "label",
          type: "text",
          admin: {
            description: "Optional. Defaults to the URL when left empty.",
          },
        },
        {
          name: "url",
          type: "text",
          required: true,
        },
      ],
    },
    {
      name: "avatar",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "template",
      type: "select",
      defaultValue: "modern",
      options: [
        { label: "Modern minimal", value: "modern" },
        { label: "Corporate", value: "corporate" },
        { label: "Cyber dark", value: "cyber" },
        { label: "Glassmorphism", value: "glass" },
      ],
      required: true,
    },
    {
      name: "brandColor",
      type: "text",
      defaultValue: "#4f46e5",
    },
    {
      name: "accentColor",
      type: "text",
      defaultValue: "#0ea5e9",
    },
    {
      name: "socialLinks",
      type: "array",
      fields: [
        {
          name: "platform",
          type: "select",
          required: true,
          defaultValue: "website",
          options: socialPlatforms.map((platform) => ({
            label: platform,
            value: platform,
          })),
        },
        {
          name: "url",
          type: "text",
          required: true,
        },
        {
          name: "label",
          type: "text",
        },
      ],
    },
    {
      name: "published",
      type: "checkbox",
      defaultValue: false,
      index: true,
      admin: {
        description:
          "Only published cards are visible at their public URL.",
      },
    },
  ],
}
