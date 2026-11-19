"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import {
  ArrowUpRight,
  Check,
  Copy,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Wallet,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

import {
  cardLinkHref,
  normalizeCardLinkType,
  type CustomLinkInput,
} from "../lib/types"

const typeIcons: Record<string, LucideIcon> = {
  url: ArrowUpRight,
  phone: Phone,
  whatsapp: MessageCircle,
  email: Mail,
  location: MapPin,
  copy: Copy,
  payment: Wallet,
}

/**
 * Interactive card item. Rendered inside `CardRenderer` on both the builder
 * preview and the published page, so copy feedback behaves identically.
 */
export function CardLinkButton({
  link,
  dark = false,
}: {
  link: CustomLinkInput
  dark?: boolean
}) {
  const t = useTranslations("Card")
  const [copied, setCopied] = useState(false)
  const type = normalizeCardLinkType(link.type)
  const Icon = copied ? Check : (typeIcons[type] ?? Globe)
  const href = cardLinkHref(link)
  const title = link.label || link.url

  useEffect(() => {
    if (!copied) return

    const timeout = window.setTimeout(() => setCopied(false), 1800)
    return () => window.clearTimeout(timeout)
  }, [copied])

  function legacyCopy(value: string) {
    const field = document.createElement("textarea")
    field.value = value
    field.setAttribute("readonly", "")
    field.style.position = "fixed"
    field.style.opacity = "0"
    document.body.appendChild(field)
    field.select()
    const copiedValue = document.execCommand("copy")
    field.remove()
    if (!copiedValue) throw new Error("Clipboard copy failed")
  }

  async function copyValue() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link.url)
      } else {
        legacyCopy(link.url)
      }
      setCopied(true)
      toast.success(t("copiedValue"))
    } catch {
      try {
        legacyCopy(link.url)
        setCopied(true)
        toast.success(t("copiedValue"))
      } catch {
        toast.error(t("copyErrorValue"))
      }
    }
  }

  const className = cn(
    "group/link flex w-full items-center gap-2 rounded-[var(--card-radius-sm)] border px-[var(--card-link-x)] py-[var(--card-link-y)] text-[length:var(--card-meta)] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
    dark
      ? "border-white/20 bg-white/10 text-white hover:border-white/45 hover:bg-white/20"
      : "border-[color:var(--card-brand-line)] bg-[var(--card-brand-soft)] text-slate-900 hover:border-[color:var(--card-brand)] hover:bg-[var(--card-brand-strong)]"
  )

  const icon = (
    <Icon
      className={cn(
        "size-[var(--card-icon)] shrink-0 opacity-60 transition-transform duration-200",
        type === "url" &&
          "group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 rtl:-scale-x-100",
        copied && "text-emerald-400 opacity-100"
      )}
      aria-hidden="true"
    />
  )

  const content = (
    <>
      <span className="min-w-0 flex-1 truncate">{title}</span>
      {icon}
    </>
  )

  if (type === "copy" || !href) {
    return (
      <button
        type="button"
        onClick={copyValue}
        className={className}
        aria-label={`${title} — ${t("copyValueHint")}`}
        title={t("copyValueHint")}
      >
        {content}
      </button>
    )
  }

  const external = href.startsWith("http")

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      title={title}
      className={className}
    >
      {content}
    </a>
  )
}
