import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type StatusKind = "user" | "app" | "audit"

const tones = {
  success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  danger: "bg-destructive/10 text-destructive",
  info: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  muted: "bg-muted text-muted-foreground",
} as const

type Tone = keyof typeof tones

const toneByKind: Record<StatusKind, Record<string, Tone>> = {
  user: {
    active: "success",
    pending: "warning",
    suspended: "danger",
  },
  app: {
    active: "success",
    beta: "info",
    coming_soon: "muted",
  },
  audit: {
    success: "success",
    warning: "warning",
    failed: "danger",
  },
}

export function StatusBadge({
  kind,
  status,
  label,
  className,
}: {
  kind: StatusKind
  status: string
  label: string
  className?: string
}) {
  const tone = toneByKind[kind][status] ?? "muted"

  return (
    <Badge
      variant="outline"
      className={cn("border-transparent font-medium", tones[tone], className)}
    >
      {label}
    </Badge>
  )
}
