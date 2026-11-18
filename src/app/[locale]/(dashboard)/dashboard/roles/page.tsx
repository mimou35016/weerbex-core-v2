"use client"

import { Fragment, useEffect, useState } from "react"
import { RotateCcw, Save } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  emptyPermissionSet,
  fullPermissionSet,
  permissionActionIds,
  permissionResources,
  toPermissionSet,
  toRolePermissions,
  type PermissionAction,
  type PermissionGroup,
  type PermissionSet,
} from "@/lib/permissions"
import {
  listRolesAction,
  updateRolePermissionsAction,
} from "@/lib/role-actions"
import type { RoleOption } from "@/lib/roles"

const actionColumns = permissionActionIds

const groupOrder: PermissionGroup[] = ["core", "settings", "apps", "system"]

function matrixForRole(role: RoleOption | undefined): PermissionSet {
  if (!role) return emptyPermissionSet()
  return role.isSuperAdmin
    ? fullPermissionSet()
    : toPermissionSet(role.permissions)
}

export default function RolesPage() {
  const t = useTranslations("Dashboard")
  const tr = useTranslations("Dashboard.roles")
  const tt = useTranslations("Dashboard.toast")

  const [roles, setRoles] = useState<RoleOption[]>([])
  const [activeRoleId, setActiveRoleId] = useState("")
  const [matrix, setMatrix] = useState<PermissionSet>(() =>
    emptyPermissionSet()
  )
  const [savedMatrix, setSavedMatrix] = useState<PermissionSet>(() =>
    emptyPermissionSet()
  )
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true

    listRolesAction().then((result) => {
      if (!active) return

      if (!result.success) {
        toast.error(result.error)
        return
      }

      setRoles(result.data)

      const first = result.data[0]

      if (first) {
        const next = matrixForRole(first)
        setActiveRoleId(first.id)
        setMatrix(next)
        setSavedMatrix(next)
      }
    })

    return () => {
      active = false
    }
  }, [])

  function roleLabel(role: RoleOption) {
    const slug = role.slug as never
    return tr.has(slug) ? tr(slug) : role.name
  }

  function selectRole(roleId: string) {
    const role = roles.find((entry) => entry.id === roleId)
    const next = matrixForRole(role)

    setActiveRoleId(roleId)
    setMatrix(next)
    setSavedMatrix(next)
  }

  function togglePermission(
    resourceId: string,
    action: PermissionAction,
    checked: boolean
  ) {
    setMatrix((current) => ({
      ...current,
      [resourceId]: {
        ...current[resourceId],
        [action]: checked,
      },
    }))
  }

  async function savePermissions() {
    if (!activeRoleId) return

    setSaving(true)
    const result = await updateRolePermissionsAction(
      activeRoleId,
      toRolePermissions(matrix)
    )
    setSaving(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    setRoles((current) =>
      current.map((role) =>
        role.id === result.data.id ? result.data : role
      )
    )
    setSavedMatrix(matrix)
    toast.success(tt("permissionsSaved"))
  }

  function resetPermissions() {
    setMatrix(savedMatrix)
  }

  const activeRole = roles.find((role) => role.id === activeRoleId)
  const locked = Boolean(activeRole?.isSuperAdmin)
  const groups = groupOrder
    .map((id) => ({
      id,
      label:
        id === "core"
          ? t("rolesPage.coreModules")
          : id === "settings"
            ? t("rolesPage.settingsModules")
            : id === "apps"
              ? t("rolesPage.applications")
              : t("rolesPage.system"),
    }))
    .filter((group) =>
      permissionResources.some((resource) => resource.group === group.id)
    )

  return (
    <>
      <PageHeader
        title={t("rolesPage.title")}
        description={t("rolesPage.description")}
      />

      <Card>
        <CardHeader>
          <CardTitle>{t("rolesPage.matrixTitle")}</CardTitle>
          <CardDescription>{t("rolesPage.matrixDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Tabs value={activeRoleId} onValueChange={selectRole}>
            <TabsList className="w-full max-w-xl">
              {roles.map((role) => (
                <TabsTrigger key={role.id} value={role.id} className="flex-1">
                  {roleLabel(role)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {locked ? (
            <p className="rounded-lg border border-dashed bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
              {t("rolesPage.superAdminHint")}
            </p>
          ) : (
            <p className="rounded-lg border border-dashed bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
              {t("rolesPage.roleHint")}
            </p>
          )}

          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[48rem] text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-3 py-2 text-start font-medium">
                    {t("rolesPage.resource")}
                  </th>
                  {actionColumns.map((action) => (
                    <th
                      key={action}
                      className="w-16 px-2 py-2 text-center font-medium"
                    >
                      {t(`rolesPage.actions.${action}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => (
                  <Fragment key={group.id}>
                    <tr className="bg-muted/20">
                      <td
                        colSpan={actionColumns.length + 1}
                        className="px-3 py-1.5 text-xs font-medium text-muted-foreground"
                      >
                        {group.label}
                      </td>
                    </tr>
                    {permissionResources
                      .filter((resource) => resource.group === group.id)
                      .map((resource) => (
                        <tr
                          key={resource.id}
                          className="border-t first:border-t-0"
                        >
                          <td className="px-3 py-2">
                            {t(resource.labelKey)}
                          </td>
                          {actionColumns.map((action) => {
                            const supported =
                              resource.actions.includes(action)
                            const resourceLocked =
                              locked || resource.id === "roles"

                            return (
                              <td
                                key={action}
                                className="px-2 py-2 text-center"
                              >
                                {supported ? (
                                  <div className="flex justify-center">
                                    <Checkbox
                                      checked={
                                        matrix[resource.id]?.[action] ?? false
                                      }
                                      disabled={resourceLocked}
                                      onCheckedChange={(checked) =>
                                        togglePermission(
                                          resource.id,
                                          action,
                                          checked
                                        )
                                      }
                                      aria-label={`${t(
                                        resource.labelKey
                                      )} — ${t(
                                        `rolesPage.actions.${action}`
                                      )}`}
                                    />
                                  </div>
                                ) : (
                                  <span
                                    aria-hidden="true"
                                    className="text-muted-foreground/50"
                                  >
                                    —
                                  </span>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              variant="outline"
              onClick={resetPermissions}
              disabled={!activeRoleId || locked}
            >
              <RotateCcw aria-hidden="true" />
              {t("rolesPage.reset")}
            </Button>
            <Button
              onClick={savePermissions}
              disabled={!activeRoleId || saving || locked}
            >
              <Save aria-hidden="true" />
              {t("rolesPage.save")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
