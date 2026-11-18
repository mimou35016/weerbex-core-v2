import type { ReactNode } from "react"
import { notFound } from "next/navigation"

import { getAppById } from "@/config/dashboard-nav"
import { requireAnyPermission } from "@/lib/require-role"

export default async function AppDetailLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ appId: string }>
}) {
  const { appId } = await params
  const app = getAppById(appId)

  if (!app) notFound()

  await requireAnyPermission(app.id, ["find", "read"])

  return children
}
