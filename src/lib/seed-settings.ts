import type { Payload } from "payload"

type Locale = "en" | "fr" | "ar"

const SITE_DEFAULTS: Record<
  Locale,
  {
    siteName: string
    tagline: string
    description: string
    footerText: string
  }
> = {
  en: {
    siteName: "Weerbex",
    tagline: "Core Dashboard",
    description: "All-in-one platform to run your business.",
    footerText: "© {year} {siteName}. All rights reserved.",
  },
  fr: {
    siteName: "Weerbex",
    tagline: "Tableau de bord central",
    description: "La plateforme tout-en-un pour gérer votre activité.",
    footerText: "© {year} {siteName}. Tous droits réservés.",
  },
  ar: {
    siteName: "Weerbex",
    tagline: "لوحة التحكم الأساسية",
    description: "منصة شاملة لإدارة أعمالك.",
    footerText: "© {year} {siteName}. جميع الحقوق محفوظة.",
  },
}

const SEO_DEFAULTS: Record<
  Locale,
  {
    defaultTitle: string
    defaultDescription: string
    defaultKeywords: string
    ogTitle: string
    ogDescription: string
  }
> = {
  en: {
    defaultTitle: "Weerbex — the core of your platform",
    defaultDescription: "All-in-one platform to run your business.",
    defaultKeywords: "saas, dashboard, platform",
    ogTitle: "Weerbex — the core of your platform",
    ogDescription: "All-in-one platform to run your business.",
  },
  fr: {
    defaultTitle: "Weerbex — le cœur de votre plateforme",
    defaultDescription: "La plateforme tout-en-un pour gérer votre activité.",
    defaultKeywords: "saas, tableau de bord, plateforme",
    ogTitle: "Weerbex — le cœur de votre plateforme",
    ogDescription: "La plateforme tout-en-un pour gérer votre activité.",
  },
  ar: {
    defaultTitle: "Weerbex — قلب منصتك",
    defaultDescription: "منصة شاملة لإدارة أعمالك.",
    defaultKeywords: "saas, لوحة تحكم, منصة",
    ogTitle: "Weerbex — قلب منصتك",
    ogDescription: "منصة شاملة لإدارة أعمالك.",
  },
}

const locales: Locale[] = ["en", "fr", "ar"]

/**
 * Bootstraps the site settings and SEO globals with sensible defaults the
 * first time the application starts. Existing values are never overwritten,
 * so every later change made by a super admin stays authoritative. Each locale
 * is seeded independently, which means a newly enabled language immediately
 * has translated fallback content.
 */
export async function seedSettings(payload: Payload): Promise<void> {
  try {
    for (const locale of locales) {
      const site = await payload.findGlobal({
        slug: "site-settings",
        locale,
        depth: 0,
        overrideAccess: true,
      })

      if (!site.siteName) {
        const defaults = SITE_DEFAULTS[locale]

        await payload.updateGlobal({
          slug: "site-settings",
          locale,
          overrideAccess: true,
          data: {
            ...defaults,
            contactEmail: "support@weerbex.io",
            maintenanceMode: false,
            openRegistration: true,
            defaultLocale: "en",
            socialLinks: [],
          },
        })
      }

      const seo = await payload.findGlobal({
        slug: "seo-settings",
        locale,
        depth: 0,
        overrideAccess: true,
      })

      if (!seo.defaultTitle) {
        const defaults = SEO_DEFAULTS[locale]

        await payload.updateGlobal({
          slug: "seo-settings",
          locale,
          overrideAccess: true,
          data: {
            ...defaults,
            titleTemplate: "%s | {siteName}",
            author: "Weerbex",
            twitterCard: "summary_large_image",
            twitterHandle: "@weerbex",
            robotsIndex: true,
            robotsFollow: true,
            canonicalBaseUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "",
            sitemapEnabled: true,
          },
        })
      }
    }
  } catch (error) {
    payload.logger.error({
      msg: "Failed to seed site settings.",
      err: error,
    })
  }
}
