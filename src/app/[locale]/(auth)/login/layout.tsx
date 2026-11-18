import type { ReactNode } from "react"

import { createRouteMetadata } from "@/lib/seo"

export const generateMetadata = createRouteMetadata("/login")

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children
}
