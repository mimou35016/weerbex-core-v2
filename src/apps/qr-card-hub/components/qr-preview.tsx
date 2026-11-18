"use client"

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"
import type QRCodeStyling from "qr-code-styling"
import type { FileExtension } from "qr-code-styling"

import { cn } from "@/lib/utils"

import { buildQrOptions, qrFileBaseName } from "../lib/qr-options"
import type { QrFormData } from "../lib/types"

export type QrPreviewHandle = {
  download: (extension: FileExtension) => Promise<void>
  ready: boolean
}

type QrPreviewProps = {
  form: QrFormData
  content: string
  origin: string
  className?: string
  emptyLabel: string
  ariaLabel: string
}

export const QrPreview = forwardRef<QrPreviewHandle, QrPreviewProps>(
  function QrPreview(
    { form, content, origin, className, emptyLabel, ariaLabel },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null)
    const instanceRef = useRef<QRCodeStyling | null>(null)
    const [ready, setReady] = useState(false)

    useImperativeHandle(
      ref,
      () => ({
        ready,
        download: async (extension) => {
          const instance = instanceRef.current

          if (!instance) return

          await instance.download({
            name: qrFileBaseName(form.title),
            extension,
          })
        },
      }),
      [form.title, ready]
    )

    useEffect(() => {
      let cancelled = false

      if (!content.trim()) {
        instanceRef.current = null
        setReady(false)

        if (containerRef.current) {
          containerRef.current.innerHTML = ""
        }

        return
      }

      async function render() {
        const mod = await import("qr-code-styling")

        if (cancelled || !containerRef.current) return

        const options = buildQrOptions(form, content, origin)

        if (!instanceRef.current) {
          const instance = new mod.default(options)
          instanceRef.current = instance
          containerRef.current.innerHTML = ""
          instance.append(containerRef.current)
        } else {
          instanceRef.current.update(options)
        }

        setReady(true)
      }

      void render()

      return () => {
        cancelled = true
      }
    }, [form, content, origin])

    return (
      <div className={cn("relative aspect-square w-full", className)}>
        <div
          ref={containerRef}
          role="img"
          aria-label={ariaLabel}
          className={cn(
            "size-full [&>canvas]:size-full [&>canvas]:object-contain [&>svg]:size-full",
            !content.trim() && "hidden"
          )}
        />
        {!content.trim() && (
          <div className="flex size-full items-center justify-center rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
            {emptyLabel}
          </div>
        )}
      </div>
    )
  }
)
