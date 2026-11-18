import type { GlobalConfig, PayloadRequest } from "payload"

import type { User } from "@/payload-types"
import {
  isActiveUser,
  resolveActor,
  roleHasPermission,
} from "@/lib/roles"

const updateAccess = async ({
  req,
}: {
  req: PayloadRequest
}): Promise<boolean> => {
  const actor = await resolveActor(req.payload, req.user as User | null)

  return Boolean(
    actor &&
      isActiveUser(actor.user) &&
      roleHasPermission(actor.role, "settings", "update")
  )
}

/**
 * Site-wide branding and contact information. Every field is consumed by the
 * Next.js app through `src/lib/site-settings.ts`, so nothing is hardcoded.
 */
export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Site settings",
  admin: {
    group: "Settings",
    description:
      "Branding, contact details and platform switches used across the public site and dashboard.",
  },
  access: {
    read: () => true,
    update: updateAccess,
  },
  fields: [
    {
      name: "siteName",
      type: "text",
      localized: true,
      admin: {
        description: "Shown in metadata, the sidebar and the auth pages.",
      },
    },
    {
      name: "tagline",
      type: "text",
      localized: true,
      admin: {
        description: "Short subtitle displayed under the site name.",
      },
    },
    {
      name: "description",
      type: "textarea",
      localized: true,
      admin: {
        description: "Fallback meta description when no SEO default is set.",
      },
    },
    {
      name: "footerText",
      type: "textarea",
      localized: true,
      admin: {
        description: "Footer copy rendered on public pages.",
      },
    },
    {
      name: "logo",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Primary brand logo. SVG or transparent PNG recommended.",
      },
    },
    {
      name: "favicon",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Icon shown in browser tabs and bookmarks.",
      },
    },
    {
      name: "contactEmail",
      type: "email",
    },
    {
      name: "contactPhone",
      type: "text",
    },
    {
      name: "socialLinks",
      type: "array",
      admin: {
        description: "Profiles linked from the footer and contact blocks.",
      },
      fields: [
        {
          name: "platform",
          type: "select",
          required: true,
          defaultValue: "website",
          options: [
            { label: "Website", value: "website" },
            { label: "X / Twitter", value: "x" },
            { label: "Facebook", value: "facebook" },
            { label: "Instagram", value: "instagram" },
            { label: "LinkedIn", value: "linkedin" },
            { label: "YouTube", value: "youtube" },
            { label: "TikTok", value: "tiktok" },
            { label: "GitHub", value: "github" },
          ],
        },
        {
          name: "url",
          type: "text",
          required: true,
        },
      ],
    },
    {
      name: "maintenanceMode",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description:
          "Signals that the platform is under maintenance. Read by the app layout.",
      },
    },
    {
      name: "openRegistration",
      type: "checkbox",
      defaultValue: true,
      admin: {
        description: "Allow visitors to create their own accounts.",
      },
    },
    {
      name: "defaultLocale",
      type: "select",
      defaultValue: "en",
      options: [
        { label: "English", value: "en" },
        { label: "Français", value: "fr" },
        { label: "العربية", value: "ar" },
      ],
    },
  ],
}
