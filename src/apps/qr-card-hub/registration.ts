import { QrCode } from "lucide-react"

import type { RegisteredApp } from "@/config/dashboard-nav"
import type { RouteAccessRule } from "@/lib/rbac"

import { qrCardHubPermissionResources } from "./permissions"

export { qrCardHubPermissionResources }

/**
 * QR & Digital Business Card Hub — Apps Hub registration.
 *
 * This file is the only place the core platform needs to know about the
 * module. It is intentionally free of Payload/server imports so it can be
 * consumed by the client sidebar, the permission catalog and the route
 * guards without pulling the backend into the browser bundle.
 */
export const qrCardHubApp: RegisteredApp = {
  id: "qrCardHub",
  nameKey: "apps.qrCardHub.name",
  descriptionKey: "apps.qrCardHub.description",
  href: "/dashboard/apps/qr-card-hub",
  icon: QrCode,
  status: "active",
  requiredRole: "user",
}

/**
 * Route-level guards for the module. The longest matching prefix wins, so the
 * app shell can be reachable while the two workspaces stay independently
 * permissioned.
 */
export const qrCardHubRouteRules: RouteAccessRule[] = [
  {
    prefix: "/dashboard/apps/qr-card-hub/qr",
    requirement: {
      type: "permission",
      resource: "qrCodes",
      actions: ["find", "read"],
    },
  },
  {
    prefix: "/dashboard/apps/qr-card-hub/cards",
    requirement: {
      type: "permission",
      resource: "digitalCards",
      actions: ["find", "read"],
    },
  },
  {
    prefix: "/dashboard/apps/qr-card-hub",
    requirement: {
      type: "permission",
      resource: "qrCardHub",
      actions: ["find", "read"],
    },
  },
]

/** Public URL prefix used by dynamic QR codes and published cards. */
export const qrCardHubPublicPath = "/card"
