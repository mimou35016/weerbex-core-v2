"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  ArrowDown,
  ArrowUp,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Save,
  Trash2,
} from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { toast } from "sonner"

import { useCurrentUser } from "@/components/dashboard/current-user-provider"
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
import { cn } from "@/lib/utils"

import {
  deleteDigitalCardAction,
  listDigitalCardsAction,
  publishDigitalCardAction,
  saveDigitalCardAction,
  uploadCardAvatarAction,
} from "../lib/actions"
import {
  cardTemplates,
  DEFAULT_CARD_FORM,
  MAX_CARD_LINKS,
  normalizeSocialPlatform,
  safeColor,
  socialPlatforms,
  type CustomLinkInput,
  type DigitalCardData,
  type DigitalCardFormData,
  type SocialLinkInput,
} from "../lib/types"
import { CardRenderer } from "./CardRenderer"
import { ColorField, ImageUploadField } from "./form-fields"
import { IphoneFrame } from "./iphone-frame"
import { TemplateMock } from "./template-mock"

const socialUrlPlaceholders: Record<string, string> = {
  website: "https://example.com",
  linkedin: "https://linkedin.com/in/username",
  x: "https://x.com/username",
  facebook: "https://facebook.com/username",
  instagram: "https://instagram.com/username",
  github: "https://github.com/username",
  youtube: "https://youtube.com/@username",
  tiktok: "https://tiktok.com/@username",
  whatsapp: "https://wa.me/123456789",
  telegram: "https://t.me/username",
}

function toFormData(card: DigitalCardData): DigitalCardFormData {
  return {
    title: card.title,
    slug: card.slug,
    fullName: card.fullName,
    jobTitle: card.jobTitle,
    company: card.company,
    bio: card.bio,
    email: card.email,
    phone: card.phone,
    website: card.website,
    address: card.address,
    avatar: card.avatar,
    template: card.template,
    brandColor: card.brandColor,
    accentColor: card.accentColor,
    socialLinks: (card.socialLinks ?? []).map((link) => ({ ...link })),
    links: (card.links ?? []).map((link) => ({ ...link })),
    published: card.published,
  }
}

function toPreviewData(form: DigitalCardFormData, slug: string): DigitalCardData {
  return {
    ...DEFAULT_CARD_FORM,
    ...form,
    id: "preview",
    slug,
    createdAt: "",
    updatedAt: "",
  }
}

export function CardBuilderPage() {
  const locale = useLocale()
  const t = useTranslations("Dashboard")
  const tc = useTranslations("Dashboard.qrCardHub")
  const currentUser = useCurrentUser()

  const canCreate = hasPermission(currentUser, "digitalCards", "create")
  const canUpdate = hasPermission(currentUser, "digitalCards", "update")
  const canDelete = hasPermission(currentUser, "digitalCards", "delete")
  const canPublish = hasPermission(currentUser, "digitalCards", "publish")

  const [items, setItems] = useState<DigitalCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [origin, setOrigin] = useState("")

  const [dialogOpen, setDialogOpen] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const [editingId, setEditingId] = useState("")
  const [form, setForm] = useState<DigitalCardFormData>(DEFAULT_CARD_FORM)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [pendingId, setPendingId] = useState("")

  useEffect(() => {
    const frame = window.requestAnimationFrame(() =>
      setOrigin(window.location.origin)
    )

    return () => window.cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    let active = true

    listDigitalCardsAction(locale).then((result) => {
      if (!active) return

      if (result.success) {
        setItems(result.data)
      } else {
        toast.error(result.error)
      }

      setLoading(false)
    })

    return () => {
      active = false
    }
  }, [locale])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()

    if (!needle) return items

    return items.filter((item) =>
      `${item.title} ${item.fullName} ${item.company} ${item.slug}`
        .toLowerCase()
        .includes(needle)
    )
  }, [items, query])

  const preview = useMemo(
    () => toPreviewData(form, form.slug),
    [form]
  )

  function translateError(error: string): string {
    return error.startsWith("qrCardHub.") && t.has(error) ? t(error) : error
  }

  function update<K extends keyof DigitalCardFormData>(
    key: K,
    value: DigitalCardFormData[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function openCreate() {
    setEditingId("")
    setForm({ ...DEFAULT_CARD_FORM })
    setDialogOpen(true)
  }

  function openEdit(card: DigitalCardData) {
    setEditingId(card.id)
    setForm(toFormData(card))
    setDialogOpen(true)
  }

  function updateSocial(index: number, patch: Partial<SocialLinkInput>) {
    setForm((current) => ({
      ...current,
      socialLinks: current.socialLinks.map((link, position) =>
        position === index ? { ...link, ...patch } : link
      ),
    }))
  }

  function addSocial() {
    setForm((current) => ({
      ...current,
      socialLinks: [
        ...current.socialLinks,
        { platform: "website", url: "", label: "" },
      ],
    }))
  }

  function removeSocial(index: number) {
    setForm((current) => ({
      ...current,
      socialLinks: current.socialLinks.filter(
        (_link, position) => position !== index
      ),
    }))
  }

  function updateLink(index: number, patch: Partial<CustomLinkInput>) {
    setForm((current) => ({
      ...current,
      links: current.links.map((link, position) =>
        position === index ? { ...link, ...patch } : link
      ),
    }))
  }

  function addLink() {
    setForm((current) => {
      if (current.links.length >= MAX_CARD_LINKS) return current

      return {
        ...current,
        links: [...current.links, { label: "", url: "" }],
      }
    })
  }

  function removeLink(index: number) {
    setForm((current) => ({
      ...current,
      links: current.links.filter((_link, position) => position !== index),
    }))
  }

  function moveLink(index: number, direction: -1 | 1) {
    setForm((current) => {
      const target = index + direction

      if (target < 0 || target >= current.links.length) return current

      const links = [...current.links]
      const [moved] = links.splice(index, 1)
      links.splice(target, 0, moved)

      return { ...current, links }
    })
  }

  async function save() {
    if (saving) return

    // Empty rows are dropped, and every remaining row must be a usable link.
    const links = form.links
      .map((link) => ({ label: link.label.trim(), url: link.url.trim() }))
      .filter((link) => link.label.length > 0 || link.url.length > 0)

    if (links.some((link) => link.url.length === 0)) {
      toast.error(tc("cards.errors.linkUrlRequired"))
      return
    }

    setSaving(true)
    const result = await saveDigitalCardAction({
      ...form,
      links,
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
    setForm(toFormData(result.data))
    setEditingId(result.data.id)
    setDialogOpen(false)
    toast.success(
      editingId ? tc("cards.toast.updated") : tc("cards.toast.created")
    )
  }

  async function togglePublished(card: DigitalCardData) {
    if (pendingId) return

    setPendingId(card.id)
    const result = await publishDigitalCardAction(card.id, !card.published)
    setPendingId("")

    if (!result.success) {
      toast.error(translateError(result.error))
      return
    }

    setItems((current) =>
      current.map((entry) => (entry.id === result.data.id ? result.data : entry))
    )
    toast.success(
      result.data.published
        ? tc("cards.toast.published")
        : tc("cards.toast.unpublished")
    )
  }

  async function remove(card: DigitalCardData) {
    if (!window.confirm(tc("cards.deleteConfirm"))) return

    const result = await deleteDigitalCardAction(card.id)

    if (!result.success) {
      toast.error(translateError(result.error))
      return
    }

    setItems((current) => current.filter((entry) => entry.id !== card.id))
    toast.success(tc("cards.toast.deleted"))
  }

  async function uploadAvatar(file: File | null) {
    if (!file) return

    const data = new FormData()
    data.append("file", file)
    setUploading(true)
    const result = await uploadCardAvatarAction(data)
    setUploading(false)

    if (!result.success) {
      toast.error(translateError(result.error))
      return
    }

    update("avatar", result.data)
  }

  function publicUrl(slug: string): string {
    if (!slug) return ""
    return `${origin}/${locale}/card/${slug}`
  }

  return (
    <>
      <PageHeader
        title={tc("cards.title")}
        description={tc("cards.description")}
      >
        {canCreate && (
          <Button onClick={openCreate}>
            <Plus aria-hidden="true" />
            {tc("cards.new")}
          </Button>
        )}
      </PageHeader>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder={tc("cards.search")}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{tc("cards.listTitle")}</CardTitle>
          <CardDescription>{tc("cards.listDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-start">
                    {tc("cards.table.card")}
                  </TableHead>
                  <TableHead className="hidden text-start sm:table-cell">
                    {tc("cards.table.slug")}
                  </TableHead>
                  <TableHead className="hidden text-start md:table-cell">
                    {tc("cards.table.template")}
                  </TableHead>
                  <TableHead className="text-start">
                    {tc("cards.table.status")}
                  </TableHead>
                  <TableHead className="text-end">
                    {tc("cards.table.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-8 text-center text-muted-foreground"
                    >
                      {tc("loading")}
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-8 text-center text-muted-foreground"
                    >
                      {tc("cards.empty")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((card) => (
                    <TableRow key={card.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{card.fullName}</span>
                          <span className="text-xs text-muted-foreground">
                            {[card.jobTitle, card.company]
                              .filter(Boolean)
                              .join(" · ") || card.title}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell
                        className="hidden max-w-[200px] truncate font-mono text-xs text-muted-foreground sm:table-cell"
                        dir="ltr"
                      >
                        /{card.slug}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {tc(`cards.templates.${card.template}`)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "border-transparent",
                            card.published
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {card.published
                            ? tc("cards.status.published")
                            : tc("cards.status.draft")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-end">
                        <div className="flex justify-end gap-1">
                          {card.published && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              nativeButton={false}
                              render={
                                <Link
                                  href={publicUrl(card.slug)}
                                  target="_blank"
                                  rel="noreferrer"
                                />
                              }
                              aria-label={tc("cards.actions.open")}
                            >
                              <ExternalLink aria-hidden="true" />
                            </Button>
                          )}
                          {canPublish && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              disabled={pendingId === card.id}
                              onClick={() => togglePublished(card)}
                              aria-label={
                                card.published
                                  ? tc("cards.actions.unpublish")
                                  : tc("cards.actions.publish")
                              }
                            >
                              {card.published ? (
                                <EyeOff aria-hidden="true" />
                              ) : (
                                <Eye aria-hidden="true" />
                              )}
                            </Button>
                          )}
                          {canUpdate && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => openEdit(card)}
                              aria-label={tc("cards.actions.edit")}
                            >
                              <Pencil aria-hidden="true" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => remove(card)}
                              aria-label={tc("cards.actions.delete")}
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
              {editingId ? tc("cards.editTitle") : tc("cards.createTitle")}
            </DialogTitle>
            <DialogDescription>{tc("cards.description")}</DialogDescription>
          </DialogHeader>

          <div className="grid min-h-0 flex-1 gap-6 overflow-y-auto pe-1 md:grid-cols-[minmax(0,1fr)_minmax(260px,300px)] md:overflow-hidden md:pe-0 lg:grid-cols-[minmax(0,1fr)_minmax(280px,320px)]">
            <div className="flex min-h-0 flex-col gap-6 md:overflow-y-auto md:pe-2">
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-semibold">
                  {tc("cards.form.identitySection")}
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <SettingsField
                    label={tc("cards.form.fullName")}
                    htmlFor="card-full-name"
                  >
                    <Input
                      id="card-full-name"
                      value={form.fullName}
                      onChange={(event) =>
                        update("fullName", event.target.value)
                      }
                    />
                  </SettingsField>
                  <SettingsField
                    label={tc("cards.form.title")}
                    htmlFor="card-title"
                    hint={tc("cards.form.titleHint")}
                  >
                    <Input
                      id="card-title"
                      value={form.title}
                      onChange={(event) => update("title", event.target.value)}
                    />
                  </SettingsField>
                  <SettingsField
                    label={tc("cards.form.jobTitle")}
                    htmlFor="card-job-title"
                  >
                    <Input
                      id="card-job-title"
                      value={form.jobTitle}
                      onChange={(event) =>
                        update("jobTitle", event.target.value)
                      }
                    />
                  </SettingsField>
                  <SettingsField
                    label={tc("cards.form.company")}
                    htmlFor="card-company"
                  >
                    <Input
                      id="card-company"
                      value={form.company}
                      onChange={(event) =>
                        update("company", event.target.value)
                      }
                    />
                  </SettingsField>
                </div>

                <SettingsField
                  label={tc("cards.form.bio")}
                  htmlFor="card-bio"
                >
                  <Textarea
                    id="card-bio"
                    value={form.bio}
                    rows={3}
                    onChange={(event) => update("bio", event.target.value)}
                  />
                </SettingsField>

                <div className="grid gap-4 sm:grid-cols-2">
                  <SettingsField
                    label={tc("cards.form.email")}
                    htmlFor="card-email"
                  >
                    <Input
                      id="card-email"
                      type="email"
                      value={form.email}
                      onChange={(event) => update("email", event.target.value)}
                      dir="ltr"
                    />
                  </SettingsField>
                  <SettingsField
                    label={tc("cards.form.phone")}
                    htmlFor="card-phone"
                  >
                    <Input
                      id="card-phone"
                      value={form.phone}
                      onChange={(event) => update("phone", event.target.value)}
                      dir="ltr"
                    />
                  </SettingsField>
                  <SettingsField
                    label={tc("cards.form.website")}
                    htmlFor="card-website"
                  >
                    <Input
                      id="card-website"
                      value={form.website}
                      onChange={(event) =>
                        update("website", event.target.value)
                      }
                      dir="ltr"
                    />
                  </SettingsField>
                  <SettingsField
                    label={tc("cards.form.address")}
                    htmlFor="card-address"
                  >
                    <Input
                      id="card-address"
                      value={form.address}
                      onChange={(event) =>
                        update("address", event.target.value)
                      }
                    />
                  </SettingsField>
                </div>

                <SettingsField
                  label={tc("cards.form.slug")}
                  htmlFor="card-slug"
                  hint={tc("cards.form.slugHint")}
                >
                  <Input
                    id="card-slug"
                    value={form.slug}
                    onChange={(event) => update("slug", event.target.value)}
                    placeholder="my-card"
                    dir="ltr"
                  />
                </SettingsField>

                <ImageUploadField
                  id="card-avatar"
                  image={form.avatar}
                  uploading={uploading}
                  onUpload={uploadAvatar}
                  onClear={() => update("avatar", null)}
                  label={tc("cards.form.avatar")}
                  hint={tc("cards.form.avatarHint")}
                  clearLabel={tc("cards.form.removeAvatar")}
                  shape="circle"
                />
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-semibold">
                  {tc("cards.form.designSection")}
                </h3>

                <SettingsField
                  label={tc("cards.form.template")}
                  htmlFor="card-template"
                >
                  <div className="grid grid-cols-2 gap-2.5">
                    {cardTemplates.map((template) => {
                      const selected = form.template === template

                      return (
                        <button
                          key={template}
                          type="button"
                          onClick={() => update("template", template)}
                          aria-pressed={selected}
                          className={cn(
                            "flex min-w-0 flex-col gap-2 rounded-lg border p-2.5 text-start text-sm transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                            selected
                              ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary/30"
                              : "text-muted-foreground hover:bg-muted"
                          )}
                        >
                          <TemplateMock
                            template={template}
                            brandColor={form.brandColor}
                            accentColor={form.accentColor}
                          />
                          <span className="flex min-w-0 items-center gap-1.5 font-medium">
                            {selected && (
                              <Check
                                aria-hidden="true"
                                className="size-3.5 shrink-0 text-primary"
                              />
                            )}
                            <span className="truncate">
                              {tc(`cards.templates.${template}`)}
                            </span>
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {tc(`cards.templateHints.${template}`)}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </SettingsField>

                <div className="grid gap-4 sm:grid-cols-2">
                  <ColorField
                    id="card-brand-color"
                    label={tc("cards.form.brandColor")}
                    value={form.brandColor}
                    onChange={(value) =>
                      update("brandColor", safeColor(value, form.brandColor))
                    }
                  />
                  <ColorField
                    id="card-accent-color"
                    label={tc("cards.form.accentColor")}
                    value={form.accentColor}
                    onChange={(value) =>
                      update("accentColor", safeColor(value, form.accentColor))
                    }
                  />
                </div>

                <SettingsSwitchRow
                  id="card-published"
                  label={tc("cards.form.published")}
                  description={tc("cards.form.publishedHint")}
                  checked={form.published}
                  onCheckedChange={(checked) => update("published", checked)}
                />
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold">
                    {tc("cards.form.linksSection")}
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addLink}
                    disabled={form.links.length >= MAX_CARD_LINKS}
                    title={
                      form.links.length >= MAX_CARD_LINKS
                        ? tc("cards.form.linksLimit", { count: MAX_CARD_LINKS })
                        : undefined
                    }
                  >
                    <Plus aria-hidden="true" />
                    {tc("cards.form.addLink")}
                  </Button>
                </div>

                {form.links.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    {tc("cards.form.noLinks")}
                  </p>
                ) : (
                  form.links.map((link, index) => (
                    <div
                      key={index}
                      className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto]"
                    >
                      <Input
                        value={link.label}
                        onChange={(event) =>
                          updateLink(index, { label: event.target.value })
                        }
                        placeholder={tc("cards.form.linkLabelPlaceholder")}
                        aria-label={tc("cards.form.linkLabel")}
                      />
                      <Input
                        value={link.url}
                        onChange={(event) =>
                          updateLink(index, { url: event.target.value })
                        }
                        placeholder="https://example.com"
                        aria-label={tc("cards.form.linkUrl")}
                        dir="ltr"
                      />
                      <div className="flex items-center justify-end gap-1 sm:justify-start">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => moveLink(index, -1)}
                          disabled={index === 0}
                          aria-label={tc("cards.form.moveLinkUp")}
                          title={tc("cards.form.moveLinkUp")}
                        >
                          <ArrowUp aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => moveLink(index, 1)}
                          disabled={index === form.links.length - 1}
                          aria-label={tc("cards.form.moveLinkDown")}
                          title={tc("cards.form.moveLinkDown")}
                        >
                          <ArrowDown aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => removeLink(index)}
                          aria-label={tc("cards.form.removeLink")}
                          title={tc("cards.form.removeLink")}
                        >
                          <Trash2 aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold">
                    {tc("cards.form.socialSection")}
                  </h3>
                  <Button type="button" variant="outline" size="sm" onClick={addSocial}>
                    <Plus aria-hidden="true" />
                    {tc("cards.form.addSocial")}
                  </Button>
                </div>

                {form.socialLinks.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    {tc("cards.form.noSocial")}
                  </p>
                ) : (
                  form.socialLinks.map((link, index) => (
                    <div
                      key={index}
                      className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[150px_minmax(0,1fr)_auto]"
                    >
                      <select
                        value={link.platform}
                        onChange={(event) =>
                          updateSocial(index, {
                            platform: normalizeSocialPlatform(
                              event.target.value
                            ),
                          })
                        }
                        aria-label={tc("cards.form.platform")}
                        className="h-9 rounded-md border bg-transparent px-2 text-sm"
                      >
                        {socialPlatforms.map((platform) => (
                          <option key={platform} value={platform}>
                            {tc(`cards.social.${platform}`)}
                          </option>
                        ))}
                      </select>
                      <Input
                        value={link.url}
                        onChange={(event) =>
                          updateSocial(index, { url: event.target.value })
                        }
                        placeholder={socialUrlPlaceholders[link.platform] ?? ""}
                        aria-label={tc("cards.form.socialUrl")}
                        dir="ltr"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeSocial(index)}
                        aria-label={tc("cards.form.removeSocial")}
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="order-first flex flex-col gap-3 md:order-none md:max-h-full md:self-start md:overflow-y-auto">
              <p className="text-center text-sm font-semibold md:text-start">
                {tc("cards.preview.title")}
              </p>
              <div className="flex justify-center rounded-xl border bg-muted/30 p-4 sm:p-5">
                <IphoneFrame
                  label={tc("cards.preview.phoneLabel")}
                  className="max-w-[210px] sm:max-w-[240px] md:max-w-[min(286px,calc((94dvh_-_17rem)/2.166))]"
                >
                  <CardRenderer
                    card={preview}
                    className="min-h-full rounded-none border-0 shadow-none"
                  />
                </IphoneFrame>
              </div>
              {form.slug && (
                <p className="break-all text-center font-mono text-[11px] text-muted-foreground">
                  {publicUrl(form.slug)}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="shrink-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={save} disabled={saving}>
              <Save aria-hidden="true" />
              {tc("cards.actions.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
