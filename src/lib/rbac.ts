import { routing } from "@/i18n/routing"
import {
  appDefinitions,
  definitionForPath,
  getAppDefinition,
} from "./app-definitions"
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
  {
    prefix: "/dashboard/docs",
    requirement: permission("docs", "find", "read"),
  },
  ...appDefinitions.flatMap((app) => app.routeRules),
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
    const app = getAppDefinition(appMatch[1])

    // Static app routes (such as the QR Card Hub) fall through to the
    // explicit route rules below instead of being treated as dynamic apps.
    if (app) return permission(app.permissionResource, "find", "read")
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

/** Whether the app is installed and enabled for the current session. */
export function isAppAvailableToUser(
  user: DashboardUser | null | undefined,
  appId: string
): boolean {
  if (!user) return false

  const state = user.appStates?.find((entry) => entry.appId === appId)
  return Boolean(state?.available)
}

/** Whether the given user may open the path. */
export function canAccessRoute(
  user: DashboardUser | null | undefined,
  pathname: string
): boolean {
  if (!user) return false

  const app = definitionForPath(pathname)
  if (app && !isAppAvailableToUser(user, app.id)) return false

  const requirement = getRouteRequirement(pathname)

  if (!requirement) return true
  if (requirement.type === "superAdmin") return user.isSuperAdmin

  return hasAnyPermission(user, requirement.resource, requirement.actions)
}

/**
 * Whether the user has the permission grants for an app, regardless of its
 * installed/enabled state. Used by the Apps Hub to distinguish "no access"
 * from "not installed".
 */
export function canAccessApp(
  user: DashboardUser | null | undefined,
  appId: string
): boolean {
  if (!user) return false

  const app = getAppDefinition(appId)

  if (!app) return false

  return hasAnyPermission(user, app.permissionResource, ["find", "read"])
}

/** Whether the user can actually launch an app (state + permissions). */
export function canLaunchApp(
  user: DashboardUser | null | undefined,
  appId: string
): boolean {
  return canAccessApp(user, appId) && isAppAvailableToUser(user, appId)
}
