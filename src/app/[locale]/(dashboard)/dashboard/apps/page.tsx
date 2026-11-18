"use client"

import { useState } from "react"
import { ExternalLink, Settings2 } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { toast } from "sonner"

import { useCurrentUser } from "@/components/dashboard/current-user-provider"
import { FilterSelect, type FilterOption } from "@/components/dashboard/filter-select"
import { PageHeader } from "@/components/dashboard/page-header"
import { SearchInput } from "@/components/dashboard/search-input"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import {
  appsRegistry,
  roleOrder,
  type DashboardRole,
  type RegisteredApp,
} from "@/config/dashboard-nav"
import { Link } from "@/i18n/navigation"
import { hasPermission } from "@/lib/permissions"
import { canAccessApp } from "@/lib/rbac"

export default function AppsHubPage() {
  const t = useTranslations("Dashboard")
  const ta = useTranslations("Dashboard.appStatus")
  const tr = useTranslations("Dashboard.roles")
  const tt = useTranslations("Dashboard.toast")
  const locale = useLocale()
  const currentUser = useCurrentUser()
  const canConfigure = hasPermission(currentUser, "appsHub", "configure")

  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      appsRegistry.map((app) => [app.id, app.status !== "coming_soon"])
    )
  )
  const [configuring, setConfiguring] = useState<RegisteredApp | null>(null)
  const [webhook, setWebhook] = useState("")
  const [configRole, setConfigRole] = useState<DashboardRole>("admin")

  const statusOptions: FilterOption[] = [
    { value: "all", label: t("common.allStatuses") },
    { value: "active", label: ta("active") },
    { value: "beta", label: ta("beta") },
    { value: "coming_soon", label: ta("coming_soon") },
  ]

  const roleOptions: FilterOption[] = roleOrder.map((role) => ({
    value: role,
    label: tr(role),
  }))

  const normalizedQuery = query.trim().toLowerCase()
  const filteredApps = appsRegistry.filter((app) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      `${t(app.nameKey)} ${t(app.descriptionKey)}`
        .toLowerCase()
        .includes(normalizedQuery)
    const matchesStatus =
      statusFilter === "all" || app.status === statusFilter

    return matchesQuery && matchesStatus
  })

  function toggleApp(app: RegisteredApp, next: boolean) {
    setEnabled((current) => ({ ...current, [app.id]: next }))
    toast.success(
      next
        ? tt("appEnabled", { app: t(app.nameKey) })
        : tt("appDisabled", { app: t(app.nameKey) })
    )
  }

  function openConfigure(app: RegisteredApp) {
    setConfiguring(app)
    setWebhook("")
    setConfigRole(app.requiredRole)
  }

  function saveConfiguration() {
    if (!configuring) return
    toast.success(tt("appConfigured", { app: t(configuring.nameKey) }))
    setConfiguring(null)
  }

  return (
    <>
      <PageHeader
        title={t("appsHub.title")}
        description={t("appsHub.description")}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder={t("appsHub.searchPlaceholder")}
        />
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={statusOptions}
          ariaLabel={t("appsHub.statusFilter")}
        />
      </div>

      {filteredApps.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">{t("appsHub.empty")}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredApps.map((app) => {
            const Icon = app.icon
            const isComingSoon = app.status === "coming_soon"

            return (
              <Card key={app.id} size="sm" className="justify-between">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <div className="flex min-w-0 flex-col gap-1">
                      <CardTitle className="flex flex-wrap items-center gap-2">
                        <span className="truncate">{t(app.nameKey)}</span>
                        <StatusBadge
                          kind="app"
                          status={app.status}
                          label={ta(app.status)}
                        />
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {t(app.descriptionKey)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3 rounded-lg border p-2.5">
                    <Label
                      htmlFor={`enable-${app.id}`}
                      className="text-xs font-medium text-muted-foreground"
                    >
                      {t("appsHub.enableLabel")}
                    </Label>
                    <Switch
                      id={`enable-${app.id}`}
                      checked={Boolean(enabled[app.id])}
                      onCheckedChange={(checked) => toggleApp(app, checked)}
                      disabled={isComingSoon || !canConfigure}
                      aria-label={t(app.nameKey)}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    {canConfigure && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openConfigure(app)}
                      >
                        <Settings2 aria-hidden="true" />
                        {t("common.configure")}
                      </Button>
                    )}
                    {isComingSoon ? (
                      <Button size="sm" className="flex-1" disabled>
                        {ta("coming_soon")}
                      </Button>
                    ) : canAccessApp(currentUser, app.id) ? (
                      <Button
                        size="sm"
                        className="flex-1"
                        nativeButton={false}
                        render={<Link href={app.href} />}
                      >
                        <ExternalLink aria-hidden="true" />
                        {t("common.launch")}
                      </Button>
                    ) : (
                      <Button size="sm" className="flex-1" disabled>
                        {t("common.noAccess")}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Sheet
        open={configuring !== null}
        onOpenChange={(open) => {
          if (!open) setConfiguring(null)
        }}
      >
        <SheetContent
          side={locale === "ar" ? "left" : "right"}
          className="w-full sm:max-w-md"
        >
          <SheetHeader>
            <SheetTitle>{t("appsHub.configureTitle")}</SheetTitle>
            <SheetDescription>
              {t("appsHub.configureDescription")}
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-4 px-4">
            <div className="flex flex-col gap-1.5">
              <Label>{t("common.name")}</Label>
              <Input value={configuring ? t(configuring.nameKey) : ""} readOnly />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="app-webhook">{t("appsHub.webhook")}</Label>
              <Input
                id="app-webhook"
                value={webhook}
                onChange={(event) => setWebhook(event.target.value)}
                placeholder={t("appsHub.webhookPlaceholder")}
                dir="ltr"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>{t("appsHub.requiredRoleLabel")}</Label>
              <FilterSelect
                value={configRole}
                onChange={(value) => setConfigRole(value as DashboardRole)}
                options={roleOptions}
                ariaLabel={t("appsHub.requiredRoleLabel")}
                className="w-full sm:w-full"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>{t("appsHub.statusLabel")}</Label>
              <div>
                {configuring && (
                  <StatusBadge
                    kind="app"
                    status={configuring.status}
                    label={ta(configuring.status)}
                  />
                )}
              </div>
            </div>
          </div>

          <SheetFooter>
            <Button onClick={saveConfiguration}>{t("appsHub.saveConfig")}</Button>
            <Button variant="outline" onClick={() => setConfiguring(null)}>
              {t("common.cancel")}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
