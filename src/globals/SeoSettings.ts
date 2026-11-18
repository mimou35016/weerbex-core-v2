import type { GlobalConfig, PayloadRequest } from "payload"

import type { User } from "@/payload-types"
import {
  isActiveUser,
  resolveActor,
  roleHasPermission,
} from "@/lib/roles"

const updateAccess = async ({
  req,
}: {
  req: PayloadRequest
}): Promise<boolean> => {
  const actor = await resolveActor(req.payload, req.user as User | null)

  return Boolean(
    actor &&
      isActiveUser(actor.user) &&
      roleHasPermission(actor.role, "seo", "update")
  )
}

/**
 * Global SEO defaults. Route-specific values live in the `page-seo`
 * collection and override these fields.
 */
export const SeoSettings: GlobalConfig = {
  slug: "seo-settings",
  label: "SEO settings",
  admin: {
    group: "Settings",
    description:
      "Default metadata, social cards, verification codes and indexing rules.",
  },
  access: {
    read: () => true,
    update: updateAccess,
  },
  fields: [
    {
      name: "defaultTitle",
      type: "text",
      localized: true,
      admin: {
        description: "Used when a page does not define its own title.",
      },
    },
    {
      name: "titleTemplate",
      type: "text",
      defaultValue: "%s | {siteName}",
      admin: {
        description:
          "Template applied to page titles. Use %s for the page title and {siteName} for the site name.",
      },
    },
    {
      name: "defaultDescription",
      type: "textarea",
      localized: true,
    },
    {
      name: "defaultKeywords",
      type: "text",
      localized: true,
      admin: {
        description: "Comma separated keywords.",
      },
    },
    {
      name: "author",
      type: "text",
    },
    {
      name: "ogTitle",
      type: "text",
      localized: true,
    },
    {
      name: "ogDescription",
      type: "textarea",
      localized: true,
    },
    {
      name: "ogImage",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Default Open Graph and Twitter card image.",
      },
    },
    {
      name: "twitterCard",
      type: "select",
      defaultValue: "summary_large_image",
      options: [
        { label: "Summary", value: "summary" },
        { label: "Summary with large image", value: "summary_large_image" },
      ],
    },
    {
      name: "twitterHandle",
      type: "text",
    },
    {
      name: "robotsIndex",
      type: "checkbox",
      defaultValue: true,
      admin: {
        description: "Allow search engines to index the site.",
      },
    },
    {
      name: "robotsFollow",
      type: "checkbox",
      defaultValue: true,
      admin: {
        description: "Allow search engines to follow links.",
      },
    },
    {
      name: "canonicalBaseUrl",
      type: "text",
      admin: {
        description:
          "Public origin used for canonical URLs, sitemaps and Open Graph links (e.g. https://example.com).",
      },
    },
    {
      name: "googleVerification",
      type: "text",
    },
    {
      name: "bingVerification",
      type: "text",
    },
    {
      name: "yandexVerification",
      type: "text",
    },
    {
      name: "robotsTxt",
      type: "textarea",
      admin: {
        description:
          "Optional custom robots.txt body. When empty, rules are generated from the indexing switches.",
      },
    },
    {
      name: "sitemapEnabled",
      type: "checkbox",
      defaultValue: true,
      admin: {
        description: "Publish /sitemap.xml and reference it from robots.txt.",
      },
    },
    {
      name: "customHeadScripts",
      type: "textarea",
      admin: {
        description:
          "Raw HTML injected into every page. Only edit when you trust the content.",
      },
    },
    {
      name: "analyticsScript",
      type: "textarea",
    },
    {
      name: "pixelScript",
      type: "textarea",
    },
  ],
}
