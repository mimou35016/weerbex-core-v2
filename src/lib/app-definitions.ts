/**
 * Central declaration list for mini-apps.
 *
 * Every mini-app contributes four things from its own `registration.ts`:
 *  1. its registry metadata (id, label, icon, entry point),
 *  2. its permission resources,
 *  3. its route access rules, and
 *  4. its lifecycle metadata below (permission resource + route prefix).
 *
 * The core platform only imports this module, so adding a future app never
 * requires rewriting the shared navigation, RBAC or Apps Hub code.
 */

import {
  qrCardHubApp,
  qrCardHubPermissionResources,
  qrCardHubRouteRules,
} from "@/apps/qr-card-hub/registration"
import type { RegisteredApp } from "@/config/dashboard-nav"

import type { RouteAccessRule } from "./rbac"

export type AppDefinition = RegisteredApp & {
  /** Permission resource that gates the app shell and its store entry. */
  permissionResource: string
  /** Locale-less dashboard route prefix owned by the app. */
  routePrefix: string
  /** Nested route access rules contributed by the app. */
  routeRules: RouteAccessRule[]
}

export const appDefinitions: AppDefinition[] = [
  {
    ...qrCardHubApp,
    permissionResource: "qrCardHub",
    routePrefix: "/dashboard/apps/qr-card-hub",
    routeRules: qrCardHubRouteRules,
  },
]

/** All permission resources contributed by mini-apps, for the central catalog. */
export const appPermissionResources = [...qrCardHubPermissionResources]

/**
 * Looks up an app by its registry id (`qrCardHub`) or by the URL segment used
 * by its entry point (`qr-card-hub`).
 */
export function getAppDefinition(
  idOrSegment: string
): AppDefinition | undefined {
  return appDefinitions.find(
    (app) =>
      app.id === idOrSegment ||
      app.routePrefix === `/dashboard/apps/${idOrSegment}`
  )
}

/** Returns the app that owns a dashboard path, if any. */
export function definitionForPath(pathname: string): AppDefinition | undefined {
  const [withoutQuery] = pathname.split(/[?#]/)
  const clean = withoutQuery.replace(/\/+$/, "")

  return appDefinitions.find(
    (app) => clean === app.routePrefix || clean.startsWith(`${app.routePrefix}/`)
  )
}

/** Default lifecycle state before an operator touches the store controls. */
export function defaultAppAvailability(app: Pick<RegisteredApp, "status">): {
  installed: boolean
  enabled: boolean
} {
  const available = app.status !== "coming_soon"
  return { installed: available, enabled: available }
}

export type AppAvailability = {
  appId: string
  installed: boolean
  enabled: boolean
  /** True only when the app is both installed and enabled. */
  available: boolean
}
