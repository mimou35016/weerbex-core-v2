import type { CollectionConfig } from "payload"

import {
  qrCornerStyles,
  qrDotStyles,
  qrErrorCorrections,
  qrKinds,
  qrSizeOptions,
  qrTypes,
  wifiEncryptions,
} from "../lib/types"
import { adminAccess, permissionAccess } from "./access"

/**
 * Stored QR code definitions. Styling is persisted alongside the content so a
 * code can be re-exported at any size without losing its look. Dynamic codes
 * store a relationship to a digital card instead of a fixed payload.
 */
export const QrCodes: CollectionConfig = {
  slug: "qr-codes",
  labels: {
    singular: "QR code",
    plural: "QR codes",
  },
  admin: {
    group: "QR Card Hub",
    useAsTitle: "title",
    defaultColumns: ["title", "kind", "qrType", "published", "updatedAt"],
    description:
      "Branded static and dynamic QR codes with PNG and SVG export.",
  },
  access: {
    admin: adminAccess("qrCodes"),
    read: permissionAccess("qrCodes", "read"),
    create: permissionAccess("qrCodes", "create"),
    update: permissionAccess("qrCodes", "update"),
    delete: permissionAccess("qrCodes", "delete"),
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      admin: {
        description: "Internal name shown in the dashboard list.",
      },
    },
    {
      name: "kind",
      type: "select",
      required: true,
      defaultValue: "static",
      options: qrKinds.map((kind) => ({
        label: kind === "static" ? "Static" : "Dynamic",
        value: kind,
      })),
    },
    {
      name: "qrType",
      type: "select",
      required: true,
      defaultValue: "url",
      options: qrTypes.map((type) => ({
        label: type,
        value: type,
      })),
    },
    {
      name: "url",
      type: "text",
    },
    {
      name: "text",
      type: "textarea",
    },
    {
      name: "email",
      type: "text",
    },
    {
      name: "emailSubject",
      type: "text",
    },
    {
      name: "emailBody",
      type: "textarea",
    },
    {
      name: "phone",
      type: "text",
    },
    {
      name: "wifiSsid",
      type: "text",
    },
    {
      name: "wifiPassword",
      type: "text",
    },
    {
      name: "wifiEncryption",
      type: "select",
      defaultValue: "WPA",
      options: wifiEncryptions.map((value) => ({ label: value, value })),
    },
    {
      name: "wifiHidden",
      type: "checkbox",
      defaultValue: false,
    },
    {
      name: "vcardFirstName",
      type: "text",
    },
    {
      name: "vcardLastName",
      type: "text",
    },
    {
      name: "vcardOrganization",
      type: "text",
    },
    {
      name: "vcardJobTitle",
      type: "text",
    },
    {
      name: "vcardPhone",
      type: "text",
    },
    {
      name: "vcardEmail",
      type: "email",
    },
    {
      name: "vcardWebsite",
      type: "text",
    },
    {
      name: "vcardAddress",
      type: "text",
    },
    {
      name: "card",
      type: "relationship",
      relationTo: "digital-cards",
      admin: {
        description:
          "Target card for dynamic codes. Editing the card updates every scan.",
      },
    },
    {
      name: "dotStyle",
      type: "select",
      defaultValue: "rounded",
      options: qrDotStyles.map((value) => ({ label: value, value })),
    },
    {
      name: "cornerStyle",
      type: "select",
      defaultValue: "extra-rounded",
      options: qrCornerStyles.map((value) => ({ label: value, value })),
    },
    {
      name: "foregroundColor",
      type: "text",
      defaultValue: "#111827",
    },
    {
      name: "backgroundColor",
      type: "text",
      defaultValue: "#ffffff",
    },
    {
      name: "useGradient",
      type: "checkbox",
      defaultValue: false,
    },
    {
      name: "gradientColor",
      type: "text",
      defaultValue: "#4f46e5",
    },
    {
      name: "logo",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "logoSize",
      type: "number",
      defaultValue: 0.35,
      min: 0.1,
      max: 0.6,
    },
    {
      name: "margin",
      type: "number",
      defaultValue: 12,
      min: 0,
      max: 80,
    },
    {
      name: "errorCorrection",
      type: "select",
      defaultValue: "H",
      options: qrErrorCorrections.map((value) => ({ label: value, value })),
    },
    {
      name: "size",
      type: "number",
      defaultValue: 1024,
      min: 128,
      max: 4096,
      admin: {
        description: `Recommended export sizes: ${qrSizeOptions.join(", ")} px.`,
      },
    },
    {
      name: "published",
      type: "checkbox",
      defaultValue: true,
      index: true,
      admin: {
        description:
          "Inactive codes stay saved but are marked as drafts.",
      },
    },
  ],
}
