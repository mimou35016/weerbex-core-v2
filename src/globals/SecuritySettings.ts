import type { GlobalConfig } from "payload"

import { globalReadAccess, globalUpdateAccess } from "@/lib/global-access"

/**
 * Session, password, rate limit, captcha and IP access policy. Consumed by the
 * security settings page and available to the auth layer.
 */
export const SecuritySettings: GlobalConfig = {
  slug: "security-settings",
  label: "Security settings",
  admin: {
    group: "Settings",
    description:
      "Session lifetime, password policy, API rate limits, captcha and IP rules.",
  },
  access: {
    read: globalReadAccess("security"),
    update: globalUpdateAccess("security"),
  },
  fields: [
    {
      name: "sessionTimeout",
      type: "number",
      defaultValue: 60,
      min: 5,
      max: 1440,
      admin: {
        description: "Minutes of inactivity before a session expires.",
      },
    },
    {
      name: "forcePasswordExpiration",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description: "Ask users to change their password every 90 days.",
      },
    },
    {
      name: "minLength",
      type: "number",
      defaultValue: 12,
      min: 6,
      max: 32,
    },
    {
      name: "requireNumbers",
      type: "checkbox",
      defaultValue: true,
    },
    {
      name: "requireSymbols",
      type: "checkbox",
      defaultValue: true,
    },
    {
      name: "rateLimitEnabled",
      type: "checkbox",
      defaultValue: true,
    },
    {
      name: "maxRequests",
      type: "number",
      defaultValue: 120,
      min: 10,
      max: 600,
      admin: {
        description: "Maximum requests per minute before a 429 is returned.",
      },
    },
    {
      name: "captchaProvider",
      type: "select",
      defaultValue: "turnstile",
      options: [
        { label: "None", value: "none" },
        { label: "Google reCAPTCHA", value: "recaptcha" },
        { label: "Cloudflare Turnstile", value: "turnstile" },
      ],
    },
    {
      name: "captchaSiteKey",
      type: "text",
    },
    {
      name: "captchaSecretKey",
      type: "text",
      admin: {
        description: "Stored server-side and never exposed to the client.",
      },
    },
    {
      name: "ipAllowList",
      type: "textarea",
      admin: {
        description: "One IP address or CIDR range per line.",
      },
    },
    {
      name: "ipBlockList",
      type: "textarea",
      admin: {
        description: "One IP address or CIDR range per line.",
      },
    },
  ],
}
