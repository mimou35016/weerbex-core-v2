"use server"

import crypto from "node:crypto"
import { cookies } from "next/headers"

import type { User } from "@/payload-types"
import { recordAuditEvent } from "./audit"
import { getCurrentUser } from "./auth"
import { getPayloadClient } from "./payload"
import {
  hasAnyPermission,
  hasPermission,
  type PermissionAction,
} from "./permissions"
import {
  countSuperAdminUsers,
  resolveRoleDoc,
} from "./roles"
import { getSiteSettings } from "./site-settings"
import {
  toDashboardUser,
  type ActionResult,
  type DashboardUser,
  type UserStatus,
} from "./users"

type UserInput = {
  name: string
  email: string
  roleId?: string | null
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

  if (!user || user.status !== "active") {
    throw new Error("Unauthorized")
  }

  return user
}

async function requirePermission(
  resource: string,
  action: PermissionAction
): Promise<DashboardUser> {
  const user = await requireCurrentUser()

  if (!hasPermission(user, resource, action)) {
    throw new Error(
      "Forbidden: you do not have permission to perform this action."
    )
  }

  return user
}

async function requireAnyPermission(
  resource: string,
  actions: PermissionAction[]
): Promise<DashboardUser> {
  const user = await requireCurrentUser()

  if (!hasAnyPermission(user, resource, actions)) {
    throw new Error(
      "Forbidden: you do not have permission to perform this action."
    )
  }

  return user
}

async function loadDashboardUser(
  id: string | number
): Promise<DashboardUser | null> {
  try {
    const payload = await getPayloadClient()
    const user = (await payload.findByID({
      collection: "users",
      id,
      depth: 1,
      overrideAccess: true,
    })) as User

    return toDashboardUser(user)
  } catch {
    return null
  }
}

/**
 * Requests a password-reset email through Payload. The response is always the
 * same regardless of whether the address exists, so the endpoint cannot be
 * used to enumerate accounts. Payload sends the email with the configured
 * adapter; failures are logged and swallowed for the same reason.
 */
export async function requestPasswordResetAction(
  email: string
): Promise<ActionResult<null>> {
  try {
    const payload = await getPayloadClient()

    await payload.forgotPassword({
      collection: "users",
      data: { email: email.trim().toLowerCase() },
    })
  } catch (error) {
    console.error("[auth] forgot-password request failed", error)
  }

  return { success: true, data: null }
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
      await recordAuditEvent(
        {
          action: "login",
          actorName: input.email,
          target: "Web console",
          status: "failed",
        },
        payload
      )

      return { success: false, error: "Unable to sign in." }
    }

    const user = result.user as User

    if ((user.status ?? "active") !== "active") {
      await recordAuditEvent(
        {
          action: "login",
          actorId: user.id,
          actorName: user.name?.trim() || user.email,
          target: "Web console",
          status: "failed",
        },
        payload
      )

      return {
        success: false,
        error: "Your account is not active. Please contact an administrator.",
      }
    }

    await setAuthCookie(result.token, result.exp)

    const fresh = await loadDashboardUser(user.id)

    if (!fresh) {
      return { success: false, error: "Unable to load your account." }
    }

    await recordAuditEvent(
      {
        action: "login",
        actorId: fresh.id,
        actorName: fresh.name,
        target: "Web console",
      },
      payload
    )

    return { success: true, data: fresh }
  } catch (error) {
    await recordAuditEvent({
      action: "login",
      actorName: input.email,
      target: "Web console",
      status: "failed",
    })

    return { success: false, error: getErrorMessage(error) }
  }
}

export async function registerAction(input: {
  name: string
  email: string
  password: string
}): Promise<ActionResult<DashboardUser>> {
  try {
    const site = await getSiteSettings("en")

    if (!site.openRegistration) {
      return {
        success: false,
        error: "Registration is currently disabled.",
      }
    }

    const payload = await getPayloadClient()
    const user = await payload.create({
      collection: "users",
      data: {
        name: input.name,
        email: input.email,
        password: input.password,
        status: "active",
      },
      overrideAccess: true,
    })

    await recordAuditEvent(
      {
        action: "userCreated",
        actorId: user.id,
        actorName: input.name,
        target: input.email,
      },
      payload
    )

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

    const fresh = await loadDashboardUser(user.id)

    return {
      success: true,
      data: fresh ?? toDashboardUser((login.user ?? user) as User),
    }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function logoutAction(): Promise<ActionResult<null>> {
  try {
    const current = await getCurrentUser()
    const payload = await getPayloadClient()
    const cookieStore = await cookies()

    cookieStore.delete(`${payload.config.cookiePrefix || "payload"}-token`)

    if (current) {
      await recordAuditEvent(
        {
          action: "logout",
          actorId: current.id,
          actorName: current.name,
          target: "Web console",
        },
        payload
      )
    }

    return { success: true, data: null }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function refreshSessionAction(): Promise<
  ActionResult<DashboardUser | null>
> {
  try {
    const user = await getCurrentUser()

    return { success: true, data: user }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function listUsersAction(): Promise<ActionResult<DashboardUser[]>> {
  try {
    await requireAnyPermission("users", ["find", "read"])
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: "users",
      depth: 1,
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
    const current = await requirePermission("users", "create")
    const payload = await getPayloadClient()

    let roleId: string | null = null

    if (current.isSuperAdmin && input.roleId) {
      const role = await resolveRoleDoc(payload, input.roleId)

      if (!role) {
        throw new Error("The selected role no longer exists.")
      }

      roleId = String(role.id)
    }

    // The dashboard form does not collect a password, but Payload requires one
    // for auth collections. Generate an unusable random one until it is reset.
    const password = crypto.randomBytes(24).toString("base64url")

    const user = await payload.create({
      collection: "users",
      data: {
        name: input.name,
        email: input.email,
        password,
        status: input.status,
        ...(roleId ? { role: roleId } : {}),
      },
      overrideAccess: true,
    })

    const fresh = await loadDashboardUser(user.id)

    await recordAuditEvent(
      {
        action: "userCreated",
        actorId: current.id,
        actorName: current.name,
        target: input.email,
      },
      payload
    )

    return {
      success: true,
      data: fresh ?? toDashboardUser(user as User),
    }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function updateUserAction(
  id: string,
  input: UserInput
): Promise<ActionResult<DashboardUser>> {
  try {
    const current = await requirePermission("users", "update")
    const payload = await getPayloadClient()
    const existing = (await payload.findByID({
      collection: "users",
      id,
      depth: 1,
      overrideAccess: true,
    })) as User

    const targetRole = await resolveRoleDoc(payload, existing.role)
    const isSelf = current.id === String(existing.id)
    const targetPriority = targetRole?.priority ?? 0

    if (targetRole?.isSuperAdmin && !current.isSuperAdmin) {
      throw new Error(
        "Forbidden: only a super admin can modify this account."
      )
    }

    if (
      !current.isSuperAdmin &&
      !isSelf &&
      targetPriority >= current.rolePriority
    ) {
      throw new Error("Forbidden: you cannot modify this account.")
    }

    let roleId: string | null = null

    if (current.isSuperAdmin && input.roleId) {
      const role = await resolveRoleDoc(payload, input.roleId)

      if (!role) {
        throw new Error("The selected role no longer exists.")
      }

      if (
        targetRole?.isSuperAdmin &&
        !role.isSuperAdmin &&
        (await countSuperAdminUsers(payload)) <= 1
      ) {
        throw new Error("At least one super admin account is required.")
      }

      roleId = String(role.id)
    }

    // Non-super admins may never change roles, and users can never change
    // their own status. Higher priority accounts are already rejected above.
    const status =
      current.isSuperAdmin || (!isSelf && targetPriority < current.rolePriority)
        ? input.status
        : ((existing.status as UserStatus | null | undefined) ?? "active")

    const user = await payload.update({
      collection: "users",
      id,
      data: {
        name: input.name,
        email: input.email,
        status,
        ...(roleId ? { role: roleId } : {}),
      },
      overrideAccess: true,
    })

    const fresh = await loadDashboardUser(user.id)

    await recordAuditEvent(
      {
        action: "userUpdated",
        actorId: current.id,
        actorName: current.name,
        target: input.email,
      },
      payload
    )

    return {
      success: true,
      data: fresh ?? toDashboardUser(user as User),
    }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function deleteUserAction(
  id: string
): Promise<ActionResult<null>> {
  try {
    const current = await requirePermission("users", "delete")

    if (current.id === id) {
      throw new Error("You cannot delete your own account.")
    }

    const payload = await getPayloadClient()
    const existing = (await payload.findByID({
      collection: "users",
      id,
      depth: 1,
      overrideAccess: true,
    })) as User

    const targetRole = await resolveRoleDoc(payload, existing.role)
    const targetPriority = targetRole?.priority ?? 0

    if (targetRole?.isSuperAdmin && !current.isSuperAdmin) {
      throw new Error("Forbidden: you cannot delete this account.")
    }

    if (!current.isSuperAdmin && targetPriority >= current.rolePriority) {
      throw new Error("Forbidden: you cannot delete this account.")
    }

    if (
      targetRole?.isSuperAdmin &&
      (await countSuperAdminUsers(payload)) <= 1
    ) {
      throw new Error("At least one super admin account is required.")
    }

    await payload.delete({
      collection: "users",
      id,
      overrideAccess: true,
    })

    await recordAuditEvent(
      {
        action: "userDeleted",
        actorId: current.id,
        actorName: current.name,
        target: existing.email,
      },
      payload
    )

    return { success: true, data: null }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function countUsersAction(): Promise<ActionResult<number>> {
  try {
    const current = await requireCurrentUser()

    if (!hasAnyPermission(current, "users", ["find", "read"])) {
      return { success: true, data: 0 }
    }

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

    const fresh = await loadDashboardUser(user.id)

    await recordAuditEvent(
      {
        action: "profileUpdated",
        actorId: current.id,
        actorName: fresh?.name ?? input.name,
        target: input.email,
      },
      payload
    )

    return {
      success: true,
      data: fresh ?? toDashboardUser(user as User),
    }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}
