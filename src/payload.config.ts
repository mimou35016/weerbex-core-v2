import { mongooseAdapter } from "@payloadcms/db-mongodb"
import { lexicalEditor } from "@payloadcms/richtext-lexical"
import path from "path"
import { buildConfig } from "payload"
import sharp from "sharp"
import { fileURLToPath } from "url"

import { Media } from "./collections/Media"
import { PageSeo } from "./collections/PageSeo"
import { Roles } from "./collections/Roles"
import { Users } from "./collections/Users"
import { SeoSettings } from "./globals/SeoSettings"
import { SiteSettings } from "./globals/SiteSettings"
import { seedRoles } from "./lib/seed-roles"
import { seedSettings } from "./lib/seed-settings"

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Roles, Media, PageSeo],
  globals: [SiteSettings, SeoSettings],
  localization: {
    locales: [
      { label: "English", code: "en" },
      { label: "Français", code: "fr" },
      { label: "العربية", code: "ar", rtl: true },
    ],
    defaultLocale: "en",
    fallback: true,
  },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || process.env.DATABASE_URL || "",
  }),
  sharp,
  plugins: [],
  onInit: async (payload) => {
    await seedRoles(payload)
    await seedSettings(payload)
  },
})
