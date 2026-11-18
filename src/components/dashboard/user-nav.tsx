"use client"

import { LogOut, Settings2, UserRound } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { useCurrentUser } from "@/components/dashboard/current-user-provider"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Link, useRouter } from "@/i18n/navigation"
import { getInitials } from "@/lib/initials"
import { logoutAction } from "@/lib/user-actions"

export function UserNav() {
  const t = useTranslations("Dashboard.userNav")
  const tt = useTranslations("Dashboard.toast")
  const currentUser = useCurrentUser()
  const router = useRouter()

  async function handleLogout() {
    await logoutAction()
    toast.success(tt("loggedOut"))
    router.push("/login")
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label={t("label")}
          />
        }
      >
        <Avatar size="sm">
          <AvatarFallback>
            {getInitials(currentUser?.name ?? "")}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <span className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">
                {currentUser?.name ?? ""}
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                {currentUser?.email ?? ""}
              </span>
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/dashboard/settings" />}>
          <UserRound aria-hidden="true" />
          {t("profile")}
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/dashboard/settings" />}>
          <Settings2 aria-hidden="true" />
          {t("settings")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleLogout}>
          <LogOut aria-hidden="true" />
          {t("logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
