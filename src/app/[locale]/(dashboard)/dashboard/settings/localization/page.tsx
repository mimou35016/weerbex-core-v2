"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { FilterSelect } from "@/components/dashboard/filter-select"
import { PageHeader } from "@/components/dashboard/page-header"
import {
  SettingsActions,
  SettingsCard,
  SettingsField,
  SettingsSwitchRow,
} from "@/components/dashboard/settings/settings-ui"

const initialLocalization = {
  activeEnglish: true,
  activeFrench: true,
  activeArabic: true,
  defaultLanguage: "en",
  fallbackLanguage: "en",
  timezone: "utc",
  dateFormat: "dmy",
  firstDayOfWeek: "monday",
}

export default function LocalizationSettingsPage() {
  const t = useTranslations("Dashboard")
  const [form, setForm] = useState(initialLocalization)

  function update<K extends keyof typeof initialLocalization>(
    key: K,
    value: (typeof initialLocalization)[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function save() {
    toast.success(t("settings.common.saved"))
  }

  function reset() {
    setForm(initialLocalization)
    toast.success(t("settings.common.resetDone"))
  }

  const languageOptions = [
    { value: "en", label: t("settings.localization.languages.english") },
    { value: "fr", label: t("settings.localization.languages.french") },
    { value: "ar", label: t("settings.localization.languages.arabic") },
  ]

  const timezoneOptions = [
    { value: "utc", label: t("settings.localization.formats.timezoneUtc") },
    {
      value: "casablanca",
      label: t("settings.localization.formats.timezoneCasablanca"),
    },
    {
      value: "paris",
      label: t("settings.localization.formats.timezoneParis"),
    },
    {
      value: "london",
      label: t("settings.localization.formats.timezoneLondon"),
    },
    {
      value: "new-york",
      label: t("settings.localization.formats.timezoneNewYork"),
    },
    {
      value: "riyadh",
      label: t("settings.localization.formats.timezoneRiyadh"),
    },
  ]

  const dateFormatOptions = [
    {
      value: "dmy",
      label: t("settings.localization.formats.dateFormatDmy"),
    },
    {
      value: "ymd",
      label: t("settings.localization.formats.dateFormatYmd"),
    },
  ]

  const firstDayOptions = [
    {
      value: "sunday",
      label: t("settings.localization.formats.firstDaySunday"),
    },
    {
      value: "monday",
      label: t("settings.localization.formats.firstDayMonday"),
    },
    {
      value: "saturday",
      label: t("settings.localization.formats.firstDaySaturday"),
    },
  ]

  return (
    <>
      <PageHeader
        title={t("settings.localization.title")}
        description={t("settings.localization.description")}
      />

      <div className="flex flex-col gap-6">
        <SettingsCard
          title={t("settings.localization.languages.title")}
          description={t("settings.localization.languages.description")}
        >
          <div className="flex flex-col gap-3">
            <SettingsSwitchRow
              id="localization-active-english"
              label={t("settings.localization.languages.english")}
              checked={form.activeEnglish}
              onCheckedChange={(checked) =>
                update("activeEnglish", checked)
              }
            />
            <SettingsSwitchRow
              id="localization-active-french"
              label={t("settings.localization.languages.french")}
              checked={form.activeFrench}
              onCheckedChange={(checked) =>
                update("activeFrench", checked)
              }
            />
            <SettingsSwitchRow
              id="localization-active-arabic"
              label={t("settings.localization.languages.arabic")}
              checked={form.activeArabic}
              onCheckedChange={(checked) =>
                update("activeArabic", checked)
              }
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsField
              label={t(
                "settings.localization.languages.defaultLanguage"
              )}
              hint={t(
                "settings.localization.languages.defaultLanguageHint"
              )}
            >
              <FilterSelect
                value={form.defaultLanguage}
                onChange={(value) => update("defaultLanguage", value)}
                options={languageOptions}
                ariaLabel={t(
                  "settings.localization.languages.defaultLanguage"
                )}
                className="w-full sm:w-full"
              />
            </SettingsField>

            <SettingsField
              label={t(
                "settings.localization.languages.fallbackLanguage"
              )}
              hint={t(
                "settings.localization.languages.fallbackLanguageHint"
              )}
            >
              <FilterSelect
                value={form.fallbackLanguage}
                onChange={(value) => update("fallbackLanguage", value)}
                options={languageOptions}
                ariaLabel={t(
                  "settings.localization.languages.fallbackLanguage"
                )}
                className="w-full sm:w-full"
              />
            </SettingsField>
          </div>
        </SettingsCard>

        <SettingsCard
          title={t("settings.localization.formats.title")}
          description={t("settings.localization.formats.description")}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsField
              label={t("settings.localization.formats.timezone")}
              hint={t("settings.localization.formats.timezoneHint")}
            >
              <FilterSelect
                value={form.timezone}
                onChange={(value) => update("timezone", value)}
                options={timezoneOptions}
                ariaLabel={t("settings.localization.formats.timezone")}
                className="w-full sm:w-full"
              />
            </SettingsField>

            <SettingsField
              label={t("settings.localization.formats.dateFormat")}
            >
              <FilterSelect
                value={form.dateFormat}
                onChange={(value) => update("dateFormat", value)}
                options={dateFormatOptions}
                ariaLabel={t("settings.localization.formats.dateFormat")}
                className="w-full sm:w-full"
              />
            </SettingsField>

            <SettingsField
              label={t("settings.localization.formats.firstDayOfWeek")}
            >
              <FilterSelect
                value={form.firstDayOfWeek}
                onChange={(value) => update("firstDayOfWeek", value)}
                options={firstDayOptions}
                ariaLabel={t(
                  "settings.localization.formats.firstDayOfWeek"
                )}
                className="w-full sm:w-full"
              />
            </SettingsField>
          </div>
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
