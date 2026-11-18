"use client"

import { createContext, useContext, type ReactNode } from "react"

import type { DashboardUser } from "@/lib/users"

const CurrentUserContext = createContext<DashboardUser | null>(null)

export function CurrentUserProvider({
  user,
  children,
}: {
  user: DashboardUser
  children: ReactNode
}) {
  return (
    <CurrentUserContext.Provider value={user}>
      {children}
    </CurrentUserContext.Provider>
  )
}

export function useCurrentUser() {
  return useContext(CurrentUserContext)
}
