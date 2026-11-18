import { ArrowLeft, ArrowRight } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

import { PageHeader } from "@/components/dashboard/page-header"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getAppById } from "@/config/dashboard-nav"
import { Link } from "@/i18n/navigation"

export default async function AppDetailPage({
  params,
}: {
  params: Promise<{ locale: string; appId: string }>
}) {
  const { locale, appId } = await params
  const app = getAppById(appId)

  if (!app) notFound()

  const t = await getTranslations("Dashboard")
  const ta = await getTranslations("Dashboard.appStatus")
  const tr = await getTranslations("Dashboard.roles")
  const BackIcon = locale === "ar" ? ArrowRight : ArrowLeft

  return (
    <>
      <div>
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/dashboard/apps" />}
        >
          <BackIcon aria-hidden="true" />
          {t("appDetail.back")}
        </Button>
      </div>

      <PageHeader
        title={t(app.nameKey)}
        description={t(app.descriptionKey)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card size="sm">
          <CardHeader>
            <CardTitle>{t("appDetail.statusLabel")}</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBadge
              kind="app"
              status={app.status}
              label={ta(app.status)}
            />
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle>{t("appDetail.requiredRoleLabel")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">{tr(app.requiredRole)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t(app.nameKey)}</CardTitle>
          <CardDescription>{t("appDetail.launchPlaceholder")}</CardDescription>
        </CardHeader>
        <CardContent>
          {app.status === "coming_soon" ? (
            <div className="rounded-lg border border-dashed p-6">
              <p className="font-medium">{t("appDetail.comingSoon")}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("appDetail.comingSoonDescription")}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              {t("appDetail.launchPlaceholder")}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
