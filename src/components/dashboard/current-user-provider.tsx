"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

import { usePathname } from "@/i18n/navigation"
import { refreshSessionAction } from "@/lib/user-actions"
import type { DashboardUser } from "@/lib/users"

const CurrentUserContext = createContext<DashboardUser | null>(null)

export function CurrentUserProvider({
  user,
  children,
}: {
  user: DashboardUser
  children: ReactNode
}) {
  const [currentUser, setCurrentUser] = useState<DashboardUser | null>(user)
  const [syncedUser, setSyncedUser] = useState(user)
  const pathname = usePathname()

  // Adopt a new server-rendered user (for example after `router.refresh()`)
  // without waiting for a navigation event.
  if (user !== syncedUser) {
    setSyncedUser(user)
    setCurrentUser(user)
  }

  // Re-resolve the role and permissions from the database after navigation so
  // permission changes apply without signing out or reloading the page.
  useEffect(() => {
    let active = true

    refreshSessionAction().then((result) => {
      if (!active || !result.success) return

      setCurrentUser(result.data)
    })

    return () => {
      active = false
    }
  }, [pathname])

  return (
    <CurrentUserContext.Provider value={currentUser}>
      {children}
    </CurrentUserContext.Provider>
  )
}

export function useCurrentUser() {
  return useContext(CurrentUserContext)
}
