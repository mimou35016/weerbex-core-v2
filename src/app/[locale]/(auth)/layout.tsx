import type { ReactNode } from "react"
import { ShieldCheck } from "lucide-react"
import { useTranslations } from "next-intl"

import { LanguageSwitcher } from "@/components/language-switcher"
import { ModeToggle } from "@/components/mode-toggle"
import { Link } from "@/i18n/navigation"

export default function AuthLayout({ children }: { children: ReactNode }) {
  const t = useTranslations("Auth")

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-zinc-50 px-4 py-10 sm:px-6 dark:bg-zinc-950">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 size-80 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />

      <div className="absolute inset-x-4 top-4 z-20 flex items-center justify-between gap-2 sm:inset-x-6 sm:top-6">
        <Link
          href="/login"
          className="flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold tracking-tight sm:text-xl">
            {t("brand")}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ModeToggle />
        </div>
      </div>

      <div className="relative z-10 flex w-full max-w-md flex-col gap-6 pt-16">
        {children}

        <p className="text-center text-xs text-muted-foreground">
          {t("footer", { year: new Date().getFullYear() })}
        </p>
      </div>
    </main>
  )
}
