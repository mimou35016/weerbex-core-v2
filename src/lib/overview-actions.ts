"use server"

import type { AuditEntry } from "./audit-types"
import { countAuditEntries, listAuditEntries } from "./audit"
import { getCurrentUser } from "./auth"
import { getPayloadClient } from "./payload"
import { hasAnyPermission } from "./permissions"
import type { ActionResult } from "./users"

export type OverviewStats = {
  totalUsers: number
  activeUsers: number
  recentActivity: AuditEntry[]
  last24h: number
  failed24h: number
  canViewAudit: boolean
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return "Something went wrong. Please try again."
}

/**
 * Aggregated numbers for the dashboard overview. Every value is computed from
 * Payload at request time; nothing is hardcoded. Sections the actor cannot read
 * are returned as zero/empty instead of leaking counts.
 */
export async function getOverviewStatsAction(): Promise<
  ActionResult<OverviewStats>
> {
  try {
    const current = await getCurrentUser()

    if (!current || current.status !== "active") {
      throw new Error("Unauthorized")
    }

    const payload = await getPayloadClient()
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000)

    let totalUsers = 0
    let activeUsers = 0

    if (hasAnyPermission(current, "users", ["find", "read"])) {
      const [total, active] = await Promise.all([
        payload.count({ collection: "users", overrideAccess: true }),
        payload.count({
          collection: "users",
          overrideAccess: true,
          where: { status: { equals: "active" } },
        }),
      ])

      totalUsers = total.totalDocs
      activeUsers = active.totalDocs
    }

    const canViewAudit = hasAnyPermission(current, "audit", [
      "find",
      "read",
    ])

    let recentActivity: AuditEntry[] = []
    let last24h = 0
    let failed24h = 0

    if (canViewAudit) {
      ;[recentActivity, last24h, failed24h] = await Promise.all([
        listAuditEntries(6),
        countAuditEntries({ since }),
        countAuditEntries({ since, status: "failed" }),
      ])
    }

    return {
      success: true,
      data: {
        totalUsers,
        activeUsers,
        recentActivity,
        last24h,
        failed24h,
        canViewAudit,
      },
    }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}
