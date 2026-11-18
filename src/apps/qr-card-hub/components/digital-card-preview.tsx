import Image from "next/image"
import {
  ArrowUpRight,
  AtSign,
  Briefcase,
  Camera,
  Code,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Play,
  Send,
  Share2,
  Video,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

import { withProtocol } from "../lib/qr-content"
import type { DigitalCardData, SocialPlatform } from "../lib/types"

const platformIcons: Record<SocialPlatform, LucideIcon> = {
  website: Globe,
  linkedin: Briefcase,
  x: AtSign,
  facebook: Share2,
  instagram: Camera,
  github: Code,
  youtube: Play,
  tiktok: Video,
  whatsapp: MessageCircle,
  telegram: Send,
}

type TemplateProps = {
  card: DigitalCardData
  compact: boolean
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function Avatar({
  card,
  className,
}: {
  card: DigitalCardData
  className?: string
}) {
  if (card.avatar) {
    return (
      <span
        className={cn(
          "relative block shrink-0 overflow-hidden rounded-full bg-muted",
          className
        )}
      >
        <Image
          src={card.avatar.url}
          alt={card.avatar.alt ?? card.fullName}
          fill
          sizes="128px"
          className="object-cover"
          unoptimized
        />
      </span>
    )
  }

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-muted text-lg font-semibold text-muted-foreground",
        className
      )}
      aria-hidden="true"
    >
      {initials(card.fullName)}
    </span>
  )
}

function ContactRow({
  icon: Icon,
  children,
  tone = "default",
  href,
  compact = false,
}: {
  icon: LucideIcon
  children: React.ReactNode
  tone?: "default" | "light"
  href?: string
  compact?: boolean
}) {
  const content = (
    <span
      className={cn(
        "flex items-start gap-2",
        compact ? "text-[11px]" : "text-sm",
        tone === "light" ? "text-white/90" : "text-muted-foreground"
      )}
    >
      <Icon
        className={cn("mt-0.5 shrink-0", compact ? "size-3.5" : "size-4")}
        aria-hidden="true"
      />
      <span className="break-all">{children}</span>
    </span>
  )

  if (!href) return content

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="transition-opacity hover:opacity-80"
    >
      {content}
    </a>
  )
}

function SocialRow({
  card,
  tone = "default",
  compact = false,
}: {
  card: DigitalCardData
  tone?: "default" | "light"
  compact?: boolean
}) {
  if (card.socialLinks.length === 0) return null

  return (
    <div className={cn("flex flex-wrap", compact ? "mt-3 gap-1.5" : "mt-4 gap-2")}>
      {card.socialLinks.map((link, index) => {
        const Icon = platformIcons[link.platform] ?? Globe

        return (
          <a
            key={`${link.platform}-${index}`}
            href={withProtocol(link.url)}
            target="_blank"
            rel="noreferrer"
            aria-label={link.label || link.platform}
            title={link.label || link.platform}
            className={cn(
              "flex items-center justify-center rounded-full border transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
              compact ? "size-7" : "size-9",
              tone === "light"
                ? "border-white/25 text-white hover:bg-white/10"
                : "border-border text-foreground hover:bg-muted"
            )}
          >
            <Icon
              className={compact ? "size-3.5" : "size-4"}
              aria-hidden="true"
            />
          </a>
        )
      })}
    </div>
  )
}

/** Linktree-style buttons, rendered in their stored order. */
function LinkList({
  card,
  tone = "default",
  compact = false,
}: {
  card: DigitalCardData
  tone?: "default" | "light"
  compact?: boolean
}) {
  const links = (card.links ?? []).filter(
    (link) => link.url.trim().length > 0
  )

  if (links.length === 0) return null

  return (
    <div className={cn("flex flex-col", compact ? "mt-3 gap-1.5" : "mt-4 gap-2")}>
      {links.map((link, index) => (
        <a
          key={`${link.url}-${index}`}
          href={withProtocol(link.url)}
          target="_blank"
          rel="noreferrer"
          className={cn(
            "group flex items-center justify-between gap-2 rounded-lg border font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
            compact ? "px-2.5 py-1.5 text-[11px]" : "px-3 py-2 text-xs",
            tone === "light"
              ? "border-white/25 bg-white/10 text-white hover:bg-white/20"
              : "border-border bg-muted/40 text-foreground hover:bg-muted"
          )}
        >
          <span className="min-w-0 flex-1 truncate">
            {link.label || link.url}
          </span>
          <ArrowUpRight
            className="size-3.5 shrink-0 opacity-70 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100"
            aria-hidden="true"
          />
        </a>
      ))}
    </div>
  )
}

function ModernCard({ card, compact }: TemplateProps) {
  return (
    <div
      className={cn(
        "overflow-hidden bg-card text-card-foreground",
        compact ? "min-h-full" : "rounded-2xl border shadow-sm"
      )}
    >
      <div
        className={compact ? "h-20 w-full" : "h-24 w-full"}
        style={{
          background: `linear-gradient(135deg, ${card.brandColor}, ${card.accentColor})`,
        }}
      />
      <div className={compact ? "px-4 pb-5" : "px-6 pb-6"}>
        <div
          className={cn(
            "flex items-end",
            compact ? "-mt-7 mb-3" : "-mt-10 mb-4 gap-4"
          )}
        >
          <Avatar
            card={card}
            className={cn(
              "border-4 border-card shadow-sm",
              compact ? "size-14" : "size-20"
            )}
          />
        </div>
        <h2
          className={cn(
            "font-semibold tracking-tight",
            compact ? "text-base" : "text-xl"
          )}
        >
          {card.fullName}
        </h2>
        <p
          className={cn("mt-1 font-medium", compact ? "text-[11px]" : "text-sm")}
          style={{ color: card.brandColor }}
        >
          {[card.jobTitle, card.company].filter(Boolean).join(" · ")}
        </p>
        {card.bio && (
          <p
            className={cn(
              "leading-relaxed text-muted-foreground",
              compact ? "mt-2 text-[11px]" : "mt-3 text-sm"
            )}
          >
            {card.bio}
          </p>
        )}
        <div
          className={cn(
            "flex flex-col",
            compact ? "mt-3 gap-1.5" : "mt-4 gap-2"
          )}
        >
          {card.email && (
            <ContactRow
              icon={Mail}
              href={`mailto:${card.email}`}
              compact={compact}
            >
              {card.email}
            </ContactRow>
          )}
          {card.phone && (
            <ContactRow
              icon={Phone}
              href={`tel:${card.phone}`}
              compact={compact}
            >
              {card.phone}
            </ContactRow>
          )}
          {card.website && (
            <ContactRow
              icon={Globe}
              href={withProtocol(card.website)}
              compact={compact}
            >
              {card.website}
            </ContactRow>
          )}
          {card.address && (
            <ContactRow icon={MapPin} compact={compact}>
              {card.address}
            </ContactRow>
          )}
        </div>
        <LinkList card={card} compact={compact} />
        <SocialRow card={card} compact={compact} />
      </div>
    </div>
  )
}

function CorporateCard({ card, compact }: TemplateProps) {
  return (
    <div
      className={cn(
        "overflow-hidden bg-card text-card-foreground",
        compact ? "min-h-full" : "rounded-xl border shadow-sm"
      )}
    >
      <div
        className={cn(
          "flex items-center",
          compact ? "gap-3 px-4 pt-7 pb-4" : "gap-4 p-6"
        )}
        style={{ backgroundColor: card.brandColor, color: "#ffffff" }}
      >
        <Avatar
          card={card}
          className={cn(
            "border-2 border-white/40",
            compact ? "size-12" : "size-16"
          )}
        />
        <div className="min-w-0">
          <h2
            className={cn(
              "truncate font-semibold tracking-tight",
              compact ? "text-base" : "text-lg"
            )}
          >
            {card.fullName}
          </h2>
          <p
            className={cn("truncate text-white/80", compact ? "text-[11px]" : "text-sm")}
          >
            {[card.jobTitle, card.company].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>
      <div
        className={cn(
          "flex flex-col",
          compact ? "gap-2 p-4" : "gap-3 p-6"
        )}
      >
        {card.bio && (
          <p
            className={cn(
              "leading-relaxed text-muted-foreground",
              compact ? "text-[11px]" : "text-sm"
            )}
          >
            {card.bio}
          </p>
        )}
        <div className="h-px w-full bg-border" />
        <div className={cn("flex flex-col", compact ? "gap-1.5" : "gap-2")}>
          {card.email && (
            <ContactRow
              icon={Mail}
              href={`mailto:${card.email}`}
              compact={compact}
            >
              {card.email}
            </ContactRow>
          )}
          {card.phone && (
            <ContactRow
              icon={Phone}
              href={`tel:${card.phone}`}
              compact={compact}
            >
              {card.phone}
            </ContactRow>
          )}
          {card.website && (
            <ContactRow
              icon={Globe}
              href={withProtocol(card.website)}
              compact={compact}
            >
              {card.website}
            </ContactRow>
          )}
          {card.address && (
            <ContactRow icon={MapPin} compact={compact}>
              {card.address}
            </ContactRow>
          )}
        </div>
        <LinkList card={card} compact={compact} />
        <div className="h-px w-full bg-border" />
        <SocialRow card={card} compact={compact} />
      </div>
    </div>
  )
}

function CyberCard({ card, compact }: TemplateProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-slate-950 text-slate-100",
        compact ? "min-h-full px-4 pt-7 pb-4" : "rounded-2xl p-6 shadow-lg"
      )}
    >
      <div
        className="pointer-events-none absolute -top-16 -end-16 size-48 rounded-full opacity-30 blur-3xl"
        style={{ backgroundColor: card.brandColor }}
      />
      <div
        className="pointer-events-none absolute -bottom-16 -start-16 size-48 rounded-full opacity-20 blur-3xl"
        style={{ backgroundColor: card.accentColor }}
      />
      <div
        className={cn("relative flex flex-col", compact ? "gap-3" : "gap-5")}
      >
        <div className={cn("flex items-center", compact ? "gap-3" : "gap-4")}>
          <span
            className="rounded-full p-[2px]"
            style={{
              background: `linear-gradient(135deg, ${card.brandColor}, ${card.accentColor})`,
            }}
          >
            <Avatar
              card={card}
              className={cn(
                "border-2 border-slate-950",
                compact ? "size-12" : "size-16"
              )}
            />
          </span>
          <div className="min-w-0">
            <h2
              className={cn(
                "truncate font-mono font-semibold tracking-tight",
                compact ? "text-base" : "text-lg"
              )}
            >
              {card.fullName}
            </h2>
            <p
              className={cn(
                "truncate font-mono uppercase tracking-[0.2em]",
                compact ? "text-[9px]" : "text-xs"
              )}
              style={{ color: card.accentColor }}
            >
              {[card.jobTitle, card.company].filter(Boolean).join(" / ")}
            </p>
          </div>
        </div>

        {card.bio && (
          <p
            className={cn(
              "leading-relaxed text-slate-300",
              compact ? "text-[11px]" : "text-sm"
            )}
          >
            {card.bio}
          </p>
        )}

        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

        <div className={cn("flex flex-col", compact ? "gap-1.5" : "gap-2")}>
          {card.email && (
            <ContactRow
              icon={Mail}
              tone="light"
              href={`mailto:${card.email}`}
              compact={compact}
            >
              {card.email}
            </ContactRow>
          )}
          {card.phone && (
            <ContactRow
              icon={Phone}
              tone="light"
              href={`tel:${card.phone}`}
              compact={compact}
            >
              {card.phone}
            </ContactRow>
          )}
          {card.website && (
            <ContactRow
              icon={Globe}
              tone="light"
              href={withProtocol(card.website)}
              compact={compact}
            >
              {card.website}
            </ContactRow>
          )}
          {card.address && (
            <ContactRow icon={MapPin} tone="light" compact={compact}>
              {card.address}
            </ContactRow>
          )}
        </div>

        <LinkList card={card} tone="light" compact={compact} />
        <SocialRow card={card} tone="light" compact={compact} />
      </div>
    </div>
  )
}

function GlassCard({ card, compact }: TemplateProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden text-white",
        compact ? "min-h-full px-4 pt-7 pb-4" : "rounded-2xl p-6 shadow-xl"
      )}
      style={{
        background: `linear-gradient(140deg, ${card.brandColor}, ${card.accentColor})`,
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 -end-10 size-40 rounded-full bg-white/30 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-12 -start-10 size-40 rounded-full bg-black/25 blur-2xl"
      />
      <div
        className={cn(
          "relative rounded-2xl border border-white/30 bg-white/15 shadow-xl backdrop-blur-xl",
          compact ? "p-3.5" : "p-5"
        )}
      >
        <div className={cn("flex items-center", compact ? "gap-3" : "gap-4")}>
          <Avatar
            card={card}
            className={cn(
              "ring-2 ring-white/60",
              compact ? "size-14" : "size-16"
            )}
          />
          <div className="min-w-0">
            <h2
              className={cn(
                "truncate font-semibold tracking-tight drop-shadow-sm",
                compact ? "text-base" : "text-lg"
              )}
            >
              {card.fullName}
            </h2>
            <p
              className={cn(
                "truncate text-white/80",
                compact ? "text-[11px]" : "text-sm"
              )}
            >
              {[card.jobTitle, card.company].filter(Boolean).join(" · ")}
            </p>
          </div>
        </div>

        {card.bio && (
          <p
            className={cn(
              "leading-relaxed text-white/85",
              compact ? "mt-2.5 text-[11px]" : "mt-4 text-sm"
            )}
          >
            {card.bio}
          </p>
        )}

        <div className={cn("h-px bg-white/25", compact ? "my-2.5" : "my-4")} />

        <div className={cn("flex flex-col", compact ? "gap-1.5" : "gap-2")}>
          {card.email && (
            <ContactRow
              icon={Mail}
              tone="light"
              href={`mailto:${card.email}`}
              compact={compact}
            >
              {card.email}
            </ContactRow>
          )}
          {card.phone && (
            <ContactRow
              icon={Phone}
              tone="light"
              href={`tel:${card.phone}`}
              compact={compact}
            >
              {card.phone}
            </ContactRow>
          )}
          {card.website && (
            <ContactRow
              icon={Globe}
              tone="light"
              href={withProtocol(card.website)}
              compact={compact}
            >
              {card.website}
            </ContactRow>
          )}
          {card.address && (
            <ContactRow icon={MapPin} tone="light" compact={compact}>
              {card.address}
            </ContactRow>
          )}
        </div>

        <LinkList card={card} tone="light" compact={compact} />
        <SocialRow card={card} tone="light" compact={compact} />
      </div>
    </div>
  )
}

export function DigitalCardPreview({
  card,
  variant = "preview",
  className,
}: {
  card: DigitalCardData
  variant?: "preview" | "page" | "phone"
  className?: string
}) {
  const compact = variant === "phone"
  const Template =
    card.template === "corporate"
      ? CorporateCard
      : card.template === "cyber"
        ? CyberCard
        : card.template === "glass"
          ? GlassCard
          : ModernCard

  return (
    <div
      className={cn(
        "w-full",
        variant === "page" && "mx-auto max-w-md",
        variant === "phone" && "min-h-full bg-card",
        className
      )}
    >
      <Template card={card} compact={compact} />
    </div>
  )
}
