import Image from "next/image"
import type { CSSProperties, ReactNode } from "react"
import {
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
import {
  DEFAULT_CARD_FORM,
  safeColor,
  type DigitalCardData,
  type SocialPlatform,
} from "../lib/types"
import { CardLinkButton } from "./CardLinkButton"

/**
 * The single source of truth for the digital business card.
 *
 * The exact same component renders:
 *  - the live preview inside the iPhone mockup of the dashboard builder, and
 *  - the public `/[locale]/card/[slug]` page.
 *
 * Sizing is fluid: every padding, radius and font size is derived from the
 * card width through container-query units (`cqw`) clamped to a readable
 * range, so the miniature in the mockup and the full-size page share one
 * layout, one hierarchy and one set of styles.
 */

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

type Tone = "light" | "dark"

/** Design tokens shared by every template, scaled from the card width. */
const CARD_TOKENS: Record<string, string> = {
  "--card-pad": "clamp(16px, 5.2cqw, 26px)",
  "--card-gap": "clamp(12px, 3.6cqw, 18px)",
  "--card-gap-sm": "clamp(7px, 2.2cqw, 10px)",
  "--card-name": "clamp(17px, 5.1cqw, 24px)",
  "--card-role": "clamp(11.5px, 3.2cqw, 14.5px)",
  "--card-body": "clamp(11px, 3cqw, 14px)",
  "--card-meta": "clamp(10.5px, 2.9cqw, 13px)",
  "--card-icon": "clamp(13px, 3.4cqw, 16px)",
  "--card-avatar": "clamp(48px, 15.5cqw, 72px)",
  "--card-banner": "clamp(62px, 19cqw, 88px)",
  "--card-radius": "clamp(14px, 4cqw, 20px)",
  "--card-radius-sm": "clamp(9px, 2.6cqw, 12px)",
  "--card-social": "clamp(26px, 7.4cqw, 34px)",
  "--card-link-y": "clamp(7px, 2.1cqw, 10px)",
  "--card-link-x": "clamp(10px, 3cqw, 14px)",
}

/** `#rrggbb` + alpha byte, used for the brand tints (hex is validated). */
function withAlpha(hex: string, alpha: number): string {
  const value = hex.trim()
  const expanded =
    value.length === 4
      ? `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`
      : value
  const byte = Math.round(Math.min(Math.max(alpha, 0), 1) * 255)
    .toString(16)
    .padStart(2, "0")

  return `${expanded}${byte}`
}

function cardStyle(card: DigitalCardData): CSSProperties {
  const brand = safeColor(card.brandColor, DEFAULT_CARD_FORM.brandColor)
  const accent = safeColor(card.accentColor, DEFAULT_CARD_FORM.accentColor)

  return {
    ...CARD_TOKENS,
    "--card-brand": brand,
    "--card-accent": accent,
    "--card-brand-soft": withAlpha(brand, 0.09),
    "--card-brand-line": withAlpha(brand, 0.26),
    "--card-brand-strong": withAlpha(brand, 0.16),
  } as CSSProperties
}

function firstCharacter(value: string): string {
  return Array.from(value.trim())[0] ?? ""
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) return "?"
  if (parts.length === 1) {
    return Array.from(parts[0]).slice(0, 2).join("").toUpperCase()
  }

  return `${firstCharacter(parts[0])}${firstCharacter(
    parts[parts.length - 1]
  )}`.toUpperCase()
}

function Avatar({
  card,
  className,
}: {
  card: DigitalCardData
  className?: string
}) {
  return (
    <span
      className={cn(
        "relative block size-[var(--card-avatar)] shrink-0 overflow-hidden rounded-full",
        className
      )}
    >
      {card.avatar ? (
        <Image
          src={card.avatar.url}
          alt={card.avatar.alt ?? card.fullName}
          fill
          sizes="160px"
          className="object-cover"
          unoptimized
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex size-full items-center justify-center font-semibold tracking-wide text-white"
          style={{
            background:
              "linear-gradient(135deg, var(--card-brand), var(--card-accent))",
            fontSize: "calc(var(--card-avatar) * 0.34)",
          }}
        >
          {initials(card.fullName)}
        </span>
      )}
    </span>
  )
}

function Role({ card, className }: { card: DigitalCardData; className?: string }) {
  const role = [card.jobTitle, card.company].filter(Boolean).join(" · ")

  if (!role) return null

  return (
    <p
      className={cn(
        "text-[length:var(--card-role)] font-medium",
        className
      )}
    >
      {role}
    </p>
  )
}

function Bio({ card, className }: { card: DigitalCardData; className?: string }) {
  if (!card.bio) return null

  return (
    <p
      className={cn(
        "text-[length:var(--card-body)] leading-relaxed",
        className
      )}
    >
      {card.bio}
    </p>
  )
}

function ContactRow({
  icon: Icon,
  href,
  tone,
  children,
}: {
  icon: LucideIcon
  href?: string
  tone: Tone
  children: ReactNode
}) {
  const content = (
    <>
      <Icon
        className="mt-[0.15em] size-[var(--card-icon)] shrink-0 opacity-70"
        aria-hidden="true"
      />
      <span className="min-w-0 break-words">{children}</span>
    </>
  )
  const className = cn(
    "flex items-start gap-2 text-[length:var(--card-meta)] leading-snug transition-colors",
    tone === "dark" ? "text-white/85" : "text-slate-500"
  )

  if (!href) return <span className={className}>{content}</span>

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        className,
        "rounded-sm focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
        tone === "dark" ? "hover:text-white" : "hover:text-slate-900"
      )}
    >
      {content}
    </a>
  )
}

function ContactList({
  card,
  tone,
  className,
}: {
  card: DigitalCardData
  tone: Tone
  className?: string
}) {
  const rows: ReactNode[] = []

  if (card.email) {
    rows.push(
      <ContactRow
        key="email"
        icon={Mail}
        href={`mailto:${card.email}`}
        tone={tone}
      >
        {card.email}
      </ContactRow>
    )
  }

  if (card.phone) {
    rows.push(
      <ContactRow
        key="phone"
        icon={Phone}
        href={`tel:${card.phone}`}
        tone={tone}
      >
        {card.phone}
      </ContactRow>
    )
  }

  if (card.website) {
    rows.push(
      <ContactRow
        key="website"
        icon={Globe}
        href={withProtocol(card.website)}
        tone={tone}
      >
        {card.website}
      </ContactRow>
    )
  }

  if (card.address) {
    rows.push(
      <ContactRow key="address" icon={MapPin} tone={tone}>
        {card.address}
      </ContactRow>
    )
  }

  if (rows.length === 0) return null

  return (
    <div
      className={cn(
        "flex flex-col gap-[var(--card-gap-sm)]",
        className
      )}
    >
      {rows}
    </div>
  )
}

function LinkButtons({
  card,
  tone,
  className,
}: {
  card: DigitalCardData
  tone: Tone
  className?: string
}) {
  const links = card.links ?? []

  if (links.length === 0) return null

  return (
    <div
      className={cn(
        "flex flex-col gap-[var(--card-gap-sm)]",
        className
      )}
    >
      {links.map((link, index) => (
        <CardLinkButton
          key={`${link.type}-${link.url}-${index}`}
          link={link}
          dark={tone === "dark"}
        />
      ))}
    </div>
  )
}

function SocialLinks({
  card,
  tone,
  className,
}: {
  card: DigitalCardData
  tone: Tone
  className?: string
}) {
  if (card.socialLinks.length === 0) return null

  return (
    <div
      className={cn("flex flex-wrap gap-[var(--card-gap-sm)]", className)}
    >
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
              "flex size-[var(--card-social)] items-center justify-center rounded-full border transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
              tone === "dark"
                ? "border-white/25 text-white hover:bg-white/15"
                : "border-slate-200 text-slate-700 hover:bg-slate-100"
            )}
          >
            <Icon
              className="size-[calc(var(--card-icon)*0.95)]"
              aria-hidden="true"
            />
          </a>
        )
      })}
    </div>
  )
}

function ModernCard({ card }: { card: DigitalCardData }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-white text-slate-900">
      <div
        className="relative h-[var(--card-banner)] w-full shrink-0 overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, var(--card-brand), var(--card-accent))",
        }}
      >
        <span
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 12% 0%, rgba(255,255,255,0.42), transparent 62%)",
          }}
        />
      </div>

      <div className="flex flex-1 flex-col px-[var(--card-pad)] pb-[var(--card-pad)]">
        <Avatar
          card={card}
          className="-mt-[calc(var(--card-avatar)/2)] border-[3px] border-white shadow-sm"
        />

        <h1 className="mt-[var(--card-gap-sm)] text-[length:var(--card-name)] leading-tight font-semibold tracking-tight text-balance">
          {card.fullName}
        </h1>
        <Role
          card={card}
          className="mt-1 text-[color:var(--card-brand)]"
        />
        <Bio
          card={card}
          className="mt-[var(--card-gap-sm)] text-slate-500"
        />
        <ContactList
          card={card}
          tone="light"
          className="mt-[var(--card-gap)] border-t pt-[var(--card-gap)]"
        />
        <LinkButtons card={card} tone="light" className="mt-[var(--card-gap)]" />
        <SocialLinks card={card} tone="light" className="mt-[var(--card-gap)]" />
      </div>
    </div>
  )
}

function CorporateCard({ card }: { card: DigitalCardData }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-white text-slate-900">
      <div
        className="relative flex items-center gap-[var(--card-gap)] px-[var(--card-pad)] py-[var(--card-pad)] text-white"
        style={{
          background:
            "linear-gradient(150deg, var(--card-brand), var(--card-accent))",
        }}
      >
        <Avatar
          card={card}
          className="border-2 border-white/45 shadow-sm"
        />
        <div className="min-w-0">
          <h1 className="truncate text-[length:var(--card-name)] leading-tight font-semibold tracking-tight">
            {card.fullName}
          </h1>
          <Role card={card} className="mt-0.5 truncate text-white/85" />
        </div>
      </div>

      <div className="flex flex-1 flex-col px-[var(--card-pad)] pb-[var(--card-pad)]">
        <Bio
          card={card}
          className="mt-[var(--card-gap)] text-slate-500"
        />
        <ContactList
          card={card}
          tone="light"
          className="mt-[var(--card-gap)] border-t pt-[var(--card-gap)]"
        />
        <LinkButtons card={card} tone="light" className="mt-[var(--card-gap)]" />
        <SocialLinks
          card={card}
          tone="light"
          className="mt-[var(--card-gap)] border-t pt-[var(--card-gap)]"
        />
      </div>
    </div>
  )
}

function CyberCard({ card }: { card: DigitalCardData }) {
  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden bg-slate-950 text-slate-100">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -end-16 size-48 rounded-full opacity-30 blur-3xl"
        style={{ backgroundColor: "var(--card-brand)" }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-16 -start-16 size-48 rounded-full opacity-20 blur-3xl"
        style={{ backgroundColor: "var(--card-accent)" }}
      />

      <div className="relative flex flex-1 flex-col px-[var(--card-pad)] py-[var(--card-pad)]">
        <div className="flex items-center gap-[var(--card-gap)]">
          <span
            className="rounded-full p-[2px]"
            style={{
              background:
                "linear-gradient(135deg, var(--card-brand), var(--card-accent))",
            }}
          >
            <Avatar
              card={card}
              className="border-2 border-slate-950"
            />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-[length:var(--card-name)] leading-tight font-semibold tracking-tight">
              {card.fullName}
            </h1>
            <Role
              card={card}
              className="mt-1 truncate font-mono text-[length:var(--card-role)] tracking-[0.16em] uppercase text-[color:var(--card-accent)]"
            />
          </div>
        </div>

        <Bio card={card} className="mt-[var(--card-gap)] text-slate-300" />

        <span
          aria-hidden="true"
          className="mt-[var(--card-gap)] h-px w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent"
        />

        <ContactList card={card} tone="dark" className="mt-[var(--card-gap)]" />
        <LinkButtons card={card} tone="dark" className="mt-[var(--card-gap)]" />
        <SocialLinks card={card} tone="dark" className="mt-[var(--card-gap)]" />
      </div>
    </div>
  )
}

function GlassCard({ card }: { card: DigitalCardData }) {
  return (
    <div
      className="relative flex min-h-full flex-1 flex-col overflow-hidden p-[var(--card-pad)] text-white"
      style={{
        background:
          "linear-gradient(150deg, var(--card-brand), var(--card-accent))",
      }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 -end-10 size-40 rounded-full bg-white/30 blur-2xl"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-12 -start-10 size-40 rounded-full bg-black/25 blur-2xl"
      />

      <div className="relative flex flex-1 flex-col rounded-[var(--card-radius)] border border-white/30 bg-white/15 p-[var(--card-pad)] shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-[var(--card-gap)]">
          <Avatar
            card={card}
            className="ring-2 ring-white/60"
          />
          <div className="min-w-0">
            <h1 className="truncate text-[length:var(--card-name)] leading-tight font-semibold tracking-tight drop-shadow-sm">
              {card.fullName}
            </h1>
            <Role card={card} className="mt-0.5 truncate text-white/80" />
          </div>
        </div>

        <Bio card={card} className="mt-[var(--card-gap)] text-white/85" />

        <span
          aria-hidden="true"
          className="mt-[var(--card-gap)] h-px w-full bg-white/25"
        />

        <ContactList card={card} tone="dark" className="mt-[var(--card-gap)]" />
        <LinkButtons card={card} tone="dark" className="mt-[var(--card-gap)]" />
        <SocialLinks card={card} tone="dark" className="mt-[var(--card-gap)]" />
      </div>
    </div>
  )
}

const templates = {
  modern: ModernCard,
  corporate: CorporateCard,
  cyber: CyberCard,
  glass: GlassCard,
} as const

export function CardRenderer({
  card,
  className,
}: {
  card: DigitalCardData
  className?: string
}) {
  const Template = templates[card.template] ?? ModernCard

  return (
    <div
      data-card-renderer={card.template}
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-[var(--card-radius)] border border-slate-200 bg-white text-slate-900 shadow-sm [container-type:inline-size]",
        className
      )}
      style={cardStyle(card)}
    >
      <Template card={card} />
    </div>
  )
}
