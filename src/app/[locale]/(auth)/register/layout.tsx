import type { ReactNode } from "react"

import { createRouteMetadata } from "@/lib/seo"

export const generateMetadata = createRouteMetadata("/register")

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return children
}
