"use client"

import { useTranslations } from "next-intl"

import { LanguageSwitcher } from "@/components/language-switcher"
import { ModeToggle } from "@/components/mode-toggle"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { DashboardBreadcrumb } from "@/components/dashboard/dashboard-breadcrumb"
import { UserNav } from "@/components/dashboard/user-nav"

export function DashboardHeader() {
  const t = useTranslations("Dashboard.header")

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
      <SidebarTrigger aria-label={t("toggleSidebar")} className="-ms-1" />
      <Separator orientation="vertical" className="me-1 h-4" />
      <DashboardBreadcrumb />
      <div className="ms-auto flex items-center gap-2">
        <LanguageSwitcher />
        <ModeToggle />
        <UserNav />
      </div>
    </header>
  )
}
