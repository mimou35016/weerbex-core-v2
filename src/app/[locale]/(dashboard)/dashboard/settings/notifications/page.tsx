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
import { Input } from "@/components/ui/input"
import {
  getNotificationSettingsAction,
  saveNotificationSettingsAction,
} from "@/lib/system-settings-actions"
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  type NotificationSettingsData,
} from "@/lib/system-settings-types"

export default function NotificationsSettingsPage() {
  const t = useTranslations("Dashboard")
  const [form, setForm] = useState<NotificationSettingsData>(
    DEFAULT_NOTIFICATION_SETTINGS
  )
  const [saved, setSaved] = useState<NotificationSettingsData>(
    DEFAULT_NOTIFICATION_SETTINGS
  )
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true

    getNotificationSettingsAction().then((result) => {
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

  function update<K extends keyof NotificationSettingsData>(
    key: K,
    value: NotificationSettingsData[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function save() {
    if (saving) return

    setSaving(true)
    const result = await saveNotificationSettingsAction(form)
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

  const encryptionOptions = [
    { value: "tls", label: t("settings.notifications.smtp.encryptionTls") },
    { value: "ssl", label: t("settings.notifications.smtp.encryptionSsl") },
    {
      value: "none",
      label: t("settings.notifications.smtp.encryptionNone"),
    },
  ]

  return (
    <>
      <PageHeader
        title={t("settings.notifications.title")}
        description={t("settings.notifications.description")}
      />

      <div className="flex flex-col gap-6">
        <SettingsCard
          title={t("settings.notifications.smtp.title")}
          description={t("settings.notifications.smtp.description")}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsField
              label={t("settings.notifications.smtp.host")}
              htmlFor="notifications-smtp-host"
            >
              <Input
                id="notifications-smtp-host"
                value={form.smtpHost}
                onChange={(event) =>
                  update("smtpHost", event.target.value)
                }
                placeholder={t(
                  "settings.notifications.smtp.hostPlaceholder"
                )}
                dir="ltr"
              />
            </SettingsField>

            <SettingsField
              label={t("settings.notifications.smtp.port")}
              htmlFor="notifications-smtp-port"
            >
              <Input
                id="notifications-smtp-port"
                type="number"
                min={1}
                max={65535}
                value={form.smtpPort}
                onChange={(event) =>
                  update("smtpPort", event.target.value)
                }
                placeholder={t(
                  "settings.notifications.smtp.portPlaceholder"
                )}
                dir="ltr"
              />
            </SettingsField>

            <SettingsField
              label={t("settings.notifications.smtp.username")}
              htmlFor="notifications-smtp-username"
            >
              <Input
                id="notifications-smtp-username"
                value={form.smtpUsername}
                onChange={(event) =>
                  update("smtpUsername", event.target.value)
                }
                placeholder={t(
                  "settings.notifications.smtp.usernamePlaceholder"
                )}
                autoComplete="off"
                dir="ltr"
              />
            </SettingsField>

            <SettingsField
              label={t("settings.notifications.smtp.password")}
              htmlFor="notifications-smtp-password"
              hint={t("settings.notifications.smtp.passwordHint")}
            >
              <Input
                id="notifications-smtp-password"
                type="password"
                value={form.smtpPassword}
                onChange={(event) =>
                  update("smtpPassword", event.target.value)
                }
                placeholder={t(
                  "settings.notifications.smtp.passwordPlaceholder"
                )}
                autoComplete="new-password"
                dir="ltr"
              />
            </SettingsField>

            <SettingsField
              label={t("settings.notifications.smtp.encryption")}
            >
              <FilterSelect
                value={form.encryption}
                onChange={(value) =>
                  update(
                    "encryption",
                    value as NotificationSettingsData["encryption"]
                  )
                }
                options={encryptionOptions}
                ariaLabel={t(
                  "settings.notifications.smtp.encryption"
                )}
                className="w-full sm:w-full"
              />
            </SettingsField>

            <SettingsField
              label={t("settings.notifications.smtp.senderName")}
              htmlFor="notifications-sender-name"
            >
              <Input
                id="notifications-sender-name"
                value={form.senderName}
                onChange={(event) =>
                  update("senderName", event.target.value)
                }
                placeholder={t(
                  "settings.notifications.smtp.senderNamePlaceholder"
                )}
              />
            </SettingsField>
          </div>

          <SettingsField
            label={t("settings.notifications.smtp.senderEmail")}
            htmlFor="notifications-sender-email"
          >
            <Input
              id="notifications-sender-email"
              type="email"
              value={form.senderEmail}
              onChange={(event) =>
                update("senderEmail", event.target.value)
              }
              placeholder={t(
                "settings.notifications.smtp.senderEmailPlaceholder"
              )}
              dir="ltr"
            />
          </SettingsField>
        </SettingsCard>

        <SettingsCard
          title={t("settings.notifications.events.title")}
          description={t("settings.notifications.events.description")}
        >
          <SettingsSwitchRow
            id="notifications-registrations"
            label={t("settings.notifications.events.registrations")}
            description={t(
              "settings.notifications.events.registrationsDescription"
            )}
            checked={form.notifyRegistrations}
            onCheckedChange={(checked) =>
              update("notifyRegistrations", checked)
            }
          />

          <SettingsSwitchRow
            id="notifications-security-alerts"
            label={t("settings.notifications.events.securityAlerts")}
            description={t(
              "settings.notifications.events.securityAlertsDescription"
            )}
            checked={form.notifySecurityAlerts}
            onCheckedChange={(checked) =>
              update("notifySecurityAlerts", checked)
            }
          />

          <SettingsSwitchRow
            id="notifications-failed-logins"
            label={t("settings.notifications.events.failedLogins")}
            description={t(
              "settings.notifications.events.failedLoginsDescription"
            )}
            checked={form.notifyFailedLogins}
            onCheckedChange={(checked) =>
              update("notifyFailedLogins", checked)
            }
          />

          <SettingsSwitchRow
            id="notifications-system-errors"
            label={t("settings.notifications.events.systemErrors")}
            description={t(
              "settings.notifications.events.systemErrorsDescription"
            )}
            checked={form.notifySystemErrors}
            onCheckedChange={(checked) =>
              update("notifySystemErrors", checked)
            }
          />
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
