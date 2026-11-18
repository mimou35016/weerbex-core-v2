"use server"

import { revalidatePath } from "next/cache"

import type { DigitalCard, Media, QrCode } from "@/payload-types"
import { recordAuditEvent } from "@/lib/audit"
import { getCurrentUser } from "@/lib/auth"
import {
  hasAnyPermission,
  hasPermission,
  type PermissionAction,
} from "@/lib/permissions"
import { getPayloadClient } from "@/lib/payload"
import {
  getSeoSettings,
  getSiteBaseUrl,
  normalizeLocale,
} from "@/lib/site-settings"
import type { ActionResult, DashboardUser } from "@/lib/users"
import {
  findPublishedCardBySlug,
  toCardSummary,
  toDigitalCardData,
  toMediaRef,
  toQrCodeData,
  toSocialLinks,
} from "./data"
import { buildQrContent, isQrContentComplete } from "./qr-content"
import {
  clamp,
  DEFAULT_CARD_FORM,
  DEFAULT_QR_FORM,
  fallbackSlug,
  isValidSlug,
  normalizeCornerStyle,
  normalizeCustomLinks,
  normalizeDotStyle,
  normalizeErrorCorrection,
  normalizeQrKind,
  normalizeQrType,
  normalizeTemplate,
  normalizeWifiEncryption,
  safeColor,
  slugify,
  text,
  type DigitalCardData,
  type DigitalCardFormData,
  type MediaRef,
  type QrCardSummary,
  type QrCodeData,
  type QrFormData,
} from "./types"

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return "Something went wrong. Please try again."
}

async function requirePermission(
  resource: string,
  action: PermissionAction
): Promise<DashboardUser> {
  const user = await getCurrentUser()

  if (!user || user.status !== "active") {
    throw new Error("Unauthorized")
  }

  if (!hasPermission(user, resource, action)) {
    throw new Error(
      "Forbidden: you do not have permission to perform this action."
    )
  }

  return user
}

async function requireAnyPermission(
  resource: string,
  actions: PermissionAction[]
): Promise<DashboardUser> {
  const user = await getCurrentUser()

  if (!user || user.status !== "active") {
    throw new Error("Unauthorized")
  }

  if (!hasAnyPermission(user, resource, actions)) {
    throw new Error(
      "Forbidden: you do not have permission to perform this action."
    )
  }

  return user
}

function revalidateCards(): void {
  revalidatePath("/[locale]/card/[slug]", "page")
}

async function resolveBaseUrl(locale: string): Promise<string> {
  const seo = await getSeoSettings(normalizeLocale(locale))

  return getSiteBaseUrl(seo)
}

async function uploadMedia(
  formData: FormData,
  alt: string
): Promise<MediaRef> {
  const payload = await getPayloadClient()
  const file = formData.get("file")

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Choose an image file to upload.")
  }

  const media = (await payload.create({
    collection: "media",
    overrideAccess: true,
    data: { alt },
    file: {
      data: Buffer.from(await file.arrayBuffer()),
      mimetype: file.type || "application/octet-stream",
      name: file.name,
      size: file.size,
    },
  })) as Media

  const ref = toMediaRef(media)

  if (!ref) {
    throw new Error("The uploaded file could not be stored.")
  }

  return ref
}

async function uniqueCardSlug(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  input: string,
  source: string,
  excludeId?: string
): Promise<string> {
  const base = isValidSlug(input)
    ? input
    : slugify(input) || slugify(source) || fallbackSlug(source || Date.now().toString())

  let candidate = base
  let suffix = 2

  while (suffix < 100) {
    const existing = await payload.find({
      collection: "digital-cards",
      where: { slug: { equals: candidate } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const found = existing.docs[0] as DigitalCard | undefined

    if (!found || (excludeId && String(found.id) === excludeId)) {
      return candidate
    }

    candidate = `${base}-${suffix}`
    suffix += 1
  }

  return `${base}-${Date.now().toString(36)}`
}

/* -------------------------------------------------------------------------- */
/*                                   QR codes                                 */
/* -------------------------------------------------------------------------- */

export async function listQrCodesAction(
  locale: string
): Promise<ActionResult<QrCodeData[]>> {
  try {
    await requireAnyPermission("qrCodes", ["find", "read"])

    const payload = await getPayloadClient()
    const baseUrl = await resolveBaseUrl(locale)
    const result = await payload.find({
      collection: "qr-codes",
      limit: 200,
      depth: 1,
      sort: "-updatedAt",
      overrideAccess: true,
    })

    return {
      success: true,
      data: result.docs.map((doc) =>
        toQrCodeData(doc as QrCode, {
          baseUrl,
          locale: normalizeLocale(locale),
        })
      ),
    }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function listCardOptionsAction(): Promise<
  ActionResult<QrCardSummary[]>
> {
  try {
    await requireAnyPermission("digitalCards", ["find", "read"])

    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: "digital-cards",
      limit: 200,
      depth: 0,
      sort: "title",
      overrideAccess: true,
    })

    return {
      success: true,
      data: result.docs.map((doc) => toCardSummary(doc as DigitalCard)),
    }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export type SaveQrCodeInput = QrFormData & { id?: string }

export async function saveQrCodeAction(
  locale: string,
  input: SaveQrCodeInput
): Promise<ActionResult<QrCodeData>> {
  try {
    const id = input.id?.trim() ?? ""

    const user = id
      ? await requirePermission("qrCodes", "update")
      : await requirePermission("qrCodes", "create")

    const title = input.title.trim()

    if (!title) {
      return { success: false, error: "qrCardHub.qr.errors.titleRequired" }
    }

    const kind = normalizeQrKind(input.kind)
    const form: QrFormData = {
      ...DEFAULT_QR_FORM,
      ...input,
      title,
      kind,
      qrType: normalizeQrType(input.qrType),
    }

    const payload = await getPayloadClient()
    let card: DigitalCard | null = null

    if (kind === "dynamic") {
      if (!form.cardId.trim()) {
        return { success: false, error: "qrCardHub.qr.errors.cardRequired" }
      }

      try {
        card = (await payload.findByID({
          collection: "digital-cards",
          id: form.cardId.trim(),
          depth: 0,
          overrideAccess: true,
        })) as DigitalCard
      } catch {
        card = null
      }

      if (!card) {
        return { success: false, error: "qrCardHub.qr.errors.cardRequired" }
      }
    }

    const content = buildQrContent(form, {
      baseUrl: await resolveBaseUrl(locale),
      locale: normalizeLocale(locale),
      cardSlug: card?.slug ?? null,
    })

    if (!content.trim() || !isQrContentComplete(form)) {
      return { success: false, error: "qrCardHub.qr.errors.contentRequired" }
    }

    const data = {
      title,
      kind,
      qrType: form.qrType,
      url: form.url.trim(),
      text: form.text,
      email: form.email.trim(),
      emailSubject: form.emailSubject.trim(),
      emailBody: form.emailBody,
      phone: form.phone.trim(),
      wifiSsid: form.wifiSsid.trim(),
      wifiPassword: form.wifiPassword,
      wifiEncryption: normalizeWifiEncryption(form.wifiEncryption),
      wifiHidden: form.wifiHidden,
      vcardFirstName: form.vcardFirstName.trim(),
      vcardLastName: form.vcardLastName.trim(),
      vcardOrganization: form.vcardOrganization.trim(),
      vcardJobTitle: form.vcardJobTitle.trim(),
      vcardPhone: form.vcardPhone.trim(),
      vcardEmail: form.vcardEmail.trim(),
      vcardWebsite: form.vcardWebsite.trim(),
      vcardAddress: form.vcardAddress.trim(),
      card: card ? String(card.id) : null,
      dotStyle: normalizeDotStyle(form.dotStyle),
      cornerStyle: normalizeCornerStyle(form.cornerStyle),
      foregroundColor: safeColor(
        form.foregroundColor,
        DEFAULT_QR_FORM.foregroundColor
      ),
      backgroundColor: safeColor(
        form.backgroundColor,
        DEFAULT_QR_FORM.backgroundColor
      ),
      useGradient: form.useGradient,
      gradientColor: safeColor(
        form.gradientColor,
        DEFAULT_QR_FORM.gradientColor
      ),
      logo: form.logo?.id ?? null,
      logoSize: clamp(form.logoSize, 0.1, 0.6),
      margin: clamp(form.margin, 0, 80),
      errorCorrection: normalizeErrorCorrection(form.errorCorrection),
      size: clamp(form.size, 128, 4096),
      published: form.published,
    }

    const doc = (id
      ? await payload.update({
          collection: "qr-codes",
          id,
          data,
          depth: 1,
          overrideAccess: true,
        })
      : await payload.create({
          collection: "qr-codes",
          data,
          depth: 1,
          overrideAccess: true,
        })) as QrCode

    await recordAuditEvent(
      {
        action: id ? "qrCodeUpdated" : "qrCodeCreated",
        actorId: user.id,
        actorName: user.name,
        target: title,
      },
      payload
    )

    if (card?.slug) revalidateCards()

    return {
      success: true,
      data: toQrCodeData(doc, {
        baseUrl: await resolveBaseUrl(locale),
        locale: normalizeLocale(locale),
      }),
    }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function deleteQrCodeAction(
  id: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requirePermission("qrCodes", "delete")
    const payload = await getPayloadClient()

    const doc = (await payload.findByID({
      collection: "qr-codes",
      id,
      depth: 0,
      overrideAccess: true,
    })) as QrCode

    await payload.delete({
      collection: "qr-codes",
      id,
      overrideAccess: true,
    })

    await recordAuditEvent(
      {
        action: "qrCodeDeleted",
        actorId: user.id,
        actorName: user.name,
        target: text(doc.title),
      },
      payload
    )

    return { success: true, data: { id } }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function uploadQrLogoAction(
  formData: FormData
): Promise<ActionResult<MediaRef>> {
  try {
    await requireAnyPermission("qrCodes", ["create", "update"])
    await requirePermission("media", "create")

    return {
      success: true,
      data: await uploadMedia(formData, "QR code logo"),
    }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

/* -------------------------------------------------------------------------- */
/*                               Digital cards                                */
/* -------------------------------------------------------------------------- */

export async function listDigitalCardsAction(
  locale: string
): Promise<ActionResult<DigitalCardData[]>> {
  try {
    await requireAnyPermission("digitalCards", ["find", "read"])

    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: "digital-cards",
      limit: 200,
      depth: 1,
      sort: "-updatedAt",
      locale: normalizeLocale(locale),
      overrideAccess: true,
    })

    return {
      success: true,
      data: result.docs.map((doc) => toDigitalCardData(doc as DigitalCard)),
    }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export type SaveDigitalCardInput = DigitalCardFormData & { id?: string }

export async function saveDigitalCardAction(
  input: SaveDigitalCardInput
): Promise<ActionResult<DigitalCardData>> {
  try {
    const id = input.id?.trim() ?? ""

    const user = id
      ? await requirePermission("digitalCards", "update")
      : await requirePermission("digitalCards", "create")

    const fullName = input.fullName.trim()
    const title = input.title.trim() || fullName

    if (!fullName || !title) {
      return { success: false, error: "qrCardHub.cards.errors.nameRequired" }
    }

    const payload = await getPayloadClient()
    const slug = await uniqueCardSlug(
      payload,
      input.slug.trim(),
      fullName || title,
      id || undefined
    )

    const data = {
      title,
      slug,
      fullName,
      jobTitle: input.jobTitle.trim(),
      company: input.company.trim(),
      bio: input.bio.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      website: input.website.trim(),
      address: input.address.trim(),
      avatar: input.avatar?.id ?? null,
      template: normalizeTemplate(input.template),
      brandColor: safeColor(
        input.brandColor,
        DEFAULT_CARD_FORM.brandColor
      ),
      accentColor: safeColor(
        input.accentColor,
        DEFAULT_CARD_FORM.accentColor
      ),
      socialLinks: toSocialLinks(input.socialLinks),
      links: normalizeCustomLinks(input.links),
      published: input.published,
    }

    const doc = (id
      ? await payload.update({
          collection: "digital-cards",
          id,
          data,
          depth: 1,
          overrideAccess: true,
        })
      : await payload.create({
          collection: "digital-cards",
          data,
          depth: 1,
          overrideAccess: true,
        })) as DigitalCard

    await recordAuditEvent(
      {
        action: id ? "cardUpdated" : "cardCreated",
        actorId: user.id,
        actorName: user.name,
        target: fullName,
      },
      payload
    )

    revalidateCards()

    return { success: true, data: toDigitalCardData(doc) }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function publishDigitalCardAction(
  id: string,
  published: boolean
): Promise<ActionResult<DigitalCardData>> {
  try {
    const user = await requirePermission("digitalCards", "publish")
    const payload = await getPayloadClient()

    const doc = (await payload.update({
      collection: "digital-cards",
      id,
      data: { published },
      depth: 1,
      overrideAccess: true,
    })) as DigitalCard

    await recordAuditEvent(
      {
        action: published ? "cardPublished" : "cardUnpublished",
        actorId: user.id,
        actorName: user.name,
        target: text(doc.fullName) || text(doc.title),
      },
      payload
    )

    revalidateCards()

    return { success: true, data: toDigitalCardData(doc) }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function deleteDigitalCardAction(
  id: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requirePermission("digitalCards", "delete")
    const payload = await getPayloadClient()

    const doc = (await payload.findByID({
      collection: "digital-cards",
      id,
      depth: 0,
      overrideAccess: true,
    })) as DigitalCard

    await payload.delete({
      collection: "digital-cards",
      id,
      overrideAccess: true,
    })

    await recordAuditEvent(
      {
        action: "cardDeleted",
        actorId: user.id,
        actorName: user.name,
        target: text(doc.fullName) || text(doc.title),
      },
      payload
    )

    revalidateCards()

    return { success: true, data: { id } }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function uploadCardAvatarAction(
  formData: FormData
): Promise<ActionResult<MediaRef>> {
  try {
    await requireAnyPermission("digitalCards", ["create", "update"])
    await requirePermission("media", "create")

    return {
      success: true,
      data: await uploadMedia(formData, "Digital card avatar"),
    }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

/** Public read used by the card page; kept here so the route stays thin. */
export async function getPublishedCardAction(
  slug: string
): Promise<ActionResult<DigitalCardData>> {
  try {
    const payload = await getPayloadClient()
    const doc = await findPublishedCardBySlug(payload, slug)

    if (!doc) {
      return { success: false, error: "Card not found" }
    }

    return { success: true, data: toDigitalCardData(doc) }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}
