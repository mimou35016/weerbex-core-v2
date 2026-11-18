import type { Options } from "qr-code-styling"

import type { QrFormData } from "./types"

/**
 * Builds the `qr-code-styling` options for a stored or in-progress code.
 * Shared by the live preview, the table thumbnails and the download actions
 * so a code always looks identical everywhere.
 */
export function buildQrOptions(
  form: QrFormData,
  content: string,
  origin: string,
  sizeOverride?: number
): Options {
  const gradient = form.useGradient
    ? {
        type: "linear" as const,
        rotation: Math.PI / 4,
        colorStops: [
          { offset: 0, color: form.foregroundColor },
          { offset: 1, color: form.gradientColor },
        ],
      }
    : undefined

  const logo =
    form.logo && origin
      ? new URL(form.logo.url, origin).toString()
      : form.logo?.url

  return {
    width: sizeOverride ?? form.size,
    height: sizeOverride ?? form.size,
    type: "canvas",
    data: content,
    margin: form.margin,
    image: logo,
    qrOptions: {
      errorCorrectionLevel: form.errorCorrection,
    },
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: form.logoSize,
      margin: 2,
      crossOrigin: "anonymous",
    },
    dotsOptions: {
      type: form.dotStyle,
      color: form.useGradient ? undefined : form.foregroundColor,
      gradient,
    },
    cornersSquareOptions: {
      type: form.cornerStyle,
      color: form.useGradient ? form.gradientColor : form.foregroundColor,
    },
    cornersDotOptions: {
      type: form.cornerStyle === "extra-rounded" ? "dot" : form.cornerStyle,
      color: form.useGradient ? form.gradientColor : form.foregroundColor,
    },
    backgroundOptions: {
      color: form.backgroundColor,
      round: 0,
    },
  }
}

/** Safe, readable file name for exported QR codes. */
export function qrFileBaseName(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return slug || "qr-code"
}
