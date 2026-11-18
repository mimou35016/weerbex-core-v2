import type { GlobalConfig } from "payload"

import { globalReadAccess, globalUpdateAccess } from "@/lib/global-access"

/**
 * Outgoing email transport and administrator alert switches.
 */
export const NotificationSettings: GlobalConfig = {
  slug: "notification-settings",
  label: "Notification settings",
  admin: {
    group: "Settings",
    description:
      "SMTP credentials for transactional email and the events that trigger alerts.",
  },
  access: {
    read: globalReadAccess("notifications"),
    update: globalUpdateAccess("notifications"),
  },
  fields: [
    {
      name: "smtpHost",
      type: "text",
    },
    {
      name: "smtpPort",
      type: "text",
      defaultValue: "587",
    },
    {
      name: "smtpUsername",
      type: "text",
    },
    {
      name: "smtpPassword",
      type: "text",
      admin: {
        description: "Stored server-side and never exposed to the client.",
      },
    },
    {
      name: "encryption",
      type: "select",
      defaultValue: "tls",
      options: [
        { label: "TLS", value: "tls" },
        { label: "SSL", value: "ssl" },
        { label: "None", value: "none" },
      ],
    },
    {
      name: "senderEmail",
      type: "text",
    },
    {
      name: "senderName",
      type: "text",
    },
    {
      name: "notifyRegistrations",
      type: "checkbox",
      defaultValue: true,
    },
    {
      name: "notifySecurityAlerts",
      type: "checkbox",
      defaultValue: true,
    },
    {
      name: "notifyFailedLogins",
      type: "checkbox",
      defaultValue: true,
    },
    {
      name: "notifySystemErrors",
      type: "checkbox",
      defaultValue: false,
    },
  ],
}
