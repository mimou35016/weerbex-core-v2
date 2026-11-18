"use client"

import { useEffect, useState } from "react"
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
import {
  getLocalizationSettingsAction,
  saveLocalizationSettingsAction,
} from "@/lib/system-settings-actions"
import {
  DEFAULT_LOCALIZATION_SETTINGS,
  type LocalizationSettingsData,
} from "@/lib/system-settings-types"

export default function LocalizationSettingsPage() {
  const t = useTranslations("Dashboard")
  const [form, setForm] = useState<LocalizationSettingsData>(
    DEFAULT_LOCALIZATION_SETTINGS
  )
  const [saved, setSaved] = useState<LocalizationSettingsData>(
    DEFAULT_LOCALIZATION_SETTINGS
  )
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true

    getLocalizationSettingsAction().then((result) => {
      if (!active) return

      if (result.success) {
        setForm(result.data)
        setSaved(result.data)
      } else {
        toast.error(result.error)
      }
    })

    return () => {
      active = false
    }
  }, [])

  function update<K extends keyof LocalizationSettingsData>(
    key: K,
    value: LocalizationSettingsData[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function save() {
    if (saving) return

    setSaving(true)
    const result = await saveLocalizationSettingsAction(form)
    setSaving(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    setForm(result.data)
    setSaved(result.data)
    toast.success(t("settings.common.saved"))
  }

  function reset() {
    setForm(saved)
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
                onChange={(value) =>
                  update(
                    "defaultLanguage",
                    value as LocalizationSettingsData["defaultLanguage"]
                  )
                }
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
                onChange={(value) =>
                  update(
                    "fallbackLanguage",
                    value as LocalizationSettingsData["fallbackLanguage"]
                  )
                }
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
                onChange={(value) =>
                  update(
                    "timezone",
                    value as LocalizationSettingsData["timezone"]
                  )
                }
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
                onChange={(value) =>
                  update(
                    "dateFormat",
                    value as LocalizationSettingsData["dateFormat"]
                  )
                }
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
                onChange={(value) =>
                  update(
                    "firstDayOfWeek",
                    value as LocalizationSettingsData["firstDayOfWeek"]
                  )
                }
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
          saving={saving}
        />
      </div>
    </>
  )
}
