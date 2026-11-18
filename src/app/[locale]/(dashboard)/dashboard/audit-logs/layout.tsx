import type { ReactNode } from "react"

import { requireAnyPermission } from "@/lib/require-role"
import { createRouteMetadata } from "@/lib/seo"

export const generateMetadata = createRouteMetadata("/dashboard/audit-logs")

export default async function AuditLogsLayout({
  children,
}: {
  children: ReactNode
}) {
  await requireAnyPermission("audit", ["find", "read"])

  return children
}
