"use client"

import { useEffect, useState, type ReactNode } from "react"
import Image from "next/image"
import { KeyRound, Plus, Save, Trash2, Upload, Webhook, X } from "lucide-react"
import { useFormatter, useLocale, useTranslations } from "next-intl"
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
import { Textarea } from "@/components/ui/textarea"
import {
  generateApiTokenAction,
  getWebhookAction,
  listApiTokensAction,
  revokeApiTokenAction,
  saveWebhookAction,
} from "@/lib/api-token-actions"
import type { ApiTokenView } from "@/lib/api-token-types"
import { useRouter } from "@/i18n/navigation"
import { validateConfirmPassword, validatePassword } from "@/lib/auth-validation"
import { getInitials } from "@/lib/initials"
import { hasAnyPermission, hasPermission } from "@/lib/permissions"
import {
  getSiteSettingsAction,
  updateSiteSettingsAction,
  uploadBrandAssetAction,
} from "@/lib/settings-actions"
import {
  socialPlatforms,
  type MediaRef,
  type SiteSettingsData,
  type SocialPlatform,
} from "@/lib/site-settings-types"
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

type SiteForm = Omit<SiteSettingsData, "logo" | "favicon">

const EMPTY_SITE_FORM: SiteForm = {
  siteName: "",
  tagline: "",
  description: "",
  footerText: "",
  contactEmail: "",
  contactPhone: "",
  socialLinks: [],
  maintenanceMode: false,
  openRegistration: true,
  defaultLocale: "en",
}

export default function SettingsPage() {
  const t = useTranslations("Dashboard")
  const tl = useTranslations("Language")
  const tt = useTranslations("Dashboard.toast")
  const tv = useTranslations("Validation")
  const format = useFormatter()
  const locale = useLocale()
  const currentUser = useCurrentUser()
  const router = useRouter()

  const [site, setSite] = useState<SiteForm>(EMPTY_SITE_FORM)
  const [logo, setLogo] = useState<MediaRef | null>(null)
  const [favicon, setFavicon] = useState<MediaRef | null>(null)
  const [loadingSettings, setLoadingSettings] = useState(true)
  const [savingSettings, setSavingSettings] = useState(false)
  const [uploading, setUploading] = useState<"logo" | "favicon" | null>(null)

  const [profile, setProfile] = useState({
    fullName: currentUser?.name ?? "",
    email: currentUser?.email ?? "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [tokens, setTokens] = useState<ApiTokenView[]>([])
  const [tokenName, setTokenName] = useState("")
  const [newSecret, setNewSecret] = useState("")
  const [savingToken, setSavingToken] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState("")
  const [savingWebhook, setSavingWebhook] = useState(false)

  const canReadApi = hasAnyPermission(currentUser, "settings", [
    "find",
    "read",
  ])
  const canManageApi = hasPermission(currentUser, "settings", "update")

  const languageOptions = [
    { value: "en", label: tl("en") },
    { value: "fr", label: tl("fr") },
    { value: "ar", label: tl("ar") },
  ]

  const platformOptions = socialPlatforms.map((platform) => ({
    value: platform,
    label: t(`settings.general.socialPlatforms.${platform}`),
  }))

  function applySettings(data: SiteSettingsData) {
    setSite({
      siteName: data.siteName,
      tagline: data.tagline,
      description: data.description,
      footerText: data.footerText,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      socialLinks: data.socialLinks,
      maintenanceMode: data.maintenanceMode,
      openRegistration: data.openRegistration,
      defaultLocale: data.defaultLocale,
    })
    setLogo(data.logo)
    setFavicon(data.favicon)
  }

  useEffect(() => {
    let active = true

    getSiteSettingsAction(locale).then((result) => {
      if (!active) return

      if (result.success) {
        applySettings(result.data)
      } else {
        toast.error(result.error)
      }

      setLoadingSettings(false)
    })

    return () => {
      active = false
    }
  }, [locale])

  useEffect(() => {
    if (!canReadApi) return

    let active = true

    Promise.all([listApiTokensAction(), getWebhookAction()]).then(
      ([tokenResult, webhookResult]) => {
        if (!active) return

        if (tokenResult.success) setTokens(tokenResult.data)
        if (webhookResult.success) setWebhookUrl(webhookResult.data.webhookUrl)
      }
    )

    return () => {
      active = false
    }
  }, [canReadApi])

  function updateSite<K extends keyof SiteForm>(key: K, value: SiteForm[K]) {
    setSite((current) => ({ ...current, [key]: value }))
  }

  function updateSocialLink(
    index: number,
    patch: Partial<{ platform: SocialPlatform; url: string }>
  ) {
    setSite((current) => ({
      ...current,
      socialLinks: current.socialLinks.map((link, position) =>
        position === index ? { ...link, ...patch } : link
      ),
    }))
  }

  function addSocialLink() {
    setSite((current) => ({
      ...current,
      socialLinks: [...current.socialLinks, { platform: "website", url: "" }],
    }))
  }

  function removeSocialLink(index: number) {
    setSite((current) => ({
      ...current,
      socialLinks: current.socialLinks.filter(
        (_, position) => position !== index
      ),
    }))
  }

  async function saveGeneral() {
    setSavingSettings(true)

    const result = await updateSiteSettingsAction(locale, site)

    setSavingSettings(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    applySettings(result.data)
    toast.success(tt("settingsSaved"))
    router.refresh()
  }

  async function uploadAsset(kind: "logo" | "favicon", file: File | null) {
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)
    setUploading(kind)

    const result = await uploadBrandAssetAction(kind, formData)

    setUploading(null)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    if (kind === "logo") {
      setLogo(result.data)
    } else {
      setFavicon(result.data)
    }

    toast.success(t("settings.general.uploaded"))
    router.refresh()
  }

  async function generateToken() {
    if (!tokenName.trim() || savingToken) return

    setSavingToken(true)
    const result = await generateApiTokenAction(tokenName)
    setSavingToken(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    setTokens((current) => [result.data.token, ...current])
    setNewSecret(result.data.secret)
    setTokenName("")
    toast.success(tt("tokenGenerated"))
  }

  async function revokeToken(token: ApiTokenView) {
    const result = await revokeApiTokenAction(token.id)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    setTokens((current) => current.filter((entry) => entry.id !== token.id))
    toast.success(tt("tokenRevoked"))
  }

  async function saveWebhook() {
    if (savingWebhook) return

    setSavingWebhook(true)
    const result = await saveWebhookAction(webhookUrl)
    setSavingWebhook(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    setWebhookUrl(result.data.webhookUrl)
    toast.success(tt("webhookSaved"))
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
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("settings.general.title")}</CardTitle>
                <CardDescription>
                  {t("settings.general.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex max-w-2xl flex-col gap-4">
                {loadingSettings && (
                  <p className="text-sm text-muted-foreground">
                    {t("settings.general.loading")}
                  </p>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label={t("settings.general.platformName")}
                    htmlFor="platform-name"
                  >
                    <Input
                      id="platform-name"
                      value={site.siteName}
                      onChange={(event) =>
                        updateSite("siteName", event.target.value)
                      }
                      placeholder={t(
                        "settings.general.platformNamePlaceholder"
                      )}
                    />
                  </Field>

                  <Field
                    label={t("settings.general.tagline")}
                    htmlFor="platform-tagline"
                  >
                    <Input
                      id="platform-tagline"
                      value={site.tagline}
                      onChange={(event) =>
                        updateSite("tagline", event.target.value)
                      }
                      placeholder={t("settings.general.taglinePlaceholder")}
                    />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label={t("settings.general.supportEmail")}
                    htmlFor="support-email"
                  >
                    <Input
                      id="support-email"
                      type="email"
                      value={site.contactEmail}
                      onChange={(event) =>
                        updateSite("contactEmail", event.target.value)
                      }
                      placeholder={t(
                        "settings.general.supportEmailPlaceholder"
                      )}
                      dir="ltr"
                    />
                  </Field>

                  <Field
                    label={t("settings.general.contactPhone")}
                    htmlFor="contact-phone"
                  >
                    <Input
                      id="contact-phone"
                      value={site.contactPhone}
                      onChange={(event) =>
                        updateSite("contactPhone", event.target.value)
                      }
                      placeholder={t(
                        "settings.general.contactPhonePlaceholder"
                      )}
                      dir="ltr"
                    />
                  </Field>
                </div>

                <Field
                  label={t("settings.general.siteDescription")}
                  htmlFor="site-description"
                >
                  <Textarea
                    id="site-description"
                    value={site.description}
                    onChange={(event) =>
                      updateSite("description", event.target.value)
                    }
                    placeholder={t(
                      "settings.general.siteDescriptionPlaceholder"
                    )}
                    rows={3}
                  />
                </Field>

                <Field
                  label={t("settings.general.footerText")}
                  htmlFor="footer-text"
                >
                  <Textarea
                    id="footer-text"
                    value={site.footerText}
                    onChange={(event) =>
                      updateSite("footerText", event.target.value)
                    }
                    placeholder={t("settings.general.footerTextPlaceholder")}
                    rows={2}
                  />
                </Field>

                <Field label={t("settings.general.defaultLanguage")}>
                  <FilterSelect
                    value={site.defaultLocale}
                    onChange={(value) =>
                      updateSite("defaultLocale", value as SiteForm["defaultLocale"])
                    }
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
                    checked={site.maintenanceMode}
                    onCheckedChange={(checked) =>
                      updateSite("maintenanceMode", checked)
                    }
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
                    checked={site.openRegistration}
                    onCheckedChange={(checked) =>
                      updateSite("openRegistration", checked)
                    }
                    aria-label={t("settings.general.registration")}
                  />
                </div>

                <div>
                  <Button onClick={saveGeneral} disabled={savingSettings}>
                    <Save aria-hidden="true" />
                    {t("settings.general.save")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("settings.general.logo")}</CardTitle>
                <CardDescription>
                  {t("settings.general.imageHint")}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                {(
                  [
                    {
                      kind: "logo" as const,
                      label: t("settings.general.logo"),
                      media: logo,
                    },
                    {
                      kind: "favicon" as const,
                      label: t("settings.general.favicon"),
                      media: favicon,
                    },
                  ]
                ).map((asset) => (
                  <div
                    key={asset.kind}
                    className="flex flex-col gap-3 sm:flex-row sm:items-center"
                  >
                    <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
                      {asset.media ? (
                        <Image
                          src={asset.media.url}
                          alt={asset.media.alt ?? asset.label}
                          width={56}
                          height={56}
                          className="size-full object-contain"
                          unoptimized
                        />
                      ) : (
                        <Upload
                          aria-hidden="true"
                          className="size-5 text-muted-foreground"
                        />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-1.5">
                      <Label htmlFor={`${asset.kind}-upload`}>
                        {asset.label}
                      </Label>
                      <Input
                        id={`${asset.kind}-upload`}
                        type="file"
                        accept="image/*"
                        disabled={uploading !== null}
                        onChange={(event) =>
                          uploadAsset(
                            asset.kind,
                            event.target.files?.[0] ?? null
                          )
                        }
                      />
                      {uploading === asset.kind && (
                        <span className="text-xs text-muted-foreground">
                          {t("settings.general.uploading")}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("settings.general.socialLinks")}</CardTitle>
                <CardDescription>
                  {t("settings.general.socialLinksDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {site.socialLinks.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    {t("settings.general.noSocialLinks")}
                  </p>
                )}

                {site.socialLinks.map((link, index) => (
                  <div
                    key={`${link.platform}-${index}`}
                    className="flex flex-col gap-2 sm:flex-row sm:items-center"
                  >
                    <FilterSelect
                      value={link.platform}
                      onChange={(value) =>
                        updateSocialLink(index, {
                          platform: value as SocialPlatform,
                        })
                      }
                      options={platformOptions}
                      ariaLabel={t("settings.general.socialPlatform")}
                      className="w-full sm:w-[180px]"
                    />
                    <Input
                      value={link.url}
                      onChange={(event) =>
                        updateSocialLink(index, { url: event.target.value })
                      }
                      placeholder="https://example.com/profile"
                      aria-label={t("settings.general.socialUrl")}
                      dir="ltr"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSocialLink(index)}
                      aria-label={t("settings.general.removeSocialLink")}
                    >
                      <X aria-hidden="true" />
                    </Button>
                  </div>
                ))}

                <div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSocialLink}
                  >
                    <Plus aria-hidden="true" />
                    {t("settings.general.addSocialLink")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
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
                    disabled={!tokenName.trim() || savingToken || !canManageApi}
                    className="shrink-0"
                  >
                    <KeyRound aria-hidden="true" />
                    {t("settings.apiKeys.generate")}
                  </Button>
                </div>

                {newSecret && (
                  <div className="flex flex-col gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">
                          {t("settings.apiKeys.secretTitle")}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {t("settings.apiKeys.secretDescription")}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setNewSecret("")}
                        aria-label={t("common.close")}
                      >
                        <X aria-hidden="true" />
                      </Button>
                    </div>
                    <code
                      className="block overflow-x-auto rounded bg-background/60 p-2 font-mono text-xs"
                      dir="ltr"
                    >
                      {newSecret}
                    </code>
                  </div>
                )}

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
                                disabled={!canManageApi}
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
                  <Button onClick={saveWebhook} disabled={savingWebhook || !canManageApi}>
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
