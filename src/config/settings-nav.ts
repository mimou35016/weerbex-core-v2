import {
  HardDrive,
  Languages,
  Mail,
  Search,
  Settings2,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react"

export type SettingsNavItem = {
  id: string
  /** Key relative to the `Dashboard.settings` namespace. */
  labelKey: string
  href: string
  icon: LucideIcon
}

/**
 * Secondary navigation for the settings module. Add an entry here and it
 * automatically appears in the settings sidebar, the breadcrumb and the
 * settings layout without touching the core dashboard navigation.
 */
export const settingsNavItems: SettingsNavItem[] = [
  {
    id: "general",
    labelKey: "nav.general",
    href: "/dashboard/settings",
    icon: Settings2,
  },
  {
    id: "seo",
    labelKey: "nav.seo",
    href: "/dashboard/settings/seo",
    icon: Search,
  },
  {
    id: "security",
    labelKey: "nav.security",
    href: "/dashboard/settings/security",
    icon: ShieldCheck,
  },
  {
    id: "localization",
    labelKey: "nav.localization",
    href: "/dashboard/settings/localization",
    icon: Languages,
  },
  {
    id: "notifications",
    labelKey: "nav.notifications",
    href: "/dashboard/settings/notifications",
    icon: Mail,
  },
  {
    id: "storage",
    labelKey: "nav.storage",
    href: "/dashboard/settings/storage",
    icon: HardDrive,
  },
]
