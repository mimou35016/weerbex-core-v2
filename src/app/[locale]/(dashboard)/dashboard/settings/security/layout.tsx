import type { ReactNode } from "react"

import { requireAnyPermission } from "@/lib/require-role"

export default async function SecuritySettingsLayout({
  children,
}: {
  children: ReactNode
}) {
  await requireAnyPermission("security", ["find", "read"])

  return children
}
