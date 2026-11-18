import {
  LayoutDashboard,
  LayoutGrid,
  ScrollText,
  Settings2,
  ShieldCheck,
  UsersRound,
  type LucideIcon,
} from "lucide-react"

export type DashboardRole = "super_admin" | "admin" | "manager" | "user"

export type AppStatus = "active" | "beta" | "coming_soon"

export type CoreNavItem = {
  id: string
  /** Key relative to the `Dashboard.nav` namespace. */
  labelKey: string
  href: string
  icon: LucideIcon
}

export type RegisteredApp = {
  id: string
  /** Key relative to the `Dashboard` namespace, e.g. `apps.<id>.name`. */
  nameKey: string
  /** Key relative to the `Dashboard` namespace, e.g. `apps.<id>.description`. */
  descriptionKey: string
  href: string
  icon: LucideIcon
  status: AppStatus
  requiredRole: DashboardRole
}

export const roleOrder: DashboardRole[] = [
  "super_admin",
  "admin",
  "manager",
  "user",
]

/**
 * Core platform navigation. Every entry maps to a page inside
 * `src/app/[locale]/(dashboard)/dashboard`.
 */
export const coreNavItems: CoreNavItem[] = [
  {
    id: "overview",
    labelKey: "overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  { id: "apps", labelKey: "apps", href: "/dashboard/apps", icon: LayoutGrid },
  { id: "users", labelKey: "users", href: "/dashboard/users", icon: UsersRound },
  {
    id: "roles",
    labelKey: "roles",
    href: "/dashboard/roles",
    icon: ShieldCheck,
  },
  {
    id: "audit",
    labelKey: "audit",
    href: "/dashboard/audit-logs",
    icon: ScrollText,
  },
  {
    id: "settings",
    labelKey: "settings",
    href: "/dashboard/settings",
    icon: Settings2,
  },
]

/**
 * Modular apps registry. This is the single registration point for every
 * mini-app/plugin. It ships empty on purpose: add an entry here (plus its
 * permission resource and translation keys) and the app automatically appears
 * in the sidebar, the overview launcher, the Apps Hub and its own
 * `/dashboard/apps/[appId]` route without touching the core navigation.
 */
export const appsRegistry: RegisteredApp[] = []

export function getAppById(id: string): RegisteredApp | undefined {
  return appsRegistry.find((app) => app.id === id)
}

/**
 * Very small role comparison helper used by the app registry. A lower index
 * means a more privileged role.
 */
export function hasRequiredRole(
  currentRole: DashboardRole,
  requiredRole: DashboardRole
): boolean {
  return roleOrder.indexOf(currentRole) <= roleOrder.indexOf(requiredRole)
}
