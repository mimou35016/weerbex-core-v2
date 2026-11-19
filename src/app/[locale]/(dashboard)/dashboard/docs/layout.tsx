import type { ReactNode } from "react"

import { requireAnyPermission } from "@/lib/require-role"
import { createRouteMetadata } from "@/lib/seo"

export const generateMetadata = createRouteMetadata("/dashboard/docs")

export default async function DocumentationLayout({
  children,
}: {
  children: ReactNode
}) {
  await requireAnyPermission("docs", ["find", "read"])

  return children
}
