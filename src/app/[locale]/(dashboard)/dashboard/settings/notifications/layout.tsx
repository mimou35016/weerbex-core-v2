import type { ReactNode } from "react"

import { requireAnyPermission } from "@/lib/require-role"

export default async function NotificationSettingsLayout({
  children,
}: {
  children: ReactNode
}) {
  await requireAnyPermission("notifications", ["find", "read"])

  return children
}
