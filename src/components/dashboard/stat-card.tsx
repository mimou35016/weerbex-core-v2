import type { LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const toneClasses = {
  primary: "bg-primary/10 text-primary",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  sky: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
} as const

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "primary",
}: {
  icon: LucideIcon
  label: string
  value: string | number
  hint?: string
  tone?: keyof typeof toneClasses
}) {
  return (
    <Card size="sm">
      <CardContent className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className="text-2xl font-semibold tracking-tight tabular-nums">
            {value}
          </span>
          {hint && (
            <span className="text-xs text-muted-foreground">{hint}</span>
          )}
        </div>
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            toneClasses[tone]
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </CardContent>
    </Card>
  )
}
