import type { CSSProperties, ReactNode } from "react"
import { BatteryFull, Signal, Wifi } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * High-fidelity, purely decorative iPhone shell used for the card builder's
 * live preview. Width is controlled by the caller (`className`), the height
 * follows the real 9:19.5 aspect ratio, and the screen scrolls so long cards
 * still feel native.
 *
 * The status strip sits above the scroll area (like Safari on iOS), so the
 * card inside is never covered by the Dynamic Island.
 */
export function IphoneFrame({
  children,
  label,
  className,
  style,
}: {
  children: ReactNode
  label?: string
  className?: string
  style?: CSSProperties
}) {
  return (
    <div
      className={cn("relative mx-auto w-full max-w-[300px]", className)}
      style={style}
    >
      {/* Ambient glow so the device lifts off the dialog surface. */}
      <div
        aria-hidden="true"
        className="absolute -inset-6 -z-10 rounded-[4rem] bg-gradient-to-b from-primary/30 via-primary/5 to-transparent blur-2xl"
      />

      {/* Titanium outer frame */}
      <div className="relative aspect-[9/19.5] rounded-[3.1rem] bg-gradient-to-b from-zinc-400 via-zinc-700 to-zinc-900 p-[2.5px] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.75),0_2px_6px_rgba(0,0,0,0.35)] ring-1 ring-black/40">
        {/* Physical side buttons (physical left/right, not mirrored in RTL) */}
        <span
          aria-hidden="true"
          className="absolute -left-[3px] top-[15%] h-[4.5%] w-[3px] rounded-full bg-zinc-500"
        />
        <span
          aria-hidden="true"
          className="absolute -left-[3px] top-[22%] h-[7.5%] w-[3px] rounded-full bg-zinc-500"
        />
        <span
          aria-hidden="true"
          className="absolute -left-[3px] top-[31%] h-[7.5%] w-[3px] rounded-full bg-zinc-500"
        />
        <span
          aria-hidden="true"
          className="absolute -right-[3px] top-[24%] h-[10.5%] w-[3px] rounded-full bg-zinc-500"
        />

        {/* Black bezel */}
        <div className="relative h-full w-full rounded-[2.95rem] bg-black p-[6px] ring-1 ring-white/10">
          {/* Screen */}
          <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[2.6rem] bg-black">
            {/* Status bar + Dynamic Island */}
            <div className="relative z-30 flex h-7 shrink-0 items-center justify-between bg-black px-5 pt-0.5 text-[9px] font-semibold text-white">
              <span>9:41</span>
              <span className="flex items-center gap-1">
                <Signal className="size-2.5" aria-hidden="true" />
                <Wifi className="size-2.5" aria-hidden="true" />
                <BatteryFull className="size-3" aria-hidden="true" />
              </span>
              <span
                aria-hidden="true"
                className="absolute top-1/2 left-1/2 flex h-[18px] w-[33%] max-w-[76px] -translate-x-1/2 -translate-y-1/2 items-center justify-end rounded-full bg-black pr-1.5 ring-1 ring-white/10"
              >
                <span className="size-1.5 rounded-full bg-zinc-900 ring-1 ring-zinc-700/70" />
              </span>
            </div>

            {/* Scrollable screen content */}
            <div
              role="group"
              aria-label={label}
              className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain bg-black [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {children}
            </div>

            {/* Home indicator */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-1.5 z-30 flex justify-center"
            >
              <span className="h-1 w-[32%] max-w-[96px] rounded-full bg-white/80 shadow-[0_0_2px_rgba(0,0,0,0.65)]" />
            </div>

            {/* Screen glare */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-tr from-white/0 via-white/0 to-white/10"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
