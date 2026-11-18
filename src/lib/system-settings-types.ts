/**
 * Dependency-free types and defaults for the operational settings globals.
 * Client components import from this module so Payload never enters the
 * browser bundle. The database stays the source of truth; these defaults only
 * describe the shape and first-run values.
 */

export type SecuritySettingsData = {
  sessionTimeout: number
  forcePasswordExpiration: boolean
  minLength: number
  requireNumbers: boolean
  requireSymbols: boolean
  rateLimitEnabled: boolean
  maxRequests: number
  captchaProvider: "none" | "recaptcha" | "turnstile"
  captchaSiteKey: string
  captchaSecretKey: string
  ipAllowList: string
  ipBlockList: string
}

export type LocalizationSettingsData = {
  activeEnglish: boolean
  activeFrench: boolean
  activeArabic: boolean
  defaultLanguage: "en" | "fr" | "ar"
  fallbackLanguage: "en" | "fr" | "ar"
  timezone:
    | "utc"
    | "casablanca"
    | "paris"
    | "london"
    | "new-york"
    | "riyadh"
  dateFormat: "dmy" | "ymd"
  firstDayOfWeek: "sunday" | "monday" | "saturday"
}

export type NotificationSettingsData = {
  smtpHost: string
  smtpPort: string
  smtpUsername: string
  smtpPassword: string
  encryption: "tls" | "ssl" | "none"
  senderEmail: string
  senderName: string
  notifyRegistrations: boolean
  notifySecurityAlerts: boolean
  notifyFailedLogins: boolean
  notifySystemErrors: boolean
}

export type StorageSettingsData = {
  provider: "local" | "s3" | "r2" | "uploadthing"
  bucket: string
  region: string
  accessKey: string
  secretKey: string
  maxSize: number
  mimeTypes: string
}

export type AppConfigData = {
  appId: string
  enabled: boolean
  requiredRole: string
  webhookUrl: string
}

export const DEFAULT_SECURITY_SETTINGS: SecuritySettingsData = {
  sessionTimeout: 60,
  forcePasswordExpiration: false,
  minLength: 12,
  requireNumbers: true,
  requireSymbols: true,
  rateLimitEnabled: true,
  maxRequests: 120,
  captchaProvider: "turnstile",
  captchaSiteKey: "",
  captchaSecretKey: "",
  ipAllowList: "",
  ipBlockList: "",
}

export const DEFAULT_LOCALIZATION_SETTINGS: LocalizationSettingsData = {
  activeEnglish: true,
  activeFrench: true,
  activeArabic: true,
  defaultLanguage: "en",
  fallbackLanguage: "en",
  timezone: "utc",
  dateFormat: "dmy",
  firstDayOfWeek: "monday",
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettingsData = {
  smtpHost: "",
  smtpPort: "587",
  smtpUsername: "",
  smtpPassword: "",
  encryption: "tls",
  senderEmail: "",
  senderName: "",
  notifyRegistrations: true,
  notifySecurityAlerts: true,
  notifyFailedLogins: true,
  notifySystemErrors: false,
}

export const DEFAULT_STORAGE_SETTINGS: StorageSettingsData = {
  provider: "local",
  bucket: "",
  region: "",
  accessKey: "",
  secretKey: "",
  maxSize: 10,
  mimeTypes: "image/png, image/jpeg, application/pdf",
}
