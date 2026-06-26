"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const links = [
  { href: "/", label: "Ma Semaine" },
  { href: "/cuisiner", label: "Cuisiner" },
  { href: "/bilan", label: "Bilan" },
  { href: "/profil", label: "Profil" },
]

export default function Nav() {
  const pathname = usePathname()
  return (
    <header className="border-b border-zinc-800 bg-zinc-950 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 flex items-center gap-1 h-14 overflow-x-auto">
        <span className="font-semibold text-zinc-100 mr-2 sm:mr-6 shrink-0">NutriWeek</span>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-colors shrink-0",
              pathname === l.href
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
            )}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </header>
  )
}
