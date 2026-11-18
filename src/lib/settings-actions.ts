"use server"

import { revalidatePath } from "next/cache"

import { getCurrentUser } from "./auth"
import { getPayloadClient } from "./payload"
import {
  hasAnyPermission,
  hasPermission,
  type PermissionAction,
} from "./permissions"
import {
  getSiteSettings,
  normalizeLocale,
  normalizeSocialPlatform,
  toMediaRef,
  toPageSeo,
  toSeoSettings,
  type Locale,
  type MediaRef,
  type PageSeoData,
  type SeoSettingsData,
  type SiteSettingsData,
} from "./site-settings"
import type { ActionResult } from "./users"

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return "Something went wrong. Please try again."
}

async function requirePermission(
  resource: string,
  action: PermissionAction
) {
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
) {
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

function revalidateSettings(): void {
  revalidatePath("/", "layout")
}

export type SiteSettingsInput = Omit<SiteSettingsData, "logo" | "favicon">

export type SeoSettingsInput = Omit<SeoSettingsData, "ogImage">

export type PageSeoInput = {
  id?: string
  path: string
  locale: Locale
  label: string
  title: string
  description: string
  keywords: string
  canonicalUrl: string
  noIndex: boolean
  includeInSitemap: boolean
  changeFrequency: PageSeoData["changeFrequency"]
  priority: number
}

function normalizePath(value: string): string {
  const trimmed = value.trim()

  if (!trimmed || trimmed === "/") return "/"

  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`

  return withLeadingSlash.replace(/\/+$/, "") || "/"
}

export async function getSiteSettingsAction(
  locale: string
): Promise<ActionResult<SiteSettingsData>> {
  try {
    await requireAnyPermission("settings", ["find", "read"])

    return {
      success: true,
      data: await getSiteSettings(normalizeLocale(locale)),
    }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function updateSiteSettingsAction(
  locale: string,
  input: SiteSettingsInput
): Promise<ActionResult<SiteSettingsData>> {
  try {
    await requirePermission("settings", "update")

    const payload = await getPayloadClient()
    const currentLocale = normalizeLocale(locale)

    await payload.updateGlobal({
      slug: "site-settings",
      locale: currentLocale,
      overrideAccess: true,
      data: {
        siteName: input.siteName.trim(),
        tagline: input.tagline.trim(),
        description: input.description.trim(),
        footerText: input.footerText.trim(),
        contactEmail: input.contactEmail.trim(),
        contactPhone: input.contactPhone.trim(),
        socialLinks: input.socialLinks
          .map((link) => ({
            platform: normalizeSocialPlatform(link.platform),
            url: link.url.trim(),
          }))
          .filter((link) => link.url.length > 0),
        maintenanceMode: input.maintenanceMode,
        openRegistration: input.openRegistration,
        defaultLocale: normalizeLocale(input.defaultLocale),
      },
    })

    revalidateSettings()

    return {
      success: true,
      data: await getSiteSettings(currentLocale),
    }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function getSeoSettingsAction(
  locale: string
): Promise<ActionResult<SeoSettingsData>> {
  try {
    await requireAnyPermission("seo", ["find", "read"])

    const payload = await getPayloadClient()
    const settings = await payload.findGlobal({
      slug: "seo-settings",
      locale: normalizeLocale(locale),
      depth: 1,
      overrideAccess: true,
    })

    return { success: true, data: toSeoSettings(settings) }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function updateSeoSettingsAction(
  locale: string,
  input: SeoSettingsInput
): Promise<ActionResult<SeoSettingsData>> {
  try {
    await requirePermission("seo", "update")

    const payload = await getPayloadClient()
    const currentLocale = normalizeLocale(locale)

    await payload.updateGlobal({
      slug: "seo-settings",
      locale: currentLocale,
      overrideAccess: true,
      data: {
        defaultTitle: input.defaultTitle.trim(),
        titleTemplate: input.titleTemplate.trim(),
        defaultDescription: input.defaultDescription.trim(),
        defaultKeywords: input.defaultKeywords.trim(),
        author: input.author.trim(),
        ogTitle: input.ogTitle.trim(),
        ogDescription: input.ogDescription.trim(),
        twitterCard:
          input.twitterCard === "summary" ? "summary" : "summary_large_image",
        twitterHandle: input.twitterHandle.trim(),
        robotsIndex: input.robotsIndex,
        robotsFollow: input.robotsFollow,
        canonicalBaseUrl: input.canonicalBaseUrl.trim(),
        googleVerification: input.googleVerification.trim(),
        bingVerification: input.bingVerification.trim(),
        yandexVerification: input.yandexVerification.trim(),
        robotsTxt: input.robotsTxt,
        sitemapEnabled: input.sitemapEnabled,
        customHeadScripts: input.customHeadScripts,
        analyticsScript: input.analyticsScript,
        pixelScript: input.pixelScript,
      },
    })

    revalidateSettings()

    const settings = await payload.findGlobal({
      slug: "seo-settings",
      locale: currentLocale,
      depth: 1,
      overrideAccess: true,
    })

    return { success: true, data: toSeoSettings(settings) }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function listPageSeoAction(
  locale: string
): Promise<ActionResult<PageSeoData[]>> {
  try {
    await requireAnyPermission("seo", ["find", "read"])

    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: "page-seo",
      limit: 500,
      depth: 1,
      sort: "path",
      locale: normalizeLocale(locale),
      overrideAccess: true,
    })

    return {
      success: true,
      data: result.docs.map((doc) => toPageSeo(doc)),
    }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function savePageSeoAction(
  input: PageSeoInput
): Promise<ActionResult<PageSeoData>> {
  try {
    const path = normalizePath(input.path)

    if (!path) {
      throw new Error("A route path is required.")
    }

    const payload = await getPayloadClient()
    const locale = normalizeLocale(input.locale)

    let id = input.id

    if (!id) {
      const existing = await payload.find({
        collection: "page-seo",
        where: { path: { equals: path } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })

      id = existing.docs[0] ? String(existing.docs[0].id) : undefined
    }

    if (id) {
      await requirePermission("seo", "update")
    } else {
      await requirePermission("seo", "create")
    }

    const data = {
      path,
      label: input.label.trim(),
      title: input.title.trim(),
      description: input.description.trim(),
      keywords: input.keywords.trim(),
      canonicalUrl: input.canonicalUrl.trim(),
      noIndex: input.noIndex,
      includeInSitemap: input.includeInSitemap,
      changeFrequency: input.changeFrequency,
      priority: Number.isFinite(input.priority) ? input.priority : 0.5,
    }

    const doc = id
      ? await payload.update({
          collection: "page-seo",
          id,
          locale,
          data,
          overrideAccess: true,
        })
      : await payload.create({
          collection: "page-seo",
          locale,
          data,
          overrideAccess: true,
        })

    revalidateSettings()

    return { success: true, data: toPageSeo(doc) }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function deletePageSeoAction(
  id: string
): Promise<ActionResult<{ id: string }>> {
  try {
    await requirePermission("seo", "delete")

    const payload = await getPayloadClient()

    await payload.delete({
      collection: "page-seo",
      id,
      overrideAccess: true,
    })

    revalidateSettings()

    return { success: true, data: { id } }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
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

  const media = await payload.create({
    collection: "media",
    overrideAccess: true,
    data: { alt },
    file: {
      data: Buffer.from(await file.arrayBuffer()),
      mimetype: file.type || "application/octet-stream",
      name: file.name,
      size: file.size,
    },
  })

  const ref = toMediaRef(media)

  if (!ref) {
    throw new Error("The uploaded file could not be stored.")
  }

  return ref
}

export async function uploadBrandAssetAction(
  kind: "logo" | "favicon",
  formData: FormData
): Promise<ActionResult<MediaRef>> {
  try {
    await requirePermission("settings", "update")
    await requirePermission("media", "create")

    const media = await uploadMedia(
      formData,
      kind === "logo" ? "Site logo" : "Site favicon"
    )
    const payload = await getPayloadClient()

    await payload.updateGlobal({
      slug: "site-settings",
      overrideAccess: true,
      data: kind === "logo" ? { logo: media.id } : { favicon: media.id },
    })

    revalidateSettings()

    return { success: true, data: media }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function uploadSeoImageAction(
  formData: FormData
): Promise<ActionResult<MediaRef>> {
  try {
    await requirePermission("seo", "update")
    await requirePermission("media", "create")

    const media = await uploadMedia(formData, "Open Graph image")
    const payload = await getPayloadClient()

    await payload.updateGlobal({
      slug: "seo-settings",
      overrideAccess: true,
      data: { ogImage: media.id },
    })

    revalidateSettings()

    return { success: true, data: media }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function uploadPageSeoImageAction(
  id: string,
  formData: FormData
): Promise<ActionResult<MediaRef>> {
  try {
    await requirePermission("seo", "update")
    await requirePermission("media", "create")

    const media = await uploadMedia(formData, "Page Open Graph image")
    const payload = await getPayloadClient()

    await payload.update({
      collection: "page-seo",
      id,
      data: { ogImage: media.id },
      overrideAccess: true,
    })

    revalidateSettings()

    return { success: true, data: media }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function regenerateSitemapAction(): Promise<
  ActionResult<{ regenerated: boolean }>
> {
  try {
    await requirePermission("seo", "update")

    revalidateSettings()

    return { success: true, data: { regenerated: true } }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}
