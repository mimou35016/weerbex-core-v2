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
import { Input } from "@/components/ui/input"

const initialNotifications = {
  smtpHost: "",
  smtpPort: "587",
  smtpUsername: "",
  smtpPassword: "",
  encryption: "tls",
  senderEmail: "",
  senderName: "",
  notifyRegistrations: true,
  notifySecurityAlerts: true,
  notifyFailedLogins: true,
  notifySystemErrors: false,
}

export default function NotificationsSettingsPage() {
  const t = useTranslations("Dashboard")
  const [form, setForm] = useState(initialNotifications)

  function update<K extends keyof typeof initialNotifications>(
    key: K,
    value: (typeof initialNotifications)[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function save() {
    toast.success(t("settings.common.saved"))
  }

  function reset() {
    setForm(initialNotifications)
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
                onChange={(value) => update("encryption", value)}
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
        />
      </div>
    </>
  )
}
