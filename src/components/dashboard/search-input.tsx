"use client"

import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function SearchInput({
  value,
  onChange,
  placeholder,
  ariaLabel,
  className,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  ariaLabel?: string
  className?: string
}) {
  return (
    <div className={cn("relative w-full sm:max-w-xs", className)}>
      <Search
        className="pointer-events-none absolute top-1/2 start-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className="ps-9"
      />
    </div>
  )
}
