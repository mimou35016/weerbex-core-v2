import { getLocale } from "next-intl/server"

import { redirect } from "@/i18n/navigation"
import { createRouteMetadata } from "@/lib/seo"

export const generateMetadata = createRouteMetadata("/")

export default async function LocaleIndexPage() {
  const locale = await getLocale()
  redirect({ href: "/dashboard", locale })
}
