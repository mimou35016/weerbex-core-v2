import type { ReactNode } from "react"

import { requireAnyPermission } from "@/lib/require-role"
import { createRouteMetadata } from "@/lib/seo"

export const generateMetadata = createRouteMetadata(
  "/dashboard/settings/notifications"
)

export default async function NotificationSettingsLayout({
  children,
}: {
  children: ReactNode
}) {
  await requireAnyPermission("notifications", ["find", "read"])

  return children
}
