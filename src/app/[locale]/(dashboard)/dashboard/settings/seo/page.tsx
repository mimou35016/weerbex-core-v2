"use client"

import { useState } from "react"
import { RefreshCw } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { PageHeader } from "@/components/dashboard/page-header"
import {
  SettingsActions,
  SettingsCard,
  SettingsField,
  SettingsSwitchRow,
} from "@/components/dashboard/settings/settings-ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const initialSeo = {
  metaTitle: "",
  metaDescription: "",
  keywords: "",
  author: "",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  twitterHandle: "",
  allowIndexing: true,
  robots: "User-agent: *\nAllow: /",
  sitemapAuto: true,
  googleVerification: "",
  bingVerification: "",
  yandexVerification: "",
  analyticsScript: "",
  pixelScript: "",
}

export default function SeoSettingsPage() {
  const t = useTranslations("Dashboard")
  const [form, setForm] = useState(initialSeo)

  function update<K extends keyof typeof initialSeo>(
    key: K,
    value: (typeof initialSeo)[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function save() {
    toast.success(t("settings.common.saved"))
  }

  function reset() {
    setForm(initialSeo)
    toast.success(t("settings.common.resetDone"))
  }

  function regenerateSitemap() {
    toast.success(t("settings.seo.indexing.generated"))
  }

  return (
    <>
      <PageHeader
        title={t("settings.seo.title")}
        description={t("settings.seo.description")}
      />

      <div className="flex flex-col gap-6">
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
              value={form.metaTitle}
              onChange={(event) => update("metaTitle", event.target.value)}
              placeholder={t("settings.seo.meta.metaTitlePlaceholder")}
            />
          </SettingsField>

          <SettingsField
            label={t("settings.seo.meta.metaDescription")}
            htmlFor="seo-meta-description"
          >
            <Textarea
              id="seo-meta-description"
              value={form.metaDescription}
              onChange={(event) =>
                update("metaDescription", event.target.value)
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
                value={form.keywords}
                onChange={(event) => update("keywords", event.target.value)}
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

          <SettingsField
            label={t("settings.seo.social.ogImage")}
            htmlFor="seo-og-image"
          >
            <Input
              id="seo-og-image"
              type="url"
              value={form.ogImage}
              onChange={(event) => update("ogImage", event.target.value)}
              placeholder={t("settings.seo.social.ogImagePlaceholder")}
              dir="ltr"
            />
          </SettingsField>
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
            checked={form.allowIndexing}
            onCheckedChange={(checked) => update("allowIndexing", checked)}
          />

          <SettingsField
            label={t("settings.seo.indexing.robots")}
            htmlFor="seo-robots"
            hint={t("settings.seo.indexing.robotsHint")}
          >
            <Textarea
              id="seo-robots"
              value={form.robots}
              onChange={(event) => update("robots", event.target.value)}
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
            checked={form.sitemapAuto}
            onCheckedChange={(checked) => update("sitemapAuto", checked)}
          />

          <div>
            <Button
              variant="outline"
              onClick={regenerateSitemap}
              disabled={!form.sitemapAuto}
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
        </SettingsCard>

        <SettingsActions
          saveLabel={t("settings.common.save")}
          resetLabel={t("settings.common.reset")}
          onSave={save}
          onReset={reset}
        />
      </div>
    </>
  )
}
