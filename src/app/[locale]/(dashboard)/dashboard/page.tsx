"use client"

import { useEffect, useState } from "react"
import {
  Activity,
  ArrowUpRight,
  HeartPulse,
  LayoutGrid,
  UsersRound,
} from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"

import { PageHeader } from "@/components/dashboard/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { appsRegistry } from "@/config/dashboard-nav"
import { Link } from "@/i18n/navigation"
import type { AuditEntry } from "@/lib/audit-types"
import { getOverviewStatsAction } from "@/lib/overview-actions"
import { cn } from "@/lib/utils"

const statusDot: Record<string, string> = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  failed: "bg-destructive",
}

type Stats = {
  totalUsers: number
  activeUsers: number
  recentActivity: AuditEntry[]
  last24h: number
  failed24h: number
  canViewAudit: boolean
}

const EMPTY_STATS: Stats = {
  totalUsers: 0,
  activeUsers: 0,
  recentActivity: [],
  last24h: 0,
  failed24h: 0,
  canViewAudit: false,
}

export default function DashboardOverviewPage() {
  const t = useTranslations("Dashboard")
  const ta = useTranslations("Dashboard.auditStatus")
  const tac = useTranslations("Dashboard.audit.actions")
  const format = useFormatter()
  const [stats, setStats] = useState<Stats>(EMPTY_STATS)

  useEffect(() => {
    let active = true

    getOverviewStatsAction().then((result) => {
      if (active && result.success) {
        setStats(result.data)
      }
    })

    return () => {
      active = false
    }
  }, [])

  const activeApps = appsRegistry.filter((app) => app.status === "active")
  const launchableApps = appsRegistry.filter(
    (app) => app.status !== "coming_soon"
  )

  return (
    <>
      <PageHeader
        title={t("overview.title")}
        description={t("overview.description")}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={UsersRound}
          label={t("overview.kpi.totalUsers")}
          value={stats.totalUsers}
          hint={t("overview.kpi.usersActive", { count: stats.activeUsers })}
          tone="primary"
        />
        <StatCard
          icon={LayoutGrid}
          label={t("overview.kpi.activeApps")}
          value={activeApps.length}
          hint={t("overview.kpi.appsTrend", {
            count: appsRegistry.length,
          })}
          tone="sky"
        />
        <StatCard
          icon={HeartPulse}
          label={t("overview.kpi.failedEvents")}
          value={stats.failed24h}
          hint={t("overview.kpi.failedEventsHint")}
          tone="emerald"
        />
        <StatCard
          icon={Activity}
          label={t("overview.kpi.recentActivity")}
          value={stats.last24h}
          hint={t("overview.kpi.activityTrend")}
          tone="amber"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>{t("overview.launcher.title")}</CardTitle>
            <CardDescription>
              {t("overview.launcher.description")}
            </CardDescription>
            <CardAction>
              <Button
                variant="ghost"
                size="sm"
                nativeButton={false}
                render={<Link href="/dashboard/apps" />}
              >
                {t("overview.launcher.manage")}
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {launchableApps.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {t("overview.launcher.empty")}
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {launchableApps.map((app) => {
                  const Icon = app.icon
                  return (
                    <Link
                      key={app.id}
                      href={app.href}
                      className="group flex items-start gap-3 rounded-xl border p-4 transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      <span className="flex min-w-0 flex-col gap-1">
                        <span className="flex items-center gap-2 text-sm font-medium">
                          <span className="truncate">{t(app.nameKey)}</span>
                          {app.status === "beta" && (
                            <StatusBadge
                              kind="app"
                              status={app.status}
                              label={t("appStatus.beta")}
                            />
                          )}
                        </span>
                        <span className="line-clamp-2 text-xs text-muted-foreground">
                          {t(app.descriptionKey)}
                        </span>
                      </span>
                      <ArrowUpRight
                        className="ms-auto size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
                        aria-hidden="true"
                      />
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("overview.activity.title")}</CardTitle>
            <CardDescription>
              {t("overview.activity.description")}
            </CardDescription>
            <CardAction>
              <Button
                variant="ghost"
                size="sm"
                nativeButton={false}
                render={<Link href="/dashboard/audit-logs" />}
              >
                {t("overview.activity.viewAll")}
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {stats.recentActivity.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {t("overview.activity.empty")}
              </p>
            ) : (
              <ul className="flex flex-col divide-y">
                {stats.recentActivity.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <span
                      className={cn(
                        "mt-1.5 size-2 shrink-0 rounded-full",
                        statusDot[item.status] ?? "bg-muted-foreground"
                      )}
                      aria-hidden="true"
                    />
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <p className="text-sm leading-snug">
                        {item.actor && (
                          <>
                            <span className="font-medium">{item.actor}</span>{" "}
                          </>
                        )}
                        <span className="text-muted-foreground">
                          {tac.has(item.action) ? tac(item.action) : item.action}
                        </span>
                        {item.target && (
                          <>
                            {" "}
                            <span className="font-medium">{item.target}</span>
                          </>
                        )}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {format.dateTime(new Date(item.timestamp), {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                    <StatusBadge
                      kind="audit"
                      status={item.status}
                      label={ta(item.status)}
                      className="ms-auto shrink-0"
                    />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
