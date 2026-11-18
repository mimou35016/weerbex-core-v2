import type { GlobalConfig } from "payload"

import { globalReadAccess, globalUpdateAccess } from "@/lib/global-access"

/**
 * Per-app configuration keyed by the registry id. The registry in
 * `src/config/dashboard-nav.ts` defines which apps exist; this global stores
 * the operator-controlled state for each of them.
 */
export const AppSettings: GlobalConfig = {
  slug: "app-settings",
  label: "App settings",
  admin: {
    group: "Settings",
    description:
      "Enablement, role hint and webhook endpoint for every registered app.",
  },
  access: {
    read: globalReadAccess("appsHub"),
    update: globalUpdateAccess("appsHub", "configure"),
  },
  fields: [
    {
      name: "apps",
      type: "array",
      fields: [
        {
          name: "appId",
          type: "text",
          required: true,
          index: true,
        },
        {
          name: "enabled",
          type: "checkbox",
          defaultValue: true,
        },
        {
          name: "requiredRole",
          type: "text",
          admin: {
            description: "Role slug hint shown in the Apps Hub.",
          },
        },
        {
          name: "webhookUrl",
          type: "text",
        },
      ],
    },
  ],
}
