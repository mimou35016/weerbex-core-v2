import type { ReactNode } from "react"

import { requireAnyPermission } from "@/lib/require-role"
import { createRouteMetadata } from "@/lib/seo"

export const generateMetadata = createRouteMetadata("/dashboard/settings/seo")

export default async function SeoSettingsLayout({
  children,
}: {
  children: ReactNode
}) {
  await requireAnyPermission("seo", ["find", "read"])

  return children
}
