import type { ReactNode } from "react"

import { requireAnyPermission } from "@/lib/require-role"

export default async function LocalizationSettingsLayout({
  children,
}: {
  children: ReactNode
}) {
  await requireAnyPermission("localization", ["find", "read"])

  return children
}
