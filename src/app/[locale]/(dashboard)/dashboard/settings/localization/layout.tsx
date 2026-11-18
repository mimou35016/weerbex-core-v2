import type { ReactNode } from "react"

import { requireAnyPermission } from "@/lib/require-role"
import { createRouteMetadata } from "@/lib/seo"

export const generateMetadata = createRouteMetadata(
  "/dashboard/settings/localization"
)

export default async function LocalizationSettingsLayout({
  children,
}: {
  children: ReactNode
}) {
  await requireAnyPermission("localization", ["find", "read"])

  return children
}
