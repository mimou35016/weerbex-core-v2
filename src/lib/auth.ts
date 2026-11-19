import { headers } from "next/headers"

import type { User } from "@/payload-types"
import { getAppStates } from "./app-state"
import { getPayloadClient } from "./payload"
import { toDashboardUser, type DashboardUser } from "./users"

/**
 * Resolves the signed-in user together with a freshly populated role document.
 * The role is always re-read from the database so permission or role changes
 * take effect on the next request instead of relying on stale JWT claims.
 */
export async function getCurrentUser(): Promise<DashboardUser | null> {
  try {
    const payload = await getPayloadClient()
    const { user } = await payload.auth({ headers: await headers() })

    if (!user) return null

    const fresh = (await payload.findByID({
      collection: "users",
      id: user.id,
      depth: 1,
      overrideAccess: true,
    })) as User

    return toDashboardUser(fresh, await getAppStates())
  } catch {
    return null
  }
}
