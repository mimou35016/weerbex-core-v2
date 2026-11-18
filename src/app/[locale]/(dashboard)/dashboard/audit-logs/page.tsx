"use client"

import { useState } from "react"
import { useFormatter, useTranslations } from "next-intl"

import { FilterSelect, type FilterOption } from "@/components/dashboard/filter-select"
import { PageHeader } from "@/components/dashboard/page-header"
import { SearchInput } from "@/components/dashboard/search-input"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { mockAuditLogs } from "@/config/dashboard-mock-data"

export default function AuditLogsPage() {
  const t = useTranslations("Dashboard")
  const ts = useTranslations("Dashboard.auditStatus")
  const format = useFormatter()

  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const statusOptions: FilterOption[] = [
    { value: "all", label: t("common.allStatuses") },
    { value: "success", label: ts("success") },
    { value: "warning", label: ts("warning") },
    { value: "failed", label: ts("failed") },
  ]

  const normalizedQuery = query.trim().toLowerCase()
  const filteredLogs = mockAuditLogs.filter((log) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      `${t(log.actionKey)} ${log.user} ${log.target} ${log.ip}`
        .toLowerCase()
        .includes(normalizedQuery)
    const matchesStatus =
      statusFilter === "all" || log.status === statusFilter

    return matchesQuery && matchesStatus
  })

  return (
    <>
      <PageHeader
        title={t("audit.title")}
        description={t("audit.description")}
      />

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
                    {t("audit.empty")}
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">
                      {t(log.actionKey)}
                    </TableCell>
                    <TableCell>{log.user}</TableCell>
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
