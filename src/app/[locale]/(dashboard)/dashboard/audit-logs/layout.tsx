import type { ReactNode } from "react"

import { requireAnyPermission } from "@/lib/require-role"

export default async function AuditLogsLayout({
  children,
}: {
  children: ReactNode
}) {
  await requireAnyPermission("audit", ["find", "read"])

  return children
}
