import type { ReactNode } from "react"

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default async function DashboardLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const isRtl = locale === "ar"

  return (
    <SidebarProvider>
      <AppSidebar side={isRtl ? "right" : "left"} dir={isRtl ? "rtl" : "ltr"} />
      <SidebarInset>
        <DashboardHeader />
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
