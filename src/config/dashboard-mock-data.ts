import type { DashboardRole } from "./dashboard-nav"

export type AuditStatus = "success" | "failed" | "warning"

export type AuditLog = {
  id: string
  /** Key relative to the `Dashboard` namespace, e.g. `audit.actions.login`. */
  actionKey: string
  user: string
  target: string
  ip: string
  status: AuditStatus
  timestamp: string
}

export type ActivityItem = {
  id: string
  actor: string
  /** Key relative to the `Dashboard` namespace, e.g. `audit.actions.login`. */
  actionKey: string
  target: string
  timestamp: string
  status: AuditStatus
}

export type ApiToken = {
  id: string
  name: string
  prefix: string
  created: string
  lastUsed: string | null
}

export const mockActivity: ActivityItem[] = [
  {
    id: "act_01",
    actor: "Amina El-Sayed",
    actionKey: "audit.actions.apiKeyCreated",
    target: "billing-sync",
    timestamp: "2026-11-18T09:42:00.000Z",
    status: "success",
  },
  {
    id: "act_02",
    actor: "Lucas Martin",
    actionKey: "audit.actions.appEnabled",
    target: "Analytics",
    timestamp: "2026-11-18T08:15:00.000Z",
    status: "success",
  },
  {
    id: "act_03",
    actor: "Sofia Rossi",
    actionKey: "audit.actions.roleChanged",
    target: "Omar Benali",
    timestamp: "2026-11-17T19:03:00.000Z",
    status: "success",
  },
  {
    id: "act_04",
    actor: "Youssef Haddad",
    actionKey: "audit.actions.login",
    target: "web console",
    timestamp: "2026-11-17T16:48:00.000Z",
    status: "failed",
  },
  {
    id: "act_05",
    actor: "Karim Nasser",
    actionKey: "audit.actions.settingsUpdated",
    target: "Support email",
    timestamp: "2026-11-17T12:26:00.000Z",
    status: "success",
  },
  {
    id: "act_06",
    actor: "Amina El-Sayed",
    actionKey: "audit.actions.userCreated",
    target: "Emily Carter",
    timestamp: "2026-11-16T21:11:00.000Z",
    status: "warning",
  },
]

export const mockAuditLogs: AuditLog[] = [
  {
    id: "log_01",
    actionKey: "audit.actions.login",
    user: "Amina El-Sayed",
    target: "Web console",
    ip: "192.168.1.24",
    status: "success",
    timestamp: "2026-11-18T09:51:00.000Z",
  },
  {
    id: "log_02",
    actionKey: "audit.actions.apiKeyCreated",
    user: "Amina El-Sayed",
    target: "billing-sync",
    ip: "192.168.1.24",
    status: "success",
    timestamp: "2026-11-18T09:42:00.000Z",
  },
  {
    id: "log_03",
    actionKey: "audit.actions.appEnabled",
    user: "Lucas Martin",
    target: "Analytics",
    ip: "10.0.0.18",
    status: "success",
    timestamp: "2026-11-18T08:15:00.000Z",
  },
  {
    id: "log_04",
    actionKey: "audit.actions.login",
    user: "Youssef Haddad",
    target: "Web console",
    ip: "203.0.113.57",
    status: "failed",
    timestamp: "2026-11-17T16:48:00.000Z",
  },
  {
    id: "log_05",
    actionKey: "audit.actions.roleChanged",
    user: "Sofia Rossi",
    target: "Omar Benali",
    ip: "10.0.0.42",
    status: "success",
    timestamp: "2026-11-17T19:03:00.000Z",
  },
  {
    id: "log_06",
    actionKey: "audit.actions.settingsUpdated",
    user: "Karim Nasser",
    target: "Support email",
    ip: "10.0.0.51",
    status: "success",
    timestamp: "2026-11-17T12:26:00.000Z",
  },
  {
    id: "log_07",
    actionKey: "audit.actions.appDisabled",
    user: "Lucas Martin",
    target: "Automation",
    ip: "10.0.0.18",
    status: "warning",
    timestamp: "2026-11-16T22:40:00.000Z",
  },
  {
    id: "log_08",
    actionKey: "audit.actions.userCreated",
    user: "Amina El-Sayed",
    target: "Emily Carter",
    ip: "192.168.1.24",
    status: "success",
    timestamp: "2026-11-16T21:11:00.000Z",
  },
  {
    id: "log_09",
    actionKey: "audit.actions.logout",
    user: "Omar Benali",
    target: "Web console",
    ip: "10.0.0.42",
    status: "success",
    timestamp: "2026-11-16T18:02:00.000Z",
  },
  {
    id: "log_10",
    actionKey: "audit.actions.login",
    user: "Clara Dubois",
    target: "Web console",
    ip: "198.51.100.9",
    status: "failed",
    timestamp: "2026-11-16T07:33:00.000Z",
  },
]

export const mockApiTokens: ApiToken[] = [
  {
    id: "tok_01",
    name: "billing-sync",
    prefix: "wbx_live_4f9a",
    created: "2026-09-04T10:00:00.000Z",
    lastUsed: "2026-11-18T09:40:00.000Z",
  },
  {
    id: "tok_02",
    name: "analytics-exporter",
    prefix: "wbx_live_c21d",
    created: "2026-06-19T15:20:00.000Z",
    lastUsed: "2026-11-15T22:05:00.000Z",
  },
  {
    id: "tok_03",
    name: "legacy-crm-bridge",
    prefix: "wbx_test_88be",
    created: "2025-12-01T09:10:00.000Z",
    lastUsed: null,
  },
]

export type PermissionAction = "read" | "write" | "delete"

export type PermissionResource = {
  id: string
  /** Key relative to the `Dashboard` namespace. */
  labelKey: string
  group: "core" | "apps"
}

export const permissionResources: PermissionResource[] = [
  { id: "users", labelKey: "roles.resources.users", group: "core" },
  { id: "roles", labelKey: "roles.resources.roles", group: "core" },
  { id: "audit", labelKey: "roles.resources.audit", group: "core" },
  { id: "settings", labelKey: "roles.resources.settings", group: "core" },
  { id: "appsHub", labelKey: "roles.resources.appsHub", group: "core" },
  { id: "analytics", labelKey: "apps.analytics.name", group: "apps" },
  { id: "crm", labelKey: "apps.crm.name", group: "apps" },
  { id: "billing", labelKey: "apps.billing.name", group: "apps" },
  { id: "automation", labelKey: "apps.automation.name", group: "apps" },
  { id: "reports", labelKey: "apps.reports.name", group: "apps" },
  { id: "integrations", labelKey: "apps.integrations.name", group: "apps" },
]

export type PermissionMatrix = Record<
  DashboardRole,
  Record<string, Record<PermissionAction, boolean>>
>

function buildMatrix(
  levels: Record<DashboardRole, number>
): PermissionMatrix {
  const result = {} as PermissionMatrix

  for (const role of Object.keys(levels) as DashboardRole[]) {
    result[role] = {}
    for (const resource of permissionResources) {
      const level = levels[role]
      result[role][resource.id] = {
        read: level >= 1,
        write: level >= 2,
        delete: level >= 3,
      }
    }
    // Everyone can always read the Apps Hub so they can launch their apps.
    if (result[role].appsHub) {
      result[role].appsHub.read = true
    }
  }

  return result
}

export const defaultPermissionMatrix: PermissionMatrix = buildMatrix({
  super_admin: 3,
  admin: 3,
  manager: 2,
  user: 1,
})
