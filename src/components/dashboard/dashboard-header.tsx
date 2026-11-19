"use client"

import { CircleHelp } from "lucide-react"
import { useTranslations } from "next-intl"

import { LanguageSwitcher } from "@/components/language-switcher"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useCurrentUser } from "@/components/dashboard/current-user-provider"
import { DashboardBreadcrumb } from "@/components/dashboard/dashboard-breadcrumb"
import { UserNav } from "@/components/dashboard/user-nav"
import { Link } from "@/i18n/navigation"
import { canAccessRoute } from "@/lib/rbac"

export function DashboardHeader() {
  const t = useTranslations("Dashboard.header")
  const currentUser = useCurrentUser()
  const canViewDocs = canAccessRoute(currentUser, "/dashboard/docs")

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
      <SidebarTrigger aria-label={t("toggleSidebar")} className="-ms-1" />
      <Separator orientation="vertical" className="me-1 h-4" />
      <DashboardBreadcrumb />
      <div className="ms-auto flex items-center gap-2">
        {canViewDocs ? (
          <Button
            variant="ghost"
            size="icon-sm"
            nativeButton={false}
            render={<Link href="/dashboard/docs" />}
            aria-label={t("docs")}
            title={t("docs")}
          >
            <CircleHelp aria-hidden="true" />
          </Button>
        ) : null}
        <LanguageSwitcher />
        <ModeToggle />
        <UserNav />
      </div>
    </header>
  )
}
