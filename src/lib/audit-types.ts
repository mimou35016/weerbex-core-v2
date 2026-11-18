/**
 * Dependency-free audit log types shared by the server helpers, the Payload
 * collection and the client components. Keeping them here prevents the
 * Payload runtime from being pulled into the browser bundle.
 */

export type AuditStatus = "success" | "failed" | "warning"

export const auditStatuses: AuditStatus[] = ["success", "failed", "warning"]

/**
 * Machine-readable action identifiers. The dashboard resolves the human label
 * from `Dashboard.audit.actions.<action>` and falls back to the raw value so
 * new modules can record events before their translations land.
 */
export type AuditAction =
  | "login"
  | "logout"
  | "profileUpdated"
  | "userCreated"
  | "userUpdated"
  | "userDeleted"
  | "roleChanged"
  | "settingsUpdated"
  | "apiKeyCreated"
  | "apiKeyRevoked"
  | "webhookUpdated"
  | "appEnabled"
  | "appDisabled"
  | "appConfigured"
  | "sitemapRegenerated"

export type AuditEntry = {
  id: string
  action: string
  actor: string
  target: string
  ip: string
  status: AuditStatus
  timestamp: string
}

export function normalizeAuditStatus(value: unknown): AuditStatus {
  return value === "failed" || value === "warning" ? value : "success"
}
