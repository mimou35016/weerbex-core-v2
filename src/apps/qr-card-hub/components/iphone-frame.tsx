import type { CSSProperties, ReactNode } from "react"
import { BatteryFull, Signal, Wifi } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * High-fidelity, purely decorative iPhone shell used for the card builder's
 * live preview. Width is controlled by the caller (`className`), the height
 * follows the real 9:19.5 aspect ratio, and the screen scrolls so long cards
 * still feel native.
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
      className={cn("relative mx-auto w-full max-w-[286px]", className)}
      style={style}
    >
      {/* Ambient glow so the device lifts off the dialog surface. */}
      <div
        aria-hidden="true"
        className="absolute -inset-6 -z-10 rounded-[4rem] bg-gradient-to-b from-primary/30 via-primary/5 to-transparent blur-2xl"
      />

      {/* Titanium outer frame */}
      <div className="relative aspect-[9/19.5] rounded-[3rem] bg-gradient-to-b from-zinc-500 via-zinc-800 to-zinc-950 p-[3px] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.75),0_2px_6px_rgba(0,0,0,0.35)] ring-1 ring-black/50">
        {/* Physical side buttons (physical left/right, not mirrored in RTL) */}
        <span
          aria-hidden="true"
          className="absolute -left-[3px] top-[16%] h-[5%] w-[3px] rounded-full bg-zinc-500"
        />
        <span
          aria-hidden="true"
          className="absolute -left-[3px] top-[23%] h-[8%] w-[3px] rounded-full bg-zinc-500"
        />
        <span
          aria-hidden="true"
          className="absolute -left-[3px] top-[32.5%] h-[8%] w-[3px] rounded-full bg-zinc-500"
        />
        <span
          aria-hidden="true"
          className="absolute -right-[3px] top-[25%] h-[11%] w-[3px] rounded-full bg-zinc-500"
        />

        {/* Black bezel */}
        <div className="relative h-full w-full rounded-[2.78rem] bg-black p-[6px] ring-1 ring-white/10">
          {/* Screen */}
          <div className="relative h-full w-full overflow-hidden rounded-[2.4rem] bg-black">
            <div
              role="group"
              aria-label={label}
              className="absolute inset-0 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {children}
            </div>

            {/* Screen glare */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-tr from-white/0 via-white/0 to-white/10"
            />

            {/* Status bar */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between px-6 pt-2 text-[9px] font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
            >
              <span>9:41</span>
              <span className="flex items-center gap-1">
                <Signal className="size-2.5" />
                <Wifi className="size-2.5" />
                <BatteryFull className="size-3" />
              </span>
            </div>

            {/* Dynamic Island */}
            <div
              aria-hidden="true"
              className="absolute top-1.5 left-1/2 z-40 flex h-[19px] w-[36%] max-w-[74px] -translate-x-1/2 items-center justify-end rounded-full bg-black pr-1.5 ring-1 ring-white/5"
            >
              <span className="size-1.5 rounded-full bg-zinc-800 ring-1 ring-zinc-700" />
            </div>

            {/* Home indicator */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-1 z-30 flex justify-center"
            >
              <span className="h-1 w-[36%] max-w-[104px] rounded-full bg-white/75" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
