/**
 * Shared, dependency-free types and constants for site settings and SEO.
 * Client components import from this module so the Payload server code is
 * never pulled into the browser bundle.
 */

export type Locale = "en" | "fr" | "ar"

export const supportedLocales: Locale[] = ["en", "fr", "ar"]

export function normalizeLocale(value: unknown): Locale {
  return value === "fr" || value === "ar" ? value : "en"
}

export type MediaRef = {
  id: string
  url: string
  alt: string | null
}

export type SocialPlatform =
  | "website"
  | "x"
  | "facebook"
  | "instagram"
  | "linkedin"
  | "youtube"
  | "tiktok"
  | "github"

export const socialPlatforms: SocialPlatform[] = [
  "website",
  "x",
  "facebook",
  "instagram",
  "linkedin",
  "youtube",
  "tiktok",
  "github",
]

export function normalizeSocialPlatform(value: unknown): SocialPlatform {
  return typeof value === "string" &&
    (socialPlatforms as string[]).includes(value)
    ? (value as SocialPlatform)
    : "website"
}

export type SocialLink = {
  platform: SocialPlatform
  url: string
}

export type SiteSettingsData = {
  siteName: string
  tagline: string
  description: string
  footerText: string
  logo: MediaRef | null
  favicon: MediaRef | null
  contactEmail: string
  contactPhone: string
  socialLinks: SocialLink[]
  maintenanceMode: boolean
  openRegistration: boolean
  defaultLocale: Locale
}

export type SeoSettingsData = {
  defaultTitle: string
  titleTemplate: string
  defaultDescription: string
  defaultKeywords: string
  author: string
  ogTitle: string
  ogDescription: string
  ogImage: MediaRef | null
  twitterCard: "summary" | "summary_large_image"
  twitterHandle: string
  robotsIndex: boolean
  robotsFollow: boolean
  canonicalBaseUrl: string
  googleVerification: string
  bingVerification: string
  yandexVerification: string
  robotsTxt: string
  sitemapEnabled: boolean
  customHeadScripts: string
  analyticsScript: string
  pixelScript: string
}

export type PageSeoFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never"

export type PageSeoData = {
  id: string
  path: string
  label: string
  title: string
  description: string
  keywords: string
  canonicalUrl: string
  ogImage: MediaRef | null
  noIndex: boolean
  includeInSitemap: boolean
  changeFrequency: PageSeoFrequency
  priority: number
  updatedAt: string | null
}
