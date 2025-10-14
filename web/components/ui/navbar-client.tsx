"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ProfileDropdown } from "./profile-dropdown"

interface NavItem {
  name: string
  url: string
}

interface NavBarClientProps {
  items: NavItem[]
  user?: {
    name?: string
    email?: string
    image?: string | null
  }
  className?: string
}

export function NavBarClient({ items, user, className }: NavBarClientProps) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex items-center justify-between p-4", className)}>
      <div className="flex items-center gap-6">
        {items.map((item) => (
          <Link
            key={item.name}
            prefetch={true}
            href={item.url}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === item.url
                ? "text-foreground"
                : "text-muted-foreground"
            )}
          >
            {item.name}
          </Link>
        ))}
      </div>
      {user && <ProfileDropdown user={user} />}
    </nav>
  )
}