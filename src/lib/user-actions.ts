"use server"

import crypto from "node:crypto"
import { cookies } from "next/headers"

import type { DashboardRole } from "@/config/dashboard-nav"
import type { User } from "@/payload-types"
import { getCurrentUser } from "./auth"
import { getPayloadClient } from "./payload"
import {
  toDashboardUser,
  type ActionResult,
  type DashboardUser,
  type UserStatus,
} from "./users"

type UserInput = {
  name: string
  email: string
  role: DashboardRole
  status: UserStatus
}

type ProfileInput = {
  name: string
  email: string
  currentPassword?: string
  newPassword?: string
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return "Something went wrong. Please try again."
}

async function setAuthCookie(token: string, exp?: number) {
  const payload = await getPayloadClient()
  const cookieStore = await cookies()

  cookieStore.set(`${payload.config.cookiePrefix || "payload"}-token`, token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    ...(exp ? { expires: new Date(exp * 1000) } : {}),
  })
}

async function requireCurrentUser(): Promise<DashboardUser> {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  return user
}

export async function loginAction(input: {
  email: string
  password: string
}): Promise<ActionResult<DashboardUser>> {
  try {
    const payload = await getPayloadClient()
    const result = await payload.login({
      collection: "users",
      data: {
        email: input.email,
        password: input.password,
      },
    })

    if (!result.token || !result.user) {
      return { success: false, error: "Unable to sign in." }
    }

    await setAuthCookie(result.token, result.exp)

    return { success: true, data: toDashboardUser(result.user as User) }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function registerAction(input: {
  name: string
  email: string
  password: string
}): Promise<ActionResult<DashboardUser>> {
  try {
    const payload = await getPayloadClient()
    const user = await payload.create({
      collection: "users",
      data: {
        name: input.name,
        email: input.email,
        password: input.password,
        role: "user",
        status: "active",
      },
      overrideAccess: true,
    })

    const login = await payload.login({
      collection: "users",
      data: {
        email: input.email,
        password: input.password,
      },
    })

    if (login.token) {
      await setAuthCookie(login.token, login.exp)
    }

    return {
      success: true,
      data: toDashboardUser((login.user ?? user) as User),
    }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function logoutAction(): Promise<ActionResult<null>> {
  try {
    const payload = await getPayloadClient()
    const cookieStore = await cookies()

    cookieStore.delete(`${payload.config.cookiePrefix || "payload"}-token`)

    return { success: true, data: null }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function listUsersAction(): Promise<ActionResult<DashboardUser[]>> {
  try {
    await requireCurrentUser()
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: "users",
      depth: 0,
      limit: 100,
      sort: "-createdAt",
      overrideAccess: true,
    })

    return {
      success: true,
      data: result.docs.map((doc) => toDashboardUser(doc as User)),
    }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function createUserAction(
  input: UserInput
): Promise<ActionResult<DashboardUser>> {
  try {
    await requireCurrentUser()
    const payload = await getPayloadClient()

    // The dashboard form does not collect a password, but Payload requires one
    // for auth collections. Generate an unusable random one until it is reset.
    const password = crypto.randomBytes(24).toString("base64url")

    const user = await payload.create({
      collection: "users",
      data: {
        name: input.name,
        email: input.email,
        password,
        role: input.role,
        status: input.status,
      },
      overrideAccess: true,
    })

    return { success: true, data: toDashboardUser(user as User) }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function updateUserAction(
  id: string,
  input: UserInput
): Promise<ActionResult<DashboardUser>> {
  try {
    await requireCurrentUser()
    const payload = await getPayloadClient()
    const user = await payload.update({
      collection: "users",
      id,
      data: {
        name: input.name,
        email: input.email,
        role: input.role,
        status: input.status,
      },
      overrideAccess: true,
    })

    return { success: true, data: toDashboardUser(user as User) }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function deleteUserAction(
  id: string
): Promise<ActionResult<null>> {
  try {
    await requireCurrentUser()
    const payload = await getPayloadClient()
    await payload.delete({
      collection: "users",
      id,
      overrideAccess: true,
    })

    return { success: true, data: null }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function countUsersAction(): Promise<ActionResult<number>> {
  try {
    await requireCurrentUser()
    const payload = await getPayloadClient()
    const result = await payload.count({
      collection: "users",
      overrideAccess: true,
    })

    return { success: true, data: result.totalDocs }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function updateProfileAction(
  input: ProfileInput
): Promise<ActionResult<DashboardUser>> {
  try {
    const current = await requireCurrentUser()
    const payload = await getPayloadClient()
    const existing = await payload.findByID({
      collection: "users",
      id: current.id,
      depth: 0,
      overrideAccess: true,
    })

    if (input.newPassword) {
      if (!input.currentPassword) {
        return { success: false, error: "Current password is required." }
      }

      try {
        await payload.login({
          collection: "users",
          data: {
            email: existing.email,
            password: input.currentPassword,
          },
        })
      } catch {
        return { success: false, error: "Current password is incorrect." }
      }
    }

    const user = await payload.update({
      collection: "users",
      id: current.id,
      data: {
        name: input.name,
        email: input.email,
        ...(input.newPassword ? { password: input.newPassword } : {}),
      },
      overrideAccess: true,
    })

    return { success: true, data: toDashboardUser(user as User) }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}
