"use client"

import { useLocale, useTranslations } from "next-intl"
import { Check, Languages } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePathname, useRouter } from "@/i18n/navigation"

const languageOptions = [
  { code: "en", label: "en" },
  { code: "fr", label: "fr" },
  { code: "ar", label: "ar" },
] as const

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations("Language")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" size="icon" aria-label={t("label")} />}
      >
        <Languages className="size-4" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languageOptions.map(({ code, label }) => (
          <DropdownMenuItem
            key={code}
            onClick={() => router.replace(pathname, { locale: code })}
          >
            {t(label)}
            {locale === code && <Check className="ms-auto size-4" aria-hidden="true" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
