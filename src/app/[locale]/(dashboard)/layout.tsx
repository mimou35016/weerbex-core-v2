import type { ReactNode } from "react"
import { redirect } from "next/navigation"

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { CurrentUserProvider } from "@/components/dashboard/current-user-provider"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getCurrentUser } from "@/lib/auth"

export default async function DashboardLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const user = await getCurrentUser()

  if (!user || user.status !== "active") {
    redirect(`/${locale}/login`)
  }

  const isRtl = locale === "ar"

  return (
    <CurrentUserProvider user={user}>
      <SidebarProvider>
        <AppSidebar side={isRtl ? "right" : "left"} dir={isRtl ? "rtl" : "ltr"} />
        <SidebarInset>
          <DashboardHeader />
          <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </CurrentUserProvider>
  )
}
