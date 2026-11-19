"use client"

import {
  BookOpen,
  CircleHelp,
  Code2,
  CreditCard,
  Globe2,
  KeyRound,
  Layers,
  Lightbulb,
  Palette,
  QrCode,
  Rocket,
  Store,
  UserRound,
  type LucideIcon,
} from "lucide-react"
import { useTranslations } from "next-intl"

import { PageHeader } from "@/components/dashboard/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Link } from "@/i18n/navigation"

type GuideSection = {
  id: string
  icon: LucideIcon
  title: string
  description: string
  items: string[]
}

export default function DocumentationPage() {
  const t = useTranslations("Dashboard.docs")

  const userSections: GuideSection[] = [
    {
      id: "getting-started",
      icon: Rocket,
      title: t("user.gettingStarted.title"),
      description: t("user.gettingStarted.description"),
      items: t.raw("user.gettingStarted.items") as string[],
    },
    {
      id: "apps-store",
      icon: Store,
      title: t("user.appsStore.title"),
      description: t("user.appsStore.description"),
      items: t.raw("user.appsStore.items") as string[],
    },
    {
      id: "digital-cards",
      icon: CreditCard,
      title: t("user.digitalCards.title"),
      description: t("user.digitalCards.description"),
      items: t.raw("user.digitalCards.items") as string[],
    },
    {
      id: "qr-studio",
      icon: QrCode,
      title: t("user.qrStudio.title"),
      description: t("user.qrStudio.description"),
      items: t.raw("user.qrStudio.items") as string[],
    },
    {
      id: "account",
      icon: UserRound,
      title: t("user.account.title"),
      description: t("user.account.description"),
      items: t.raw("user.account.items") as string[],
    },
  ]

  const developerSections: GuideSection[] = [
    {
      id: "architecture",
      icon: Layers,
      title: t("developer.architecture.title"),
      description: t("developer.architecture.description"),
      items: t.raw("developer.architecture.items") as string[],
    },
    {
      id: "new-app",
      icon: Code2,
      title: t("developer.newApp.title"),
      description: t("developer.newApp.description"),
      items: t.raw("developer.newApp.items") as string[],
    },
    {
      id: "permissions",
      icon: KeyRound,
      title: t("developer.permissions.title"),
      description: t("developer.permissions.description"),
      items: t.raw("developer.permissions.items") as string[],
    },
    {
      id: "card-items",
      icon: Palette,
      title: t("developer.cardItems.title"),
      description: t("developer.cardItems.description"),
      items: t.raw("developer.cardItems.items") as string[],
    },
    {
      id: "localization",
      icon: Globe2,
      title: t("developer.localization.title"),
      description: t("developer.localization.description"),
      items: t.raw("developer.localization.items") as string[],
    },
  ]

  function renderSections(sections: GuideSection[], ordered: boolean) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon
          const ListTag = ordered ? "ol" : "ul"

          return (
            <Card key={section.id} size="sm" className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  {section.title}
                </CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ListTag
                  className={
                    ordered
                      ? "list-decimal space-y-2 ps-5 text-sm text-muted-foreground marker:font-medium marker:text-foreground"
                      : "list-disc space-y-2 ps-5 text-sm text-muted-foreground marker:text-primary"
                  }
                >
                  {section.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ListTag>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">
          <BookOpen className="size-3" aria-hidden="true" />
          {t("badge")}
        </Badge>
        <span className="text-xs text-muted-foreground">{t("hint")}</span>
      </div>

      <Tabs defaultValue="user" className="flex flex-col gap-5">
        <TabsList className="w-fit">
          <TabsTrigger value="user">{t("userTab")}</TabsTrigger>
          <TabsTrigger value="developer">{t("developerTab")}</TabsTrigger>
        </TabsList>

        <TabsContent value="user" className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">{t("user.intro")}</p>
          {renderSections(userSections, true)}
        </TabsContent>

        <TabsContent value="developer" className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            {t("developer.intro")}
          </p>
          {renderSections(developerSections, false)}
        </TabsContent>
      </Tabs>

      <Card className="bg-muted/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="size-4 text-primary" aria-hidden="true" />
            {t("footer.title")}
          </CardTitle>
          <CardDescription>{t("footer.description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/dashboard/apps" />}
          >
            <Store aria-hidden="true" />
            {t("footer.apps")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/dashboard/settings" />}
          >
            <CircleHelp aria-hidden="true" />
            {t("footer.settings")}
          </Button>
        </CardContent>
      </Card>
    </>
  )
}
