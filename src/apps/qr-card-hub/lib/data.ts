import type { Payload } from "payload"

import type { DigitalCard, Media, QrCode } from "@/payload-types"
import { buildQrContent } from "./qr-content"
import {
  bool,
  clamp,
  DEFAULT_CARD_FORM,
  DEFAULT_QR_FORM,
  normalizeCornerStyle,
  normalizeCustomLinks,
  normalizeDotStyle,
  normalizeErrorCorrection,
  normalizeQrKind,
  normalizeQrType,
  normalizeSocialPlatform,
  normalizeTemplate,
  normalizeWifiEncryption,
  num,
  safeColor,
  text,
  type DigitalCardData,
  type MediaRef,
  type QrCardSummary,
  type QrCodeData,
  type QrFormData,
  type SocialLinkInput,
  type CustomLinkInput,
} from "./types"

export function toMediaRef(value: unknown): MediaRef | null {
  if (!value || typeof value !== "object") return null

  const media = value as Media
  const url = text(media.url)

  if (!url) return null

  return {
    id: String(media.id),
    url,
    alt: typeof media.alt === "string" ? media.alt : null,
  }
}

export function toSocialLinks(value: unknown): SocialLinkInput[] {
  if (!Array.isArray(value)) return []

  return value
    .map((entry) => {
      const link = entry as Record<string, unknown>

      return {
        platform: normalizeSocialPlatform(link.platform),
        url: text(link.url),
        label: text(link.label),
      }
    })
    .filter((link) => link.url.trim().length > 0)
}

/** Normalizes stored Linktree-style links while preserving their order. */
export function toCustomLinks(value: unknown): CustomLinkInput[] {
  return normalizeCustomLinks(value)
}

export function toDigitalCardData(doc: DigitalCard): DigitalCardData {
  return {
    ...DEFAULT_CARD_FORM,
    id: String(doc.id),
    title: text(doc.title),
    slug: text(doc.slug),
    fullName: text(doc.fullName),
    jobTitle: text(doc.jobTitle),
    company: text(doc.company),
    bio: text(doc.bio),
    email: text(doc.email),
    phone: text(doc.phone),
    website: text(doc.website),
    address: text(doc.address),
    avatar: toMediaRef(doc.avatar),
    template: normalizeTemplate(doc.template),
    brandColor: safeColor(doc.brandColor, DEFAULT_CARD_FORM.brandColor),
    accentColor: safeColor(doc.accentColor, DEFAULT_CARD_FORM.accentColor),
    socialLinks: toSocialLinks(doc.socialLinks),
    links: toCustomLinks(doc.links),
    published: bool(doc.published),
    createdAt: text(doc.createdAt),
    updatedAt: text(doc.updatedAt),
  }
}

/** Reads the card reference regardless of whether it was populated. */
export function resolveCardRef(
  value: QrCode["card"] | DigitalCard["id"] | null | undefined
): DigitalCard | null {
  if (!value || typeof value !== "object") return null

  return value as DigitalCard
}

export function toQrForm(doc: QrCode): QrFormData {
  return {
    ...DEFAULT_QR_FORM,
    title: text(doc.title),
    kind: normalizeQrKind(doc.kind),
    qrType: normalizeQrType(doc.qrType),
    url: text(doc.url),
    text: text(doc.text),
    email: text(doc.email),
    emailSubject: text(doc.emailSubject),
    emailBody: text(doc.emailBody),
    phone: text(doc.phone),
    wifiSsid: text(doc.wifiSsid),
    wifiPassword: text(doc.wifiPassword),
    wifiEncryption: normalizeWifiEncryption(doc.wifiEncryption),
    wifiHidden: bool(doc.wifiHidden),
    vcardFirstName: text(doc.vcardFirstName),
    vcardLastName: text(doc.vcardLastName),
    vcardOrganization: text(doc.vcardOrganization),
    vcardJobTitle: text(doc.vcardJobTitle),
    vcardPhone: text(doc.vcardPhone),
    vcardEmail: text(doc.vcardEmail),
    vcardWebsite: text(doc.vcardWebsite),
    vcardAddress: text(doc.vcardAddress),
    cardId: resolveCardRef(doc.card) ? String(resolveCardRef(doc.card)?.id) : "",
    dotStyle: normalizeDotStyle(doc.dotStyle),
    cornerStyle: normalizeCornerStyle(doc.cornerStyle),
    foregroundColor: safeColor(
      doc.foregroundColor,
      DEFAULT_QR_FORM.foregroundColor
    ),
    backgroundColor: safeColor(
      doc.backgroundColor,
      DEFAULT_QR_FORM.backgroundColor
    ),
    useGradient: bool(doc.useGradient),
    gradientColor: safeColor(
      doc.gradientColor,
      DEFAULT_QR_FORM.gradientColor
    ),
    logo: toMediaRef(doc.logo),
    logoSize: clamp(num(doc.logoSize, DEFAULT_QR_FORM.logoSize), 0.1, 0.6),
    margin: clamp(num(doc.margin, DEFAULT_QR_FORM.margin), 0, 80),
    errorCorrection: normalizeErrorCorrection(doc.errorCorrection),
    size: clamp(num(doc.size, DEFAULT_QR_FORM.size), 128, 4096),
    published: doc.published !== false,
  }
}

export function toQrCodeData(
  doc: QrCode,
  options: { baseUrl: string; locale: string }
): QrCodeData {
  const form = toQrForm(doc)
  const card = resolveCardRef(doc.card)

  return {
    ...form,
    id: String(doc.id),
    content: buildQrContent(form, {
      baseUrl: options.baseUrl,
      locale: options.locale,
      cardSlug: card?.slug ?? null,
    }),
    cardSlug: card?.slug ?? null,
    cardName: card ? text(card.title) || text(card.fullName) : null,
    cardPublished: Boolean(card?.published),
    createdAt: text(doc.createdAt),
    updatedAt: text(doc.updatedAt),
  }
}

export function toCardSummary(doc: DigitalCard): QrCardSummary {
  return {
    id: String(doc.id),
    name: text(doc.title) || text(doc.fullName) || text(doc.slug),
    slug: text(doc.slug),
    published: bool(doc.published),
  }
}

/** Public lookup used by the `/[locale]/card/[slug]` route. */
export async function findPublishedCardBySlug(
  payload: Payload,
  slug: string
): Promise<DigitalCard | null> {
  if (!slug.trim()) return null

  const result = await payload.find({
    collection: "digital-cards",
    where: {
      slug: { equals: slug.trim() },
      published: { equals: true },
    },
    limit: 1,
    depth: 1,
    overrideAccess: true,
  })

  return (result.docs[0] as DigitalCard | undefined) ?? null
}

export type QrCardHubStats = {
  qrCodes: number
  digitalCards: number
  publishedCards: number
}

export async function getQrCardHubStats(
  payload: Payload
): Promise<QrCardHubStats> {
  const [qrCodes, digitalCards, publishedCards] = await Promise.all([
    payload.count({ collection: "qr-codes", overrideAccess: true }),
    payload.count({ collection: "digital-cards", overrideAccess: true }),
    payload.count({
      collection: "digital-cards",
      where: { published: { equals: true } },
      overrideAccess: true,
    }),
  ])

  return {
    qrCodes: qrCodes.totalDocs,
    digitalCards: digitalCards.totalDocs,
    publishedCards: publishedCards.totalDocs,
  }
}
