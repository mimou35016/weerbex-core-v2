import type { ReactNode } from "react"

import { requireAnyPermission, requireAppAvailable } from "@/lib/require-role"
import { createRouteMetadata } from "@/lib/seo"

import { HubNav } from "@/apps/qr-card-hub/components/hub-nav"

export const generateMetadata = createRouteMetadata(
  "/dashboard/apps/qr-card-hub"
)

export default async function QrCardHubLayout({
  children,
}: {
  children: ReactNode
}) {
  await requireAppAvailable("qrCardHub")
  await requireAnyPermission("qrCardHub", ["find", "read"])

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <HubNav />
      <div className="flex min-w-0 flex-1 flex-col gap-6">{children}</div>
    </div>
  )
}
