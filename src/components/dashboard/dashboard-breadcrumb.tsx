"use client"

import { Fragment } from "react"
import { useTranslations } from "next-intl"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { appsRegistry } from "@/config/dashboard-nav"
import { settingsNavItems } from "@/config/settings-nav"
import { Link, usePathname } from "@/i18n/navigation"

type Crumb = {
  label: string
  href?: string
}

export function DashboardBreadcrumb() {
  const t = useTranslations("Dashboard")
  const pathname = usePathname()

  const segments = pathname.split("/").filter(Boolean)
  const items: Crumb[] = [{ label: t("nav.overview"), href: "/dashboard" }]
  const section = segments[1]

  if (section === "apps") {
    items.push({ label: t("nav.apps"), href: "/dashboard/apps" })
    const app = appsRegistry.find((entry) => entry.id === segments[2])
    if (app) items.push({ label: t(app.nameKey) })
  } else if (section === "users") {
    items.push({ label: t("nav.users") })
  } else if (section === "roles") {
    items.push({ label: t("nav.roles") })
  } else if (section === "audit-logs") {
    items.push({ label: t("nav.audit") })
  } else if (section === "settings") {
    const subSection = segments[2]
    items.push({
      label: t("nav.settings"),
      href: subSection ? "/dashboard/settings" : undefined,
    })

    if (subSection) {
      const settingsItem = settingsNavItems.find(
        (entry) => entry.href === `/dashboard/settings/${subSection}`
      )
      if (settingsItem) {
        items.push({ label: t(`settings.${settingsItem.labelKey}`) })
      }
    }
  }

  return (
    <Breadcrumb aria-label={t("header.breadcrumbLabel")}>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <Fragment key={`${item.label}-${index}`}>
              <BreadcrumbItem>
                {isLast || !item.href ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={item.href} />}>
                    {item.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && (
                <BreadcrumbSeparator className="rtl:[&>svg]:rotate-180" />
              )}
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
