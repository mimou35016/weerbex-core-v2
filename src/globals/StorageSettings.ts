import type { GlobalConfig } from "payload"

import { globalReadAccess, globalUpdateAccess } from "@/lib/global-access"

/**
 * Upload storage provider and file constraints used by the media library.
 */
export const StorageSettings: GlobalConfig = {
  slug: "storage-settings",
  label: "Storage settings",
  admin: {
    group: "Settings",
    description:
      "Where uploaded files are stored and which files are accepted.",
  },
  access: {
    read: globalReadAccess("storage"),
    update: globalUpdateAccess("storage"),
  },
  fields: [
    {
      name: "provider",
      type: "select",
      defaultValue: "local",
      options: [
        { label: "Local", value: "local" },
        { label: "Amazon S3", value: "s3" },
        { label: "Cloudflare R2", value: "r2" },
        { label: "UploadThing", value: "uploadthing" },
      ],
    },
    {
      name: "bucket",
      type: "text",
    },
    {
      name: "region",
      type: "text",
    },
    {
      name: "accessKey",
      type: "text",
    },
    {
      name: "secretKey",
      type: "text",
      admin: {
        description: "Stored server-side and never exposed to the client.",
      },
    },
    {
      name: "maxSize",
      type: "number",
      defaultValue: 10,
      min: 1,
      max: 100,
      admin: {
        description: "Maximum upload size in megabytes.",
      },
    },
    {
      name: "mimeTypes",
      type: "textarea",
      defaultValue: "image/png, image/jpeg, application/pdf",
      admin: {
        description: "Comma separated list of accepted MIME types.",
      },
    },
  ],
}
