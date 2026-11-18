import type { MetadataRoute } from "next"

import { routing } from "@/i18n/routing"
import {
  absoluteUrl,
  getSeoSettings,
  getSiteBaseUrl,
  listPageSeo,
  normalizeLocale,
} from "@/lib/site-settings"

export const dynamic = "force-dynamic"

/**
 * Sitemap generated from the `page-seo` collection. Every route that is not
 * marked as `noIndex` or excluded from the sitemap is emitted once per locale.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const seo = await getSeoSettings("en")

  if (!seo.sitemapEnabled) return []

  const baseUrl = getSiteBaseUrl(seo)
  const pages = await listPageSeo("en")
  const now = new Date()
  const entries: MetadataRoute.Sitemap = []

  for (const locale of routing.locales) {
    entries.push({
      url: absoluteUrl(baseUrl, normalizeLocale(locale), "/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    })
  }

  for (const page of pages) {
    if (!page.includeInSitemap || page.noIndex) continue

    const lastModified = page.updatedAt ? new Date(page.updatedAt) : now

    for (const locale of routing.locales) {
      entries.push({
        url: absoluteUrl(baseUrl, normalizeLocale(locale), page.path),
        lastModified,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
      })
    }
  }

  const seen = new Set<string>()

  return entries.filter((entry) => {
    if (seen.has(entry.url)) return false

    seen.add(entry.url)
    return true
  })
}
