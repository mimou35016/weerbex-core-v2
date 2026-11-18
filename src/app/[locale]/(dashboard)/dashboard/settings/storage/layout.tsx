import type { ReactNode } from "react"

import { requireAnyPermission } from "@/lib/require-role"
import { createRouteMetadata } from "@/lib/seo"

export const generateMetadata = createRouteMetadata(
  "/dashboard/settings/storage"
)

export default async function StorageSettingsLayout({
  children,
}: {
  children: ReactNode
}) {
  await requireAnyPermission("storage", ["find", "read"])

  return children
}
