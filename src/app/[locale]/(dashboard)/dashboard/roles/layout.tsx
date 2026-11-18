import type { ReactNode } from "react"

import { requireSuperAdmin } from "@/lib/require-role"

export default async function RolesLayout({
  children,
}: {
  children: ReactNode
}) {
  await requireSuperAdmin()

  return children
}
