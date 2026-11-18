import type { QrFormData } from "./types"

export type QrContentOptions = {
  baseUrl?: string
  locale?: string
  cardSlug?: string | null
}

function escapeWifi(value: string): string {
  return value.replace(/([\\;,:"])/g, "\\$1")
}

function escapeVCard(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
}

/** Adds a protocol to bare domains so phone cameras open them correctly. */
export function withProtocol(value: string): string {
  const trimmed = value.trim()

  if (!trimmed) return ""
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed

  return `https://${trimmed}`
}

export type VCardInput = {
  firstName: string
  lastName: string
  organization: string
  jobTitle: string
  phone: string
  email: string
  website: string
  address: string
}

/** Builds a vCard 3.0 payload that works with iOS, Android and desktop. */
export function buildVCard(input: VCardInput): string {
  const first = input.firstName.trim()
  const last = input.lastName.trim()
  const fullName = [first, last].filter(Boolean).join(" ")

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escapeVCard(last)};${escapeVCard(first)};;;`,
    `FN:${escapeVCard(fullName)}`,
  ]

  if (input.organization.trim()) {
    lines.push(`ORG:${escapeVCard(input.organization)}`)
  }

  if (input.jobTitle.trim()) {
    lines.push(`TITLE:${escapeVCard(input.jobTitle)}`)
  }

  if (input.phone.trim()) {
    lines.push(`TEL;TYPE=CELL:${escapeVCard(input.phone)}`)
  }

  if (input.email.trim()) {
    lines.push(`EMAIL;TYPE=INTERNET:${escapeVCard(input.email)}`)
  }

  if (input.website.trim()) {
    lines.push(`URL:${escapeVCard(withProtocol(input.website))}`)
  }

  if (input.address.trim()) {
    lines.push(`ADR;TYPE=WORK:;;${escapeVCard(input.address)};;;;`)
  }

  lines.push("END:VCARD")

  return lines.join("\r\n")
}

/**
 * Resolves the exact string encoded into a QR code. Dynamic codes always
 * point at the public card route, so editing the card updates every scan.
 */
export function buildQrContent(
  form: QrFormData,
  options: QrContentOptions = {}
): string {
  if (form.kind === "dynamic") {
    const slug = options.cardSlug?.trim()

    if (!slug) return ""

    const base = (options.baseUrl ?? "").replace(/\/+$/, "")
    const locale = options.locale?.trim() || "en"

    return `${base}/${locale}/card/${slug}`
  }

  switch (form.qrType) {
    case "url":
      return withProtocol(form.url)

    case "text":
      return form.text.trim()

    case "email": {
      const address = form.email.trim()

      if (!address) return ""

      const params = new URLSearchParams()

      if (form.emailSubject.trim()) params.set("subject", form.emailSubject.trim())
      if (form.emailBody.trim()) params.set("body", form.emailBody.trim())

      const query = params.toString()

      return `mailto:${address}${query ? `?${query}` : ""}`
    }

    case "phone": {
      const phone = form.phone.replace(/\s+/g, "")

      return phone ? `tel:${phone}` : ""
    }

    case "wifi": {
      const ssid = form.wifiSsid.trim()

      if (!ssid) return ""

      const password =
        form.wifiEncryption === "nopass" ? "" : form.wifiPassword

      return `WIFI:T:${form.wifiEncryption};S:${escapeWifi(ssid)};P:${escapeWifi(
        password
      )};H:${form.wifiHidden ? "true" : "false"};;`
    }

    case "vcard":
      return buildVCard({
        firstName: form.vcardFirstName,
        lastName: form.vcardLastName,
        organization: form.vcardOrganization,
        jobTitle: form.vcardJobTitle,
        phone: form.vcardPhone,
        email: form.vcardEmail,
        website: form.vcardWebsite,
        address: form.vcardAddress,
      })

    default:
      return ""
  }
}

/** Whether the current source fields can produce a scannable payload. */
export function isQrContentComplete(form: QrFormData): boolean {
  if (form.kind === "dynamic") return Boolean(form.cardId)

  switch (form.qrType) {
    case "url":
      return Boolean(form.url.trim())
    case "text":
      return Boolean(form.text.trim())
    case "email":
      return Boolean(form.email.trim())
    case "phone":
      return Boolean(form.phone.trim())
    case "wifi":
      return Boolean(form.wifiSsid.trim())
    case "vcard":
      return Boolean(
        form.vcardFirstName.trim() ||
          form.vcardLastName.trim() ||
          form.vcardOrganization.trim()
      )
    default:
      return false
  }
}
