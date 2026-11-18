import { cn } from "@/lib/utils"

import type { CardTemplateId } from "../lib/types"

/**
 * Tiny, purely decorative layout preview shown inside the template picker.
 * It uses the card's current colors so the choice feels live.
 */
export function TemplateMock({
  template,
  brandColor,
  accentColor,
  className,
}: {
  template: CardTemplateId
  brandColor: string
  accentColor: string
  className?: string
}) {
  const shell = cn(
    "relative h-20 w-full overflow-hidden rounded-md border shadow-xs sm:h-24",
    className
  )

  if (template === "corporate") {
    return (
      <div className={cn(shell, "bg-card")} aria-hidden="true">
        <div
          className="flex h-7 items-center gap-1.5 px-2"
          style={{ backgroundColor: brandColor }}
        >
          <span className="size-4 shrink-0 rounded-full bg-white/50" />
          <span className="flex min-w-0 flex-col gap-1">
            <span className="h-1 w-10 rounded-full bg-white/80" />
            <span className="h-1 w-7 rounded-full bg-white/45" />
          </span>
        </div>
        <div className="flex flex-col gap-1 p-2">
          <span className="h-1 w-full rounded-full bg-muted-foreground/20" />
          <span className="h-1 w-3/4 rounded-full bg-muted-foreground/20" />
          <span className="mt-0.5 h-1 w-1/2 rounded-full bg-muted-foreground/35" />
          <span className="h-1 w-2/3 rounded-full bg-muted-foreground/20" />
        </div>
      </div>
    )
  }

  if (template === "cyber") {
    return (
      <div className={cn(shell, "border-slate-800 bg-slate-950")} aria-hidden="true">
        <span
          className="absolute -top-3 -right-3 size-10 rounded-full opacity-50 blur-lg"
          style={{ backgroundColor: brandColor }}
        />
        <span
          className="absolute -bottom-3 -left-3 size-10 rounded-full opacity-40 blur-lg"
          style={{ backgroundColor: accentColor }}
        />
        <div className="relative flex h-full flex-col gap-1.5 p-2">
          <div className="flex items-center gap-1.5">
            <span
              className="size-4 shrink-0 rounded-full ring-1 ring-slate-700"
              style={{
                background: `linear-gradient(135deg, ${brandColor}, ${accentColor})`,
              }}
            />
            <span className="flex flex-col gap-1">
              <span className="h-1 w-10 rounded-full bg-slate-300" />
              <span
                className="h-0.5 w-7 rounded-full"
                style={{ backgroundColor: accentColor }}
              />
            </span>
          </div>
          <span className="h-px w-full bg-slate-800" />
          <span className="h-1 w-full rounded-full bg-slate-700" />
          <span className="h-1 w-3/4 rounded-full bg-slate-700" />
          <span className="mt-auto h-2.5 w-full rounded border border-slate-700 bg-slate-800/80" />
        </div>
      </div>
    )
  }

  if (template === "glass") {
    return (
      <div
        className={cn(shell, "border-white/20")}
        style={{
          background: `linear-gradient(140deg, ${brandColor}, ${accentColor})`,
        }}
        aria-hidden="true"
      >
        <span className="absolute -top-4 -right-4 size-12 rounded-full bg-white/40 blur-lg" />
        <span className="absolute -bottom-5 -left-4 size-12 rounded-full bg-black/30 blur-lg" />
        <div className="relative m-1.5 flex h-[calc(100%-0.75rem)] flex-col gap-1 rounded-md border border-white/30 bg-white/15 p-1.5 backdrop-blur-sm">
          <div className="flex items-center gap-1.5">
            <span className="size-4 shrink-0 rounded-full bg-white/60 ring-1 ring-white/60" />
            <span className="flex flex-col gap-1">
              <span className="h-1 w-9 rounded-full bg-white/85" />
              <span className="h-0.5 w-6 rounded-full bg-white/55" />
            </span>
          </div>
          <span className="mt-auto h-2.5 w-full rounded border border-white/30 bg-white/20" />
          <span className="h-2.5 w-full rounded border border-white/30 bg-white/20" />
        </div>
      </div>
    )
  }

  return (
    <div className={cn(shell, "bg-card")} aria-hidden="true">
      <div
        className="h-7 w-full"
        style={{
          background: `linear-gradient(135deg, ${brandColor}, ${accentColor})`,
        }}
      />
      <div className="px-2">
        <span
          className="-mt-3 block size-6 rounded-full border-2 border-card"
          style={{
            background: `linear-gradient(135deg, ${brandColor}, ${accentColor})`,
          }}
        />
        <span className="mt-1 block h-1.5 w-12 rounded-full bg-foreground/70" />
        <span
          className="mt-1 block h-1 w-8 rounded-full"
          style={{ backgroundColor: brandColor }}
        />
        <span className="mt-1 block h-1 w-14 rounded-full bg-muted-foreground/25" />
      </div>
    </div>
  )
}
