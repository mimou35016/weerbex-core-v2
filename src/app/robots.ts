import type { MetadataRoute } from "next"

import { getSeoSettings, getSiteBaseUrl } from "@/lib/site-settings"

export const dynamic = "force-dynamic"

type RobotsRule = {
  userAgent: string | string[]
  allow?: string | string[]
  disallow?: string | string[]
  crawlDelay?: number
  other?: Record<string, string | number | Array<string | number>>
}

type ParsedRobots = {
  rules: RobotsRule[]
  sitemaps: string[]
  host?: string
}

const DEFAULT_DISALLOW = ["/admin", "/api", "/dashboard"]

/**
 * Parses a custom robots.txt body into the structured shape expected by the
 * `MetadataRoute.Robots` file convention. Unknown directives are preserved as
 * `other` entries so nothing is silently dropped.
 */
function parseCustomRobots(body: string): ParsedRobots {
  const parsed: ParsedRobots = { rules: [], sitemaps: [] }
  let current: RobotsRule | null = null
  let hasDirectives = false

  const flush = () => {
    if (current && hasDirectives) parsed.rules.push(current)

    current = null
    hasDirectives = false
  }

  const ensureCurrent = (): RobotsRule => {
    if (!current) {
      current = { userAgent: "*" }
    }

    return current
  }

  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.trim()

    if (!line || line.startsWith("#")) {
      if (!line) flush()
      continue
    }

    const separator = line.indexOf(":")

    if (separator === -1) continue

    const directive = line.slice(0, separator).trim()
    const value = line.slice(separator + 1).trim()
    const key = directive.toLowerCase()

    if (key === "user-agent") {
      if (current && !hasDirectives) {
        const existing = current.userAgent
        current.userAgent = Array.isArray(existing)
          ? [...existing, value]
          : [existing, value]
      } else {
        flush()
        current = { userAgent: value }
      }

      hasDirectives = false
      continue
    }

    if (key === "sitemap") {
      if (value) parsed.sitemaps.push(value)
      continue
    }

    if (key === "host") {
      parsed.host = value
      continue
    }

    const rule = ensureCurrent()
    hasDirectives = true

    if (key === "allow" || key === "disallow") {
      const existing = rule[key]
      const values = Array.isArray(existing)
        ? [...existing, value]
        : existing
          ? [existing, value]
          : [value]

      rule[key] = values
      continue
    }

    if (key === "crawl-delay") {
      const delay = Number(value)

      if (Number.isFinite(delay)) rule.crawlDelay = delay
      continue
    }

    rule.other = {
      ...(rule.other ?? {}),
      [directive]: value,
    }
  }

  flush()

  return parsed
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  const seo = await getSeoSettings("en")
  const baseUrl = getSiteBaseUrl(seo)
  const custom = parseCustomRobots(seo.robotsTxt)
  const sitemapUrl = `${baseUrl.replace(/\/+$/, "")}/sitemap.xml`

  const generated: RobotsRule = {
    userAgent: "*",
    ...(seo.robotsIndex
      ? { allow: "/", disallow: DEFAULT_DISALLOW }
      : { disallow: "/" }),
  }

  const rules: RobotsRule[] =
    custom.rules.length > 0 ? custom.rules : [generated]

  const sitemaps = new Set(custom.sitemaps)

  if (seo.sitemapEnabled) sitemaps.add(sitemapUrl)

  return {
    rules,
    sitemap: sitemaps.size > 0 ? Array.from(sitemaps) : undefined,
    host: custom.host ?? baseUrl,
  }
}
