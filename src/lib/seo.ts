import type { Metadata } from "next"

import { routing } from "@/i18n/routing"
import {
  absoluteUrl,
  getPageSeo,
  getSeoSettings,
  getSiteBaseUrl,
  getSiteSettings,
  normalizeLocale,
  type PageSeoData,
  type SeoSettingsData,
  type SiteSettingsData,
} from "./site-settings"

function normalizePath(path: string): string {
  const trimmed = path.trim()

  if (!trimmed || trimmed === "/") return "/"

  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`

  return withLeadingSlash.replace(/\/+$/, "") || "/"
}

function resolveTitleTemplate(template: string, siteName: string): string {
  const resolved = (template || "%s | {siteName}")
    .replaceAll("{siteName}", siteName)
    .replaceAll("{site}", siteName)

  return resolved.includes("%s") ? resolved : `%s | ${siteName}`
}

function stripVerificationPrefix(value: string, prefix: string): string {
  const trimmed = value.trim()

  if (!trimmed) return ""

  return trimmed.startsWith(prefix)
    ? trimmed.slice(prefix.length).trim()
    : trimmed
}

function splitKeywords(value: string): string[] | undefined {
  const keywords = value
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean)

  return keywords.length > 0 ? keywords : undefined
}

function resolveMediaUrl(media: { url: string } | null): string | undefined {
  return media?.url || undefined
}

function buildVerification(
  seo: SeoSettingsData
): Metadata["verification"] {
  const google = stripVerificationPrefix(
    seo.googleVerification,
    "google-site-verification="
  )
  const bing = stripVerificationPrefix(
    seo.bingVerification,
    "msvalidate.01="
  )
  const yandex = stripVerificationPrefix(
    seo.yandexVerification,
    "yandex-verification="
  )

  const other: Record<string, string> = {}

  if (bing) other["msvalidate.01"] = bing
  if (yandex) other["yandex-verification"] = yandex

  if (!google && Object.keys(other).length === 0) return undefined

  return {
    google: google || undefined,
    other: Object.keys(other).length > 0 ? other : undefined,
  }
}

function buildLanguages(
  baseUrl: string,
  path: string
): Record<string, string> {
  return Object.fromEntries(
    routing.locales.map((locale) => [
      locale,
      absoluteUrl(baseUrl, normalizeLocale(locale), path),
    ])
  )
}

function buildGlobalMetadata(
  site: SiteSettingsData,
  seo: SeoSettingsData,
  baseUrl: string
): Metadata {
  const siteName = site.siteName
  const template = resolveTitleTemplate(seo.titleTemplate, siteName)
  const defaultTitle = seo.defaultTitle || siteName
  const description = seo.defaultDescription || site.description
  const image = resolveMediaUrl(seo.ogImage)
  const favicon = resolveMediaUrl(site.favicon)
  const verification = buildVerification(seo)

  return {
    metadataBase: new URL(baseUrl),
    applicationName: siteName,
    generator: siteName,
    title: {
      default: defaultTitle,
      template,
    },
    description,
    keywords: splitKeywords(seo.defaultKeywords),
    authors: seo.author ? [{ name: seo.author }] : undefined,
    openGraph: {
      type: "website",
      siteName,
      title: seo.ogTitle || defaultTitle,
      description: seo.ogDescription || description,
      images: image ? [{ url: image, alt: siteName }] : undefined,
    },
    twitter: {
      card: seo.twitterCard,
      site: seo.twitterHandle || undefined,
      title: seo.ogTitle || defaultTitle,
      description: seo.ogDescription || description,
      images: image ? [image] : undefined,
    },
    robots: {
      index: seo.robotsIndex,
      follow: seo.robotsFollow,
      googleBot: {
        index: seo.robotsIndex,
        follow: seo.robotsFollow,
      },
    },
    icons: favicon
      ? {
          icon: favicon,
          shortcut: favicon,
          apple: favicon,
        }
      : undefined,
    verification,
  }
}

function buildRouteMetadata(
  path: string,
  locale: ReturnType<typeof normalizeLocale>,
  site: SiteSettingsData,
  seo: SeoSettingsData,
  baseUrl: string,
  page: PageSeoData | null
): Metadata {
  const description = page?.description || seo.defaultDescription || site.description
  const image = resolveMediaUrl(page?.ogImage ?? seo.ogImage)
  const canonical = page?.canonicalUrl || absoluteUrl(baseUrl, locale, path)
  const title = page?.title || undefined
  const openGraphTitle = page?.title || seo.ogTitle || seo.defaultTitle
  const openGraphDescription =
    page?.description || seo.ogDescription || description

  const metadata: Metadata = {
    description,
    keywords: splitKeywords(page?.keywords || seo.defaultKeywords),
    alternates: {
      canonical,
      languages: buildLanguages(baseUrl, path),
    },
    robots: {
      index: seo.robotsIndex && !page?.noIndex,
      follow: seo.robotsFollow,
      googleBot: {
        index: seo.robotsIndex && !page?.noIndex,
        follow: seo.robotsFollow,
      },
    },
  }

  if (title) {
    metadata.title = title
  }

  if (page) {
    metadata.openGraph = {
      type: "website",
      siteName: site.siteName,
      title: openGraphTitle,
      description: openGraphDescription,
      url: canonical,
      images: image
        ? [{ url: image, alt: page.title || site.siteName }]
        : undefined,
    }
    metadata.twitter = {
      card: seo.twitterCard,
      site: seo.twitterHandle || undefined,
      title: openGraphTitle,
      description: openGraphDescription,
      images: image ? [image] : undefined,
    }
  }

  return metadata
}

/**
 * Builds the metadata for a locale. Without a `path` it returns the global
 * defaults (used by the root layout); with a `path` it layers the route-level
 * overrides stored in the `page-seo` collection.
 */
export async function buildMetadata({
  locale,
  path,
}: {
  locale: string
  path?: string
}): Promise<Metadata> {
  const current = normalizeLocale(locale)
  const [site, seo] = await Promise.all([
    getSiteSettings(current),
    getSeoSettings(current),
  ])
  const baseUrl = getSiteBaseUrl(seo)

  if (!path) {
    return buildGlobalMetadata(site, seo, baseUrl)
  }

  const normalizedPath = normalizePath(path)
  const page = await getPageSeo(normalizedPath, current)

  return buildRouteMetadata(
    normalizedPath,
    current,
    site,
    seo,
    baseUrl,
    page
  )
}

/**
 * Creates a `generateMetadata` export for a route segment. The returned
 * function resolves the locale from the segment params and layers the
 * `page-seo` overrides on top of the global defaults.
 */
export function createRouteMetadata(path: string) {
  return async function generateMetadata({
    params,
  }: {
    params: Promise<{ locale: string }>
  }): Promise<Metadata> {
    const { locale } = await params

    return buildMetadata({ locale, path })
  }
}
