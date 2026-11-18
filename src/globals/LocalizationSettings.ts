import type { GlobalConfig } from "payload"

import { globalReadAccess, globalUpdateAccess } from "@/lib/global-access"

/**
 * Languages and regional formatting offered by the dashboard. The Next.js
 * routing layer reads `defaultLanguage`/active flags from here.
 */
export const LocalizationSettings: GlobalConfig = {
  slug: "localization-settings",
  label: "Localization settings",
  admin: {
    group: "Settings",
    description:
      "Enabled languages, default and fallback locale, time zone and date formats.",
  },
  access: {
    read: globalReadAccess("localization"),
    update: globalUpdateAccess("localization"),
  },
  fields: [
    {
      name: "activeEnglish",
      type: "checkbox",
      defaultValue: true,
    },
    {
      name: "activeFrench",
      type: "checkbox",
      defaultValue: true,
    },
    {
      name: "activeArabic",
      type: "checkbox",
      defaultValue: true,
    },
    {
      name: "defaultLanguage",
      type: "select",
      defaultValue: "en",
      options: [
        { label: "English", value: "en" },
        { label: "Français", value: "fr" },
        { label: "العربية", value: "ar" },
      ],
    },
    {
      name: "fallbackLanguage",
      type: "select",
      defaultValue: "en",
      options: [
        { label: "English", value: "en" },
        { label: "Français", value: "fr" },
        { label: "العربية", value: "ar" },
      ],
    },
    {
      name: "timezone",
      type: "select",
      defaultValue: "utc",
      options: [
        { label: "UTC", value: "utc" },
        { label: "Casablanca (GMT+1)", value: "casablanca" },
        { label: "Paris (GMT+1)", value: "paris" },
        { label: "London (GMT)", value: "london" },
        { label: "New York (GMT-5)", value: "new-york" },
        { label: "Riyadh (GMT+3)", value: "riyadh" },
      ],
    },
    {
      name: "dateFormat",
      type: "select",
      defaultValue: "dmy",
      options: [
        { label: "DD/MM/YYYY", value: "dmy" },
        { label: "YYYY-MM-DD", value: "ymd" },
      ],
    },
    {
      name: "firstDayOfWeek",
      type: "select",
      defaultValue: "monday",
      options: [
        { label: "Sunday", value: "sunday" },
        { label: "Monday", value: "monday" },
        { label: "Saturday", value: "saturday" },
      ],
    },
  ],
}
