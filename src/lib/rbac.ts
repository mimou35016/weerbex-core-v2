import { appsRegistry } from "@/config/dashboard-nav"
import { routing } from "@/i18n/routing"
import { qrCardHubRouteRules } from "@/apps/qr-card-hub/registration"
import {
  hasAnyPermission,
  type PermissionAction,
} from "./permissions"
import type { DashboardUser } from "./users"

export type RouteRequirement =
  | { type: "permission"; resource: string; actions: PermissionAction[] }
  | { type: "superAdmin" }

export type RouteAccessRule = {
  /** Locale-less path prefix, e.g. `/dashboard/users`. */
  prefix: string
  requirement: RouteRequirement
}

function permission(
  resource: string,
  ...actions: PermissionAction[]
): RouteRequirement {
  return { type: "permission", resource, actions }
}

const superAdmin: RouteRequirement = { type: "superAdmin" }

/**
 * Route level access rules for the core dashboard. The longest matching
 * prefix wins, which lets nested routes be locked down independently from
 * their parent section.
 */
export const routeAccessRules: RouteAccessRule[] = [
  {
    prefix: "/dashboard/settings/seo",
    requirement: permission("seo", "find", "read"),
  },
  {
    prefix: "/dashboard/settings/security",
    requirement: permission("security", "find", "read"),
  },
  {
    prefix: "/dashboard/settings/localization",
    requirement: permission("localization", "find", "read"),
  },
  {
    prefix: "/dashboard/settings/notifications",
    requirement: permission("notifications", "find", "read"),
  },
  {
    prefix: "/dashboard/settings/storage",
    requirement: permission("storage", "find", "read"),
  },
  {
    prefix: "/dashboard/settings",
    requirement: permission("settings", "find", "read"),
  },
  {
    prefix: "/dashboard/users",
    requirement: permission("users", "find", "read"),
  },
  {
    prefix: "/dashboard/roles",
    requirement: superAdmin,
  },
  {
    prefix: "/dashboard/audit-logs",
    requirement: permission("audit", "find", "read"),
  },
  {
    prefix: "/dashboard/apps",
    requirement: permission("appsHub", "find", "read"),
  },
  ...qrCardHubRouteRules,
]

/**
 * Strips the locale, query string and hash from a pathname so rules can be
 * matched consistently from both server and client code.
 */
export function normalizeDashboardPath(pathname: string): string {
  const [withoutQuery] = pathname.split(/[?#]/)
  const segments = withoutQuery.split("/").filter(Boolean)

  if (
    segments.length > 0 &&
    (routing.locales as readonly string[]).includes(segments[0])
  ) {
    segments.shift()
  }

  return `/${segments.join("/")}`
}

/**
 * Returns the permission required to open a path, or `null` when the route is
 * available to every signed-in user.
 */
export function getRouteRequirement(
  pathname: string
): RouteRequirement | null {
  const normalized = normalizeDashboardPath(pathname)

  const appMatch = normalized.match(/^\/dashboard\/apps\/([^/]+)$/)
  if (appMatch) {
    const app = appsRegistry.find((entry) => entry.id === appMatch[1])

    // Static app routes (such as the QR Card Hub) fall through to the
    // explicit route rules below instead of being treated as dynamic apps.
    if (app) return permission(app.id, "find", "read")
  }

  const rule = routeAccessRules
    .filter(
      (entry) =>
        normalized === entry.prefix ||
        normalized.startsWith(`${entry.prefix}/`)
    )
    .sort((a, b) => b.prefix.length - a.prefix.length)[0]

  return rule?.requirement ?? null
}

/** Whether the given user may open the path. */
export function canAccessRoute(
  user: DashboardUser | null | undefined,
  pathname: string
): boolean {
  if (!user) return false

  const requirement = getRouteRequirement(pathname)

  if (!requirement) return true
  if (requirement.type === "superAdmin") return user.isSuperAdmin

  return hasAnyPermission(user, requirement.resource, requirement.actions)
}

/** Whether the given user may launch a registered mini-app. */
export function canAccessApp(
  user: DashboardUser | null | undefined,
  appId: string
): boolean {
  if (!user) return false

  const app = appsRegistry.find((entry) => entry.id === appId)

  if (!app) return false

  return hasAnyPermission(user, app.id, ["find", "read"])
}
