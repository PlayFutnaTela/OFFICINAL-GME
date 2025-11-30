"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Heart, User, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/favoritos", icon: Heart, label: "Favoritos" },
  {
    href: "/oportunidades",
    label: "Oportunidades",
    isCentral: true,
    icon: () => (
      <div className="relative w-[52px] h-[52px]">
        <Image
          src="/svg-logo.svg"
          alt="Oportunidades"
          fill
          className="object-contain"
          priority
        />
      </div>
    )
  },
  { href: "/perfil", icon: User, label: "Perfil" },
  { href: "/concierge", icon: MessageSquare, label: "Concierge" },
]

export default function MobileNav() {
  const pathname = usePathname()

  // Don't show on auth pages
  if (pathname === '/login' || pathname === '/register' || pathname === '/recuperar-senha') {
    return null
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 h-[72px] bg-navy-600/95 backdrop-blur-sm z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.2)]"
      role="navigation"
      aria-label="Navegação Mobile"
    >
      <div className="flex justify-center items-end h-full w-full max-w-md mx-auto relative">
        {navItems.map((item) => {
          const isActive = pathname === item.href

          if (item.isCentral) {
            return (
              <div key={item.href} className="relative w-[74px] h-full flex justify-center z-10">
                <Link
                  href={item.href}
                  className={cn(
                    "absolute -top-3.5 left-1/2 -translate-x-1/2 h-[72px] w-[72px] rounded-full bg-navy-500 flex items-center justify-center shadow-2xl transition-all duration-300 ease-out",
                    "border-4 border-navy-600", // Solid border to match navbar bg for seamless look
                    isActive
                      ? "-translate-y-2 shadow-[0_10px_25px_rgba(0,0,0,0.3)] scale-105"
                      : "shadow-[0_8px_20px_rgba(0,0,0,0.25)] hover:-translate-y-1"
                  )}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                >
                  <item.icon />
                </Link>
              </div>
            )
          }

          return (
            <Link
              href={item.href}
              key={item.href}
              className={cn(
                "w-[74px] h-full flex flex-col items-center justify-center gap-1 transition-all duration-200 group focus:outline-none",
                isActive ? "text-gold-500" : "text-gold-500/60 hover:text-gold-300"
              )}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <div className={cn(
                "relative p-1 rounded-xl transition-all duration-200",
                isActive && "bg-gold-500/10"
              )}>
                <item.icon className={cn(
                  "w-6 h-6 transition-transform duration-200",
                  isActive && "scale-110",
                  "group-hover:scale-105"
                )} />
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-opacity duration-200",
                isActive ? "opacity-100" : "opacity-70"
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
