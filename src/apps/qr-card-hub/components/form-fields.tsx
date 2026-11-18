"use client"

import Image from "next/image"
import { Trash2, Upload } from "lucide-react"

import { SettingsField } from "@/components/dashboard/settings/settings-ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

import type { MediaRef } from "../lib/types"

export function ColorField({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <SettingsField label={label} htmlFor={id}>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-14 shrink-0 p-1"
        />
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          dir="ltr"
          className="font-mono text-xs"
          aria-label={label}
        />
      </div>
    </SettingsField>
  )
}

export function ImageUploadField({
  id,
  label,
  hint,
  image,
  uploading,
  onUpload,
  onClear,
  clearLabel,
  shape = "square",
  contain = false,
}: {
  id: string
  label: string
  hint?: string
  image: MediaRef | null
  uploading: boolean
  onUpload: (file: File | null) => void
  onClear: () => void
  clearLabel: string
  shape?: "square" | "circle"
  contain?: boolean
}) {
  return (
    <SettingsField label={label} htmlFor={id} hint={hint}>
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex size-12 shrink-0 items-center justify-center overflow-hidden border bg-muted",
            shape === "circle" ? "rounded-full" : "rounded-md"
          )}
        >
          {image ? (
            <Image
              src={image.url}
              alt={image.alt ?? label}
              width={48}
              height={48}
              className={cn(
                "size-full",
                contain ? "object-contain" : "object-cover"
              )}
              unoptimized
            />
          ) : (
            <Upload
              aria-hidden="true"
              className="size-4 text-muted-foreground"
            />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Input
            id={id}
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(event) => onUpload(event.target.files?.[0] ?? null)}
          />
          {image && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="self-start"
              onClick={onClear}
            >
              <Trash2 aria-hidden="true" />
              {clearLabel}
            </Button>
          )}
        </div>
      </div>
    </SettingsField>
  )
}
