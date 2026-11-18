import createMiddleware from "next-intl/middleware"

import { routing } from "./i18n/routing"

export default createMiddleware(routing)

export const config = {
  // Match all pathnames except for:
  // - `/api`, `/admin` (Payload CMS), `/trpc`, `/_next`, `/_vercel`
  // - files containing a dot (e.g. `favicon.ico`)
  matcher: "/((?!api|admin|trpc|_next|_vercel|.*\\..*).*)",
}
