import type { ReactNode } from "react"

import { requireAnyPermission } from "@/lib/require-role"
import { createRouteMetadata } from "@/lib/seo"

export const generateMetadata = createRouteMetadata(
  "/dashboard/settings/security"
)

export default async function SecuritySettingsLayout({
  children,
}: {
  children: ReactNode
}) {
  await requireAnyPermission("security", ["find", "read"])

  return children
}
