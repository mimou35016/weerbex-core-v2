"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  FileCode2,
  FileImage,
  Pencil,
  Plus,
  QrCode,
  Trash2,
} from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { toast } from "sonner"

import { useCurrentUser } from "@/components/dashboard/current-user-provider"
import { FilterSelect } from "@/components/dashboard/filter-select"
import { PageHeader } from "@/components/dashboard/page-header"
import { SearchInput } from "@/components/dashboard/search-input"
import {
  SettingsField,
  SettingsSwitchRow,
} from "@/components/dashboard/settings/settings-ui"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { hasPermission } from "@/lib/permissions"

import {
  deleteQrCodeAction,
  listCardOptionsAction,
  listQrCodesAction,
  saveQrCodeAction,
  uploadQrLogoAction,
} from "../lib/actions"
import { buildQrContent } from "../lib/qr-content"
import {
  DEFAULT_QR_FORM,
  qrCornerStyles,
  qrDotStyles,
  qrErrorCorrections,
  qrKinds,
  qrSizeOptions,
  qrTypes,
  wifiEncryptions,
  type QrCardSummary,
  type QrCodeData,
  type QrFormData,
} from "../lib/types"
import { ColorField, ImageUploadField } from "./form-fields"
import { QrPreview, type QrPreviewHandle } from "./qr-preview"
import { QrDownloadButtons, QrThumbnail } from "./qr-thumbnail"

export function QrStudioPage() {
  const locale = useLocale()
  const t = useTranslations("Dashboard")
  const tq = useTranslations("Dashboard.qrCardHub")
  const currentUser = useCurrentUser()

  const canCreate = hasPermission(currentUser, "qrCodes", "create")
  const canUpdate = hasPermission(currentUser, "qrCodes", "update")
  const canDelete = hasPermission(currentUser, "qrCodes", "delete")
  const canExport = hasPermission(currentUser, "qrCodes", "export")

  const [items, setItems] = useState<QrCodeData[]>([])
  const [cards, setCards] = useState<QrCardSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [origin, setOrigin] = useState("")

  const [dialogOpen, setDialogOpen] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const [editingId, setEditingId] = useState("")
  const [form, setForm] = useState<QrFormData>(DEFAULT_QR_FORM)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const previewRef = useRef<QrPreviewHandle>(null)

  useEffect(() => {
    const frame = window.requestAnimationFrame(() =>
      setOrigin(window.location.origin)
    )

    return () => window.cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    let active = true

    Promise.all([listQrCodesAction(locale), listCardOptionsAction()]).then(
      ([qrResult, cardResult]) => {
        if (!active) return

        if (qrResult.success) {
          setItems(qrResult.data)
        } else {
          toast.error(qrResult.error)
        }

        if (cardResult.success) {
          setCards(cardResult.data)
        }

        setLoading(false)
      }
    )

    return () => {
      active = false
    }
  }, [locale])

  // The picker falls back to the first available card for display, so keep
  // the preview, the generated URL and the saved record in sync with it.
  const cardValue = cards.some((card) => card.id === form.cardId)
    ? form.cardId
    : (cards[0]?.id ?? "")

  const cardSlug = useMemo(
    () => cards.find((card) => card.id === cardValue)?.slug ?? null,
    [cards, cardValue]
  )

  const content = useMemo(
    () =>
      buildQrContent(form, {
        baseUrl: origin,
        locale,
        cardSlug,
      }),
    [form, origin, locale, cardSlug]
  )

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()

    if (!needle) return items

    return items.filter((item) =>
      `${item.title} ${item.content} ${item.qrType} ${item.kind}`
        .toLowerCase()
        .includes(needle)
    )
  }, [items, query])

  function translateError(error: string): string {
    return error.startsWith("qrCardHub.") && t.has(error) ? t(error) : error
  }

  function update<K extends keyof QrFormData>(key: K, value: QrFormData[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function openCreate() {
    setEditingId("")
    setForm({ ...DEFAULT_QR_FORM, title: "" })
    setDialogOpen(true)
  }

  function openEdit(item: QrCodeData) {
    setEditingId(item.id)
    setForm(item)
    setDialogOpen(true)
  }

  async function save() {
    if (saving) return

    setSaving(true)
    const result = await saveQrCodeAction(locale, {
      ...form,
      cardId: cardValue,
      id: editingId || undefined,
    })
    setSaving(false)

    if (!result.success) {
      toast.error(translateError(result.error))
      return
    }

    setItems((current) => {
      const exists = current.some((entry) => entry.id === result.data.id)

      return exists
        ? current.map((entry) =>
            entry.id === result.data.id ? result.data : entry
          )
        : [result.data, ...current]
    })
    setDialogOpen(false)
    toast.success(
      editingId ? tq("qr.toast.updated") : tq("qr.toast.created")
    )
  }

  async function remove(item: QrCodeData) {
    if (!window.confirm(tq("qr.deleteConfirm"))) return

    const result = await deleteQrCodeAction(item.id)

    if (!result.success) {
      toast.error(translateError(result.error))
      return
    }

    setItems((current) => current.filter((entry) => entry.id !== item.id))
    toast.success(tq("qr.toast.deleted"))
  }

  async function uploadLogo(file: File | null) {
    if (!file) return

    const data = new FormData()
    data.append("file", file)
    setUploading(true)
    const result = await uploadQrLogoAction(data)
    setUploading(false)

    if (!result.success) {
      toast.error(translateError(result.error))
      return
    }

    update("logo", result.data)
  }

  async function exportQr(extension: "png" | "svg") {
    await previewRef.current?.download(extension)
  }

  const kindOptions = qrKinds.map((kind) => ({
    value: kind,
    label: tq(`qr.kinds.${kind}`),
  }))

  const typeOptions = qrTypes.map((type) => ({
    value: type,
    label: tq(`qr.types.${type}`),
  }))

  const dotOptions = qrDotStyles.map((style) => ({
    value: style,
    label: tq(`qr.styles.${style}`),
  }))

  const cornerOptions = qrCornerStyles.map((style) => ({
    value: style,
    label: tq(`qr.styles.${style}`),
  }))

  const errorOptions = qrErrorCorrections.map((level) => ({
    value: level,
    label: level,
  }))

  const sizeOptions = qrSizeOptions.map((size) => ({
    value: String(size),
    label: `${size} × ${size}`,
  }))

  const wifiOptions = wifiEncryptions.map((value) => ({
    value,
    label: value === "nopass" ? tq("qr.form.wifiOpen") : value,
  }))

  const cardOptions = cards.map((card) => ({
    value: card.id,
    label: `${card.name}${card.published ? "" : " •"}`,
  }))

  return (
    <>
      <PageHeader
        title={tq("qr.title")}
        description={tq("qr.description")}
      >
        {canCreate && (
          <Button onClick={openCreate}>
            <Plus aria-hidden="true" />
            {tq("qr.new")}
          </Button>
        )}
      </PageHeader>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder={tq("qr.search")}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{tq("qr.listTitle")}</CardTitle>
          <CardDescription>{tq("qr.listDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-start">
                    {tq("qr.table.title")}
                  </TableHead>
                  <TableHead className="hidden text-start md:table-cell">
                    {tq("qr.table.kind")}
                  </TableHead>
                  <TableHead className="hidden text-start lg:table-cell">
                    {tq("qr.table.type")}
                  </TableHead>
                  <TableHead className="hidden text-start sm:table-cell">
                    {tq("qr.table.target")}
                  </TableHead>
                  <TableHead className="text-start">
                    {tq("qr.table.status")}
                  </TableHead>
                  <TableHead className="text-end">
                    {tq("qr.table.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-center text-muted-foreground"
                    >
                      {tq("loading")}
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-center text-muted-foreground"
                    >
                      {tq("qr.empty")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <QrThumbnail item={item} origin={origin} />
                          <span className="min-w-0 break-words">{item.title}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">
                          {tq(`qr.kinds.${item.kind}`)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {tq(`qr.types.${item.qrType}`)}
                      </TableCell>
                      <TableCell
                        className="hidden max-w-[220px] truncate font-mono text-xs text-muted-foreground sm:table-cell"
                        dir="ltr"
                        title={item.content}
                      >
                        {item.cardName
                          ? `${item.cardName} → /${item.cardSlug}`
                          : item.content || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            item.published
                              ? "border-transparent bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                              : "border-transparent bg-muted text-muted-foreground"
                          }
                        >
                          {item.published
                            ? tq("qr.status.active")
                            : tq("qr.status.draft")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-end">
                        <div className="flex justify-end gap-1">
                          {canExport && (
                            <QrDownloadButtons
                              item={item}
                              origin={origin}
                              pngLabel={tq("qr.actions.downloadPng")}
                              svgLabel={tq("qr.actions.downloadSvg")}
                              errorLabel={tq("qr.errors.downloadFailed")}
                            />
                          )}
                          {canUpdate && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => openEdit(item)}
                              aria-label={tq("qr.actions.edit")}
                            >
                              <Pencil aria-hidden="true" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => remove(item)}
                              aria-label={tq("qr.actions.delete")}
                            >
                              <Trash2 aria-hidden="true" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          ref={dialogRef}
          initialFocus={() => dialogRef.current ?? false}
          className="flex max-h-[94dvh] w-[calc(100%-2rem)] flex-col gap-4 overflow-hidden p-4 sm:w-[calc(100%-3rem)] sm:max-w-5xl sm:gap-5 sm:p-6"
        >
          <DialogHeader className="shrink-0 pe-8">
            <DialogTitle>
              {editingId ? tq("qr.editTitle") : tq("qr.createTitle")}
            </DialogTitle>
            <DialogDescription>{tq("qr.description")}</DialogDescription>
          </DialogHeader>

          <div className="grid min-h-0 flex-1 gap-6 overflow-y-auto pe-1 md:grid-cols-[minmax(0,1fr)_minmax(260px,300px)] md:overflow-hidden md:pe-0 lg:grid-cols-[minmax(0,1fr)_minmax(280px,320px)]">
            <div className="flex min-h-0 flex-col gap-5 md:overflow-y-auto md:pe-2">
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-semibold">
                  {tq("qr.form.contentSection")}
                </h3>

                <SettingsField
                  label={tq("qr.form.title")}
                  htmlFor="qr-title"
                >
                  <Input
                    id="qr-title"
                    value={form.title}
                    onChange={(event) => update("title", event.target.value)}
                    placeholder={tq("qr.form.titlePlaceholder")}
                  />
                </SettingsField>

                <div className="grid gap-4 sm:grid-cols-2">
                  <SettingsField
                    label={tq("qr.form.kind")}
                    htmlFor="qr-kind"
                    hint={tq("qr.form.kindHint")}
                  >
                    <FilterSelect
                      value={form.kind}
                      onChange={(value) =>
                        update("kind", value as QrFormData["kind"])
                      }
                      options={kindOptions}
                      ariaLabel={tq("qr.form.kind")}
                      className="w-full sm:w-full"
                    />
                  </SettingsField>

                  {form.kind === "static" ? (
                    <SettingsField
                      label={tq("qr.form.type")}
                      htmlFor="qr-type"
                    >
                      <FilterSelect
                        value={form.qrType}
                        onChange={(value) =>
                          update("qrType", value as QrFormData["qrType"])
                        }
                        options={typeOptions}
                        ariaLabel={tq("qr.form.type")}
                        className="w-full sm:w-full"
                      />
                    </SettingsField>
                  ) : (
                    <SettingsField
                      label={tq("qr.form.card")}
                      htmlFor="qr-card"
                      hint={tq("qr.form.cardHint")}
                    >
                      {cards.length > 0 ? (
                        <FilterSelect
                          value={cardValue}
                          onChange={(value) => update("cardId", value)}
                          options={cardOptions}
                          ariaLabel={tq("qr.form.card")}
                          className="w-full sm:w-full"
                        />
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          {tq("qr.form.noCards")}
                        </p>
                      )}
                    </SettingsField>
                  )}
                </div>

                {form.kind === "static" && form.qrType === "url" && (
                  <SettingsField
                    label={tq("qr.form.url")}
                    htmlFor="qr-url"
                  >
                    <Input
                      id="qr-url"
                      value={form.url}
                      onChange={(event) => update("url", event.target.value)}
                      placeholder={tq("qr.form.urlPlaceholder")}
                      dir="ltr"
                    />
                  </SettingsField>
                )}

                {form.kind === "static" && form.qrType === "text" && (
                  <SettingsField
                    label={tq("qr.form.text")}
                    htmlFor="qr-text"
                  >
                    <Textarea
                      id="qr-text"
                      value={form.text}
                      onChange={(event) => update("text", event.target.value)}
                      placeholder={tq("qr.form.textPlaceholder")}
                      rows={3}
                    />
                  </SettingsField>
                )}

                {form.kind === "static" && form.qrType === "email" && (
                  <div className="grid gap-4">
                    <SettingsField
                      label={tq("qr.form.email")}
                      htmlFor="qr-email"
                    >
                      <Input
                        id="qr-email"
                        type="email"
                        value={form.email}
                        onChange={(event) =>
                          update("email", event.target.value)
                        }
                        dir="ltr"
                      />
                    </SettingsField>
                    <SettingsField
                      label={tq("qr.form.emailSubject")}
                      htmlFor="qr-email-subject"
                    >
                      <Input
                        id="qr-email-subject"
                        value={form.emailSubject}
                        onChange={(event) =>
                          update("emailSubject", event.target.value)
                        }
                      />
                    </SettingsField>
                    <SettingsField
                      label={tq("qr.form.emailBody")}
                      htmlFor="qr-email-body"
                    >
                      <Textarea
                        id="qr-email-body"
                        value={form.emailBody}
                        onChange={(event) =>
                          update("emailBody", event.target.value)
                        }
                        rows={3}
                      />
                    </SettingsField>
                  </div>
                )}

                {form.kind === "static" && form.qrType === "phone" && (
                  <SettingsField
                    label={tq("qr.form.phone")}
                    htmlFor="qr-phone"
                  >
                    <Input
                      id="qr-phone"
                      value={form.phone}
                      onChange={(event) => update("phone", event.target.value)}
                      dir="ltr"
                    />
                  </SettingsField>
                )}

                {form.kind === "static" && form.qrType === "wifi" && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <SettingsField
                      label={tq("qr.form.wifiSsid")}
                      htmlFor="qr-wifi-ssid"
                    >
                      <Input
                        id="qr-wifi-ssid"
                        value={form.wifiSsid}
                        onChange={(event) =>
                          update("wifiSsid", event.target.value)
                        }
                        dir="ltr"
                      />
                    </SettingsField>
                    <SettingsField
                      label={tq("qr.form.wifiPassword")}
                      htmlFor="qr-wifi-password"
                    >
                      <Input
                        id="qr-wifi-password"
                        value={form.wifiPassword}
                        onChange={(event) =>
                          update("wifiPassword", event.target.value)
                        }
                        disabled={form.wifiEncryption === "nopass"}
                        dir="ltr"
                      />
                    </SettingsField>
                    <SettingsField
                      label={tq("qr.form.wifiEncryption")}
                      htmlFor="qr-wifi-encryption"
                    >
                      <FilterSelect
                        value={form.wifiEncryption}
                        onChange={(value) =>
                          update(
                            "wifiEncryption",
                            value as QrFormData["wifiEncryption"]
                          )
                        }
                        options={wifiOptions}
                        ariaLabel={tq("qr.form.wifiEncryption")}
                        className="w-full sm:w-full"
                      />
                    </SettingsField>
                    <div className="flex items-end">
                      <SettingsSwitchRow
                        id="qr-wifi-hidden"
                        label={tq("qr.form.wifiHidden")}
                        checked={form.wifiHidden}
                        onCheckedChange={(checked) =>
                          update("wifiHidden", checked)
                        }
                      />
                    </div>
                  </div>
                )}

                {form.kind === "static" && form.qrType === "vcard" && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <SettingsField
                      label={tq("qr.form.vcard.firstName")}
                      htmlFor="qr-vcard-first"
                    >
                      <Input
                        id="qr-vcard-first"
                        value={form.vcardFirstName}
                        onChange={(event) =>
                          update("vcardFirstName", event.target.value)
                        }
                      />
                    </SettingsField>
                    <SettingsField
                      label={tq("qr.form.vcard.lastName")}
                      htmlFor="qr-vcard-last"
                    >
                      <Input
                        id="qr-vcard-last"
                        value={form.vcardLastName}
                        onChange={(event) =>
                          update("vcardLastName", event.target.value)
                        }
                      />
                    </SettingsField>
                    <SettingsField
                      label={tq("qr.form.vcard.organization")}
                      htmlFor="qr-vcard-org"
                    >
                      <Input
                        id="qr-vcard-org"
                        value={form.vcardOrganization}
                        onChange={(event) =>
                          update("vcardOrganization", event.target.value)
                        }
                      />
                    </SettingsField>
                    <SettingsField
                      label={tq("qr.form.vcard.jobTitle")}
                      htmlFor="qr-vcard-title"
                    >
                      <Input
                        id="qr-vcard-title"
                        value={form.vcardJobTitle}
                        onChange={(event) =>
                          update("vcardJobTitle", event.target.value)
                        }
                      />
                    </SettingsField>
                    <SettingsField
                      label={tq("qr.form.vcard.phone")}
                      htmlFor="qr-vcard-phone"
                    >
                      <Input
                        id="qr-vcard-phone"
                        value={form.vcardPhone}
                        onChange={(event) =>
                          update("vcardPhone", event.target.value)
                        }
                        dir="ltr"
                      />
                    </SettingsField>
                    <SettingsField
                      label={tq("qr.form.vcard.email")}
                      htmlFor="qr-vcard-email"
                    >
                      <Input
                        id="qr-vcard-email"
                        type="email"
                        value={form.vcardEmail}
                        onChange={(event) =>
                          update("vcardEmail", event.target.value)
                        }
                        dir="ltr"
                      />
                    </SettingsField>
                    <SettingsField
                      label={tq("qr.form.vcard.website")}
                      htmlFor="qr-vcard-website"
                    >
                      <Input
                        id="qr-vcard-website"
                        value={form.vcardWebsite}
                        onChange={(event) =>
                          update("vcardWebsite", event.target.value)
                        }
                        dir="ltr"
                      />
                    </SettingsField>
                    <SettingsField
                      label={tq("qr.form.vcard.address")}
                      htmlFor="qr-vcard-address"
                    >
                      <Input
                        id="qr-vcard-address"
                        value={form.vcardAddress}
                        onChange={(event) =>
                          update("vcardAddress", event.target.value)
                        }
                      />
                    </SettingsField>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-semibold">
                  {tq("qr.form.designSection")}
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <SettingsField
                    label={tq("qr.form.dotStyle")}
                    htmlFor="qr-dot-style"
                  >
                    <FilterSelect
                      value={form.dotStyle}
                      onChange={(value) =>
                        update("dotStyle", value as QrFormData["dotStyle"])
                      }
                      options={dotOptions}
                      ariaLabel={tq("qr.form.dotStyle")}
                      className="w-full sm:w-full"
                    />
                  </SettingsField>
                  <SettingsField
                    label={tq("qr.form.cornerStyle")}
                    htmlFor="qr-corner-style"
                  >
                    <FilterSelect
                      value={form.cornerStyle}
                      onChange={(value) =>
                        update(
                          "cornerStyle",
                          value as QrFormData["cornerStyle"]
                        )
                      }
                      options={cornerOptions}
                      ariaLabel={tq("qr.form.cornerStyle")}
                      className="w-full sm:w-full"
                    />
                  </SettingsField>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <ColorField
                    id="qr-foreground"
                    label={tq("qr.form.foregroundColor")}
                    value={form.foregroundColor}
                    onChange={(value) => update("foregroundColor", value)}
                  />
                  <ColorField
                    id="qr-background"
                    label={tq("qr.form.backgroundColor")}
                    value={form.backgroundColor}
                    onChange={(value) => update("backgroundColor", value)}
                  />
                </div>

                <SettingsSwitchRow
                  id="qr-gradient"
                  label={tq("qr.form.useGradient")}
                  checked={form.useGradient}
                  onCheckedChange={(checked) =>
                    update("useGradient", checked)
                  }
                />

                {form.useGradient && (
                  <ColorField
                    id="qr-gradient-color"
                    label={tq("qr.form.gradientColor")}
                    value={form.gradientColor}
                    onChange={(value) => update("gradientColor", value)}
                  />
                )}

                <ImageUploadField
                  id="qr-logo"
                  image={form.logo}
                  uploading={uploading}
                  onUpload={uploadLogo}
                  onClear={() => update("logo", null)}
                  label={tq("qr.form.logo")}
                  hint={tq("qr.form.logoHint")}
                  clearLabel={tq("qr.form.removeLogo")}
                  contain
                />

                <SettingsField
                  label={`${tq("qr.form.logoSize")} — ${Math.round(
                    form.logoSize * 100
                  )}%`}
                  htmlFor="qr-logo-size"
                >
                  <Slider
                    id="qr-logo-size"
                    min={0.1}
                    max={0.6}
                    step={0.05}
                    value={form.logoSize}
                    onValueChange={(value) =>
                      update("logoSize", value as number)
                    }
                  />
                </SettingsField>

                <SettingsField
                  label={`${tq("qr.form.margin")} — ${form.margin}px`}
                  htmlFor="qr-margin"
                >
                  <Slider
                    id="qr-margin"
                    min={0}
                    max={48}
                    step={1}
                    value={form.margin}
                    onValueChange={(value) =>
                      update("margin", value as number)
                    }
                  />
                </SettingsField>

                <div className="grid gap-4 sm:grid-cols-2">
                  <SettingsField
                    label={tq("qr.form.errorCorrection")}
                    htmlFor="qr-error"
                  >
                    <FilterSelect
                      value={form.errorCorrection}
                      onChange={(value) =>
                        update(
                          "errorCorrection",
                          value as QrFormData["errorCorrection"]
                        )
                      }
                      options={errorOptions}
                      ariaLabel={tq("qr.form.errorCorrection")}
                      className="w-full sm:w-full"
                    />
                  </SettingsField>
                  <SettingsField
                    label={tq("qr.form.size")}
                    htmlFor="qr-size"
                  >
                    <FilterSelect
                      value={String(form.size)}
                      onChange={(value) => update("size", Number(value))}
                      options={sizeOptions}
                      ariaLabel={tq("qr.form.size")}
                      className="w-full sm:w-full"
                    />
                  </SettingsField>
                </div>

                <SettingsSwitchRow
                  id="qr-published"
                  label={tq("qr.form.published")}
                  description={tq("qr.form.publishedHint")}
                  checked={form.published}
                  onCheckedChange={(checked) =>
                    update("published", checked)
                  }
                />
              </div>
            </div>

            <div className="order-first flex flex-col gap-3 md:order-none md:max-h-full md:self-start md:overflow-y-auto">
              <p className="text-center text-sm font-semibold md:text-start">
                {tq("qr.preview.title")}
              </p>
              <div className="mx-auto w-full max-w-xs rounded-xl border bg-muted/30 p-4">
                <QrPreview
                  ref={previewRef}
                  form={form}
                  content={content}
                  origin={origin}
                  emptyLabel={tq("qr.preview.empty")}
                  ariaLabel={tq("qr.preview.title")}
                />
              </div>
              <p className="break-all text-center font-mono text-[11px] text-muted-foreground">
                {content || "—"}
              </p>
              {canExport && (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportQr("png")}
                  >
                    <FileImage aria-hidden="true" />
                    PNG
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportQr("svg")}
                  >
                    <FileCode2 aria-hidden="true" />
                    SVG
                  </Button>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="shrink-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={save} disabled={saving}>
              <QrCode aria-hidden="true" />
              {tq("qr.actions.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
