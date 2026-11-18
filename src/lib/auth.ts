import { headers } from "next/headers"

import type { User } from "@/payload-types"
import { getPayloadClient } from "./payload"
import { toDashboardUser, type DashboardUser } from "./users"

export async function getCurrentUser(): Promise<DashboardUser | null> {
  try {
    const payload = await getPayloadClient()
    const { user } = await payload.auth({ headers: await headers() })

    if (!user) return null

    return toDashboardUser(user as User)
  } catch {
    return null
  }
}
