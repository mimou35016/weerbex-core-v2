import {
  ChartColumn,
  ChartNoAxesCombined,
  LayoutDashboard,
  LayoutGrid,
  PlugZap,
  ReceiptText,
  ScrollText,
  Settings2,
  ShieldCheck,
  UsersRound,
  Workflow,
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
  /** Key relative to the `Dashboard` namespace, e.g. `apps.analytics.name`. */
  nameKey: string
  /** Key relative to the `Dashboard` namespace, e.g. `apps.analytics.description`. */
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
 * Modular apps registry. Future mini-apps can be added here and they will
 * automatically show up in the sidebar, the overview launcher and the Apps Hub.
 */
export const appsRegistry: RegisteredApp[] = [
  {
    id: "analytics",
    nameKey: "apps.analytics.name",
    descriptionKey: "apps.analytics.description",
    href: "/dashboard/apps/analytics",
    icon: ChartNoAxesCombined,
    status: "active",
    requiredRole: "admin",
  },
  {
    id: "crm",
    nameKey: "apps.crm.name",
    descriptionKey: "apps.crm.description",
    href: "/dashboard/apps/crm",
    icon: UsersRound,
    status: "active",
    requiredRole: "manager",
  },
  {
    id: "billing",
    nameKey: "apps.billing.name",
    descriptionKey: "apps.billing.description",
    href: "/dashboard/apps/billing",
    icon: ReceiptText,
    status: "active",
    requiredRole: "admin",
  },
  {
    id: "automation",
    nameKey: "apps.automation.name",
    descriptionKey: "apps.automation.description",
    href: "/dashboard/apps/automation",
    icon: Workflow,
    status: "beta",
    requiredRole: "admin",
  },
  {
    id: "reports",
    nameKey: "apps.reports.name",
    descriptionKey: "apps.reports.description",
    href: "/dashboard/apps/reports",
    icon: ChartColumn,
    status: "active",
    requiredRole: "user",
  },
  {
    id: "integrations",
    nameKey: "apps.integrations.name",
    descriptionKey: "apps.integrations.description",
    href: "/dashboard/apps/integrations",
    icon: PlugZap,
    status: "coming_soon",
    requiredRole: "super_admin",
  },
]

export function getAppById(id: string): RegisteredApp | undefined {
  return appsRegistry.find((app) => app.id === id)
}

/**
 * Very small role comparison helper for the mock RBAC layer. A higher index
 * means a more privileged role.
 */
export function hasRequiredRole(
  currentRole: DashboardRole,
  requiredRole: DashboardRole
): boolean {
  return roleOrder.indexOf(currentRole) <= roleOrder.indexOf(requiredRole)
}
