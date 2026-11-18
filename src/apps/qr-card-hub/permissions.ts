import type { PermissionResource } from "@/lib/permissions"

/**
 * Granular Strapi-style grants owned by the QR & Digital Card Hub.
 *
 * `qrCardHub` gates the app shell, while `qrCodes` and `digitalCards` gate the
 * two collections so a role can, for example, build cards without touching the
 * QR studio. Keeping these definitions next to the module means the platform
 * catalog stays untouched when the module is added or removed.
 */
export const qrCardHubPermissionResources: PermissionResource[] = [
  {
    id: "qrCardHub",
    labelKey: "roles.resources.qrCardHub",
    group: "apps",
    actions: ["find", "read", "configure"],
  },
  {
    id: "qrCodes",
    labelKey: "roles.resources.qrCodes",
    group: "apps",
    actions: ["find", "read", "create", "update", "delete", "export"],
  },
  {
    id: "digitalCards",
    labelKey: "roles.resources.digitalCards",
    group: "apps",
    actions: [
      "find",
      "read",
      "create",
      "update",
      "delete",
      "export",
      "publish",
    ],
  },
]
