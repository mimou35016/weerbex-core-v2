"use client"

import { useState, type FormEvent } from "react"
import { CircleCheck, LoaderCircle, Mail } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link } from "@/i18n/navigation"
import { validateEmail } from "@/lib/auth-validation"
import { requestPasswordResetAction } from "@/lib/user-actions"

export default function ForgotPasswordPage() {
  const t = useTranslations("ForgotPassword")
  const tv = useTranslations("Validation")

  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextError = validateEmail(email, {
      required: tv("emailRequired"),
      invalid: tv("emailInvalid"),
    })
    setError(nextError)
    if (nextError) return

    setIsSubmitting(true)
    await requestPasswordResetAction(email)
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="space-y-1.5">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          {t("title")}
        </CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>

      <CardContent>
        {isSubmitted ? (
          <div
            role="status"
            className="flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-300"
          >
            <CircleCheck className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <p className="leading-relaxed">{t("success", { email })}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">{t("emailLabel")}</Label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute top-1/2 start-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder={t("emailPlaceholder")}
                  className="ps-9"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    if (error) setError(undefined)
                  }}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "email-error" : undefined}
                />
              </div>
              {error && (
                <p id="email-error" role="alert" className="text-sm font-medium text-destructive">
                  {error}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && (
                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              )}
              {isSubmitting ? t("submitting") : t("submit")}
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter className="justify-center border-t pt-5">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {t("backLink")}
        </Link>
      </CardFooter>
    </Card>
  )
}
