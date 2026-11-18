import { cache } from "react"

import type {
  AppSetting,
  LocalizationSetting,
  NotificationSetting,
  SecuritySetting,
  StorageSetting,
} from "@/payload-types"
import { getPayloadClient } from "./payload"
import {
  DEFAULT_LOCALIZATION_SETTINGS,
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_SECURITY_SETTINGS,
  DEFAULT_STORAGE_SETTINGS,
  type AppConfigData,
  type LocalizationSettingsData,
  type NotificationSettingsData,
  type SecuritySettingsData,
  type StorageSettingsData,
} from "./system-settings-types"

export * from "./system-settings-types"

function text(value: unknown): string {
  return typeof value === "string" ? value : ""
}

function num(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback
}

function select<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T
): T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback
}

export function toSecuritySettings(
  value: SecuritySetting | null
): SecuritySettingsData {
  if (!value) return DEFAULT_SECURITY_SETTINGS

  return {
    sessionTimeout: num(value.sessionTimeout, DEFAULT_SECURITY_SETTINGS.sessionTimeout),
    forcePasswordExpiration: bool(
      value.forcePasswordExpiration,
      DEFAULT_SECURITY_SETTINGS.forcePasswordExpiration
    ),
    minLength: num(value.minLength, DEFAULT_SECURITY_SETTINGS.minLength),
    requireNumbers: bool(value.requireNumbers, DEFAULT_SECURITY_SETTINGS.requireNumbers),
    requireSymbols: bool(value.requireSymbols, DEFAULT_SECURITY_SETTINGS.requireSymbols),
    rateLimitEnabled: bool(
      value.rateLimitEnabled,
      DEFAULT_SECURITY_SETTINGS.rateLimitEnabled
    ),
    maxRequests: num(value.maxRequests, DEFAULT_SECURITY_SETTINGS.maxRequests),
    captchaProvider: select(
      value.captchaProvider,
      ["none", "recaptcha", "turnstile"] as const,
      DEFAULT_SECURITY_SETTINGS.captchaProvider
    ),
    captchaSiteKey: text(value.captchaSiteKey),
    captchaSecretKey: text(value.captchaSecretKey),
    ipAllowList: text(value.ipAllowList),
    ipBlockList: text(value.ipBlockList),
  }
}

export function toLocalizationSettings(
  value: LocalizationSetting | null
): LocalizationSettingsData {
  if (!value) return DEFAULT_LOCALIZATION_SETTINGS

  return {
    activeEnglish: bool(
      value.activeEnglish,
      DEFAULT_LOCALIZATION_SETTINGS.activeEnglish
    ),
    activeFrench: bool(
      value.activeFrench,
      DEFAULT_LOCALIZATION_SETTINGS.activeFrench
    ),
    activeArabic: bool(
      value.activeArabic,
      DEFAULT_LOCALIZATION_SETTINGS.activeArabic
    ),
    defaultLanguage: select(
      value.defaultLanguage,
      ["en", "fr", "ar"] as const,
      DEFAULT_LOCALIZATION_SETTINGS.defaultLanguage
    ),
    fallbackLanguage: select(
      value.fallbackLanguage,
      ["en", "fr", "ar"] as const,
      DEFAULT_LOCALIZATION_SETTINGS.fallbackLanguage
    ),
    timezone: select(
      value.timezone,
      ["utc", "casablanca", "paris", "london", "new-york", "riyadh"] as const,
      DEFAULT_LOCALIZATION_SETTINGS.timezone
    ),
    dateFormat: select(
      value.dateFormat,
      ["dmy", "ymd"] as const,
      DEFAULT_LOCALIZATION_SETTINGS.dateFormat
    ),
    firstDayOfWeek: select(
      value.firstDayOfWeek,
      ["sunday", "monday", "saturday"] as const,
      DEFAULT_LOCALIZATION_SETTINGS.firstDayOfWeek
    ),
  }
}

export function toNotificationSettings(
  value: NotificationSetting | null
): NotificationSettingsData {
  if (!value) return DEFAULT_NOTIFICATION_SETTINGS

  return {
    smtpHost: text(value.smtpHost),
    smtpPort: text(value.smtpPort) || DEFAULT_NOTIFICATION_SETTINGS.smtpPort,
    smtpUsername: text(value.smtpUsername),
    smtpPassword: text(value.smtpPassword),
    encryption: select(
      value.encryption,
      ["tls", "ssl", "none"] as const,
      DEFAULT_NOTIFICATION_SETTINGS.encryption
    ),
    senderEmail: text(value.senderEmail),
    senderName: text(value.senderName),
    notifyRegistrations: bool(
      value.notifyRegistrations,
      DEFAULT_NOTIFICATION_SETTINGS.notifyRegistrations
    ),
    notifySecurityAlerts: bool(
      value.notifySecurityAlerts,
      DEFAULT_NOTIFICATION_SETTINGS.notifySecurityAlerts
    ),
    notifyFailedLogins: bool(
      value.notifyFailedLogins,
      DEFAULT_NOTIFICATION_SETTINGS.notifyFailedLogins
    ),
    notifySystemErrors: bool(
      value.notifySystemErrors,
      DEFAULT_NOTIFICATION_SETTINGS.notifySystemErrors
    ),
  }
}

export function toStorageSettings(
  value: StorageSetting | null
): StorageSettingsData {
  if (!value) return DEFAULT_STORAGE_SETTINGS

  return {
    provider: select(
      value.provider,
      ["local", "s3", "r2", "uploadthing"] as const,
      DEFAULT_STORAGE_SETTINGS.provider
    ),
    bucket: text(value.bucket),
    region: text(value.region),
    accessKey: text(value.accessKey),
    secretKey: text(value.secretKey),
    maxSize: num(value.maxSize, DEFAULT_STORAGE_SETTINGS.maxSize),
    mimeTypes: text(value.mimeTypes) || DEFAULT_STORAGE_SETTINGS.mimeTypes,
  }
}

export function toAppConfigs(value: AppSetting | null): AppConfigData[] {
  const apps = Array.isArray(value?.apps) ? value.apps : []

  return apps
    .map((app) => ({
      appId: text(app.appId),
      enabled: app.enabled !== false,
      requiredRole: text(app.requiredRole),
      webhookUrl: text(app.webhookUrl),
    }))
    .filter((app) => app.appId.length > 0)
}

export const getSecuritySettings = cache(
  async (): Promise<SecuritySettingsData> => {
    try {
      const payload = await getPayloadClient()
      const settings = await payload.findGlobal({
        slug: "security-settings",
        depth: 0,
        overrideAccess: true,
      })

      return toSecuritySettings(settings as SecuritySetting)
    } catch {
      return DEFAULT_SECURITY_SETTINGS
    }
  }
)

export const getLocalizationSettings = cache(
  async (): Promise<LocalizationSettingsData> => {
    try {
      const payload = await getPayloadClient()
      const settings = await payload.findGlobal({
        slug: "localization-settings",
        depth: 0,
        overrideAccess: true,
      })

      return toLocalizationSettings(settings as LocalizationSetting)
    } catch {
      return DEFAULT_LOCALIZATION_SETTINGS
    }
  }
)

export const getNotificationSettings = cache(
  async (): Promise<NotificationSettingsData> => {
    try {
      const payload = await getPayloadClient()
      const settings = await payload.findGlobal({
        slug: "notification-settings",
        depth: 0,
        overrideAccess: true,
      })

      return toNotificationSettings(settings as NotificationSetting)
    } catch {
      return DEFAULT_NOTIFICATION_SETTINGS
    }
  }
)

export const getStorageSettings = cache(
  async (): Promise<StorageSettingsData> => {
    try {
      const payload = await getPayloadClient()
      const settings = await payload.findGlobal({
        slug: "storage-settings",
        depth: 0,
        overrideAccess: true,
      })

      return toStorageSettings(settings as StorageSetting)
    } catch {
      return DEFAULT_STORAGE_SETTINGS
    }
  }
)

export const getAppConfigs = cache(async (): Promise<AppConfigData[]> => {
  try {
    const payload = await getPayloadClient()
    const settings = await payload.findGlobal({
      slug: "app-settings",
      depth: 0,
      overrideAccess: true,
    })

    return toAppConfigs(settings as AppSetting)
  } catch {
    return []
  }
})
