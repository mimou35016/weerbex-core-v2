"use client"

import { useState, type ReactNode } from "react"
import { KeyRound, Save, Trash2, Webhook } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import { toast } from "sonner"

import { useCurrentUser } from "@/components/dashboard/current-user-provider"
import { FilterSelect } from "@/components/dashboard/filter-select"
import { PageHeader } from "@/components/dashboard/page-header"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockApiTokens, type ApiToken } from "@/config/dashboard-mock-data"
import { useRouter } from "@/i18n/navigation"
import { validateConfirmPassword, validatePassword } from "@/lib/auth-validation"
import { getInitials } from "@/lib/initials"
import { updateProfileAction } from "@/lib/user-actions"

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor?: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const t = useTranslations("Dashboard")
  const tl = useTranslations("Language")
  const tt = useTranslations("Dashboard.toast")
  const tv = useTranslations("Validation")
  const format = useFormatter()
  const currentUser = useCurrentUser()
  const router = useRouter()

  const [platformName, setPlatformName] = useState("weerbex")
  const [supportEmail, setSupportEmail] = useState("support@weerbex.io")
  const [defaultLanguage, setDefaultLanguage] = useState("en")
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [openRegistration, setOpenRegistration] = useState(true)

  const [profile, setProfile] = useState({
    fullName: currentUser?.name ?? "",
    email: currentUser?.email ?? "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [tokens, setTokens] = useState<ApiToken[]>(mockApiTokens)
  const [tokenName, setTokenName] = useState("")
  const [webhookUrl, setWebhookUrl] = useState("")

  const languageOptions = [
    { value: "en", label: tl("en") },
    { value: "fr", label: tl("fr") },
    { value: "ar", label: tl("ar") },
  ]

  function generateToken() {
    if (!tokenName.trim()) return

    const token: ApiToken = {
      id: `tok_${Date.now()}`,
      name: tokenName.trim(),
      prefix: `wbx_live_${Math.random().toString(16).slice(2, 6)}`,
      created: new Date().toISOString(),
      lastUsed: null,
    }

    setTokens((current) => [token, ...current])
    setTokenName("")
    toast.success(tt("tokenGenerated"))
  }

  function revokeToken(token: ApiToken) {
    setTokens((current) => current.filter((entry) => entry.id !== token.id))
    toast.success(tt("tokenRevoked"))
  }

  async function saveProfile() {
    if (!profile.fullName.trim() || !profile.email.trim()) return

    if (profile.newPassword) {
      const passwordError = validatePassword(profile.newPassword, {
        required: tv("passwordRequired"),
        tooShort: tv("passwordShort"),
      })

      if (passwordError) {
        toast.error(passwordError)
        return
      }

      const confirmError = validateConfirmPassword(
        profile.newPassword,
        profile.confirmPassword,
        {
          required: tv("confirmRequired"),
          mismatch: tv("confirmMismatch"),
        }
      )

      if (confirmError) {
        toast.error(confirmError)
        return
      }
    }

    const result = await updateProfileAction({
      name: profile.fullName,
      email: profile.email,
      currentPassword: profile.currentPassword || undefined,
      newPassword: profile.newPassword || undefined,
    })

    if (!result.success) {
      toast.error(result.error)
      return
    }

    setProfile((current) => ({
      ...current,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }))
    toast.success(tt("profileSaved"))
    router.refresh()
  }

  return (
    <>
      <PageHeader
        title={t("settings.title")}
        description={t("settings.description")}
      />

      <Tabs defaultValue="general" className="gap-4">
        <TabsList className="w-full max-w-md">
          <TabsTrigger value="general">{t("settings.tabs.general")}</TabsTrigger>
          <TabsTrigger value="profile">{t("settings.tabs.profile")}</TabsTrigger>
          <TabsTrigger value="api-keys">
            {t("settings.tabs.apiKeys")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.general.title")}</CardTitle>
              <CardDescription>
                {t("settings.general.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex max-w-xl flex-col gap-4">
              <Field label={t("settings.general.platformName")} htmlFor="platform-name">
                <Input
                  id="platform-name"
                  value={platformName}
                  onChange={(event) => setPlatformName(event.target.value)}
                  placeholder={t("settings.general.platformNamePlaceholder")}
                />
              </Field>

              <Field label={t("settings.general.supportEmail")} htmlFor="support-email">
                <Input
                  id="support-email"
                  type="email"
                  value={supportEmail}
                  onChange={(event) => setSupportEmail(event.target.value)}
                  placeholder={t("settings.general.supportEmailPlaceholder")}
                  dir="ltr"
                />
              </Field>

              <Field label={t("settings.general.defaultLanguage")}>
                <FilterSelect
                  value={defaultLanguage}
                  onChange={setDefaultLanguage}
                  options={languageOptions}
                  ariaLabel={t("settings.general.defaultLanguage")}
                  className="w-full sm:w-full"
                />
              </Field>

              <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">
                    {t("settings.general.maintenanceMode")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t("settings.general.maintenanceModeDescription")}
                  </span>
                </div>
                <Switch
                  checked={maintenanceMode}
                  onCheckedChange={setMaintenanceMode}
                  aria-label={t("settings.general.maintenanceMode")}
                />
              </div>

              <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">
                    {t("settings.general.registration")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t("settings.general.registrationDescription")}
                  </span>
                </div>
                <Switch
                  checked={openRegistration}
                  onCheckedChange={setOpenRegistration}
                  aria-label={t("settings.general.registration")}
                />
              </div>

              <div>
                <Button onClick={() => toast.success(tt("settingsSaved"))}>
                  <Save aria-hidden="true" />
                  {t("settings.general.save")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.profile.title")}</CardTitle>
              <CardDescription>
                {t("settings.profile.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex max-w-xl flex-col gap-4">
              <div className="flex items-center gap-4">
                <Avatar size="lg">
                  <AvatarFallback>
                    {getInitials(profile.fullName || currentUser?.name || "")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">
                    {t("settings.profile.avatar")}
                  </span>
                  <Button variant="outline" size="sm" disabled>
                    {t("settings.profile.changeAvatar")}
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {t("settings.profile.avatarHint")}
                  </span>
                </div>
              </div>

              <Field label={t("settings.profile.fullName")} htmlFor="profile-name">
                <Input
                  id="profile-name"
                  value={profile.fullName}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      fullName: event.target.value,
                    }))
                  }
                />
              </Field>

              <Field label={t("settings.profile.email")} htmlFor="profile-email">
                <Input
                  id="profile-email"
                  type="email"
                  value={profile.email}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  dir="ltr"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label={t("settings.profile.currentPassword")}
                  htmlFor="profile-current-password"
                >
                  <Input
                    id="profile-current-password"
                    type="password"
                    value={profile.currentPassword}
                    onChange={(event) =>
                      setProfile((current) => ({
                        ...current,
                        currentPassword: event.target.value,
                      }))
                    }
                    autoComplete="current-password"
                  />
                </Field>

                <Field
                  label={t("settings.profile.newPassword")}
                  htmlFor="profile-new-password"
                >
                  <Input
                    id="profile-new-password"
                    type="password"
                    value={profile.newPassword}
                    onChange={(event) =>
                      setProfile((current) => ({
                        ...current,
                        newPassword: event.target.value,
                      }))
                    }
                    autoComplete="new-password"
                  />
                </Field>
              </div>

              <Field
                label={t("settings.profile.confirmPassword")}
                htmlFor="profile-confirm-password"
              >
                <Input
                  id="profile-confirm-password"
                  type="password"
                  value={profile.confirmPassword}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      confirmPassword: event.target.value,
                    }))
                  }
                  autoComplete="new-password"
                />
              </Field>

              <div>
                <Button onClick={saveProfile}>
                  <Save aria-hidden="true" />
                  {t("settings.profile.save")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("settings.apiKeys.title")}</CardTitle>
                <CardDescription>
                  {t("settings.apiKeys.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <Field label={t("settings.apiKeys.tokenName")} htmlFor="token-name">
                    <Input
                      id="token-name"
                      value={tokenName}
                      onChange={(event) => setTokenName(event.target.value)}
                      placeholder={t("settings.apiKeys.tokenNamePlaceholder")}
                    />
                  </Field>
                  <Button
                    onClick={generateToken}
                    disabled={!tokenName.trim()}
                    className="shrink-0"
                  >
                    <KeyRound aria-hidden="true" />
                    {t("settings.apiKeys.generate")}
                  </Button>
                </div>

                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-start">
                          {t("settings.apiKeys.table.name")}
                        </TableHead>
                        <TableHead className="text-start">
                          {t("settings.apiKeys.table.prefix")}
                        </TableHead>
                        <TableHead className="text-start">
                          {t("settings.apiKeys.table.created")}
                        </TableHead>
                        <TableHead className="text-start">
                          {t("settings.apiKeys.table.lastUsed")}
                        </TableHead>
                        <TableHead className="text-end">
                          {t("settings.apiKeys.table.actions")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tokens.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="py-8 text-center text-muted-foreground"
                          >
                            {t("settings.apiKeys.empty")}
                          </TableCell>
                        </TableRow>
                      ) : (
                        tokens.map((token) => (
                          <TableRow key={token.id}>
                            <TableCell className="font-medium">
                              {token.name}
                            </TableCell>
                            <TableCell
                              className="font-mono text-xs text-muted-foreground"
                              dir="ltr"
                            >
                              {token.prefix}…
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {format.dateTime(new Date(token.created), {
                                dateStyle: "medium",
                              })}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {token.lastUsed
                                ? format.dateTime(new Date(token.lastUsed), {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                  })
                                : t("settings.apiKeys.never")}
                            </TableCell>
                            <TableCell className="text-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => revokeToken(token)}
                              >
                                <Trash2 aria-hidden="true" />
                                {t("settings.apiKeys.revoke")}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("settings.apiKeys.webhookTitle")}</CardTitle>
                <CardDescription>
                  {t("settings.apiKeys.webhookDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex max-w-xl flex-col gap-4">
                <Field
                  label={t("settings.apiKeys.webhookUrl")}
                  htmlFor="webhook-url"
                >
                  <Input
                    id="webhook-url"
                    value={webhookUrl}
                    onChange={(event) => setWebhookUrl(event.target.value)}
                    placeholder={t("settings.apiKeys.webhookPlaceholder")}
                    dir="ltr"
                  />
                </Field>
                <div>
                  <Button onClick={() => toast.success(tt("webhookSaved"))}>
                    <Webhook aria-hidden="true" />
                    {t("settings.apiKeys.saveWebhook")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </>
  )
}
