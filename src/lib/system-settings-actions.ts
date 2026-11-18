"use server"

import { revalidatePath } from "next/cache"

import { getAppById } from "@/config/dashboard-nav"
import { recordAuditEvent } from "./audit"
import { getCurrentUser } from "./auth"
import { getPayloadClient } from "./payload"
import {
  hasAnyPermission,
  hasPermission,
  type PermissionAction,
} from "./permissions"
import {
  getAppConfigs,
  getLocalizationSettings,
  getNotificationSettings,
  getSecuritySettings,
  getStorageSettings,
  toAppConfigs,
  toLocalizationSettings,
  toNotificationSettings,
  toSecuritySettings,
  toStorageSettings,
} from "./system-settings"
import type {
  AppConfigData,
  LocalizationSettingsData,
  NotificationSettingsData,
  SecuritySettingsData,
  StorageSettingsData,
} from "./system-settings-types"
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

function revalidateSettings(): void {
  revalidatePath("/", "layout")
}

function clamp(value: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback
  return Math.min(max, Math.max(min, Math.round(value)))
}

export async function getSecuritySettingsAction(): Promise<
  ActionResult<SecuritySettingsData>
> {
  try {
    await requireAnyPermission("security", ["find", "read"])
    return { success: true, data: await getSecuritySettings() }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function saveSecuritySettingsAction(
  input: SecuritySettingsData
): Promise<ActionResult<SecuritySettingsData>> {
  try {
    const current = await requirePermission("security", "update")
    const payload = await getPayloadClient()

    await payload.updateGlobal({
      slug: "security-settings",
      overrideAccess: true,
      data: {
        sessionTimeout: clamp(input.sessionTimeout, 5, 1440, 60),
        forcePasswordExpiration: input.forcePasswordExpiration,
        minLength: clamp(input.minLength, 6, 32, 12),
        requireNumbers: input.requireNumbers,
        requireSymbols: input.requireSymbols,
        rateLimitEnabled: input.rateLimitEnabled,
        maxRequests: clamp(input.maxRequests, 10, 600, 120),
        captchaProvider: input.captchaProvider,
        captchaSiteKey: input.captchaSiteKey.trim(),
        captchaSecretKey: input.captchaSecretKey.trim(),
        ipAllowList: input.ipAllowList,
        ipBlockList: input.ipBlockList,
      },
    })

    await recordAuditEvent(
      {
        action: "settingsUpdated",
        actorId: current.id,
        actorName: current.name,
        target: "Security",
      },
      payload
    )

    revalidateSettings()

    const settings = await payload.findGlobal({
      slug: "security-settings",
      depth: 0,
      overrideAccess: true,
    })

    return { success: true, data: toSecuritySettings(settings) }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function getLocalizationSettingsAction(): Promise<
  ActionResult<LocalizationSettingsData>
> {
  try {
    await requireAnyPermission("localization", ["find", "read"])
    return { success: true, data: await getLocalizationSettings() }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function saveLocalizationSettingsAction(
  input: LocalizationSettingsData
): Promise<ActionResult<LocalizationSettingsData>> {
  try {
    const current = await requirePermission("localization", "update")
    const payload = await getPayloadClient()

    await payload.updateGlobal({
      slug: "localization-settings",
      overrideAccess: true,
      data: {
        activeEnglish: input.activeEnglish,
        activeFrench: input.activeFrench,
        activeArabic: input.activeArabic,
        defaultLanguage: input.defaultLanguage,
        fallbackLanguage: input.fallbackLanguage,
        timezone: input.timezone,
        dateFormat: input.dateFormat,
        firstDayOfWeek: input.firstDayOfWeek,
      },
    })

    await recordAuditEvent(
      {
        action: "settingsUpdated",
        actorId: current.id,
        actorName: current.name,
        target: "Localization",
      },
      payload
    )

    revalidateSettings()

    const settings = await payload.findGlobal({
      slug: "localization-settings",
      depth: 0,
      overrideAccess: true,
    })

    return { success: true, data: toLocalizationSettings(settings) }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function getNotificationSettingsAction(): Promise<
  ActionResult<NotificationSettingsData>
> {
  try {
    await requireAnyPermission("notifications", ["find", "read"])
    return { success: true, data: await getNotificationSettings() }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function saveNotificationSettingsAction(
  input: NotificationSettingsData
): Promise<ActionResult<NotificationSettingsData>> {
  try {
    const current = await requirePermission("notifications", "update")
    const payload = await getPayloadClient()

    await payload.updateGlobal({
      slug: "notification-settings",
      overrideAccess: true,
      data: {
        smtpHost: input.smtpHost.trim(),
        smtpPort: input.smtpPort.trim() || "587",
        smtpUsername: input.smtpUsername.trim(),
        smtpPassword: input.smtpPassword,
        encryption: input.encryption,
        senderEmail: input.senderEmail.trim(),
        senderName: input.senderName.trim(),
        notifyRegistrations: input.notifyRegistrations,
        notifySecurityAlerts: input.notifySecurityAlerts,
        notifyFailedLogins: input.notifyFailedLogins,
        notifySystemErrors: input.notifySystemErrors,
      },
    })

    await recordAuditEvent(
      {
        action: "settingsUpdated",
        actorId: current.id,
        actorName: current.name,
        target: "Notifications",
      },
      payload
    )

    revalidateSettings()

    const settings = await payload.findGlobal({
      slug: "notification-settings",
      depth: 0,
      overrideAccess: true,
    })

    return { success: true, data: toNotificationSettings(settings) }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function getStorageSettingsAction(): Promise<
  ActionResult<StorageSettingsData>
> {
  try {
    await requireAnyPermission("storage", ["find", "read"])
    return { success: true, data: await getStorageSettings() }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function saveStorageSettingsAction(
  input: StorageSettingsData
): Promise<ActionResult<StorageSettingsData>> {
  try {
    const current = await requirePermission("storage", "update")
    const payload = await getPayloadClient()

    await payload.updateGlobal({
      slug: "storage-settings",
      overrideAccess: true,
      data: {
        provider: input.provider,
        bucket: input.bucket.trim(),
        region: input.region.trim(),
        accessKey: input.accessKey.trim(),
        secretKey: input.secretKey,
        maxSize: clamp(input.maxSize, 1, 100, 10),
        mimeTypes: input.mimeTypes.trim(),
      },
    })

    await recordAuditEvent(
      {
        action: "settingsUpdated",
        actorId: current.id,
        actorName: current.name,
        target: "Storage",
      },
      payload
    )

    revalidateSettings()

    const settings = await payload.findGlobal({
      slug: "storage-settings",
      depth: 0,
      overrideAccess: true,
    })

    return { success: true, data: toStorageSettings(settings) }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function getAppConfigsAction(): Promise<
  ActionResult<AppConfigData[]>
> {
  try {
    await requireAnyPermission("appsHub", ["find", "read"])
    return { success: true, data: await getAppConfigs() }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

async function writeAppConfigs(
  apps: AppConfigData[]
): Promise<AppConfigData[]> {
  const payload = await getPayloadClient()

  await payload.updateGlobal({
    slug: "app-settings",
    overrideAccess: true,
    data: {
      apps: apps.map((app) => ({
        appId: app.appId,
        enabled: app.enabled,
        requiredRole: app.requiredRole,
        webhookUrl: app.webhookUrl,
      })),
    },
  })

  const settings = await payload.findGlobal({
    slug: "app-settings",
    depth: 0,
    overrideAccess: true,
  })

  return toAppConfigs(settings)
}

export async function saveAppConfigAction(
  input: AppConfigData
): Promise<ActionResult<AppConfigData[]>> {
  try {
    const current = await requirePermission("appsHub", "configure")
    const app = getAppById(input.appId)

    if (!app) {
      throw new Error("Unknown app.")
    }

    const existing = await getAppConfigs()
    const previous = existing.find((entry) => entry.appId === input.appId)
    const next = existing.some((entry) => entry.appId === input.appId)
      ? existing.map((entry) =>
          entry.appId === input.appId ? { ...input } : entry
        )
      : [...existing, { ...input }]

    const apps = await writeAppConfigs(next)
    const enabled = input.enabled

    await recordAuditEvent({
      action:
        previous && previous.enabled !== enabled
          ? enabled
            ? "appEnabled"
            : "appDisabled"
          : "appConfigured",
      actorId: current.id,
      actorName: current.name,
      target: input.appId,
    })

    revalidateSettings()

    return { success: true, data: apps }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function toggleAppAction(
  appId: string,
  enabled: boolean
): Promise<ActionResult<AppConfigData[]>> {
  try {
    const current = await requirePermission("appsHub", "configure")
    const app = getAppById(appId)

    if (!app) {
      throw new Error("Unknown app.")
    }

    const existing = await getAppConfigs()
    const previous = existing.find((entry) => entry.appId === appId)
    const config: AppConfigData = {
      appId,
      enabled,
      requiredRole: previous?.requiredRole ?? app.requiredRole,
      webhookUrl: previous?.webhookUrl ?? "",
    }
    const next = existing.some((entry) => entry.appId === appId)
      ? existing.map((entry) => (entry.appId === appId ? config : entry))
      : [...existing, config]

    const apps = await writeAppConfigs(next)

    await recordAuditEvent({
      action: enabled ? "appEnabled" : "appDisabled",
      actorId: current.id,
      actorName: current.name,
      target: appId,
    })

    revalidateSettings()

    return { success: true, data: apps }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}
