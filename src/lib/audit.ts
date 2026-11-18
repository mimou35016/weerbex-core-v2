import { headers } from "next/headers"
import type { Payload, Where } from "payload"

import type { AuditLog } from "@/payload-types"
import {
  normalizeAuditStatus,
  type AuditEntry,
  type AuditStatus,
} from "./audit-types"
import { getPayloadClient } from "./payload"

export type RecordAuditInput = {
  action: string
  actorName?: string
  actorId?: string | number | null
  target?: string
  ip?: string
  status?: AuditStatus
  metadata?: Record<string, unknown>
}

function text(value: unknown): string {
  return typeof value === "string" ? value : ""
}

/**
 * Best-effort client IP used for audit entries. Proxies may set either header;
 * the left-most forwarded address is the original client.
 */
export async function getRequestIp(): Promise<string> {
  try {
    const store = await headers()
    const forwarded = store.get("x-forwarded-for")

    if (forwarded) {
      const first = forwarded.split(",")[0]?.trim()
      if (first) return first
    }

    return store.get("x-real-ip")?.trim() ?? ""
  } catch {
    return ""
  }
}

export function toAuditEntry(doc: AuditLog): AuditEntry {
  return {
    id: String(doc.id),
    action: text(doc.action) || "unknown",
    actor: text(doc.actorName),
    target: text(doc.target),
    ip: text(doc.ip),
    status: normalizeAuditStatus(doc.status),
    timestamp: text(doc.createdAt) || new Date().toISOString(),
  }
}

/**
 * Appends an audit entry through the Local API. Failures are swallowed on
 * purpose: recording an event must never break the action it describes.
 */
export async function recordAuditEvent(
  input: RecordAuditInput,
  payload?: Payload
): Promise<void> {
  try {
    const client = payload ?? (await getPayloadClient())
    const ip = input.ip ?? (await getRequestIp())

    await client.create({
      collection: "audit-logs",
      overrideAccess: true,
      data: {
        action: input.action,
        ...(input.actorId ? { actor: String(input.actorId) } : {}),
        actorName: input.actorName?.trim() ?? "",
        target: input.target?.trim() ?? "",
        ip,
        status: input.status ?? "success",
        ...(input.metadata ? { metadata: input.metadata } : {}),
      },
    })
  } catch (error) {
    console.error("[audit] failed to record event", input.action, error)
  }
}

export async function listAuditEntries(limit = 200): Promise<AuditEntry[]> {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: "audit-logs",
      limit,
      depth: 0,
      sort: "-createdAt",
      overrideAccess: true,
    })

    return result.docs.map((doc) => toAuditEntry(doc as AuditLog))
  } catch {
    return []
  }
}

export async function countAuditEntries(options?: {
  since?: Date
  status?: AuditStatus
}): Promise<number> {
  try {
    const payload = await getPayloadClient()
    const where: Where = {}

    if (options?.since) {
      where.createdAt = { greater_than: options.since.toISOString() }
    }

    if (options?.status) {
      where.status = { equals: options.status }
    }

    const result = await payload.count({
      collection: "audit-logs",
      overrideAccess: true,
      ...(Object.keys(where).length > 0 ? { where } : {}),
    })

    return result.totalDocs
  } catch {
    return 0
  }
}
