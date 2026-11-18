"use server"

import crypto from "node:crypto"

import type { ApiToken } from "@/payload-types"
import type { ApiTokenView } from "./api-token-types"
import { recordAuditEvent } from "./audit"
import { getCurrentUser } from "./auth"
import { getPayloadClient } from "./payload"
import {
  hasAnyPermission,
  hasPermission,
  type PermissionAction,
} from "./permissions"
import type { ActionResult, DashboardUser } from "./users"

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return "Something went wrong. Please try again."
}

async function requirePermission(
  resource: string,
  action: PermissionAction
): Promise<DashboardUser> {
  const current = await getCurrentUser()

  if (!current || current.status !== "active") {
    throw new Error("Unauthorized")
  }

  if (!hasPermission(current, resource, action)) {
    throw new Error(
      "Forbidden: you do not have permission to perform this action."
    )
  }

  return current
}

async function requireAnyPermission(
  resource: string,
  actions: PermissionAction[]
): Promise<DashboardUser> {
  const current = await getCurrentUser()

  if (!current || current.status !== "active") {
    throw new Error("Unauthorized")
  }

  if (!hasAnyPermission(current, resource, actions)) {
    throw new Error(
      "Forbidden: you do not have permission to perform this action."
    )
  }

  return current
}

function toTokenView(doc: ApiToken): ApiTokenView {
  return {
    id: String(doc.id),
    name: doc.name,
    prefix: doc.prefix,
    created: doc.createdAt,
    lastUsed: doc.lastUsedAt ?? null,
  }
}

export async function listApiTokensAction(): Promise<
  ActionResult<ApiTokenView[]>
> {
  try {
    await requireAnyPermission("settings", ["find", "read"])

    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: "api-tokens",
      limit: 200,
      depth: 0,
      sort: "-createdAt",
      overrideAccess: true,
    })

    return {
      success: true,
      data: result.docs.map((doc) => toTokenView(doc as ApiToken)),
    }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function generateApiTokenAction(
  name: string
): Promise<ActionResult<{ token: ApiTokenView; secret: string }>> {
  try {
    const current = await requirePermission("settings", "update")
    const trimmed = name.trim()

    if (!trimmed) {
      throw new Error("A token name is required.")
    }

    const secret = `wbx_live_${crypto.randomBytes(24).toString("base64url")}`
    const prefix = secret.slice(0, 16)
    const tokenHash = crypto.createHash("sha256").update(secret).digest("hex")

    const payload = await getPayloadClient()
    const doc = (await payload.create({
      collection: "api-tokens",
      data: {
        name: trimmed,
        prefix,
        tokenHash,
        createdBy: current.id,
      },
      overrideAccess: true,
    })) as ApiToken

    await recordAuditEvent(
      {
        action: "apiKeyCreated",
        actorId: current.id,
        actorName: current.name,
        target: trimmed,
      },
      payload
    )

    return { success: true, data: { token: toTokenView(doc), secret } }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function revokeApiTokenAction(
  id: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const current = await requirePermission("settings", "update")
    const payload = await getPayloadClient()

    const existing = (await payload.findByID({
      collection: "api-tokens",
      id,
      depth: 0,
      overrideAccess: true,
    })) as ApiToken

    await payload.delete({
      collection: "api-tokens",
      id,
      overrideAccess: true,
    })

    await recordAuditEvent(
      {
        action: "apiKeyRevoked",
        actorId: current.id,
        actorName: current.name,
        target: existing.name,
      },
      payload
    )

    return { success: true, data: { id } }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function getWebhookAction(): Promise<
  ActionResult<{ webhookUrl: string }>
> {
  try {
    await requireAnyPermission("settings", ["find", "read"])

    const payload = await getPayloadClient()
    const settings = await payload.findGlobal({
      slug: "api-settings",
      depth: 0,
      overrideAccess: true,
    })

    return {
      success: true,
      data: {
        webhookUrl:
          typeof settings.webhookUrl === "string" ? settings.webhookUrl : "",
      },
    }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function saveWebhookAction(
  webhookUrl: string
): Promise<ActionResult<{ webhookUrl: string }>> {
  try {
    const current = await requirePermission("settings", "update")
    const payload = await getPayloadClient()
    const value = webhookUrl.trim()

    if (value) {
      try {
        const parsed = new URL(value)
        if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
          throw new Error("invalid")
        }
      } catch {
        throw new Error("Enter a valid webhook URL.")
      }
    }

    await payload.updateGlobal({
      slug: "api-settings",
      data: { webhookUrl: value },
      overrideAccess: true,
    })

    await recordAuditEvent(
      {
        action: "webhookUpdated",
        actorId: current.id,
        actorName: current.name,
        target: value || "—",
      },
      payload
    )

    return { success: true, data: { webhookUrl: value } }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}
