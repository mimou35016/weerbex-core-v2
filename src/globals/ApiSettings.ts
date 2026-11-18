import type { GlobalConfig } from "payload"

import { globalReadAccess, globalUpdateAccess } from "@/lib/global-access"

/**
 * Integration endpoints that receive platform events. Kept separate from the
 * public site settings because it is an operational secret, not branding.
 */
export const ApiSettings: GlobalConfig = {
  slug: "api-settings",
  label: "API settings",
  admin: {
    group: "Settings",
    description: "Outgoing webhook endpoint used for platform events.",
  },
  access: {
    read: globalReadAccess("settings"),
    update: globalUpdateAccess("settings"),
  },
  fields: [
    {
      name: "webhookUrl",
      type: "text",
      admin: {
        description:
          "HTTPS endpoint that receives platform events. Leave empty to disable webhooks.",
      },
    },
  ],
}
