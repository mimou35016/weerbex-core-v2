import type { ReactNode } from "react"

import { requireAnyPermission } from "@/lib/require-role"

export default async function StorageSettingsLayout({
  children,
}: {
  children: ReactNode
}) {
  await requireAnyPermission("storage", ["find", "read"])

  return children
}
