import type { ReactNode } from "react"

import { requireAnyPermission } from "@/lib/require-role"
import { createRouteMetadata } from "@/lib/seo"

export const generateMetadata = createRouteMetadata("/dashboard/users")

export default async function UsersLayout({
  children,
}: {
  children: ReactNode
}) {
  await requireAnyPermission("users", ["find", "read"])

  return children
}
