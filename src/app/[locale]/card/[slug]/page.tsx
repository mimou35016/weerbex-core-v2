import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { CardActions } from "@/apps/qr-card-hub/components/card-actions"
import { CardRenderer } from "@/apps/qr-card-hub/components/CardRenderer"
import {
  findPublishedCardBySlug,
  toDigitalCardData,
} from "@/apps/qr-card-hub/lib/data"
import { isAppAvailable } from "@/lib/app-state"
import { getPayloadClient } from "@/lib/payload"
import { buildMetadata } from "@/lib/seo"
import {
  getSeoSettings,
  getSiteBaseUrl,
  getSiteSettings,
  normalizeLocale,
} from "@/lib/site-settings"

type CardRouteParams = { locale: string; slug: string }

async function loadCard(slug: string) {
  if (!(await isAppAvailable("qrCardHub"))) return null

  const payload = await getPayloadClient()
  return findPublishedCardBySlug(payload, slug)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<CardRouteParams>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const [card, base] = await Promise.all([
    loadCard(slug),
    buildMetadata({ locale, path: `/card/${slug}` }),
  ])

  if (!card) {
    return {
      ...base,
      title: "404",
      robots: { index: false, follow: false },
    }
  }

  const name = (card.fullName || card.title || "").trim()
  const description = (
    card.bio ||
    [card.jobTitle, card.company].filter(Boolean).join(" · ") ||
    base.description ||
    ""
  ).trim()

  return {
    ...base,
    title: name,
    description,
    openGraph: {
      ...base.openGraph,
      title: name,
      description,
    },
    twitter: {
      ...base.twitter,
      title: name,
      description,
    },
  }
}

export default async function PublicCardPage({
  params,
}: {
  params: Promise<CardRouteParams>
}) {
  const { locale, slug } = await params
  const card = await loadCard(slug)

  if (!card) notFound()

  const t = await getTranslations("Card")
  const normalizedLocale = normalizeLocale(locale)
  const [seo, site] = await Promise.all([
    getSeoSettings(normalizedLocale),
    getSiteSettings(normalizedLocale),
  ])
  const baseUrl = getSiteBaseUrl(seo).replace(/\/+$/, "")
  const data = toDigitalCardData(card)
  const shareUrl = `${baseUrl}/${locale}/card/${card.slug}`

  return (
    <main className="relative flex min-h-dvh flex-col overflow-x-hidden bg-muted/40">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-0 sm:px-5 sm:py-10">
        <div className="my-auto flex w-full flex-col">
          {/* Full-bleed on phones, framed and centered from `sm` upwards. */}
          <CardRenderer
            card={data}
            className="min-h-dvh rounded-none border-0 shadow-none sm:min-h-0 sm:rounded-3xl sm:border sm:shadow-xl"
          />
          <div className="flex flex-col gap-5 px-4 pt-5 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-0 sm:pt-5 sm:pb-0">
            <CardActions card={data} shareUrl={shareUrl} />
            <p className="text-center text-xs text-muted-foreground">
              {t("poweredBy", { site: site.siteName || "Weerbex" })}
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
