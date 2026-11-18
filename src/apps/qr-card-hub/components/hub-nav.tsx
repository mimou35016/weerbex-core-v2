"use client"

import { CreditCard, LayoutGrid, QrCode } from "lucide-react"
import { useTranslations } from "next-intl"

import { useCurrentUser } from "@/components/dashboard/current-user-provider"
import { Link, usePathname } from "@/i18n/navigation"
import { canAccessRoute } from "@/lib/rbac"
import { cn } from "@/lib/utils"

const hubNavItems = [
  {
    id: "overview",
    href: "/dashboard/apps/qr-card-hub",
    labelKey: "overview.nav",
    icon: LayoutGrid,
  },
  {
    id: "qr",
    href: "/dashboard/apps/qr-card-hub/qr",
    labelKey: "qr.nav",
    icon: QrCode,
  },
  {
    id: "cards",
    href: "/dashboard/apps/qr-card-hub/cards",
    labelKey: "cards.nav",
    icon: CreditCard,
  },
] as const

export function HubNav() {
  const t = useTranslations("Dashboard.qrCardHub")
  const pathname = usePathname()
  const currentUser = useCurrentUser()
  const visibleItems = currentUser
    ? hubNavItems.filter((item) => canAccessRoute(currentUser, item.href))
    : []

  return (
    <nav aria-label={t("navLabel")} className="lg:w-56 lg:shrink-0">
      <ul className="flex gap-1 overflow-x-auto rounded-xl bg-muted/60 p-1 lg:sticky lg:top-20 lg:flex-col lg:overflow-visible lg:bg-transparent lg:p-0">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <li key={item.id} className="shrink-0 lg:w-full">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                  "hover:bg-muted hover:text-foreground",
                  "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                  isActive
                    ? "bg-background text-foreground shadow-xs lg:bg-muted"
                    : "text-muted-foreground"
                )}
              >
                <Icon aria-hidden="true" className="size-4 shrink-0" />
                <span>{t(item.labelKey)}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
