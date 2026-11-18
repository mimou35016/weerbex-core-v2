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
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"

const initialSecurity = {
  sessionTimeout: 60,
  forcePasswordExpiration: false,
  minLength: 12,
  requireNumbers: true,
  requireSymbols: true,
  rateLimitEnabled: true,
  maxRequests: 120,
  captchaProvider: "turnstile",
  captchaSiteKey: "",
  captchaSecretKey: "",
  ipAllowList: "",
  ipBlockList: "",
}

export default function SecuritySettingsPage() {
  const t = useTranslations("Dashboard")
  const [form, setForm] = useState(initialSecurity)

  function update<K extends keyof typeof initialSecurity>(
    key: K,
    value: (typeof initialSecurity)[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function save() {
    toast.success(t("settings.common.saved"))
  }

  function reset() {
    setForm(initialSecurity)
    toast.success(t("settings.common.resetDone"))
  }

  const captchaOptions = [
    {
      value: "none",
      label: t("settings.security.captcha.providerNone"),
    },
    {
      value: "recaptcha",
      label: t("settings.security.captcha.providerRecaptcha"),
    },
    {
      value: "turnstile",
      label: t("settings.security.captcha.providerTurnstile"),
    },
  ]

  return (
    <>
      <PageHeader
        title={t("settings.security.title")}
        description={t("settings.security.description")}
      />

      <div className="flex flex-col gap-6">
        <SettingsCard
          title={t("settings.security.session.title")}
          description={t("settings.security.session.description")}
        >
          <SettingsField
            label={t("settings.security.session.timeout")}
            htmlFor="security-session-timeout"
            hint={t("settings.security.session.timeoutHint")}
          >
            <Input
              id="security-session-timeout"
              type="number"
              min={5}
              max={1440}
              value={form.sessionTimeout}
              onChange={(event) =>
                update("sessionTimeout", Number(event.target.value))
              }
              className="max-w-40"
            />
          </SettingsField>

          <SettingsSwitchRow
            id="security-force-expiration"
            label={t("settings.security.session.forceExpiration")}
            description={t(
              "settings.security.session.forceExpirationDescription"
            )}
            checked={form.forcePasswordExpiration}
            onCheckedChange={(checked) =>
              update("forcePasswordExpiration", checked)
            }
          />
        </SettingsCard>

        <SettingsCard
          title={t("settings.security.password.title")}
          description={t("settings.security.password.description")}
        >
          <SettingsField
            label={t("settings.security.password.minLength")}
            htmlFor="security-min-length"
            hint={t("settings.security.password.minLengthHint")}
          >
            <Input
              id="security-min-length"
              type="number"
              min={6}
              max={32}
              value={form.minLength}
              onChange={(event) =>
                update("minLength", Number(event.target.value))
              }
              className="max-w-40"
            />
          </SettingsField>

          <SettingsSwitchRow
            id="security-require-numbers"
            label={t("settings.security.password.requireNumbers")}
            description={t(
              "settings.security.password.requireNumbersDescription"
            )}
            checked={form.requireNumbers}
            onCheckedChange={(checked) => update("requireNumbers", checked)}
          />

          <SettingsSwitchRow
            id="security-require-symbols"
            label={t("settings.security.password.requireSymbols")}
            description={t(
              "settings.security.password.requireSymbolsDescription"
            )}
            checked={form.requireSymbols}
            onCheckedChange={(checked) => update("requireSymbols", checked)}
          />
        </SettingsCard>

        <SettingsCard
          title={t("settings.security.rateLimit.title")}
          description={t("settings.security.rateLimit.description")}
        >
          <SettingsSwitchRow
            id="security-rate-limit-enabled"
            label={t("settings.security.rateLimit.enabled")}
            description={t(
              "settings.security.rateLimit.enabledDescription"
            )}
            checked={form.rateLimitEnabled}
            onCheckedChange={(checked) =>
              update("rateLimitEnabled", checked)
            }
          />

          <SettingsField
            label={t("settings.security.rateLimit.maxRequests")}
            hint={t("settings.security.rateLimit.maxRequestsHint")}
          >
            <div className="flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <Slider
                  id="security-max-requests"
                  min={10}
                  max={600}
                  step={10}
                  value={[form.maxRequests]}
                  onValueChange={(value) =>
                    update(
                      "maxRequests",
                      Array.isArray(value) ? value[0] : value
                    )
                  }
                  disabled={!form.rateLimitEnabled}
                  aria-label={t(
                    "settings.security.rateLimit.maxRequests"
                  )}
                />
              </div>
              <span
                className="w-32 shrink-0 text-end text-sm font-medium tabular-nums"
                dir="ltr"
              >
                {form.maxRequests}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  {t("settings.common.requestsPerMinute")}
                </span>
              </span>
            </div>
          </SettingsField>
        </SettingsCard>

        <SettingsCard
          title={t("settings.security.captcha.title")}
          description={t("settings.security.captcha.description")}
        >
          <SettingsField
            label={t("settings.security.captcha.provider")}
          >
            <FilterSelect
              value={form.captchaProvider}
              onChange={(value) => update("captchaProvider", value)}
              options={captchaOptions}
              ariaLabel={t("settings.security.captcha.provider")}
              className="w-full sm:w-full"
            />
          </SettingsField>

          {form.captchaProvider !== "none" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <SettingsField
                label={t("settings.security.captcha.siteKey")}
                htmlFor="security-captcha-site-key"
              >
                <Input
                  id="security-captcha-site-key"
                  value={form.captchaSiteKey}
                  onChange={(event) =>
                    update("captchaSiteKey", event.target.value)
                  }
                  placeholder={t(
                    "settings.security.captcha.siteKeyPlaceholder"
                  )}
                  dir="ltr"
                />
              </SettingsField>

              <SettingsField
                label={t("settings.security.captcha.secretKey")}
                htmlFor="security-captcha-secret-key"
                hint={t("settings.security.captcha.secretKeyHint")}
              >
                <Input
                  id="security-captcha-secret-key"
                  type="password"
                  value={form.captchaSecretKey}
                  onChange={(event) =>
                    update("captchaSecretKey", event.target.value)
                  }
                  placeholder={t(
                    "settings.security.captcha.secretKeyPlaceholder"
                  )}
                  autoComplete="off"
                  dir="ltr"
                />
              </SettingsField>
            </div>
          )}
        </SettingsCard>

        <SettingsCard
          title={t("settings.security.ip.title")}
          description={t("settings.security.ip.description")}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsField
              label={t("settings.security.ip.allowList")}
              htmlFor="security-ip-allow"
              hint={t("settings.security.ip.allowListHint")}
            >
              <Textarea
                id="security-ip-allow"
                value={form.ipAllowList}
                onChange={(event) =>
                  update("ipAllowList", event.target.value)
                }
                placeholder={t(
                  "settings.security.ip.allowListPlaceholder"
                )}
                className="font-mono text-xs"
                dir="ltr"
                rows={6}
              />
            </SettingsField>

            <SettingsField
              label={t("settings.security.ip.blockList")}
              htmlFor="security-ip-block"
              hint={t("settings.security.ip.blockListHint")}
            >
              <Textarea
                id="security-ip-block"
                value={form.ipBlockList}
                onChange={(event) =>
                  update("ipBlockList", event.target.value)
                }
                placeholder={t(
                  "settings.security.ip.blockListPlaceholder"
                )}
                className="font-mono text-xs"
                dir="ltr"
                rows={6}
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
