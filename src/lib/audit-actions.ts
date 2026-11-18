"use server"

import type { AuditEntry } from "./audit-types"
import { getCurrentUser } from "./auth"
import { listAuditEntries } from "./audit"
import { hasAnyPermission } from "./permissions"
import type { ActionResult } from "./users"

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return "Something went wrong. Please try again."
}

export async function listAuditLogsAction(): Promise<ActionResult<AuditEntry[]>> {
  try {
    const current = await getCurrentUser()

    if (!current || current.status !== "active") {
      throw new Error("Unauthorized")
    }

    if (!hasAnyPermission(current, "audit", ["find", "read"])) {
      throw new Error(
        "Forbidden: you do not have permission to view audit logs."
      )
    }

    return { success: true, data: await listAuditEntries(200) }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}
