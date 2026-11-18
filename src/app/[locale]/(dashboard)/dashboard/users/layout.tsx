import type { ReactNode } from "react"

import { requireAnyPermission } from "@/lib/require-role"

export default async function UsersLayout({
  children,
}: {
  children: ReactNode
}) {
  await requireAnyPermission("users", ["find", "read"])

  return children
}
