import { cache } from "react"

import type { Media, PageSeo, SeoSetting, SiteSetting } from "@/payload-types"
import { getPayloadClient } from "./payload"
import {
  normalizeLocale,
  normalizeSocialPlatform,
  type Locale,
  type MediaRef,
  type PageSeoData,
  type SeoSettingsData,
  type SiteSettingsData,
} from "./site-settings-types"

export * from "./site-settings-types"


/**
 * Last-resort values used only when Payload cannot be reached (for example
 * during a database-less build). The database remains the source of truth.
 */
export const DEFAULT_SITE_SETTINGS: SiteSettingsData = {
  siteName: process.env.NEXT_PUBLIC_SITE_NAME || "Weerbex",
  tagline: "Core Dashboard",
  description: "All-in-one platform to run your business.",
  footerText: "© {year} {siteName}. All rights reserved.",
  logo: null,
  favicon: null,
  contactEmail: "",
  contactPhone: "",
  socialLinks: [],
  maintenanceMode: false,
  openRegistration: true,
  defaultLocale: "en",
}

export const DEFAULT_SEO_SETTINGS: SeoSettingsData = {
  defaultTitle: DEFAULT_SITE_SETTINGS.siteName,
  titleTemplate: "%s | {siteName}",
  defaultDescription: DEFAULT_SITE_SETTINGS.description,
  defaultKeywords: "",
  author: DEFAULT_SITE_SETTINGS.siteName,
  ogTitle: "",
  ogDescription: "",
  ogImage: null,
  twitterCard: "summary_large_image",
  twitterHandle: "",
  robotsIndex: true,
  robotsFollow: true,
  canonicalBaseUrl: process.env.NEXT_PUBLIC_SITE_URL || "",
  googleVerification: "",
  bingVerification: "",
  yandexVerification: "",
  robotsTxt: "",
  sitemapEnabled: true,
  customHeadScripts: "",
  analyticsScript: "",
  pixelScript: "",
}

function text(value: unknown): string {
  return typeof value === "string" ? value : ""
}

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

export function toSiteSettings(value: SiteSetting | null): SiteSettingsData {
  if (!value) return DEFAULT_SITE_SETTINGS

  const socialLinks = Array.isArray(value.socialLinks)
    ? value.socialLinks
        .map((link) => ({
          platform: normalizeSocialPlatform(link.platform),
          url: text(link.url),
        }))
        .filter((link) => link.url.length > 0)
    : []

  return {
    siteName: text(value.siteName) || DEFAULT_SITE_SETTINGS.siteName,
    tagline: text(value.tagline) || DEFAULT_SITE_SETTINGS.tagline,
    description: text(value.description) || DEFAULT_SITE_SETTINGS.description,
    footerText: text(value.footerText) || DEFAULT_SITE_SETTINGS.footerText,
    logo: toMediaRef(value.logo),
    favicon: toMediaRef(value.favicon),
    contactEmail: text(value.contactEmail),
    contactPhone: text(value.contactPhone),
    socialLinks,
    maintenanceMode: Boolean(value.maintenanceMode),
    openRegistration: value.openRegistration !== false,
    defaultLocale: normalizeLocale(value.defaultLocale),
  }
}

export function toSeoSettings(value: SeoSetting | null): SeoSettingsData {
  if (!value) return DEFAULT_SEO_SETTINGS

  return {
    defaultTitle:
      text(value.defaultTitle) || DEFAULT_SEO_SETTINGS.defaultTitle,
    titleTemplate:
      text(value.titleTemplate) || DEFAULT_SEO_SETTINGS.titleTemplate,
    defaultDescription:
      text(value.defaultDescription) ||
      DEFAULT_SEO_SETTINGS.defaultDescription,
    defaultKeywords: text(value.defaultKeywords),
    author: text(value.author),
    ogTitle: text(value.ogTitle),
    ogDescription: text(value.ogDescription),
    ogImage: toMediaRef(value.ogImage),
    twitterCard:
      value.twitterCard === "summary" ? "summary" : "summary_large_image",
    twitterHandle: text(value.twitterHandle),
    robotsIndex: value.robotsIndex !== false,
    robotsFollow: value.robotsFollow !== false,
    canonicalBaseUrl: text(value.canonicalBaseUrl),
    googleVerification: text(value.googleVerification),
    bingVerification: text(value.bingVerification),
    yandexVerification: text(value.yandexVerification),
    robotsTxt: text(value.robotsTxt),
    sitemapEnabled: value.sitemapEnabled !== false,
    customHeadScripts: text(value.customHeadScripts),
    analyticsScript: text(value.analyticsScript),
    pixelScript: text(value.pixelScript),
  }
}

export function toPageSeo(value: PageSeo): PageSeoData {
  const changeFrequency =
    value.changeFrequency === "always" ||
    value.changeFrequency === "hourly" ||
    value.changeFrequency === "daily" ||
    value.changeFrequency === "monthly" ||
    value.changeFrequency === "yearly" ||
    value.changeFrequency === "never"
      ? value.changeFrequency
      : "weekly"

  return {
    id: String(value.id),
    path: text(value.path) || "/",
    label: text(value.label),
    title: text(value.title),
    description: text(value.description),
    keywords: text(value.keywords),
    canonicalUrl: text(value.canonicalUrl),
    ogImage: toMediaRef(value.ogImage),
    noIndex: Boolean(value.noIndex),
    includeInSitemap: value.includeInSitemap !== false,
    changeFrequency,
    priority:
      typeof value.priority === "number" && Number.isFinite(value.priority)
        ? value.priority
        : 0.5,
    updatedAt: text(value.updatedAt) || null,
  }
}

export const getSiteSettings = cache(
  async (locale: Locale = "en"): Promise<SiteSettingsData> => {
    try {
      const payload = await getPayloadClient()
      const settings = await payload.findGlobal({
        slug: "site-settings",
        locale,
        depth: 1,
        overrideAccess: true,
      })

      return toSiteSettings(settings as SiteSetting)
    } catch {
      return DEFAULT_SITE_SETTINGS
    }
  }
)

export const getSeoSettings = cache(
  async (locale: Locale = "en"): Promise<SeoSettingsData> => {
    try {
      const payload = await getPayloadClient()
      const settings = await payload.findGlobal({
        slug: "seo-settings",
        locale,
        depth: 1,
        overrideAccess: true,
      })

      return toSeoSettings(settings as SeoSetting)
    } catch {
      return DEFAULT_SEO_SETTINGS
    }
  }
)

export const getPageSeo = cache(
  async (path: string, locale: Locale = "en"): Promise<PageSeoData | null> => {
    try {
      const payload = await getPayloadClient()
      const result = await payload.find({
        collection: "page-seo",
        where: { path: { equals: path } },
        limit: 1,
        depth: 1,
        locale,
        overrideAccess: true,
      })

      const doc = result.docs[0] as PageSeo | undefined

      return doc ? toPageSeo(doc) : null
    } catch {
      return null
    }
  }
)

export const listPageSeo = cache(
  async (locale: Locale = "en"): Promise<PageSeoData[]> => {
    try {
      const payload = await getPayloadClient()
      const result = await payload.find({
        collection: "page-seo",
        limit: 500,
        depth: 1,
        sort: "path",
        locale,
        overrideAccess: true,
      })

      return result.docs.map((doc) => toPageSeo(doc as PageSeo))
    } catch {
      return []
    }
  }
)

const FALLBACK_BASE_URL = "http://localhost:3000"

export function getSiteBaseUrl(seo?: SeoSettingsData): string {
  const candidate =
    seo?.canonicalBaseUrl?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    FALLBACK_BASE_URL

  try {
    return new URL(candidate).origin
  } catch {
    return FALLBACK_BASE_URL
  }
}

export function localizedPath(locale: Locale, path = "/"): string {
  const normalized = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`

  return `/${locale}${normalized}`
}

export function absoluteUrl(
  baseUrl: string,
  locale: Locale,
  path = "/"
): string {
  return `${baseUrl.replace(/\/+$/, "")}${localizedPath(locale, path)}`
}

export function interpolateSiteText(
  value: string,
  site: Pick<SiteSettingsData, "siteName">
): string {
  return value
    .replaceAll("{siteName}", site.siteName)
    .replaceAll("{site}", site.siteName)
    .replaceAll("{year}", String(new Date().getFullYear()))
}
