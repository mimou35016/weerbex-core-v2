"use client"

import { useEffect, useRef, useState } from "react"
import { FileCode2, FileImage, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { buildQrOptions, qrFileBaseName } from "../lib/qr-options"
import type { QrCodeData } from "../lib/types"

/**
 * Small, scannable rendering of a stored code. It is intentionally rendered
 * at 128px and scaled down with CSS so table rows stay cheap.
 */
export function QrThumbnail({
  item,
  origin,
  className,
}: {
  item: QrCodeData
  origin: string
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    const container = containerRef.current

    if (!item.content.trim()) {
      if (container) container.innerHTML = ""
      return
    }

    void (async () => {
      const mod = await import("qr-code-styling")

      if (cancelled || !container) return

      const instance = new mod.default(
        buildQrOptions(item, item.content, origin, 128)
      )

      container.innerHTML = ""
      instance.append(container)
    })()

    return () => {
      cancelled = true
      if (container) container.innerHTML = ""
    }
  }, [item, origin])

  return (
    <div
      className={cn(
        "size-11 shrink-0 overflow-hidden rounded-md border bg-white p-0.5 shadow-xs",
        className
      )}
      aria-hidden="true"
    >
      <div
        ref={containerRef}
        className="size-full [&>canvas]:size-full [&>canvas]:object-contain [&>svg]:size-full"
      />
    </div>
  )
}

/**
 * Downloads a stored code at its configured export size. The instance is
 * created on demand (never appended) so listing 200 codes stays light.
 */
export function QrDownloadButtons({
  item,
  origin,
  pngLabel,
  svgLabel,
  errorLabel,
}: {
  item: QrCodeData
  origin: string
  pngLabel: string
  svgLabel: string
  errorLabel: string
}) {
  const [busy, setBusy] = useState<"png" | "svg" | null>(null)

  async function download(extension: "png" | "svg") {
    if (busy || !item.content.trim()) return

    setBusy(extension)

    try {
      const mod = await import("qr-code-styling")
      const instance = new mod.default(
        buildQrOptions(item, item.content, origin, item.size)
      )

      await instance.download({
        name: qrFileBaseName(item.title),
        extension,
      })
    } catch {
      toast.error(errorLabel)
    } finally {
      setBusy(null)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => download("png")}
        disabled={busy !== null}
        aria-label={pngLabel}
        title={pngLabel}
      >
        {busy === "png" ? (
          <Loader2 aria-hidden="true" className="animate-spin" />
        ) : (
          <FileImage aria-hidden="true" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => download("svg")}
        disabled={busy !== null}
        aria-label={svgLabel}
        title={svgLabel}
      >
        {busy === "svg" ? (
          <Loader2 aria-hidden="true" className="animate-spin" />
        ) : (
          <FileCode2 aria-hidden="true" />
        )}
      </Button>
    </>
  )
}
