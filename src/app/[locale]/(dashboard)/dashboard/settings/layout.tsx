import type { ReactNode } from "react"

import { SettingsNav } from "@/components/dashboard/settings/settings-nav"
import { createRouteMetadata } from "@/lib/seo"

export const generateMetadata = createRouteMetadata("/dashboard/settings")

export default function SettingsLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <SettingsNav />
      <div className="flex min-w-0 flex-1 flex-col gap-6">{children}</div>
    </div>
  )
}
