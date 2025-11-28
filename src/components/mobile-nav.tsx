"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Heart, User, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/favoritos", icon: Heart, label: "Favoritos" },
  { href: "/oportunidades", icon: () => <Image src="/logo.png" alt="Oportunidades" width={40} height={40} className="rounded-full" />, label: "Oportunidades", isCentral: true },
  { href: "/perfil", icon: User, label: "Perfil" },
  { href: "/concierge", icon: MessageSquare, label: "Concierge" },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-navy-600/90 backdrop-blur-sm z-50">
      <nav className="flex justify-around items-center h-full">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          if (item.isCentral) {
            return (
              <Link href={item.href} key={item.href} className={cn(
                "relative -top-5 h-16 w-16 rounded-full bg-navy-500 flex items-center justify-center shadow-2xl transform transition-all duration-300 ease-out",
                isActive && "-translate-y-1 shadow-[0_10px_20px_rgba(0,0,0,0.25)]"
              )}>
                <item.icon />
              </Link>
            )
          }
          return (
            <Link href={item.href} key={item.href} className={cn(
              "flex flex-col items-center justify-center gap-1 text-gold-500/70 transition-colors",
              isActive && "text-gold-500"
            )}>
              <item.icon className="w-6 h-6" />
              <span className="text-xs">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
