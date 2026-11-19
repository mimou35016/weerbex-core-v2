import { getLocale } from "next-intl/server"
import { notFound, redirect } from "next/navigation"

import { isAppAvailable } from "./app-state"
import { getCurrentUser } from "./auth"
import {
  hasAnyPermission,
  hasPermission,
  type PermissionAction,
} from "./permissions"
import type { DashboardUser } from "./users"

/**
 * Server-side route guard. Redirects guests to the localized login page and
 * hides routes the signed-in user has no permission to open.
 */
async function requireActiveUser(): Promise<DashboardUser> {
  const user = await getCurrentUser()

  if (!user || user.status !== "active") {
    const locale = await getLocale()
    redirect(`/${locale}/login`)
  }

  return user
}

export async function requirePermission(
  resource: string,
  action: PermissionAction
): Promise<DashboardUser> {
  const user = await requireActiveUser()

  if (!hasPermission(user, resource, action)) {
    notFound()
  }

  return user
}

export async function requireAnyPermission(
  resource: string,
  actions: PermissionAction[]
): Promise<DashboardUser> {
  const user = await requireActiveUser()

  if (!hasAnyPermission(user, resource, actions)) {
    notFound()
  }

  return user
}

/**
 * Blocks a mini-app's routes when the app has been uninstalled or disabled in
 * the Apps Hub. The catalog entry remains in the database for reinstallation.
 */
export async function requireAppAvailable(appId: string): Promise<void> {
  if (!(await isAppAvailable(appId))) notFound()
}

export async function requireSuperAdmin(): Promise<DashboardUser> {
  const user = await requireActiveUser()

  if (!user.isSuperAdmin) {
    notFound()
  }

  return user
}
