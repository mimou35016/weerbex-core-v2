import type { ReactNode } from "react"

import { requireSuperAdmin } from "@/lib/require-role"
import { createRouteMetadata } from "@/lib/seo"

export const generateMetadata = createRouteMetadata("/dashboard/roles")

export default async function RolesLayout({
  children,
}: {
  children: ReactNode
}) {
  await requireSuperAdmin()

  return children
}
