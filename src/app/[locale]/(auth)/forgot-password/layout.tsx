import type { ReactNode } from "react"

import { createRouteMetadata } from "@/lib/seo"

export const generateMetadata = createRouteMetadata("/forgot-password")

export default function ForgotPasswordLayout({
  children,
}: {
  children: ReactNode
}) {
  return children
}
