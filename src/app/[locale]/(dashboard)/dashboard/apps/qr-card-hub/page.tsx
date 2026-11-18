import { CreditCard, Eye, QrCode } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Link } from "@/i18n/navigation"
import { getPayloadClient } from "@/lib/payload"

import { getQrCardHubStats } from "@/apps/qr-card-hub/lib/data"

export default async function QrCardHubOverviewPage() {
  const t = await getTranslations("Dashboard.qrCardHub")
  const payload = await getPayloadClient()
  const stats = await getQrCardHubStats(payload)

  const cards = [
    {
      id: "qr",
      icon: QrCode,
      label: t("overview.qrCodes"),
      value: stats.qrCodes,
      description: t("overview.qrCodesHint"),
      href: "/dashboard/apps/qr-card-hub/qr",
      action: t("overview.openQr"),
    },
    {
      id: "cards",
      icon: CreditCard,
      label: t("overview.digitalCards"),
      value: stats.digitalCards,
      description: t("overview.digitalCardsHint"),
      href: "/dashboard/apps/qr-card-hub/cards",
      action: t("overview.openCards"),
    },
    {
      id: "published",
      icon: Eye,
      label: t("overview.publishedCards"),
      value: stats.publishedCards,
      description: t("overview.publishedCardsHint"),
      href: "/dashboard/apps/qr-card-hub/cards",
      action: t("overview.openCards"),
    },
  ]

  return (
    <>
      <PageHeader
        title={t("overview.title")}
        description={t("overview.description")}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon

          return (
            <Card key={card.id}>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.label}
                  </CardTitle>
                  <Icon
                    aria-hidden="true"
                    className="size-4 text-muted-foreground"
                  />
                </div>
                <p className="text-3xl font-semibold tracking-tight">
                  {card.value}
                </p>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  size="sm"
                  nativeButton={false}
                  render={<Link href={card.href} />}
                >
                  {card.action}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("overview.aboutTitle")}</CardTitle>
          <CardDescription>{t("overview.aboutDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="flex list-disc flex-col gap-2 ps-5 text-sm text-muted-foreground">
            <li>{t("overview.featureStatic")}</li>
            <li>{t("overview.featureDynamic")}</li>
            <li>{t("overview.featureTemplates")}</li>
            <li>{t("overview.featureExport")}</li>
          </ul>
        </CardContent>
      </Card>
    </>
  )
}
