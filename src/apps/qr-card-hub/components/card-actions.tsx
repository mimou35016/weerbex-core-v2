"use client"

import { Check, Copy, Download } from "lucide-react"
import { useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

import { buildVCard } from "../lib/qr-content"
import type { DigitalCardData } from "../lib/types"

function downloadVCard(card: DigitalCardData): void {
  const [firstName, ...rest] = card.fullName.trim().split(/\s+/)
  const content = buildVCard({
    firstName: firstName ?? "",
    lastName: rest.join(" "),
    organization: card.company,
    jobTitle: card.jobTitle,
    phone: card.phone,
    email: card.email,
    website: card.website,
    address: card.address,
  })

  const blob = new Blob([content], { type: "text/vcard;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")

  anchor.href = url
  anchor.download = `${card.slug || "contact"}.vcf`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export function CardActions({
  card,
  shareUrl,
}: {
  card: DigitalCardData
  shareUrl: string
}) {
  const t = useTranslations("Card")
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success(t("copied"))
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(t("copyError"))
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Button onClick={() => downloadVCard(card)}>
        <Download aria-hidden="true" />
        {t("saveContact")}
      </Button>
      <Button variant="outline" onClick={copyLink}>
        {copied ? (
          <Check aria-hidden="true" />
        ) : (
          <Copy aria-hidden="true" />
        )}
        {t("copyLink")}
      </Button>
    </div>
  )
}
