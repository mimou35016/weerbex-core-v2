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
} from "@/components/dashboard/settings/settings-ui"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  getStorageSettingsAction,
  saveStorageSettingsAction,
} from "@/lib/system-settings-actions"
import {
  DEFAULT_STORAGE_SETTINGS,
  type StorageSettingsData,
} from "@/lib/system-settings-types"

export default function StorageSettingsPage() {
  const t = useTranslations("Dashboard")
  const [form, setForm] = useState<StorageSettingsData>(
    DEFAULT_STORAGE_SETTINGS
  )
  const [saved, setSaved] = useState<StorageSettingsData>(
    DEFAULT_STORAGE_SETTINGS
  )
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true

    getStorageSettingsAction().then((result) => {
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

  function update<K extends keyof StorageSettingsData>(
    key: K,
    value: StorageSettingsData[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function save() {
    if (saving) return

    setSaving(true)
    const result = await saveStorageSettingsAction(form)
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

  const providerOptions = [
    { value: "local", label: t("settings.storage.provider.local") },
    { value: "s3", label: t("settings.storage.provider.s3") },
    { value: "r2", label: t("settings.storage.provider.r2") },
    {
      value: "uploadthing",
      label: t("settings.storage.provider.uploadthing"),
    },
  ]

  const providerDescriptions: Record<string, string> = {
    local: t("settings.storage.provider.localDescription"),
    s3: t("settings.storage.cloud.description"),
    r2: t("settings.storage.cloud.description"),
    uploadthing: t("settings.storage.cloud.description"),
  }

  const isCloud = form.provider !== "local"

  return (
    <>
      <PageHeader
        title={t("settings.storage.title")}
        description={t("settings.storage.description")}
      />

      <div className="flex flex-col gap-6">
        <SettingsCard
          title={t("settings.storage.provider.title")}
          description={t("settings.storage.provider.description")}
        >
          <SettingsField
            label={t("settings.storage.provider.label")}
            hint={providerDescriptions[form.provider]}
          >
            <FilterSelect
              value={form.provider}
              onChange={(value) =>
                update(
                  "provider",
                  value as StorageSettingsData["provider"]
                )
              }
              options={providerOptions}
              ariaLabel={t("settings.storage.provider.label")}
              className="w-full sm:w-full"
            />
          </SettingsField>
        </SettingsCard>

        {isCloud && (
          <SettingsCard
            title={t("settings.storage.cloud.title")}
            description={t("settings.storage.cloud.description")}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <SettingsField
                label={t("settings.storage.cloud.bucket")}
                htmlFor="storage-bucket"
              >
                <Input
                  id="storage-bucket"
                  value={form.bucket}
                  onChange={(event) =>
                    update("bucket", event.target.value)
                  }
                  placeholder={t(
                    "settings.storage.cloud.bucketPlaceholder"
                  )}
                  dir="ltr"
                />
              </SettingsField>

              <SettingsField
                label={t("settings.storage.cloud.region")}
                htmlFor="storage-region"
              >
                <Input
                  id="storage-region"
                  value={form.region}
                  onChange={(event) =>
                    update("region", event.target.value)
                  }
                  placeholder={t(
                    "settings.storage.cloud.regionPlaceholder"
                  )}
                  dir="ltr"
                />
              </SettingsField>

              <SettingsField
                label={t("settings.storage.cloud.accessKey")}
                htmlFor="storage-access-key"
              >
                <Input
                  id="storage-access-key"
                  value={form.accessKey}
                  onChange={(event) =>
                    update("accessKey", event.target.value)
                  }
                  placeholder={t(
                    "settings.storage.cloud.accessKeyPlaceholder"
                  )}
                  autoComplete="off"
                  dir="ltr"
                />
              </SettingsField>

              <SettingsField
                label={t("settings.storage.cloud.secretKey")}
                htmlFor="storage-secret-key"
                hint={t("settings.storage.cloud.secretKeyHint")}
              >
                <Input
                  id="storage-secret-key"
                  type="password"
                  value={form.secretKey}
                  onChange={(event) =>
                    update("secretKey", event.target.value)
                  }
                  placeholder={t(
                    "settings.storage.cloud.secretKeyPlaceholder"
                  )}
                  autoComplete="new-password"
                  dir="ltr"
                />
              </SettingsField>
            </div>
          </SettingsCard>
        )}

        <SettingsCard
          title={t("settings.storage.uploads.title")}
          description={t("settings.storage.uploads.description")}
        >
          <SettingsField
            label={t("settings.storage.uploads.maxSize")}
            htmlFor="storage-max-size"
            hint={t("settings.storage.uploads.maxSizeHint")}
          >
            <Input
              id="storage-max-size"
              type="number"
              min={1}
              max={100}
              value={form.maxSize}
              onChange={(event) =>
                update("maxSize", Number(event.target.value))
              }
              className="max-w-40"
              dir="ltr"
            />
          </SettingsField>

          <SettingsField
            label={t("settings.storage.uploads.mimeTypes")}
            htmlFor="storage-mime-types"
            hint={t("settings.storage.uploads.mimeTypesHint")}
          >
            <Textarea
              id="storage-mime-types"
              value={form.mimeTypes}
              onChange={(event) =>
                update("mimeTypes", event.target.value)
              }
              placeholder={t(
                "settings.storage.uploads.mimeTypesPlaceholder"
              )}
              className="font-mono text-xs"
              dir="ltr"
              rows={4}
            />
          </SettingsField>
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
