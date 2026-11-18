"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export type FilterOption = {
  value: string
  label: string
}

export function FilterSelect({
  value,
  onChange,
  options,
  ariaLabel,
  className,
}: {
  value: string
  onChange: (value: string) => void
  options: FilterOption[]
  ariaLabel: string
  className?: string
}) {
  return (
    <Select
      value={value}
      onValueChange={(next) => onChange(next ?? options[0].value)}
    >
      <SelectTrigger
        className={cn("w-full sm:w-[180px]", className)}
        aria-label={ariaLabel}
      >
        <SelectValue>
          {(selected: string | null) =>
            options.find((option) => option.value === selected)?.label ??
            options[0]?.label
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
