import type { ReactNode } from "react"

import { requireAnyPermission } from "@/lib/require-role"

export default async function SeoSettingsLayout({
  children,
}: {
  children: ReactNode
}) {
  await requireAnyPermission("seo", ["find", "read"])

  return children
}
