"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, ClipboardList, Home, Recycle, Settings, Truck } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="grid items-start gap-2">
      <Button variant="ghost" className={cn("justify-start", pathname === "/" && "bg-muted")} asChild>
        <Link href="/">
          <Home className="mr-2 h-4 w-4" />
          Dashboard
        </Link>
      </Button>
      <Button variant="ghost" className={cn("justify-start", pathname === "/analytics" && "bg-muted")} asChild>
        <Link href="/analytics">
          <BarChart3 className="mr-2 h-4 w-4" />
          Analytics
        </Link>
      </Button>
      <Button variant="ghost" className={cn("justify-start", pathname === "/collections" && "bg-muted")} asChild>
        <Link href="/collections">
          <Truck className="mr-2 h-4 w-4" />
          Collections
        </Link>
      </Button>
      <Button variant="ghost" className={cn("justify-start", pathname === "/recycling" && "bg-muted")} asChild>
        <Link href="/recycling">
          <Recycle className="mr-2 h-4 w-4" />
          Recycling
        </Link>
      </Button>
      <Button variant="ghost" className={cn("justify-start", pathname === "/reports" && "bg-muted")} asChild>
        <Link href="/reports">
          <ClipboardList className="mr-2 h-4 w-4" />
          Reports
        </Link>
      </Button>
      <Button variant="ghost" className={cn("justify-start", pathname === "/settings" && "bg-muted")} asChild>
        <Link href="/settings">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Link>
      </Button>
    </nav>
  )
}
