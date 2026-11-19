import {
  appDefinitions,
  defaultAppAvailability,
  type AppAvailability,
} from "./app-definitions"
import { getAppConfigs } from "./system-settings"

/**
 * Resolves the effective lifecycle state of every registered app from the
 * Payload `app-settings` global. Uninstalled or disabled apps stay in the
 * catalog (so they can be reinstalled) but are hidden from navigation and
 * blocked at the route/action layer.
 */
export async function getAppStates(): Promise<AppAvailability[]> {
  const configs = await getAppConfigs()
  const byId = new Map(configs.map((config) => [config.appId, config]))

  return appDefinitions.map((app) => {
    const config = byId.get(app.id)
    const defaults = defaultAppAvailability(app)
    const installed = config?.installed ?? defaults.installed
    const enabled = config?.enabled ?? defaults.enabled

    return {
      appId: app.id,
      installed,
      enabled,
      available: installed && enabled,
    }
  })
}

/** Effective availability of a single app. Unknown apps are unavailable. */
export async function isAppAvailable(appId: string): Promise<boolean> {
  const states = await getAppStates()
  return states.find((state) => state.appId === appId)?.available ?? false
}
