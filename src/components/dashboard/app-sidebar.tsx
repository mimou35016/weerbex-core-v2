"use client"

import { ShieldCheck } from "lucide-react"
import { useTranslations } from "next-intl"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { appsRegistry, coreNavItems } from "@/config/dashboard-nav"
import { mockUsers } from "@/config/dashboard-mock-data"
import { Link, usePathname } from "@/i18n/navigation"
import { getInitials } from "@/lib/initials"

const currentUser = mockUsers[0]

export function AppSidebar({
  side = "left",
  dir = "ltr",
}: {
  side?: "left" | "right"
  dir?: "ltr" | "rtl"
}) {
  const t = useTranslations("Dashboard")
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Sidebar side={side} dir={dir} collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ShieldCheck className="size-4" aria-hidden="true" />
              </span>
              <span className="grid flex-1 text-start leading-tight">
                <span className="truncate text-sm font-semibold">
                  {t("nav.brand")}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {t("nav.brandTagline")}
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("nav.registeredApps")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {appsRegistry.map((app) => {
                const Icon = app.icon
                return (
                  <SidebarMenuItem key={app.id}>
                    <SidebarMenuButton
                      render={<Link href={app.href} />}
                      isActive={isActive(app.href)}
                      tooltip={t(app.nameKey)}
                    >
                      <Icon aria-hidden="true" />
                      <span>{t(app.nameKey)}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t("nav.coreManagement")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {coreNavItems.map((item) => {
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive(item.href)}
                      tooltip={t(`nav.${item.labelKey}`)}
                    >
                      <Icon aria-hidden="true" />
                      <span>{t(`nav.${item.labelKey}`)}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/dashboard/settings" />}
              tooltip={currentUser.name}
            >
              <Avatar size="sm">
                <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
              </Avatar>
              <span className="grid flex-1 text-start leading-tight">
                <span className="truncate text-sm font-medium">
                  {currentUser.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {t("userNav.role")}
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
