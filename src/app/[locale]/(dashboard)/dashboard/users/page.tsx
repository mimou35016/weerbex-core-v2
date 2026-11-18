"use client"

import { useEffect, useState } from "react"
import { Ban, Ellipsis, PenLine, Plus, Trash2, UserCheck } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import { toast } from "sonner"

import { useCurrentUser } from "@/components/dashboard/current-user-provider"
import { FilterSelect, type FilterOption } from "@/components/dashboard/filter-select"
import { PageHeader } from "@/components/dashboard/page-header"
import { SearchInput } from "@/components/dashboard/search-input"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getInitials } from "@/lib/initials"
import { hasPermission } from "@/lib/permissions"
import { listRoleOptionsAction } from "@/lib/role-actions"
import type { RoleOption } from "@/lib/roles"
import {
  createUserAction,
  deleteUserAction,
  listUsersAction,
  updateUserAction,
} from "@/lib/user-actions"
import { type DashboardUser, type UserStatus } from "@/lib/users"

type UserForm = {
  name: string
  email: string
  roleId: string
  status: UserStatus
}

const emptyForm: UserForm = {
  name: "",
  email: "",
  roleId: "",
  status: "active",
}

function getDefaultRoleId(roles: RoleOption[]) {
  return (
    roles.find((role) => role.isDefault)?.id ??
    roles[roles.length - 1]?.id ??
    ""
  )
}

export default function UsersPage() {
  const t = useTranslations("Dashboard")
  const tr = useTranslations("Dashboard.roles")
  const ts = useTranslations("Dashboard.status")
  const tc = useTranslations("Dashboard.common")
  const tt = useTranslations("Dashboard.toast")
  const format = useFormatter()
  const currentUser = useCurrentUser()

  const [users, setUsers] = useState<DashboardUser[]>([])
  const [roles, setRoles] = useState<RoleOption[]>([])
  const [query, setQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<DashboardUser | null>(null)
  const [form, setForm] = useState<UserForm>(emptyForm)

  useEffect(() => {
    let active = true

    Promise.all([listUsersAction(), listRoleOptionsAction()]).then(
      ([usersResult, rolesResult]) => {
        if (!active) return

        if (usersResult.success) {
          setUsers(usersResult.data)
        } else {
          toast.error(usersResult.error)
        }

        if (rolesResult.success) {
          setRoles(rolesResult.data)
          setForm((current) =>
            current.roleId
              ? current
              : {
                  ...current,
                  roleId: getDefaultRoleId(rolesResult.data),
                }
          )
        } else {
          toast.error(rolesResult.error)
        }
      }
    )

    return () => {
      active = false
    }
  }, [])

  function roleLabel(role: { slug: string; name: string }) {
    const slug = role.slug as never
    return tr.has(slug) ? tr(slug) : role.name
  }

  const roleOptions: FilterOption[] = [
    { value: "all", label: tc("allRoles") },
    ...roles.map((role) => ({ value: role.slug, label: roleLabel(role) })),
  ]

  const statusOptions: FilterOption[] = [
    { value: "all", label: tc("allStatuses") },
    { value: "active", label: ts("active") },
    { value: "pending", label: ts("pending") },
    { value: "suspended", label: ts("suspended") },
  ]

  const normalizedQuery = query.trim().toLowerCase()
  const filteredUsers = users.filter((user) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      `${user.name} ${user.email}`.toLowerCase().includes(normalizedQuery)
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter

    return matchesQuery && matchesRole && matchesStatus
  })

  function openAddDialog() {
    setEditing(null)
    setForm({ ...emptyForm, roleId: getDefaultRoleId(roles) })
    setDialogOpen(true)
  }

  function openEditDialog(user: DashboardUser) {
    setEditing(user)
    setForm({
      name: user.name,
      email: user.email,
      roleId: user.roleId ?? getDefaultRoleId(roles),
      status: user.status,
    })
    setDialogOpen(true)
  }

  async function saveUser() {
    if (!form.name.trim() || !form.email.trim()) return

    if (editing) {
      const result = await updateUserAction(editing.id, {
        name: form.name,
        email: form.email,
        roleId: form.roleId || undefined,
        status: form.status,
      })

      if (!result.success) {
        toast.error(result.error)
        return
      }

      setUsers((current) =>
        current.map((user) => (user.id === editing.id ? result.data : user))
      )
      toast.success(tt("userUpdated"))
    } else {
      const result = await createUserAction({
        name: form.name,
        email: form.email,
        roleId: form.roleId || undefined,
        status: form.status,
      })

      if (!result.success) {
        toast.error(result.error)
        return
      }

      setUsers((current) => [result.data, ...current])
      toast.success(tt("userAdded"))
    }

    setDialogOpen(false)
  }

  async function toggleUserStatus(user: DashboardUser) {
    const nextStatus: UserStatus =
      user.status === "suspended" ? "active" : "suspended"

    const result = await updateUserAction(user.id, {
      name: user.name,
      email: user.email,
      roleId: user.roleId ?? undefined,
      status: nextStatus,
    })

    if (!result.success) {
      toast.error(result.error)
      return
    }

    setUsers((current) =>
      current.map((entry) => (entry.id === user.id ? result.data : entry))
    )
    toast.success(
      nextStatus === "active" ? tt("userActivated") : tt("userSuspended")
    )
  }

  async function deleteUser(user: DashboardUser) {
    const result = await deleteUserAction(user.id)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    setUsers((current) => current.filter((entry) => entry.id !== user.id))
    toast.success(tt("userDeleted"))
  }

  const canCreate = hasPermission(currentUser, "users", "create")
  const canUpdate = hasPermission(currentUser, "users", "update")
  const canDelete = hasPermission(currentUser, "users", "delete")
  const canSave = form.name.trim().length > 0 && form.email.trim().length > 0
  const selectedRole = roles.find((role) => role.id === form.roleId)
  const readOnlyRole =
    selectedRole ??
    (editing
      ? { slug: editing.role, name: editing.roleName }
      : currentUser
        ? { slug: currentUser.role, name: currentUser.roleName }
        : null)

  return (
    <>
      <PageHeader
        title={t("users.title")}
        description={t("users.description")}
      >
        {canCreate && (
          <Button onClick={openAddDialog}>
            <Plus aria-hidden="true" />
            {t("users.add")}
          </Button>
        )}
      </PageHeader>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder={t("users.searchPlaceholder")}
        />
        <FilterSelect
          value={roleFilter}
          onChange={setRoleFilter}
          options={roleOptions}
          ariaLabel={tc("role")}
        />
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={statusOptions}
          ariaLabel={tc("status")}
        />
        <span className="text-sm text-muted-foreground lg:ms-auto">
          {t("users.results", { count: filteredUsers.length })}
        </span>
      </div>

      <Card className="py-0">
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-start">{t("users.table.user")}</TableHead>
                <TableHead className="text-start">{t("users.table.role")}</TableHead>
                <TableHead className="text-start">{t("users.table.status")}</TableHead>
                <TableHead className="text-start">{t("users.table.joined")}</TableHead>
                <TableHead className="text-end">{t("users.table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    {t("users.empty")}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar size="sm">
                          <AvatarFallback>
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {roleLabel({ slug: user.role, name: user.roleName })}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        kind="user"
                        status={user.status}
                        label={ts(user.status)}
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format.dateTime(new Date(user.joined), {
                        dateStyle: "medium",
                      })}
                    </TableCell>
                    <TableCell className="text-end">
                      {(canUpdate || canDelete) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={tc("actions")}
                              />
                            }
                          >
                            <Ellipsis aria-hidden="true" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {canUpdate && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => openEditDialog(user)}
                                >
                                  <PenLine aria-hidden="true" />
                                  {tc("edit")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => toggleUserStatus(user)}
                                >
                                  {user.status === "suspended" ? (
                                    <UserCheck aria-hidden="true" />
                                  ) : (
                                    <Ban aria-hidden="true" />
                                  )}
                                  {user.status === "suspended"
                                    ? t("users.activate")
                                    : t("users.suspend")}
                                </DropdownMenuItem>
                              </>
                            )}
                            {canUpdate && canDelete && (
                              <DropdownMenuSeparator />
                            )}
                            {canDelete && (
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => deleteUser(user)}
                              >
                                <Trash2 aria-hidden="true" />
                                {tc("delete")}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? t("users.editTitle") : t("users.addTitle")}
            </DialogTitle>
            <DialogDescription>
              {editing ? t("users.editDescription") : t("users.addDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="user-name">{t("users.fullName")}</Label>
              <Input
                id="user-name"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder={t("users.fullNamePlaceholder")}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="user-email">{tc("email")}</Label>
              <Input
                id="user-email"
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                placeholder={t("users.emailPlaceholder")}
                dir="ltr"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label>{tc("role")}</Label>
                {currentUser?.isSuperAdmin && roles.length > 0 ? (
                  <FilterSelect
                    value={form.roleId}
                    onChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        roleId: value,
                      }))
                    }
                    options={roles.map((role) => ({
                      value: role.id,
                      label: roleLabel(role),
                    }))}
                    ariaLabel={tc("role")}
                    className="w-full sm:w-full"
                  />
                ) : (
                  <div className="flex h-9 items-center rounded-md border border-input px-3 text-sm">
                    {readOnlyRole
                      ? roleLabel(readOnlyRole)
                      : ""}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>{tc("status")}</Label>
                <FilterSelect
                  value={form.status}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      status: value as UserStatus,
                    }))
                  }
                  options={[
                    { value: "active", label: ts("active") },
                    { value: "pending", label: ts("pending") },
                    { value: "suspended", label: ts("suspended") },
                  ]}
                  ariaLabel={tc("status")}
                  className="w-full sm:w-full"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {tc("cancel")}
            </Button>
            <Button onClick={saveUser} disabled={!canSave}>
              {t("users.saveUser")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
