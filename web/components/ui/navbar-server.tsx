import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { NavBarClient } from "./navbar-client"

interface NavBarProps {
  className?: string
}

export async function NavBar({ className }: NavBarProps) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  const items = session
    ? [
        { name: 'Home', url: '/' },
        { name: 'Dashboard', url: '/dashboard' },
      ]
    : [
        { name: 'Home', url: '/' },
        { name: 'Sign In', url: '/sign-in' },
        { name: 'Sign Up', url: '/sign-up' },
      ]

  return <NavBarClient items={items} user={session?.user} className={className} />
}