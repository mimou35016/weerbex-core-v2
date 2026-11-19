import type { Metadata } from "next"
import type { ReactNode } from "react"
import { notFound } from "next/navigation"

import { getAppDefinition } from "@/lib/app-definitions"
import { requireAnyPermission, requireAppAvailable } from "@/lib/require-role"
import { buildMetadata } from "@/lib/seo"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; appId: string }>
}): Promise<Metadata> {
  const { locale, appId } = await params

  return buildMetadata({ locale, path: `/dashboard/apps/${appId}` })
}

export default async function AppDetailLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ appId: string }>
}) {
  const { appId } = await params
  const app = getAppDefinition(appId)

  if (!app) notFound()

  await requireAppAvailable(app.id)
  await requireAnyPermission(app.permissionResource, ["find", "read"])

  return children
}
