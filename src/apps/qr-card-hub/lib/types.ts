/**
 * Shared, dependency-free types and normalizers for the QR & Digital Card
 * Hub. Both the Payload collections (server) and the client UI import from
 * this file, so it must never pull in server-only code.
 */

export type QrKind = "static" | "dynamic"

export type QrType = "url" | "text" | "wifi" | "vcard" | "email" | "phone"

export type WifiEncryption = "WPA" | "WEP" | "nopass"

export type QrDotStyle =
  | "square"
  | "dots"
  | "rounded"
  | "classy"
  | "classy-rounded"
  | "extra-rounded"

export type QrCornerStyle = "square" | "dot" | "extra-rounded"

export type QrErrorCorrection = "L" | "M" | "Q" | "H"

export type CardTemplateId = "modern" | "corporate" | "cyber" | "glass"

export type SocialPlatform =
  | "website"
  | "linkedin"
  | "x"
  | "facebook"
  | "instagram"
  | "github"
  | "youtube"
  | "tiktok"
  | "whatsapp"
  | "telegram"

export type MediaRef = {
  id: string
  url: string
  alt: string | null
}

export type SocialLinkInput = {
  platform: SocialPlatform
  url: string
  label: string
}

/** The action a Linktree-style card item performs when tapped. */
export const cardLinkTypes = [
  "url",
  "phone",
  "whatsapp",
  "email",
  "location",
  "copy",
  "payment",
] as const

export type CardLinkType = (typeof cardLinkTypes)[number]

/**
 * Linktree-style button rendered on the card, ordered by array position.
 *
 * `url` is intentionally kept as the raw value field for every type (it used
 * to hold a website URL only). This keeps every card already saved in MongoDB
 * valid: a missing `type` is normalized to `"url"` by `normalizeCustomLinks`.
 */
export type CustomLinkInput = {
  label: string
  url: string
  type: CardLinkType
  /** Optional pre-filled message for WhatsApp items. */
  message: string
}

export type QrFormData = {
  title: string
  kind: QrKind
  qrType: QrType
  url: string
  text: string
  email: string
  emailSubject: string
  emailBody: string
  phone: string
  wifiSsid: string
  wifiPassword: string
  wifiEncryption: WifiEncryption
  wifiHidden: boolean
  vcardFirstName: string
  vcardLastName: string
  vcardOrganization: string
  vcardJobTitle: string
  vcardPhone: string
  vcardEmail: string
  vcardWebsite: string
  vcardAddress: string
  cardId: string
  dotStyle: QrDotStyle
  cornerStyle: QrCornerStyle
  foregroundColor: string
  backgroundColor: string
  useGradient: boolean
  gradientColor: string
  logo: MediaRef | null
  logoSize: number
  margin: number
  errorCorrection: QrErrorCorrection
  size: number
  published: boolean
}

export type QrCardSummary = {
  id: string
  name: string
  slug: string
  published: boolean
}

export type QrCodeData = QrFormData & {
  id: string
  /** Resolved, ready-to-encode payload for the current locale. */
  content: string
  cardSlug: string | null
  cardName: string | null
  cardPublished: boolean
  createdAt: string
  updatedAt: string
}

export type DigitalCardFormData = {
  title: string
  slug: string
  fullName: string
  jobTitle: string
  company: string
  bio: string
  email: string
  phone: string
  website: string
  address: string
  avatar: MediaRef | null
  template: CardTemplateId
  brandColor: string
  accentColor: string
  socialLinks: SocialLinkInput[]
  links: CustomLinkInput[]
  published: boolean
}

export type DigitalCardData = DigitalCardFormData & {
  id: string
  createdAt: string
  updatedAt: string
}

export const qrKinds: QrKind[] = ["static", "dynamic"]

export const qrTypes: QrType[] = [
  "url",
  "text",
  "wifi",
  "vcard",
  "email",
  "phone",
]

export const qrDotStyles: QrDotStyle[] = [
  "square",
  "dots",
  "rounded",
  "classy",
  "classy-rounded",
  "extra-rounded",
]

export const qrCornerStyles: QrCornerStyle[] = [
  "square",
  "dot",
  "extra-rounded",
]

export const qrErrorCorrections: QrErrorCorrection[] = ["L", "M", "Q", "H"]

export const wifiEncryptions: WifiEncryption[] = ["WPA", "WEP", "nopass"]

export const cardTemplates: CardTemplateId[] = [
  "modern",
  "corporate",
  "cyber",
  "glass",
]

export const socialPlatforms: SocialPlatform[] = [
  "website",
  "linkedin",
  "x",
  "facebook",
  "instagram",
  "github",
  "youtube",
  "tiktok",
  "whatsapp",
  "telegram",
]

export const qrSizeOptions = [512, 1024, 2048, 4096] as const

export const DEFAULT_QR_FORM: QrFormData = {
  title: "",
  kind: "static",
  qrType: "url",
  url: "",
  text: "",
  email: "",
  emailSubject: "",
  emailBody: "",
  phone: "",
  wifiSsid: "",
  wifiPassword: "",
  wifiEncryption: "WPA",
  wifiHidden: false,
  vcardFirstName: "",
  vcardLastName: "",
  vcardOrganization: "",
  vcardJobTitle: "",
  vcardPhone: "",
  vcardEmail: "",
  vcardWebsite: "",
  vcardAddress: "",
  cardId: "",
  dotStyle: "rounded",
  cornerStyle: "extra-rounded",
  foregroundColor: "#111827",
  backgroundColor: "#ffffff",
  useGradient: false,
  gradientColor: "#4f46e5",
  logo: null,
  logoSize: 0.35,
  margin: 12,
  errorCorrection: "H",
  size: 1024,
  published: true,
}

export const DEFAULT_CARD_FORM: DigitalCardFormData = {
  title: "",
  slug: "",
  fullName: "",
  jobTitle: "",
  company: "",
  bio: "",
  email: "",
  phone: "",
  website: "",
  address: "",
  avatar: null,
  template: "modern",
  brandColor: "#4f46e5",
  accentColor: "#0ea5e9",
  socialLinks: [],
  links: [],
  published: false,
}

export function pick<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T
): T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback
}

export function text(value: unknown): string {
  return typeof value === "string" ? value : ""
}

const anyScheme = /^[a-z][a-z0-9+.-]*:/i
const safeScheme = /^https?:\/\//i
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeCardLinkType(value: unknown): CardLinkType {
  return pick(value, cardLinkTypes, "url")
}

/** Rejects `javascript:` and other non-navigational schemes. */
function safeWebUrl(value: string): string {
  const url = value.trim()

  if (!url) return ""
  if (anyScheme.test(url)) return safeScheme.test(url) ? url : ""

  return `https://${url}`
}

export function phoneDigits(value: string): string {
  const hasPlus = value.trimStart().startsWith("+")
  const digits = value.replace(/\D/g, "")

  return hasPlus && digits ? `+${digits}` : digits
}

/** True when the raw value can perform the selected action. */
export function isCardLinkValueValid(
  type: CardLinkType,
  rawValue: string
): boolean {
  const value = rawValue.trim()

  if (!value) return false

  switch (type) {
    case "phone":
      return phoneDigits(value).replace(/\D/g, "").length >= 5
    case "whatsapp":
      return phoneDigits(value).replace(/\D/g, "").length >= 6
    case "email":
      return emailPattern.test(value) && !anyScheme.test(value)
    case "copy":
      return true
    case "location":
      return value.length > 1
    case "url":
    case "payment":
      return /^https?:\/\/[^\s/?#]+/i.test(safeWebUrl(value))
  }
}

/** Localization key suffix for the first invalid part of an item, if any. */
export function cardLinkError(
  link: Pick<CustomLinkInput, "type" | "url">
): string | null {
  const type = normalizeCardLinkType(link.type)
  const value = link.url.trim()

  if (!value) return "linkValueRequired"
  if (!isCardLinkValueValid(type, value)) {
    return type === "email"
      ? "linkEmailInvalid"
      : type === "phone" || type === "whatsapp"
        ? "linkPhoneInvalid"
        : "linkValueInvalid"
  }

  return null
}

/** Builds the action URL for an item. Copyable items return an empty string. */
export function cardLinkHref(link: Pick<CustomLinkInput, "type" | "url" | "message">): string {
  const value = link.url.trim()

  switch (normalizeCardLinkType(link.type)) {
    case "phone":
      return `tel:${phoneDigits(value)}`
    case "whatsapp": {
      const number = phoneDigits(value).replace(/\D/g, "")
      const message = text(link.message).trim()
      const query = message ? `?text=${encodeURIComponent(message)}` : ""

      return `https://wa.me/${number}${query}`
    }
    case "email":
      return `mailto:${value}`
    case "location":
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`
    case "copy":
      return ""
    case "url":
    case "payment":
      return safeWebUrl(value)
  }
}

/** Builds a readable fallback label for a value of any supported type. */
export function linkLabelFromValue(link: Pick<CustomLinkInput, "type" | "url">): string {
  const value = link.url.trim()

  if (normalizeCardLinkType(link.type) === "url") {
    return value
      .replace(/^[a-z][a-z0-9+.-]*:\/\//i, "")
      .replace(/^www\./i, "")
      .replace(/[?#].*$/, "")
      .replace(/\/+$/, "")
  }

  return value.length > 42 ? `${value.slice(0, 41)}…` : value
}

/** Backwards-compatible alias used by older importers/tests. */
export const linkLabelFromUrl = (value: string): string =>
  linkLabelFromValue({ type: "url", url: value })

/**
 * Older cards stored action URLs in the generic `url` field (`tel:`,
 * `mailto:`, `wa.me`). Recognising them keeps those rows usable instead of
 * silently dropping them after the multi-type upgrade.
 */
function migrateLegacyLinkValue(value: string): {
  type?: CardLinkType
  url: string
} {
  const raw = value.trim()

  if (/^tel:/i.test(raw)) {
    return { type: "phone", url: raw.slice(4).trim() }
  }
  if (/^mailto:/i.test(raw)) {
    return { type: "email", url: raw.slice(7).trim() }
  }

  const whatsapp = raw.match(/^https?:\/\/(?:www\.)?wa\.me\/(\d+)/i)
  if (whatsapp) return { type: "whatsapp", url: `+${whatsapp[1]}` }

  return { url: raw }
}

/**
 * Single source of truth for Linktree-style card items. It trims values,
 * keeps the stored order, defaults legacy rows to the `url` type, migrates
 * legacy action URLs, drops blank or invalid rows and derives a label when the
 * user did not supply one. Both the Payload write path and the read mappers
 * use it, so the UI and MongoDB always agree.
 */
export function normalizeCustomLinks(value: unknown): CustomLinkInput[] {
  if (!Array.isArray(value)) return []

  return value
    .map((entry) => {
      const link = (entry ?? {}) as Record<string, unknown>
      const rawValue = text(link.url)
      const hasExplicitType = typeof link.type === "string" && link.type !== ""
      const legacy = hasExplicitType ? null : migrateLegacyLinkValue(rawValue)

      return {
        type: legacy?.type ?? normalizeCardLinkType(link.type),
        url: (legacy?.url ?? rawValue).trim(),
        message: text(link.message).trim(),
        label: text(link.label).trim(),
      }
    })
    .filter((link) => cardLinkError(link) === null)
    .map((link) => ({
      ...link,
      label: link.label || linkLabelFromValue(link),
    }))
}

export function bool(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback
}

export function num(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

export function normalizeQrKind(value: unknown): QrKind {
  return pick(value, qrKinds, "static")
}

export function normalizeQrType(value: unknown): QrType {
  return pick(value, qrTypes, "url")
}

export function normalizeDotStyle(value: unknown): QrDotStyle {
  return pick(value, qrDotStyles, "rounded")
}

export function normalizeCornerStyle(value: unknown): QrCornerStyle {
  return pick(value, qrCornerStyles, "extra-rounded")
}

export function normalizeErrorCorrection(value: unknown): QrErrorCorrection {
  return pick(value, qrErrorCorrections, "H")
}

export function normalizeWifiEncryption(value: unknown): WifiEncryption {
  return pick(value, wifiEncryptions, "WPA")
}

export function normalizeTemplate(value: unknown): CardTemplateId {
  return pick(value, cardTemplates, "modern")
}

export function normalizeSocialPlatform(value: unknown): SocialPlatform {
  return pick(value, socialPlatforms, "website")
}

const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

/** Returns a usable CSS color, falling back when the value is malformed. */
export function safeColor(value: unknown, fallback: string): string {
  return typeof value === "string" && HEX_COLOR.test(value.trim())
    ? value.trim()
    : fallback
}

/**
 * URL-safe slug generator. Latin text is normalized; scripts without an
 * ASCII representation fall back to an empty string so callers can append a
 * unique suffix.
 */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
}

export function isValidSlug(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 60
}

export function splitFullName(fullName: string): {
  firstName: string
  lastName: string
} {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) return { firstName: "", lastName: "" }
  if (parts.length === 1) return { firstName: parts[0], lastName: "" }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  }
}

/** Deterministic fallback used when a name has no ASCII representation. */
export function fallbackSlug(seed: string): string {
  let hash = 0

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0
  }

  return `card-${hash.toString(36)}`
}
