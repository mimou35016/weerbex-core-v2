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

/** Linktree-style button rendered on the card, ordered by array position. */
export type CustomLinkInput = {
  label: string
  url: string
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

/** Upper bound for Linktree-style links, mirrored by the builder UI. */
export const MAX_CARD_LINKS = 20

const anyScheme = /^[a-z][a-z0-9+.-]*:/i
const safeScheme = /^(https?:|mailto:|tel:)/i

/** Rejects `javascript:` and other non-navigational schemes. */
function safeLinkUrl(value: string): string {
  const url = value.trim()

  if (!url) return ""
  if (anyScheme.test(url)) return safeScheme.test(url) ? url : ""

  return url
}

/** Builds a readable fallback label such as `example.com/pricing`. */
export function linkLabelFromUrl(value: string): string {
  const cleaned = value
    .trim()
    .replace(/^[a-z][a-z0-9+.-]*:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/[?#].*$/, "")
    .replace(/\/+$/, "")

  if (!cleaned) return value.trim()

  return cleaned
}

/**
 * Single source of truth for Linktree-style links. It trims values, keeps the
 * stored order, drops blank or unsafe rows and derives a label when the user
 * only supplied a URL. Both the Payload write path and the read mappers use
 * it, so the UI and MongoDB always agree.
 */
export function normalizeCustomLinks(value: unknown): CustomLinkInput[] {
  if (!Array.isArray(value)) return []

  return value
    .slice(0, MAX_CARD_LINKS)
    .map((entry) => {
      const link = (entry ?? {}) as Record<string, unknown>
      const url = safeLinkUrl(text(link.url))
      const label = text(link.label).trim()

      return {
        label: label || linkLabelFromUrl(url),
        url,
      }
    })
    .filter((link) => link.url.length > 0)
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
