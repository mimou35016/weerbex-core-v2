"use client"

import { Fragment, useState } from "react"
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
import { roleOrder, type DashboardRole } from "@/config/dashboard-nav"
import {
  defaultPermissionMatrix,
  permissionResources,
  type PermissionAction,
  type PermissionMatrix,
} from "@/config/dashboard-mock-data"

const actions: PermissionAction[] = ["read", "write", "delete"]

function cloneMatrix(matrix: PermissionMatrix): PermissionMatrix {
  return JSON.parse(JSON.stringify(matrix)) as PermissionMatrix
}

export default function RolesPage() {
  const t = useTranslations("Dashboard")
  const tr = useTranslations("Dashboard.roles")
  const tt = useTranslations("Dashboard.toast")

  const [role, setRole] = useState<DashboardRole>("super_admin")
  const [matrix, setMatrix] = useState<PermissionMatrix>(() =>
    cloneMatrix(defaultPermissionMatrix)
  )

  function togglePermission(
    resourceId: string,
    action: PermissionAction,
    checked: boolean
  ) {
    setMatrix((current) => ({
      ...current,
      [role]: {
        ...current[role],
        [resourceId]: {
          ...current[role][resourceId],
          [action]: checked,
        },
      },
    }))
  }

  function savePermissions() {
    toast.success(tt("permissionsSaved"))
  }

  function resetPermissions() {
    setMatrix(cloneMatrix(defaultPermissionMatrix))
  }

  const groups: Array<{ id: "core" | "apps"; label: string }> = [
    { id: "core", label: t("rolesPage.coreModules") },
    { id: "apps", label: t("rolesPage.applications") },
  ]

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
          <Tabs
            value={role}
            onValueChange={(value) => setRole(value as DashboardRole)}
          >
            <TabsList className="w-full max-w-xl">
              {roleOrder.map((entry) => (
                <TabsTrigger key={entry} value={entry} className="flex-1">
                  {tr(entry)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-3 py-2 text-start font-medium">
                    {t("rolesPage.resource")}
                  </th>
                  {actions.map((action) => (
                    <th
                      key={action}
                      className="w-20 px-3 py-2 text-center font-medium"
                    >
                      {t(`rolesPage.${action}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => (
                  <Fragment key={group.id}>
                    <tr className="bg-muted/20">
                      <td
                        colSpan={4}
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
                          {actions.map((action) => (
                            <td
                              key={action}
                              className="px-3 py-2 text-center"
                            >
                              <div className="flex justify-center">
                                <Checkbox
                                  checked={
                                    matrix[role][resource.id]?.[action] ?? false
                                  }
                                  onCheckedChange={(checked) =>
                                    togglePermission(
                                      resource.id,
                                      action,
                                      checked
                                    )
                                  }
                                  aria-label={`${t(resource.labelKey)} — ${t(
                                    `rolesPage.${action}`
                                  )}`}
                                />
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button variant="outline" onClick={resetPermissions}>
              <RotateCcw aria-hidden="true" />
              {t("rolesPage.reset")}
            </Button>
            <Button onClick={savePermissions}>
              <Save aria-hidden="true" />
              {t("rolesPage.save")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
