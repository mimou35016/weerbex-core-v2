"use client"

import { useEffect, useState } from "react"
import { Ban, Ellipsis, PenLine, Plus, Trash2, UserCheck } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import { toast } from "sonner"

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
import {
  roleOrder,
  type DashboardRole,
} from "@/config/dashboard-nav"
import { getInitials } from "@/lib/initials"
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
  role: DashboardRole
  status: UserStatus
}

const emptyForm: UserForm = {
  name: "",
  email: "",
  role: "user",
  status: "active",
}

export default function UsersPage() {
  const t = useTranslations("Dashboard")
  const tr = useTranslations("Dashboard.roles")
  const ts = useTranslations("Dashboard.status")
  const tc = useTranslations("Dashboard.common")
  const tt = useTranslations("Dashboard.toast")
  const format = useFormatter()

  const [users, setUsers] = useState<DashboardUser[]>([])
  const [query, setQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<DashboardUser | null>(null)
  const [form, setForm] = useState<UserForm>(emptyForm)

  useEffect(() => {
    let active = true

    listUsersAction().then((result) => {
      if (!active) return

      if (result.success) {
        setUsers(result.data)
      } else {
        toast.error(result.error)
      }
    })

    return () => {
      active = false
    }
  }, [])

  const roleOptions: FilterOption[] = [
    { value: "all", label: tc("allRoles") },
    ...roleOrder.map((role) => ({ value: role, label: tr(role) })),
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
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEditDialog(user: DashboardUser) {
    setEditing(user)
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    })
    setDialogOpen(true)
  }

  async function saveUser() {
    if (!form.name.trim() || !form.email.trim()) return

    if (editing) {
      const result = await updateUserAction(editing.id, form)

      if (!result.success) {
        toast.error(result.error)
        return
      }

      setUsers((current) =>
        current.map((user) => (user.id === editing.id ? result.data : user))
      )
      toast.success(tt("userUpdated"))
    } else {
      const result = await createUserAction(form)

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
      role: user.role,
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

  const canSave = form.name.trim().length > 0 && form.email.trim().length > 0

  return (
    <>
      <PageHeader
        title={t("users.title")}
        description={t("users.description")}
      >
        <Button onClick={openAddDialog}>
          <Plus aria-hidden="true" />
          {t("users.add")}
        </Button>
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
                      <Badge variant="secondary">{tr(user.role)}</Badge>
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
                          <DropdownMenuItem onClick={() => openEditDialog(user)}>
                            <PenLine aria-hidden="true" />
                            {tc("edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleUserStatus(user)}>
                            {user.status === "suspended" ? (
                              <UserCheck aria-hidden="true" />
                            ) : (
                              <Ban aria-hidden="true" />
                            )}
                            {user.status === "suspended"
                              ? t("users.activate")
                              : t("users.suspend")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => deleteUser(user)}
                          >
                            <Trash2 aria-hidden="true" />
                            {tc("delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
                <FilterSelect
                  value={form.role}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      role: value as DashboardRole,
                    }))
                  }
                  options={roleOrder.map((role) => ({
                    value: role,
                    label: tr(role),
                  }))}
                  ariaLabel={tc("role")}
                  className="w-full sm:w-full"
                />
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
