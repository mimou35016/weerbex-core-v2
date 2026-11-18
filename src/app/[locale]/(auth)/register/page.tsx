"use client"

import { useState, type FormEvent } from "react"
import {
  CircleCheck,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  UserRound,
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
import { Link } from "@/i18n/navigation"
import {
  validateConfirmPassword,
  validateEmail,
  validatePassword,
  validateRequired,
} from "@/lib/auth-validation"
import { registerAction } from "@/lib/user-actions"

type RegisterErrors = {
  fullName?: string
  email?: string
  password?: string
  confirmPassword?: string
}

export default function RegisterPage() {
  const t = useTranslations("Register")
  const tc = useTranslations("Common")
  const tv = useTranslations("Validation")

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<RegisterErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors: RegisterErrors = {
      fullName: validateRequired(fullName, tv("nameRequired")),
      email: validateEmail(email, {
        required: tv("emailRequired"),
        invalid: tv("emailInvalid"),
      }),
      password: validatePassword(password, {
        required: tv("passwordRequired"),
        tooShort: tv("passwordShort"),
      }),
      confirmPassword: validateConfirmPassword(password, confirmPassword, {
        required: tv("confirmRequired"),
        mismatch: tv("confirmMismatch"),
      }),
    }
    setErrors(nextErrors)

    if (
      nextErrors.fullName ||
      nextErrors.email ||
      nextErrors.password ||
      nextErrors.confirmPassword
    ) {
      return
    }

    setIsSubmitting(true)
    const result = await registerAction({
      name: fullName,
      email,
      password,
    })
    setIsSubmitting(false)

    if (!result.success) {
      setErrors((current) => ({ ...current, email: result.error }))
      return
    }

    setIsSubmitted(true)
  }

  function clearError(field: keyof RegisterErrors) {
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }))
    }
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
              <p className="mt-1 text-emerald-700/80 dark:text-emerald-300/80">
                {t("successDescription")}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName">{t("nameLabel")}</Label>
              <div className="relative">
                <UserRound
                  className="pointer-events-none absolute top-1/2 start-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder={t("namePlaceholder")}
                  className="ps-9"
                  value={fullName}
                  onChange={(event) => {
                    setFullName(event.target.value)
                    clearError("fullName")
                  }}
                  aria-invalid={Boolean(errors.fullName)}
                  aria-describedby={errors.fullName ? "fullName-error" : undefined}
                />
              </div>
              {errors.fullName && (
                <p id="fullName-error" role="alert" className="text-sm font-medium text-destructive">
                  {errors.fullName}
                </p>
              )}
            </div>

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
                    clearError("email")
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
              <Label htmlFor="password">{t("passwordLabel")}</Label>
              <div className="relative">
                <LockKeyhole
                  className="pointer-events-none absolute top-1/2 start-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder={t("passwordPlaceholder")}
                  className="pe-10 ps-9"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    clearError("password")
                    clearError("confirmPassword")
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
                  aria-label={showPassword ? tc("hidePassword") : tc("showPassword")}
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("confirmPasswordLabel")}</Label>
              <div className="relative">
                <LockKeyhole
                  className="pointer-events-none absolute top-1/2 start-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder={t("confirmPasswordPlaceholder")}
                  className="pe-10 ps-9"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value)
                    clearError("confirmPassword")
                  }}
                  aria-invalid={Boolean(errors.confirmPassword)}
                  aria-describedby={
                    errors.confirmPassword ? "confirmPassword-error" : undefined
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute top-1/2 end-1.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirmPassword((visible) => !visible)}
                  aria-label={
                    showConfirmPassword ? tc("hidePassword") : tc("showPassword")
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4" aria-hidden="true" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p
                  id="confirmPassword-error"
                  role="alert"
                  className="text-sm font-medium text-destructive"
                >
                  {errors.confirmPassword}
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
          {t("hasAccount")}{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
          >
            {t("loginLink")}
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
