"use client"

import { useState, type FormEvent } from "react"
import {
  CircleCheck,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
} from "lucide-react"
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
import { Link, useRouter } from "@/i18n/navigation"
import { validateEmail, validatePassword } from "@/lib/auth-validation"
import { loginAction } from "@/lib/user-actions"

type LoginErrors = {
  email?: string
  password?: string
}

export default function LoginPage() {
  const t = useTranslations("Login")
  const tc = useTranslations("Common")
  const tv = useTranslations("Validation")
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<LoginErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors: LoginErrors = {
      email: validateEmail(email, {
        required: tv("emailRequired"),
        invalid: tv("emailInvalid"),
      }),
      password: validatePassword(password, {
        required: tv("passwordRequired"),
        tooShort: tv("passwordShort"),
      }),
    }
    setErrors(nextErrors)

    if (nextErrors.email || nextErrors.password) return

    setIsSubmitting(true)
    const result = await loginAction({ email, password })
    setIsSubmitting(false)

    if (!result.success) {
      setErrors((current) => ({ ...current, password: result.error }))
      return
    }

    setIsSubmitted(true)
    router.push("/dashboard")
    router.refresh()
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
            <div>
              <p className="font-medium">{t("success")}</p>
            </div>
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
                    if (errors.email) {
                      setErrors((current) => ({ ...current, email: undefined }))
                    }
                  }}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
              </div>
              {errors.email && (
                <p id="email-error" role="alert" className="text-sm font-medium text-destructive">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="password">{t("passwordLabel")}</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  {t("forgotPassword")}
                </Link>
              </div>
              <div className="relative">
                <LockKeyhole
                  className="pointer-events-none absolute top-1/2 start-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder={t("passwordPlaceholder")}
                  className="pe-10 ps-9"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    if (errors.password) {
                      setErrors((current) => ({ ...current, password: undefined }))
                    }
                  }}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute top-1/2 end-1.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={
                    showPassword ? tc("hidePassword") : tc("showPassword")
                  }
                >
                  {showPassword ? (
                    <EyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4" aria-hidden="true" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p id="password-error" role="alert" className="text-sm font-medium text-destructive">
                  {errors.password}
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
        <p className="text-center text-sm text-muted-foreground">
          {t("noAccount")}{" "}
          <Link
            href="/register"
            className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
          >
            {t("registerLink")}
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
