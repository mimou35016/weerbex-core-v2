import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { CardActions } from "@/apps/qr-card-hub/components/card-actions"
import { DigitalCardPreview } from "@/apps/qr-card-hub/components/digital-card-preview"
import {
  findPublishedCardBySlug,
  toDigitalCardData,
} from "@/apps/qr-card-hub/lib/data"
import { getPayloadClient } from "@/lib/payload"
import { buildMetadata } from "@/lib/seo"
import {
  getSeoSettings,
  getSiteBaseUrl,
  normalizeLocale,
} from "@/lib/site-settings"

type CardRouteParams = { locale: string; slug: string }

async function loadCard(slug: string) {
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
  const seo = await getSeoSettings(normalizeLocale(locale))
  const baseUrl = getSiteBaseUrl(seo).replace(/\/+$/, "")
  const data = toDigitalCardData(card)
  const shareUrl = `${baseUrl}/${locale}/card/${card.slug}`

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/30 px-4 py-10">
      <DigitalCardPreview card={data} variant="page" />
      <CardActions card={data} shareUrl={shareUrl} />
      <p className="text-center text-xs text-muted-foreground">
        {t("poweredBy", { site: seo.defaultTitle || "Weerbex" })}
      </p>
    </main>
  )
}
