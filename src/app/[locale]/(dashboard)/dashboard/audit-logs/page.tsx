"use client"

import { useEffect, useState } from "react"
import { Download } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import { toast } from "sonner"

import { useCurrentUser } from "@/components/dashboard/current-user-provider"
import { FilterSelect, type FilterOption } from "@/components/dashboard/filter-select"
import { PageHeader } from "@/components/dashboard/page-header"
import { SearchInput } from "@/components/dashboard/search-input"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { listAuditLogsAction } from "@/lib/audit-actions"
import type { AuditEntry } from "@/lib/audit-types"
import { hasPermission } from "@/lib/permissions"

export default function AuditLogsPage() {
  const t = useTranslations("Dashboard")
  const ts = useTranslations("Dashboard.auditStatus")
  const tac = useTranslations("Dashboard.audit.actions")
  const format = useFormatter()
  const currentUser = useCurrentUser()

  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [logs, setLogs] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    listAuditLogsAction().then((result) => {
      if (!active) return

      if (result.success) {
        setLogs(result.data)
      } else {
        toast.error(result.error)
      }

      setLoading(false)
    })

    return () => {
      active = false
    }
  }, [])

  const statusOptions: FilterOption[] = [
    { value: "all", label: t("common.allStatuses") },
    { value: "success", label: ts("success") },
    { value: "warning", label: ts("warning") },
    { value: "failed", label: ts("failed") },
  ]

  const actionLabel = (action: string) =>
    tac.has(action) ? tac(action) : action

  const normalizedQuery = query.trim().toLowerCase()
  const filteredLogs = logs.filter((log) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      `${actionLabel(log.action)} ${log.actor} ${log.target} ${log.ip}`
        .toLowerCase()
        .includes(normalizedQuery)
    const matchesStatus =
      statusFilter === "all" || log.status === statusFilter

    return matchesQuery && matchesStatus
  })

  const canExport = hasPermission(currentUser, "audit", "export")

  function exportLogs() {
    if (!canExport || filteredLogs.length === 0) return

    const rows = [
      [
        t("audit.table.action"),
        t("audit.table.user"),
        t("audit.table.target"),
        t("audit.table.ip"),
        t("audit.table.status"),
        t("audit.table.timestamp"),
      ],
      ...filteredLogs.map((log) => [
        actionLabel(log.action),
        log.actor,
        log.target,
        log.ip,
        ts(log.status),
        log.timestamp,
      ]),
    ]

    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    link.href = url
    link.download = "audit-logs.csv"
    link.click()
    URL.revokeObjectURL(url)
    toast.success(t("audit.exported"))
  }

  return (
    <>
      <PageHeader
        title={t("audit.title")}
        description={t("audit.description")}
      >
        {canExport && (
          <Button
            variant="outline"
            onClick={exportLogs}
            disabled={filteredLogs.length === 0}
          >
            <Download aria-hidden="true" />
            {t("audit.export")}
          </Button>
        )}
      </PageHeader>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder={t("audit.searchPlaceholder")}
        />
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={statusOptions}
          ariaLabel={t("audit.statusFilter")}
        />
        <span className="text-sm text-muted-foreground sm:ms-auto">
          {t("audit.results", { count: filteredLogs.length })}
        </span>
      </div>

      <Card className="py-0">
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-start">{t("audit.table.action")}</TableHead>
                <TableHead className="text-start">{t("audit.table.user")}</TableHead>
                <TableHead className="text-start">{t("audit.table.target")}</TableHead>
                <TableHead className="text-start">{t("audit.table.ip")}</TableHead>
                <TableHead className="text-start">{t("audit.table.status")}</TableHead>
                <TableHead className="text-start">{t("audit.table.timestamp")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    {loading ? t("audit.loading") : t("audit.empty")}
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">
                      {actionLabel(log.action)}
                    </TableCell>
                    <TableCell>{log.actor}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {log.target}
                    </TableCell>
                    <TableCell className="text-muted-foreground" dir="ltr">
                      {log.ip}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        kind="audit"
                        status={log.status}
                        label={ts(log.status)}
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format.dateTime(new Date(log.timestamp), {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
