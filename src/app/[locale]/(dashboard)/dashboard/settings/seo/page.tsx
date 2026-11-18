"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Pencil, Plus, RefreshCw, Save, Trash2, Upload } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { toast } from "sonner"

import { FilterSelect } from "@/components/dashboard/filter-select"
import { PageHeader } from "@/components/dashboard/page-header"
import {
  SettingsActions,
  SettingsCard,
  SettingsField,
  SettingsSwitchRow,
} from "@/components/dashboard/settings/settings-ui"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  deletePageSeoAction,
  getSeoSettingsAction,
  listPageSeoAction,
  regenerateSitemapAction,
  savePageSeoAction,
  updateSeoSettingsAction,
  uploadPageSeoImageAction,
  uploadSeoImageAction,
} from "@/lib/settings-actions"
import {
  type Locale,
  type MediaRef,
  type PageSeoData,
  type PageSeoFrequency,
  type SeoSettingsData,
} from "@/lib/site-settings-types"

type SeoForm = Omit<SeoSettingsData, "ogImage">

const EMPTY_SEO_FORM: SeoForm = {
  defaultTitle: "",
  titleTemplate: "%s | {siteName}",
  defaultDescription: "",
  defaultKeywords: "",
  author: "",
  ogTitle: "",
  ogDescription: "",
  twitterCard: "summary_large_image",
  twitterHandle: "",
  robotsIndex: true,
  robotsFollow: true,
  canonicalBaseUrl: "",
  googleVerification: "",
  bingVerification: "",
  yandexVerification: "",
  robotsTxt: "",
  sitemapEnabled: true,
  customHeadScripts: "",
  analyticsScript: "",
  pixelScript: "",
}

type PageForm = {
  id?: string
  path: string
  locale: Locale
  label: string
  title: string
  description: string
  keywords: string
  canonicalUrl: string
  noIndex: boolean
  includeInSitemap: boolean
  changeFrequency: PageSeoFrequency
  priority: number
}

const FREQUENCIES: PageSeoFrequency[] = [
  "always",
  "hourly",
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "never",
]

function emptyPageForm(locale: Locale): PageForm {
  return {
    path: "",
    locale,
    label: "",
    title: "",
    description: "",
    keywords: "",
    canonicalUrl: "",
    noIndex: false,
    includeInSitemap: true,
    changeFrequency: "weekly",
    priority: 0.5,
  }
}

export default function SeoSettingsPage() {
  const t = useTranslations("Dashboard")
  const tl = useTranslations("Language")
  const locale = useLocale() as Locale

  const [form, setForm] = useState<SeoForm>(EMPTY_SEO_FORM)
  const [ogImage, setOgImage] = useState<MediaRef | null>(null)
  const [overrides, setOverrides] = useState<PageSeoData[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pageForm, setPageForm] = useState<PageForm>(() =>
    emptyPageForm(locale)
  )
  const [pageImage, setPageImage] = useState<MediaRef | null>(null)
  const [pageSaving, setPageSaving] = useState(false)
  const [pageUploading, setPageUploading] = useState(false)

  const localeOptions = [
    { value: "en", label: tl("en") },
    { value: "fr", label: tl("fr") },
    { value: "ar", label: tl("ar") },
  ]

  const frequencyOptions = FREQUENCIES.map((frequency) => ({
    value: frequency,
    label: t(`settings.seo.overrides.frequency.${frequency}`),
  }))

  const twitterCardOptions = [
    {
      value: "summary",
      label: t("settings.seo.social.twitterCardSummary"),
    },
    {
      value: "summary_large_image",
      label: t("settings.seo.social.twitterCardLarge"),
    },
  ]

  function applySeo(data: SeoSettingsData) {
    setForm({
      defaultTitle: data.defaultTitle,
      titleTemplate: data.titleTemplate,
      defaultDescription: data.defaultDescription,
      defaultKeywords: data.defaultKeywords,
      author: data.author,
      ogTitle: data.ogTitle,
      ogDescription: data.ogDescription,
      twitterCard: data.twitterCard,
      twitterHandle: data.twitterHandle,
      robotsIndex: data.robotsIndex,
      robotsFollow: data.robotsFollow,
      canonicalBaseUrl: data.canonicalBaseUrl,
      googleVerification: data.googleVerification,
      bingVerification: data.bingVerification,
      yandexVerification: data.yandexVerification,
      robotsTxt: data.robotsTxt,
      sitemapEnabled: data.sitemapEnabled,
      customHeadScripts: data.customHeadScripts,
      analyticsScript: data.analyticsScript,
      pixelScript: data.pixelScript,
    })
    setOgImage(data.ogImage)
  }

  async function loadSeo() {
    const result = await getSeoSettingsAction(locale)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    applySeo(result.data)
  }

  async function loadOverrides() {
    const result = await listPageSeoAction(locale)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    setOverrides(result.data)
  }

  useEffect(() => {
    let active = true

    Promise.all([getSeoSettingsAction(locale), listPageSeoAction(locale)]).then(
      ([seoResult, listResult]) => {
        if (!active) return

        if (seoResult.success) {
          applySeo(seoResult.data)
        } else {
          toast.error(seoResult.error)
        }

        if (listResult.success) {
          setOverrides(listResult.data)
        } else {
          toast.error(listResult.error)
        }

        setLoading(false)
      }
    )

    return () => {
      active = false
    }
  }, [locale])

  function update<K extends keyof SeoForm>(key: K, value: SeoForm[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function updatePage<K extends keyof PageForm>(key: K, value: PageForm[K]) {
    setPageForm((current) => ({ ...current, [key]: value }))
  }

  async function save() {
    setSaving(true)

    const result = await updateSeoSettingsAction(locale, form)

    setSaving(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    applySeo(result.data)
    toast.success(t("settings.common.saved"))
  }

  async function reset() {
    await loadSeo()
    toast.success(t("settings.common.resetDone"))
  }

  async function uploadImage(file: File | null) {
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)
    setUploading(true)

    const result = await uploadSeoImageAction(formData)

    setUploading(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    setOgImage(result.data)
    toast.success(t("settings.common.saved"))
  }

  async function regenerateSitemap() {
    const result = await regenerateSitemapAction()

    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success(t("settings.seo.indexing.generated"))
  }

  function openCreate() {
    setPageForm(emptyPageForm(locale))
    setPageImage(null)
    setDialogOpen(true)
  }

  function openEdit(override: PageSeoData) {
    setPageForm({
      id: override.id,
      path: override.path,
      locale,
      label: override.label,
      title: override.title,
      description: override.description,
      keywords: override.keywords,
      canonicalUrl: override.canonicalUrl,
      noIndex: override.noIndex,
      includeInSitemap: override.includeInSitemap,
      changeFrequency: override.changeFrequency,
      priority: override.priority,
    })
    setPageImage(override.ogImage)
    setDialogOpen(true)
  }

  async function saveOverride() {
    setPageSaving(true)

    const result = await savePageSeoAction(pageForm)

    setPageSaving(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    setDialogOpen(false)
    await loadOverrides()
    toast.success(t("settings.common.saved"))
  }

  async function uploadPageImage(file: File | null) {
    if (!file || !pageForm.id) return

    const formData = new FormData()
    formData.append("file", file)
    setPageUploading(true)

    const result = await uploadPageSeoImageAction(pageForm.id, formData)

    setPageUploading(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    setPageImage(result.data)
    await loadOverrides()
    toast.success(t("settings.common.saved"))
  }

  async function removeOverride(override: PageSeoData) {
    if (!window.confirm(t("settings.seo.overrides.form.deleteConfirm"))) {
      return
    }

    const result = await deletePageSeoAction(override.id)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    await loadOverrides()
    toast.success(t("settings.common.saved"))
  }

  return (
    <>
      <PageHeader
        title={t("settings.seo.title")}
        description={t("settings.seo.description")}
      />

      <div className="flex flex-col gap-6">
        {loading && (
          <p className="text-sm text-muted-foreground">
            {t("settings.seo.overrides.loading")}
          </p>
        )}

        <SettingsCard
          title={t("settings.seo.meta.title")}
          description={t("settings.seo.meta.description")}
        >
          <SettingsField
            label={t("settings.seo.meta.metaTitle")}
            htmlFor="seo-meta-title"
          >
            <Input
              id="seo-meta-title"
              value={form.defaultTitle}
              onChange={(event) => update("defaultTitle", event.target.value)}
              placeholder={t("settings.seo.meta.metaTitlePlaceholder")}
            />
          </SettingsField>

          <SettingsField
            label={t("settings.seo.meta.metaDescription")}
            htmlFor="seo-meta-description"
          >
            <Textarea
              id="seo-meta-description"
              value={form.defaultDescription}
              onChange={(event) =>
                update("defaultDescription", event.target.value)
              }
              placeholder={t(
                "settings.seo.meta.metaDescriptionPlaceholder"
              )}
              rows={3}
            />
          </SettingsField>

          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsField
              label={t("settings.seo.meta.keywords")}
              htmlFor="seo-keywords"
              hint={t("settings.seo.meta.keywordsHint")}
            >
              <Input
                id="seo-keywords"
                value={form.defaultKeywords}
                onChange={(event) =>
                  update("defaultKeywords", event.target.value)
                }
                placeholder={t("settings.seo.meta.keywordsPlaceholder")}
              />
            </SettingsField>

            <SettingsField
              label={t("settings.seo.meta.author")}
              htmlFor="seo-author"
            >
              <Input
                id="seo-author"
                value={form.author}
                onChange={(event) => update("author", event.target.value)}
                placeholder={t("settings.seo.meta.authorPlaceholder")}
              />
            </SettingsField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsField
              label={t("settings.seo.meta.titleTemplate")}
              htmlFor="seo-title-template"
              hint={t("settings.seo.meta.titleTemplateHint")}
            >
              <Input
                id="seo-title-template"
                value={form.titleTemplate}
                onChange={(event) =>
                  update("titleTemplate", event.target.value)
                }
                placeholder={t(
                  "settings.seo.meta.titleTemplatePlaceholder"
                )}
                dir="ltr"
              />
            </SettingsField>

            <SettingsField
              label={t("settings.seo.meta.canonicalBaseUrl")}
              htmlFor="seo-canonical-base"
            >
              <Input
                id="seo-canonical-base"
                type="url"
                value={form.canonicalBaseUrl}
                onChange={(event) =>
                  update("canonicalBaseUrl", event.target.value)
                }
                placeholder={t(
                  "settings.seo.meta.canonicalBaseUrlPlaceholder"
                )}
                dir="ltr"
              />
            </SettingsField>
          </div>
        </SettingsCard>

        <SettingsCard
          title={t("settings.seo.social.title")}
          description={t("settings.seo.social.description")}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsField
              label={t("settings.seo.social.ogTitle")}
              htmlFor="seo-og-title"
            >
              <Input
                id="seo-og-title"
                value={form.ogTitle}
                onChange={(event) => update("ogTitle", event.target.value)}
                placeholder={t("settings.seo.social.ogTitlePlaceholder")}
              />
            </SettingsField>

            <SettingsField
              label={t("settings.seo.social.twitterHandle")}
              htmlFor="seo-twitter-handle"
            >
              <Input
                id="seo-twitter-handle"
                value={form.twitterHandle}
                onChange={(event) =>
                  update("twitterHandle", event.target.value)
                }
                placeholder={t(
                  "settings.seo.social.twitterHandlePlaceholder"
                )}
                dir="ltr"
              />
            </SettingsField>
          </div>

          <SettingsField
            label={t("settings.seo.social.ogDescription")}
            htmlFor="seo-og-description"
          >
            <Textarea
              id="seo-og-description"
              value={form.ogDescription}
              onChange={(event) =>
                update("ogDescription", event.target.value)
              }
              placeholder={t(
                "settings.seo.social.ogDescriptionPlaceholder"
              )}
              rows={3}
            />
          </SettingsField>

          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsField
              label={t("settings.seo.social.twitterCard")}
              htmlFor="seo-twitter-card"
            >
              <FilterSelect
                value={form.twitterCard}
                onChange={(value) =>
                  update(
                    "twitterCard",
                    value as SeoForm["twitterCard"]
                  )
                }
                options={twitterCardOptions}
                ariaLabel={t("settings.seo.social.twitterCard")}
                className="w-full sm:w-full"
              />
            </SettingsField>

            <SettingsField
              label={t("settings.seo.social.ogImage")}
              htmlFor="seo-og-image"
              hint={t("settings.seo.social.ogImageHint")}
            >
              <div className="flex items-center gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
                  {ogImage ? (
                    <Image
                      src={ogImage.url}
                      alt={ogImage.alt ?? t("settings.seo.social.ogImage")}
                      width={48}
                      height={48}
                      className="size-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <Upload
                      aria-hidden="true"
                      className="size-4 text-muted-foreground"
                    />
                  )}
                </div>
                <Input
                  id="seo-og-image"
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={(event) =>
                    uploadImage(event.target.files?.[0] ?? null)
                  }
                />
              </div>
            </SettingsField>
          </div>
        </SettingsCard>

        <SettingsCard
          title={t("settings.seo.indexing.title")}
          description={t("settings.seo.indexing.description")}
        >
          <SettingsSwitchRow
            id="seo-allow-indexing"
            label={t("settings.seo.indexing.allowIndexing")}
            description={t(
              "settings.seo.indexing.allowIndexingDescription"
            )}
            checked={form.robotsIndex}
            onCheckedChange={(checked) => update("robotsIndex", checked)}
          />

          <SettingsSwitchRow
            id="seo-allow-following"
            label={t("settings.seo.indexing.allowFollowing")}
            description={t(
              "settings.seo.indexing.allowFollowingDescription"
            )}
            checked={form.robotsFollow}
            onCheckedChange={(checked) => update("robotsFollow", checked)}
          />

          <SettingsField
            label={t("settings.seo.indexing.robots")}
            htmlFor="seo-robots"
            hint={t("settings.seo.indexing.robotsHint")}
          >
            <Textarea
              id="seo-robots"
              value={form.robotsTxt}
              onChange={(event) => update("robotsTxt", event.target.value)}
              placeholder={t("settings.seo.indexing.robotsPlaceholder")}
              className="font-mono text-xs"
              dir="ltr"
              rows={6}
            />
          </SettingsField>

          <SettingsSwitchRow
            id="seo-sitemap-auto"
            label={t("settings.seo.indexing.sitemap")}
            description={t("settings.seo.indexing.sitemapDescription")}
            checked={form.sitemapEnabled}
            onCheckedChange={(checked) => update("sitemapEnabled", checked)}
          />

          <div>
            <Button
              variant="outline"
              onClick={regenerateSitemap}
              disabled={!form.sitemapEnabled}
            >
              <RefreshCw aria-hidden="true" />
              {t("settings.seo.indexing.generate")}
            </Button>
          </div>
        </SettingsCard>

        <SettingsCard
          title={t("settings.seo.verification.title")}
          description={t("settings.seo.verification.description")}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <SettingsField
              label={t("settings.seo.verification.google")}
              htmlFor="seo-google-verification"
            >
              <Input
                id="seo-google-verification"
                value={form.googleVerification}
                onChange={(event) =>
                  update("googleVerification", event.target.value)
                }
                placeholder={t(
                  "settings.seo.verification.googlePlaceholder"
                )}
                dir="ltr"
              />
            </SettingsField>

            <SettingsField
              label={t("settings.seo.verification.bing")}
              htmlFor="seo-bing-verification"
            >
              <Input
                id="seo-bing-verification"
                value={form.bingVerification}
                onChange={(event) =>
                  update("bingVerification", event.target.value)
                }
                placeholder={t(
                  "settings.seo.verification.bingPlaceholder"
                )}
                dir="ltr"
              />
            </SettingsField>

            <SettingsField
              label={t("settings.seo.verification.yandex")}
              htmlFor="seo-yandex-verification"
            >
              <Input
                id="seo-yandex-verification"
                value={form.yandexVerification}
                onChange={(event) =>
                  update("yandexVerification", event.target.value)
                }
                placeholder={t(
                  "settings.seo.verification.yandexPlaceholder"
                )}
                dir="ltr"
              />
            </SettingsField>
          </div>
        </SettingsCard>

        <SettingsCard
          title={t("settings.seo.scripts.title")}
          description={t("settings.seo.scripts.description")}
        >
          <SettingsField
            label={t("settings.seo.scripts.analytics")}
            htmlFor="seo-analytics-script"
            hint={t("settings.seo.scripts.analyticsHint")}
          >
            <Textarea
              id="seo-analytics-script"
              value={form.analyticsScript}
              onChange={(event) =>
                update("analyticsScript", event.target.value)
              }
              placeholder={t(
                "settings.seo.scripts.analyticsPlaceholder"
              )}
              className="font-mono text-xs"
              dir="ltr"
              rows={5}
            />
          </SettingsField>

          <SettingsField
            label={t("settings.seo.scripts.pixel")}
            htmlFor="seo-pixel-script"
            hint={t("settings.seo.scripts.pixelHint")}
          >
            <Textarea
              id="seo-pixel-script"
              value={form.pixelScript}
              onChange={(event) => update("pixelScript", event.target.value)}
              placeholder={t("settings.seo.scripts.pixelPlaceholder")}
              className="font-mono text-xs"
              dir="ltr"
              rows={5}
            />
          </SettingsField>

          <SettingsField
            label={t("settings.seo.scripts.customHead")}
            htmlFor="seo-custom-head"
            hint={t("settings.seo.scripts.customHeadHint")}
          >
            <Textarea
              id="seo-custom-head"
              value={form.customHeadScripts}
              onChange={(event) =>
                update("customHeadScripts", event.target.value)
              }
              placeholder={t(
                "settings.seo.scripts.customHeadPlaceholder"
              )}
              className="font-mono text-xs"
              dir="ltr"
              rows={5}
            />
          </SettingsField>
        </SettingsCard>

        <SettingsCard
          title={t("settings.seo.overrides.title")}
          description={t("settings.seo.overrides.description")}
        >
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={openCreate}>
              <Plus aria-hidden="true" />
              {t("settings.seo.overrides.add")}
            </Button>
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-start">
                    {t("settings.seo.overrides.table.path")}
                  </TableHead>
                  <TableHead className="text-start">
                    {t("settings.seo.overrides.table.title")}
                  </TableHead>
                  <TableHead className="text-start">
                    {t("settings.seo.overrides.table.noIndex")}
                  </TableHead>
                  <TableHead className="text-start">
                    {t("settings.seo.overrides.table.sitemap")}
                  </TableHead>
                  <TableHead className="text-end">
                    {t("settings.seo.overrides.table.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overrides.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-8 text-center text-muted-foreground"
                    >
                      {t("settings.seo.overrides.empty")}
                    </TableCell>
                  </TableRow>
                ) : (
                  overrides.map((override) => (
                    <TableRow key={override.id}>
                      <TableCell className="font-mono text-xs" dir="ltr">
                        {override.path}
                      </TableCell>
                      <TableCell>
                        {override.title || override.label || "—"}
                      </TableCell>
                      <TableCell>
                        {override.noIndex
                          ? t("settings.common.enabled")
                          : t("settings.common.disabled")}
                      </TableCell>
                      <TableCell>
                        {override.includeInSitemap
                          ? t("settings.common.enabled")
                          : t("settings.common.disabled")}
                      </TableCell>
                      <TableCell className="text-end">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => openEdit(override)}
                            aria-label={t("settings.seo.overrides.edit")}
                          >
                            <Pencil aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => removeOverride(override)}
                            aria-label={t(
                              "settings.seo.overrides.delete"
                            )}
                          >
                            <Trash2 aria-hidden="true" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </SettingsCard>

        <SettingsActions
          saveLabel={t("settings.common.save")}
          resetLabel={t("settings.common.reset")}
          onSave={save}
          onReset={reset}
          saving={saving}
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {t("settings.seo.overrides.form.title")}
            </DialogTitle>
            <DialogDescription>
              {t("settings.seo.overrides.form.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="grid max-h-[60vh] gap-4 overflow-y-auto py-1 sm:grid-cols-2">
            <SettingsField
              label={t("settings.seo.overrides.form.path")}
              htmlFor="page-seo-path"
              hint={t("settings.seo.overrides.form.pathHint")}
            >
              <Input
                id="page-seo-path"
                value={pageForm.path}
                onChange={(event) => updatePage("path", event.target.value)}
                placeholder={t(
                  "settings.seo.overrides.form.pathPlaceholder"
                )}
                dir="ltr"
              />
            </SettingsField>

            <SettingsField
              label={t("settings.seo.overrides.form.label")}
              htmlFor="page-seo-label"
            >
              <Input
                id="page-seo-label"
                value={pageForm.label}
                onChange={(event) => updatePage("label", event.target.value)}
                placeholder={t(
                  "settings.seo.overrides.form.labelPlaceholder"
                )}
              />
            </SettingsField>

            <SettingsField
              label={t("settings.seo.overrides.form.locale")}
              htmlFor="page-seo-locale"
            >
              <FilterSelect
                value={pageForm.locale}
                onChange={(value) =>
                  updatePage("locale", value as Locale)
                }
                options={localeOptions}
                ariaLabel={t("settings.seo.overrides.form.locale")}
                className="w-full sm:w-full"
              />
            </SettingsField>

            <SettingsField
              label={t("settings.seo.overrides.form.changeFrequency")}
              htmlFor="page-seo-frequency"
            >
              <FilterSelect
                value={pageForm.changeFrequency}
                onChange={(value) =>
                  updatePage(
                    "changeFrequency",
                    value as PageSeoFrequency
                  )
                }
                options={frequencyOptions}
                ariaLabel={t(
                  "settings.seo.overrides.form.changeFrequency"
                )}
                className="w-full sm:w-full"
              />
            </SettingsField>

            <SettingsField
              label={t("settings.seo.overrides.form.metaTitle")}
              htmlFor="page-seo-title"
            >
              <Input
                id="page-seo-title"
                value={pageForm.title}
                onChange={(event) => updatePage("title", event.target.value)}
              />
            </SettingsField>

            <SettingsField
              label={t("settings.seo.overrides.form.priority")}
              htmlFor="page-seo-priority"
            >
              <Input
                id="page-seo-priority"
                type="number"
                min={0}
                max={1}
                step={0.1}
                value={pageForm.priority}
                onChange={(event) =>
                  updatePage("priority", Number(event.target.value))
                }
                dir="ltr"
              />
            </SettingsField>

            <SettingsField
              label={t("settings.seo.overrides.form.metaDescription")}
              htmlFor="page-seo-description"
              className="sm:col-span-2"
            >
              <Textarea
                id="page-seo-description"
                value={pageForm.description}
                onChange={(event) =>
                  updatePage("description", event.target.value)
                }
                rows={3}
              />
            </SettingsField>

            <SettingsField
              label={t("settings.seo.overrides.form.keywords")}
              htmlFor="page-seo-keywords"
            >
              <Input
                id="page-seo-keywords"
                value={pageForm.keywords}
                onChange={(event) =>
                  updatePage("keywords", event.target.value)
                }
              />
            </SettingsField>

            <SettingsField
              label={t("settings.seo.overrides.form.canonicalUrl")}
              htmlFor="page-seo-canonical"
            >
              <Input
                id="page-seo-canonical"
                value={pageForm.canonicalUrl}
                onChange={(event) =>
                  updatePage("canonicalUrl", event.target.value)
                }
                placeholder={t(
                  "settings.seo.overrides.form.canonicalUrlPlaceholder"
                )}
                dir="ltr"
              />
            </SettingsField>

            <SettingsField
              label={t("settings.seo.overrides.form.ogImage")}
              htmlFor="page-seo-image"
              hint={t("settings.seo.overrides.form.ogImageHint")}
              className="sm:col-span-2"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
                  {pageImage ? (
                    <Image
                      src={pageImage.url}
                      alt={
                        pageImage.alt ??
                        t("settings.seo.overrides.form.ogImage")
                      }
                      width={48}
                      height={48}
                      className="size-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <Upload
                      aria-hidden="true"
                      className="size-4 text-muted-foreground"
                    />
                  )}
                </div>
                <Input
                  id="page-seo-image"
                  type="file"
                  accept="image/*"
                  disabled={!pageForm.id || pageUploading}
                  onChange={(event) =>
                    uploadPageImage(event.target.files?.[0] ?? null)
                  }
                />
              </div>
            </SettingsField>

            <div className="flex flex-col gap-3 sm:col-span-2">
              <SettingsSwitchRow
                id="page-seo-noindex"
                label={t("settings.seo.overrides.form.noIndex")}
                checked={pageForm.noIndex}
                onCheckedChange={(checked) =>
                  updatePage("noIndex", checked)
                }
              />
              <SettingsSwitchRow
                id="page-seo-sitemap"
                label={t("settings.seo.overrides.form.includeInSitemap")}
                checked={pageForm.includeInSitemap}
                onCheckedChange={(checked) =>
                  updatePage("includeInSitemap", checked)
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("settings.seo.overrides.form.cancel")}
            </Button>
            <Button onClick={saveOverride} disabled={pageSaving}>
              <Save aria-hidden="true" />
              {t("settings.seo.overrides.form.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
